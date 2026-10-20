import { db } from "./database";
import type { Note } from "../types/note";
import { randomUUID } from "expo-crypto";

export type SyncStatus =
  | "pending"
  | "synced"
  | "pending_delete"
  | "conflict";

type LocalNoteRow = {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
  cloud_updated_at: string | null;
  synced_title: string | null;
  synced_content: string | null;
  is_pinned: number;
  is_favorite: number;
  color: string;
  sync_status: SyncStatus;
};

function mapLocalNote(row: LocalNoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ownerId: row.owner_id,

    createdAt: row.created_at
      ? new Date(row.created_at)
      : null,

    updatedAt: row.updated_at
      ? new Date(row.updated_at)
      : null,

    isPinned: row.is_pinned === 1,
    isFavorite: row.is_favorite === 1,

    color: row.color as Note["color"],
  };
}

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export function createLocalNote(
  title: string,
  content: string,
  ownerId: string
): Note {
  const id = randomUUID();
  const createdAt = new Date();

  const statement = db.prepareSync(`
    INSERT INTO notes (
      id,
      title,
      content,
      owner_id,
      created_at,
      updated_at,
      cloud_updated_at,
      is_pinned,
      is_favorite,
      color,
      sync_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  try {
    statement.executeSync(
      id,
      title.trim(),
      content.trim(),
      ownerId,
      createdAt.toISOString(),
      null,
      null,
      0,
      0,
      "default",
      "pending"
    );
  } finally {
    statement.finalizeSync();
  }

  return {
    id,
    title: title.trim(),
    content: content.trim(),
    ownerId,

    createdAt,

    updatedAt: null,

    isPinned: false,
    isFavorite: false,

    color: "default",
  };
}

/*
|--------------------------------------------------------------------------
| READ
|--------------------------------------------------------------------------
*/

export function getLocalNotes(
  ownerId: string
): Note[] {
  const rows = db.getAllSync<LocalNoteRow>(
    `
      SELECT *
      FROM notes
      WHERE owner_id = ?
        AND sync_status != 'pending_delete'
      ORDER BY created_at DESC;
    `,
    ownerId
  );

  return rows.map(mapLocalNote);
}

export function getLocalCloudUpdatedAt(
  noteId: string
): string | null {
  const row = db.getFirstSync<{
    cloud_updated_at: string | null;
  }>(
    `
      SELECT cloud_updated_at
      FROM notes
      WHERE id = ?
      LIMIT 1;
    `,
    noteId
  );

  return row?.cloud_updated_at ?? null;
}


export function getLocalSyncedContent(
  noteId: string
  ): { title: string; content: string } | null {
  const row = db.getFirstSync<{
    synced_title: string | null;
    synced_content: string | null;
  }>(
    `
      SELECT synced_title, synced_content
      FROM notes
      WHERE id = ?
      LIMIT 1;
    `,
    noteId
  );

  if (row?.synced_title == null || row.synced_content == null) {
    return null;
  }

  return {
    title: row.synced_title,
    content: row.synced_content,
  };
}


/*
|--------------------------------------------------------------------------
| READ ONE
|--------------------------------------------------------------------------
*/

export function getLocalNote(
  noteId: string
): Note | null {
  const row = db.getFirstSync<LocalNoteRow>(
    `
      SELECT *
      FROM notes
      WHERE id = ?
        AND sync_status != 'pending_delete'
      LIMIT 1;
    `,
    noteId
  );

  if (!row) {
    return null;
  }

  return mapLocalNote(row);
}

export function getLocalNoteSyncStatus(
  noteId: string
  ): SyncStatus | null {
  const row = db.getFirstSync<{
    sync_status: SyncStatus;
  }>(
    `
      SELECT sync_status
      FROM notes
      WHERE id = ?
      LIMIT 1;
    `,
    noteId
  );

  return row?.sync_status ?? null;
}



/*
|--------------------------------------------------------------------------
| UPDATE CONTENT
|--------------------------------------------------------------------------
*/

export function updateLocalNote(
  noteId: string,
  title: string,
  content: string
): boolean {
  const updatedAt = new Date();

  const result = db.runSync(
    `
      UPDATE notes
      SET
        title = ?,
        content = ?,
        updated_at = ?,
        sync_status = 'pending'
      WHERE id = ?;
    `,
    title.trim(),
    content.trim(),
    updatedAt.toISOString(),
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export function markLocalNoteForDeletion(
  noteId: string
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET sync_status = 'pending_delete'
      WHERE id = ?;
    `,
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| FINAL DELETE
|--------------------------------------------------------------------------
|
| Used only after Firestore confirms deletion.
|
*/

export function permanentlyDeleteLocalNote(
  noteId: string
): boolean {
  const result = db.runSync(
    `
      DELETE FROM notes
      WHERE id = ?;
    `,
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| TOGGLE PIN
|--------------------------------------------------------------------------
*/

export function updateLocalPin(
  noteId: string,
  value: boolean
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        is_pinned = ?,
        sync_status = 'pending'
      WHERE id = ?;
    `,
    value ? 1 : 0,
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| TOGGLE FAVORITE
|--------------------------------------------------------------------------
*/

export function updateLocalFavorite(
  noteId: string,
  value: boolean
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        is_favorite = ?,
        sync_status = 'pending'
      WHERE id = ?;
    `,
    value ? 1 : 0,
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| UPDATE COLOR
|--------------------------------------------------------------------------
*/

export function updateLocalColor(
  noteId: string,
  color: Note["color"]
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        color = ?,
        sync_status = 'pending'
      WHERE id = ?;
    `,
    color,
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| MARK AS SYNCED
|--------------------------------------------------------------------------
*/


export function markLocalNoteAsSynced(
  noteId: string,
  cloudUpdatedAt: string,
  syncedTitle: string,
  syncedContent: string
  ): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        sync_status = 'synced',
        cloud_updated_at = ?,
        synced_title = ?,
        synced_content = ?
      WHERE id = ?;
    `,
    cloudUpdatedAt,
    syncedTitle,
    syncedContent,
    noteId
  );

  return result.changes > 0;
}


export function markLocalNoteAsConflict(
  noteId: string
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET sync_status = 'conflict'
      WHERE id = ?;
    `,
    noteId
  );

  return result.changes > 0;
}

/*
|--------------------------------------------------------------------------
| GET PENDING NOTES
|--------------------------------------------------------------------------
*/

export function getPendingNotes(
  ownerId: string
): Note[] {
  const rows = db.getAllSync<LocalNoteRow>(
    `
      SELECT *
      FROM notes
      WHERE owner_id = ?
        AND sync_status = 'pending'
      ORDER BY created_at ASC;
    `,
    ownerId
  );

  return rows.map(mapLocalNote);
}

/*
|--------------------------------------------------------------------------
| GET PENDING DELETIONS
|--------------------------------------------------------------------------
*/

export function getPendingDeletions(
  ownerId: string
): string[] {
  const rows = db.getAllSync<{
    id: string;
  }>(
    `
      SELECT id
      FROM notes
      WHERE owner_id = ?
        AND sync_status = 'pending_delete';
    `,
    ownerId
  );

  return rows.map((row) => row.id);
}


export function upsertLocalNote(note: Note): boolean {
  const result = db.runSync(
    `
      INSERT INTO notes (
        id,
        title,
        content,
        owner_id,
        created_at,
        updated_at,
        cloud_updated_at,
        synced_title,
        synced_content,
        is_pinned,
        is_favorite,
        color,
        sync_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        owner_id = excluded.owner_id,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        cloud_updated_at = excluded.cloud_updated_at,
        synced_title = excluded.synced_title,
        synced_content = excluded.synced_content,
        is_pinned = excluded.is_pinned,
        is_favorite = excluded.is_favorite,
        color = excluded.color,
        sync_status = 'synced'
      WHERE notes.sync_status = 'synced';
    `,
    note.id,
    note.title,
    note.content,
    note.ownerId,
    note.createdAt?.toISOString() ?? null,
    note.updatedAt?.toISOString() ?? null,
    note.updatedAt?.toISOString() ?? null,
    note.title,
    note.content,
    note.isPinned ? 1 : 0,
    note.isFavorite ? 1 : 0,
    note.color,
    "synced"
  );

  return result.changes > 0;
}


export function debugNoteSyncState(noteId: string) {
  const row = db.getFirstSync<{
    id: string;
    sync_status: string;
    updated_at: string | null;
    cloud_updated_at: string | null;
  }>(
    `
      SELECT
        id,
        sync_status,
        updated_at,
        cloud_updated_at
      FROM notes
      WHERE id = ?;
    `,
    noteId
  );

  console.log("Note sync diagnostic:", row);
}
export function prepareConflictRetry(
  noteId: string,
  cloudUpdatedAt: string
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        cloud_updated_at = ?,
        sync_status = 'pending'
      WHERE id = ?
        AND sync_status = 'conflict';
    `,
    cloudUpdatedAt,
    noteId
  );

  return result.changes > 0;
}

export function keepMyVersion(
  noteId: string,
  cloudUpdatedAt: string,
  cloudTitle: string,
  cloudContent: string
  ): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        cloud_updated_at = ?,
        synced_title = ?,
        synced_content = ?,
        sync_status = 'pending'
      WHERE id = ?
        AND sync_status = 'conflict';
    `,
    cloudUpdatedAt,
    cloudTitle,
    cloudContent,
    noteId
  );

  return result.changes > 0;
}

export function keepCloudVersion(
  noteId: string,
  cloudTitle: string,
  cloudContent: string,
  cloudOwnerId: string,
  cloudCreatedAt: string,
  cloudUpdatedAt: string,
  cloudIsPinned: boolean,
  cloudIsFavorite: boolean,
  cloudColor: Note["color"]
): boolean {
  const result = db.runSync(
    `
      UPDATE notes
      SET
        title = ?,
        content = ?,
        owner_id = ?,
        created_at = ?,
        updated_at = ?,
        cloud_updated_at = ?,
        synced_title = ?,
        synced_content = ?,
        is_pinned = ?,
        is_favorite = ?,
        color = ?,
        sync_status = 'synced'
      WHERE id = ?
        AND sync_status = 'conflict';
    `,
    cloudTitle,
    cloudContent,
    cloudOwnerId,
    cloudCreatedAt,
    cloudUpdatedAt,
    cloudUpdatedAt,
    cloudTitle,
    cloudContent,
    cloudIsPinned ? 1 : 0,
    cloudIsFavorite ? 1 : 0,
    cloudColor,
    noteId
  );

  return result.changes > 0;
}

