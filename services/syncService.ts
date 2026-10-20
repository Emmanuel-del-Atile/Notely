import { db, auth } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  runTransaction,
} from "firebase/firestore";

import {
  debugNoteSyncState,
  getPendingNotes,
  getPendingDeletions,
  markLocalNoteAsSynced,
  getLocalCloudUpdatedAt,
  getLocalSyncedContent,
  getLocalNoteSyncStatus,
  markLocalNoteAsConflict,
  permanentlyDeleteLocalNote,
  keepMyVersion,
  keepCloudVersion,
} from "./localNotes";


import NetInfo from "@react-native-community/netinfo";

let isSyncing = false;

/*
|--------------------------------------------------------------------------
| CHECK NETWORK
|--------------------------------------------------------------------------
*/

async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();

  return (
    state.isConnected === true &&
    state.isInternetReachable !== false
  );
}

async function getOwnedCloudNote(noteId: string) {
  const user = auth.currentUser;

  if (!user || !(await isOnline())) {
    return null;
  }

  const noteRef = doc(db, "notes", noteId);
  const snapshot = await getDoc(noteRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  if (data.ownerId !== user.uid) {
    return null;
  }

  const updatedAt =
    data.updatedAt &&
    typeof data.updatedAt.toDate === "function"
      ? data.updatedAt.toDate().toISOString()
      : null;

  if (!updatedAt) {
    return null;
  }

  return {
    title: String(data.title ?? ""),
    content: String(data.content ?? ""),
    ownerId: user.uid,
    createdAt:
      data.createdAt &&
      typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString(),
    updatedAt,
    isPinned: data.isPinned === true,
    isFavorite: data.isFavorite === true,
    color: data.color,
  };
}

/*
|--------------------------------------------------------------------------
| RESOLVE NOTE CONFLICT
|--------------------------------------------------------------------------
*/


export async function resolveKeepMyVersion(
  noteId: string
): Promise<boolean> {
  const user = auth.currentUser;

  if (!user || !(await isOnline())) {
    return false;
  }

  const cloudNote = await getOwnedCloudNote(noteId);

  if (!cloudNote) {
    console.warn(
      "Cannot resolve conflict: cloud note unavailable.",
      noteId
    );
    return false;
  }

  // Save the current cloud version as the baseline only
  // after the user explicitly chooses to keep the local copy.
  const prepared = keepMyVersion(
    noteId,
    cloudNote.updatedAt,
    cloudNote.title,
    cloudNote.content
  );

  if (!prepared) {
    return false;
  }

  // syncNote performs a transaction and checks the baseline
  // before uploading the local version.
  return syncNote(noteId);
}



export async function resolveKeepCloudVersion(
  noteId: string
): Promise<boolean> {
  const user = auth.currentUser;

  if (!user || !(await isOnline())) {
    return false;
  }

  const cloudNote = await getOwnedCloudNote(noteId);

  if (!cloudNote) {
    console.warn(
      "Cannot resolve conflict: cloud note unavailable.",
      noteId
    );
    return false;
  }

  // Confirm that the note is still marked as conflicted
  // before replacing its local content.
  const localStatus = getLocalNoteSyncStatus(noteId);

  if (localStatus !== "conflict") {
    console.warn(
      "Cannot resolve conflict: local note is no longer conflicted.",
      noteId
    );
    return false;
  }

  return keepCloudVersion(
    noteId,
    cloudNote.title,
    cloudNote.content,
    cloudNote.ownerId,
    cloudNote.createdAt,
    cloudNote.updatedAt,
    cloudNote.isPinned,
    cloudNote.isFavorite,
    cloudNote.color
  );
}



/*
|--------------------------------------------------------------------------
| SYNC ONE NOTE
|--------------------------------------------------------------------------
*/ 


export async function syncNote(
  noteId: string
  ): Promise<boolean> {
  const user = auth.currentUser;

  if (!user || !(await isOnline())) {
    return false;
  }

  const note = getPendingNotes(user.uid).find(
    (item) => item.id === noteId
  );

  if (!note) {
    return false;
  }

  const noteRef = doc(db, "notes", note.id);
  const cloudBaseline = getLocalCloudUpdatedAt(note.id);
  const syncedContent = getLocalSyncedContent(note.id);

  const createdAt = note.createdAt ?? new Date();
  const updatedAt =
    note.updatedAt ?? note.createdAt ?? new Date();

  try {
    const result = await runTransaction(db, async (transaction) => {
      const cloudSnapshot = await transaction.get(noteRef);

      if (!cloudSnapshot.exists()) {
        // Only create a cloud note if this is a new local note
        // with no previous cloud baseline.
        if (cloudBaseline || syncedContent) {
          return { status: "conflict" as const };
        }

        transaction.set(noteRef, {
          title: note.title,
          content: note.content,
          ownerId: user.uid,
          createdAt,
          updatedAt,
          isPinned: note.isPinned,
          isFavorite: note.isFavorite,
          color: note.color,
        });

        return {
          status: "synced" as const,
          cloudUpdatedAt: updatedAt.toISOString(),
        };
      }

      const cloudNote = cloudSnapshot.data();

      if (cloudNote.ownerId !== user.uid) {
        return { status: "conflict" as const };
      }

      const cloudTimestamp = cloudNote.updatedAt;
      const cloudUpdatedAt =
        cloudTimestamp &&
        typeof cloudTimestamp.toDate === "function"
          ? cloudTimestamp.toDate().toISOString()
          : null;

      const cloudMatchesBaseline =
        syncedContent !== null &&
        cloudNote.title === syncedContent.title &&
        cloudNote.content === syncedContent.content;

      const localMatchesCloud =
        cloudNote.title === note.title &&
        cloudNote.content === note.content &&
        cloudNote.isPinned === note.isPinned &&
        cloudNote.isFavorite === note.isFavorite &&
        cloudNote.color === note.color;

      // The local note already matches the cloud copy.
      if (localMatchesCloud && cloudUpdatedAt) {
        return {
          status: "synced" as const,
          cloudUpdatedAt,
        };
      }

      // Without a prior synced-content baseline, don't overwrite
      // an existing cloud document automatically.
      if (!syncedContent || !cloudBaseline || !cloudUpdatedAt) {
        return { status: "conflict" as const };
      }

      // The cloud differs from the last confirmed synced version.
      if (
        !cloudMatchesBaseline ||
        cloudUpdatedAt !== cloudBaseline
      ) {
        return { status: "conflict" as const };
      }

      // The cloud still matches our previous baseline, so the
      // pending local edit can safely be uploaded.
      transaction.set(noteRef, {
        title: note.title,
        content: note.content,
        ownerId: user.uid,
        createdAt: cloudNote.createdAt ?? createdAt,
        updatedAt,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite,
        color: note.color,
      });

      return {
        status: "synced" as const,
        cloudUpdatedAt: updatedAt.toISOString(),
      };
    });

    if (result.status === "conflict") {
      markLocalNoteAsConflict(note.id);
      debugNoteSyncState(note.id);

      console.warn(
        "Note conflict detected; local edit preserved:",
        note.id
      );

      return false;
    }

    markLocalNoteAsSynced(
      note.id,
      result.cloudUpdatedAt,
      note.title,
      note.content
    );

    console.log("Note synced:", note.id);
    return true;
  } catch (error) {
    console.error("Failed to sync note:", note.id, error);
    return false;
  }
}


/*
|--------------------------------------------------------------------------
| SYNC PENDING NOTES
|--------------------------------------------------------------------------
*/

export async function syncPendingNotes() {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  if (!(await isOnline())) {
    console.log(
      "Pending note sync skipped: offline"
    );

    return;
  }

  const pendingNotes =
    getPendingNotes(user.uid);

  console.log(
    "Pending notes:",
    pendingNotes.length
  );

  for (const note of pendingNotes) {
    try {
      await syncNote(note.id);
    } catch (error) {
      console.error(
        "Failed to sync note:",
        note.id,
        error
      );

      /*
      |--------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------
      |
      | We DO NOT mark the note as synced.
      |
      | It remains pending and can be retried later.
      |
      */
    }
  }
}

/*
|--------------------------------------------------------------------------
| SYNC PENDING DELETIONS
|--------------------------------------------------------------------------
*/

export async function syncPendingDeletions() {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  if (!(await isOnline())) {
    console.log(
      "Pending deletion sync skipped: offline"
    );

    return;
  }

  const pendingDeletions =
    getPendingDeletions(user.uid);

  console.log(
    "Pending deletions:",
    pendingDeletions.length
  );

  for (const noteId of pendingDeletions) {
    try {
      const noteRef = doc(
        db,
        "notes",
        noteId
      );

      await deleteDoc(noteRef);

      /*
      |--------------------------------------------------------------------------
      | ONLY REMOVE LOCAL ROW AFTER CLOUD DELETE SUCCEEDS
      |--------------------------------------------------------------------------
      */

      permanentlyDeleteLocalNote(
        noteId
      );

      console.log(
        "Deletion synced:",
        noteId
      );

    } catch (error) {
      console.error(
        "Failed to sync deletion:",
        noteId,
        error
      );

      /*
      |--------------------------------------------------------------------------
      | Keep local pending_delete record.
      |--------------------------------------------------------------------------
      */
    }
  }
}

/*
|--------------------------------------------------------------------------
| FULL SYNC
|--------------------------------------------------------------------------
*/

export async function syncNotes() {
  if (isSyncing) {
    console.log(
      "Sync already in progress"
    );

    return;
  }

  if (!(await isOnline())) {
    console.log(
      "Full sync skipped: offline"
    );

    return;
  }

  try {
    isSyncing = true;

    console.log(
      "Starting note synchronization..."
    );

    await syncPendingNotes();

    await syncPendingDeletions();

    console.log(
      "Note synchronization complete"
    );

  } catch (error) {
    console.error(
      "Note synchronization failed:",
      error
    );

  } finally {
    isSyncing = false;
  }
}