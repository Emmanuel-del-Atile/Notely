import { db, auth } from "./firebase";
import NetInfo from "@react-native-community/netinfo";

import type {
  Note,
  NoteColor,
} from "../types/note";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  createLocalNote,
  getLocalNotes,
  updateLocalNote,
  markLocalNoteForDeletion,
  permanentlyDeleteLocalNote,
  updateLocalPin,
  updateLocalFavorite,
  updateLocalColor,
  upsertLocalNote,
} from "./localNotes";

import { syncNote } from "./syncService";

/*
|--------------------------------------------------------------------------
| NOTES CACHE
|--------------------------------------------------------------------------
*/

const notesCache = new Map<string, Note[]>();

/*
|--------------------------------------------------------------------------
| CACHE HELPERS
|--------------------------------------------------------------------------
*/

export function getCachedNotes(): Note[] | null {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return notesCache.get(user.uid) ?? null;
}

function setCachedNotes(notes: Note[]) {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  notesCache.set(user.uid, notes);
}

function clearCachedNotes() {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  notesCache.delete(user.uid);
}

/*
|--------------------------------------------------------------------------
| CREATE NOTE
|--------------------------------------------------------------------------
*/

export async function createNote(
  title: string,
  content: string
): Promise<Note | null> {
  if (!title.trim()) {
    console.log("Title is required");
    return null;
  }

  if (!content.trim()) {
    console.log("Content is required");
    return null;
  }

  const user = auth.currentUser;

  if (!user) {
    console.log("No user is signed in");
    return null;
  }

  try {
    /*
    |----------------------------------------------------------------------
    | 1. SAVE LOCALLY
    |----------------------------------------------------------------------
    */

    const note = createLocalNote(
      title,
      content,
      user.uid
    );

    /*
    |----------------------------------------------------------------------
    | 2. UPDATE MEMORY CACHE
    |----------------------------------------------------------------------
    */

    const cachedNotes =
      getCachedNotes();

    if (cachedNotes) {
      setCachedNotes([
        note,
        ...cachedNotes,
      ]);
    }

    /*
    |----------------------------------------------------------------------
    | 3. TRY CLOUD SYNC
    |----------------------------------------------------------------------
    */

    try {
      await syncNote(note.id);
    } catch (error) {
      console.log(
        "Offline or sync failed. Note remains local:",
        error
      );
    }

    return note;

  } catch (error) {
    console.error(
      "Local note creation failed:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET MY NOTES
|--------------------------------------------------------------------------
*/

export async function getMyNotes(
  forceRefresh = false
): Promise<Note[]> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not authenticated"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 1. MEMORY CACHE
  |--------------------------------------------------------------------------
  */

  const cachedNotes =
    notesCache.get(user.uid);

  if (
    cachedNotes &&
    !forceRefresh
  ) {
    console.log(
      "Returning notes from memory cache"
    );

    return cachedNotes;
  }

  /*
  |--------------------------------------------------------------------------
  | 2. SQLITE
  |--------------------------------------------------------------------------
  */

  const localNotes =
    getLocalNotes(user.uid);

  if (localNotes.length > 0) {
    console.log(
      "Returning notes from SQLite"
    );

    setCachedNotes(localNotes);

    return localNotes;
  }
  

  const networkState = await NetInfo.fetch();

  const isOnline =
    networkState.isConnected === true &&
    networkState.isInternetReachable !== false;

  if (!isOnline) {
    console.log(
      "Offline and no local notes available"
    );

    setCachedNotes([]);

    return [];
  }
  
  /*
  |--------------------------------------------------------------------------
  | 3. FIRESTORE
  |--------------------------------------------------------------------------
  */

  console.log(
    "SQLite empty. Fetching notes from Firestore"
  );

  const notesCollection =
    collection(db, "notes");

  const q = query(
    notesCollection,
    where(
      "ownerId",
      "==",
      user.uid
    )
  );

  const snapshot =
    await getDocs(q);

  const notes: Note[] =
    snapshot.docs.map((snapshotDoc) => {
      const data =
        snapshotDoc.data();

      return {
        id: snapshotDoc.id,

        title:
          data.title ?? "",

        content:
          data.content ?? "",

        ownerId:
          data.ownerId,

        createdAt:
          data.createdAt?.toDate() ??
          null,

        updatedAt:
          data.updatedAt?.toDate() ??
          null,

        isPinned:
          data.isPinned ?? false,

        isFavorite:
          data.isFavorite ?? false,

        color:
          data.color ?? "default",
      };
    });

  /*
  |--------------------------------------------------------------------------
  | 4. SAVE FIRESTORE DATA LOCALLY
  |--------------------------------------------------------------------------
  */

  for (const note of notes) {
    upsertLocalNote(note);
  }

  /*
  |--------------------------------------------------------------------------
  | 5. CACHE
  |--------------------------------------------------------------------------
  */

  setCachedNotes(notes);

  return notes;
}

/*
|--------------------------------------------------------------------------
| UPDATE NOTE
|--------------------------------------------------------------------------
*/

export async function updateNote(
  noteId: string,
  title: string,
  content: string
): Promise<boolean> {
  try {
    /*
    |----------------------------------------------------------------------
    | LOCAL FIRST
    |----------------------------------------------------------------------
    */

    const updated =
      updateLocalNote(
        noteId,
        title,
        content
      );

    if (!updated) {
      return false;
    }

    /*
    |----------------------------------------------------------------------
    | CACHE
    |----------------------------------------------------------------------
    */

    const cachedNotes =
      getCachedNotes();

    if (cachedNotes) {
      setCachedNotes(
        cachedNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                title: title.trim(),
                content: content.trim(),
                updatedAt: new Date(),
              }
            : note
        )
      );
    }

    /*
    |----------------------------------------------------------------------
    | CLOUD SYNC
    |----------------------------------------------------------------------
    */

    try {
      await syncNote(noteId);
    } catch (error) {
      console.log(
        "Update saved locally. Sync pending:",
        error
      );
    }

    return true;

  } catch (error) {
    console.error(
      "Update error:",
      error
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| DELETE NOTE
|--------------------------------------------------------------------------
*/

export async function deleteNote(
  noteId: string
): Promise<boolean> {
  try {
    /*
    |----------------------------------------------------------------------
    | Mark for deletion locally
    |----------------------------------------------------------------------
    */

    const marked =
      markLocalNoteForDeletion(
        noteId
      );

    if (!marked) {
      return false;
    }

    /*
    |----------------------------------------------------------------------
    | Remove from UI cache
    |----------------------------------------------------------------------
    */

    const cachedNotes =
      getCachedNotes();

    if (cachedNotes) {
      setCachedNotes(
        cachedNotes.filter(
          (note) =>
            note.id !== noteId
        )
      );
    }

    /*
    |----------------------------------------------------------------------
    | Try cloud deletion
    |--------------------------------------------------------------------------
    */

    try {
      const noteRef = doc(
        db,
        "notes",
        noteId
      );

      await deleteDoc(noteRef);

      console.log(
        "Note deleted from Firestore:",
        noteId
      );
      const currentUser = auth.currentUser;

      if (currentUser) {
        permanentlyDeleteLocalNote(noteId, currentUser.uid);
}

    } catch (error) {
      console.log(
        "Deletion pending cloud sync:",
        error
      );
    }

    return true;

  } catch (error) {
    console.error(
      "Delete error:",
      error
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| TOGGLE PIN
|--------------------------------------------------------------------------
*/

export async function togglePin(
  noteId: string,
  currentValue: boolean
) {
  const newValue =
    !currentValue;

  const updated =
    updateLocalPin(
      noteId,
      newValue
    );

  if (!updated) {
    return;
  }

  const cachedNotes =
    getCachedNotes();

  if (cachedNotes) {
    setCachedNotes(
      cachedNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              isPinned: newValue,
            }
          : note
      )
    );
  }

  try {
    await syncNote(noteId);
  } catch (error) {
    console.log(
      "Pin change pending sync:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| TOGGLE FAVORITE
|--------------------------------------------------------------------------
*/

export async function toggleFavorite(
  noteId: string,
  currentValue: boolean
) {
  const newValue =
    !currentValue;

  const updated =
    updateLocalFavorite(
      noteId,
      newValue
    );

  if (!updated) {
    return;
  }

  const cachedNotes =
    getCachedNotes();

  if (cachedNotes) {
    setCachedNotes(
      cachedNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              isFavorite: newValue,
            }
          : note
      )
    );
  }

  try {
    await syncNote(noteId);
  } catch (error) {
    console.log(
      "Favorite change pending sync:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE COLOR
|--------------------------------------------------------------------------
*/

export async function updateNoteColor(
  noteId: string,
  color: NoteColor
) {
  const updated =
    updateLocalColor(
      noteId,
      color
    );

  if (!updated) {
    return;
  }

  const cachedNotes =
    getCachedNotes();

  if (cachedNotes) {
    setCachedNotes(
      cachedNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              color,
            }
          : note
      )
    );
  }

  try {
    await syncNote(noteId);
  } catch (error) {
    console.log(
      "Color change pending sync:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| CLEAR CACHE
|--------------------------------------------------------------------------
*/

export function clearNotesCache() {
  clearCachedNotes();
}