import { db, auth } from "./firebase";

import type {
  Note,
  NoteColor,
} from "../types/note";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore/lite";

/*
|--------------------------------------------------------------------------
| NOTES CACHE
|--------------------------------------------------------------------------
|
| The cache lives in memory while the app is running.
|
| Key:
|   user.uid
|
| Value:
|   that user's notes
|
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
| CREATING NOTES
|--------------------------------------------------------------------------
*/

export async function createNote(
  title: string,
  content: string
) {
  try {
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

    const notesCollection = collection(
      db,
      "notes"
    );

    const note = {
      title: title.trim(),
      content: content.trim(),
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      isPinned: false,
      isFavorite: false,
      color: "default" as NoteColor,
    };

    const docRef = await addDoc(
      notesCollection,
      note
    );

    console.log("Note created:", docRef.id);

    /*
    |--------------------------------------------------------------------------
    | Update cache
    |--------------------------------------------------------------------------
    */

    const cachedNotes =
      getCachedNotes();

    if (cachedNotes) {
      const newNote: Note = {
        id: docRef.id,
        title: note.title,
        content: note.content,
        ownerId: note.ownerId,
        createdAt: new Date(),
        updatedAt: null,
        isPinned: false,
        isFavorite: false,
        color: "default",
      };

      setCachedNotes([
        newNote,
        ...cachedNotes,
      ]);
    }

    return {
      id: docRef.id,
      ...note,
    };
  } catch (error) {
    console.error(
      "Firestore error:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| READING NOTES
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
  | RETURN CACHE
  |--------------------------------------------------------------------------
  */

  const cachedNotes =
    notesCache.get(user.uid);

  if (
    cachedNotes &&
    !forceRefresh
  ) {
    console.log(
      "Returning notes from cache"
    );

    return cachedNotes;
  }

  /*
  |--------------------------------------------------------------------------
  | FETCH FROM FIRESTORE
  |--------------------------------------------------------------------------
  */

  console.log(
    "Fetching notes from Firestore"
  );

  const notesCollection = collection(
    db,
    "notes"
  );

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
    snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title ?? "",
        content: data.content ?? "",
        ownerId: data.ownerId,

        createdAt:
          data.createdAt?.toDate() ?? null,

        updatedAt:
          data.updatedAt?.toDate() ?? null,

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
  | SAVE TO CACHE
  |--------------------------------------------------------------------------
  */

  setCachedNotes(notes);

  return notes;
}

/*
|--------------------------------------------------------------------------
| UPDATING NOTES
|--------------------------------------------------------------------------
*/

export async function updateNote(
  noteId: string,
  title: string,
  content: string
) {
  try {
    const noteRef = doc(
      db,
      "notes",
      noteId
    );

    await updateDoc(noteRef, {
      title: title.trim(),
      content: content.trim(),
      updatedAt: serverTimestamp(),
    });

    console.log(
      "Note updated:",
      noteId
    );

    /*
    |--------------------------------------------------------------------------
    | Update cache
    |--------------------------------------------------------------------------
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
| DELETING NOTES
|--------------------------------------------------------------------------
*/

export async function deleteNote(
  noteId: string
): Promise<boolean> {
  try {
    const noteRef = doc(
      db,
      "notes",
      noteId
    );

    await deleteDoc(noteRef);

    console.log(
      "Note deleted:",
      noteId
    );

    /*
    |--------------------------------------------------------------------------
    | Remove from cache
    |--------------------------------------------------------------------------
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
| PINNING NOTES
|--------------------------------------------------------------------------
*/

export async function togglePin(
  noteId: string,
  currentValue: boolean
) {
  const noteRef = doc(
    db,
    "notes",
    noteId
  );

  const newValue =
    !currentValue;

  await updateDoc(noteRef, {
    isPinned: newValue,
  });

  /*
  |--------------------------------------------------------------------------
  | Update cache
  |--------------------------------------------------------------------------
  */

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
}

/*
|--------------------------------------------------------------------------
| FAVORITING NOTES
|--------------------------------------------------------------------------
*/

export async function toggleFavorite(
  noteId: string,
  currentValue: boolean
) {
  const noteRef = doc(
    db,
    "notes",
    noteId
  );

  const newValue =
    !currentValue;

  await updateDoc(noteRef, {
    isFavorite: newValue,
  });

  /*
  |--------------------------------------------------------------------------
  | Update cache
  |--------------------------------------------------------------------------
  */

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
}

/*
|--------------------------------------------------------------------------
| CHANGING NOTE COLOR
|--------------------------------------------------------------------------
*/

export async function updateNoteColor(
  noteId: string,
  color: NoteColor
) {
  const noteRef = doc(
    db,
    "notes",
    noteId
  );

  await updateDoc(noteRef, {
    color,
  });

  /*
  |--------------------------------------------------------------------------
  | Update cache
  |--------------------------------------------------------------------------
  */

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
}

/*
|--------------------------------------------------------------------------
| CLEAR CACHE
|--------------------------------------------------------------------------
|
| Useful when logging out or when we deliberately
| want to force the next request to hit Firestore.
|
*/

export function clearNotesCache() {
  clearCachedNotes();
}