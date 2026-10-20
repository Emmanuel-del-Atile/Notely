import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("notely.db");

const DATABASE_VERSION = 6;

export function initializeDatabase() {
  const currentVersion = db.getFirstSync<{
    user_version: number;
  }>("PRAGMA user_version;");

  const version = currentVersion?.user_version ?? 0;

  console.log("Current SQLite version:", version);

  if (version < 1) {
    migrateToVersion1();
  }

  if (version < 2) {
    migrateToVersion2();
  }

  if (version < 3) {
    migrateToVersion3();
  }

  if (version < 4) {
    migrateToVersion4();
  }

  if (version < 5) {
    migrateToVersion5();
  }

  if (version < 6) {
    migrateToVersion6();
  }

  const columns = db.getAllSync<{
    name: string;
  }>("PRAGMA table_info(notes);");

  console.log(
    "SQLite notes columns:",
    columns.map((column) => column.name)
  );

  const hasCloudUpdatedAt = columns.some(
    (column) => column.name === "cloud_updated_at"
  );

  if (!hasCloudUpdatedAt) {
    throw new Error(
      "Database migration failed: cloud_updated_at is missing."
    );
  }
  const hasSyncedTitle = columns.some(
    (column) => column.name === "synced_title"
  );

  const hasSyncedContent = columns.some(
    (column) => column.name === "synced_content"
  );

  if (!hasSyncedTitle || !hasSyncedContent) {
    throw new Error(
      "Database migration failed: synced note columns are missing."
    );
  }
  db.execSync(`
    PRAGMA user_version = ${DATABASE_VERSION};
  `);

  console.log(
    "SQLite database initialized. Version:",
    DATABASE_VERSION
  );
}

/*
|--------------------------------------------------------------------------
| VERSION 1
|--------------------------------------------------------------------------
|
| Original Notely notes table.
|
*/

function migrateToVersion1() {
  console.log("Running migration: v1");

  db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      owner_id TEXT NOT NULL,

      created_at TEXT,
      updated_at TEXT,

      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,

      color TEXT NOT NULL DEFAULT 'default'
    );
  `);

  db.execSync(`
    PRAGMA user_version = 1;
  `);

  console.log("Migration v1 complete");
}

/*
|--------------------------------------------------------------------------
| VERSION 2
|--------------------------------------------------------------------------
|
| Add synchronization state.
|
*/

function migrateToVersion2() {
  console.log("Running migration: v2");

  db.execSync(`
    ALTER TABLE notes
    ADD COLUMN sync_status TEXT NOT NULL DEFAULT 'pending';
  `);

  db.execSync(`
    PRAGMA user_version = 2;
  `);


  console.log("Migration v2 complete");
}

/*
|--------------------------------------------------------------------------
| VERSION 3
|--------------------------------------------------------------------------
|
| Add a timestamp for when the note was last modified.
|
*/

function migrateToVersion3() {
  console.log("Running migration: v3");

  db.execSync(`
    ALTER TABLE notes
    ADD COLUMN last_modified TEXT;
  `);

  db.execSync(`
    PRAGMA user_version = 3;
  `);

  console.log("Migration v3 complete");
}
/*|--------------------------------------------------------------------------
| VERSION 4
|--------------------------------------------------------------------------
*/
function migrateToVersion4() {
  console.log("Running migration: v4");

  const columns = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(notes);"
  );

  const hasCloudUpdatedAt = columns.some(
    (column) => column.name === "cloud_updated_at"
  );

  if (!hasCloudUpdatedAt) {
    db.execSync(`
      ALTER TABLE notes
      ADD COLUMN cloud_updated_at TEXT;
    `);
  }

  db.execSync(`
    PRAGMA user_version = 4;
  `);

  console.log("Migration v4 complete");
}

/*
|--------------------------------------------------------------------------
| VERSION 5
|--------------------------------------------------------------------------
*/
function migrateToVersion5() {
  console.log("Running migration: v5");

  const columns = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(notes);"
  );

  const hasCloudUpdatedAt = columns.some(
    (column) => column.name === "cloud_updated_at"
  );

  if (!hasCloudUpdatedAt) {
    db.execSync(`
      ALTER TABLE notes
      ADD COLUMN cloud_updated_at TEXT;
    `);
  }

  // Verify that the column actually exists.
  const updatedColumns = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(notes);"
  );

  const verified = updatedColumns.some(
    (column) => column.name === "cloud_updated_at"
  );

  if (!verified) {
    throw new Error(
      "Migration v5 failed: cloud_updated_at is missing."
    );
  }

  db.execSync(`
    PRAGMA user_version = 5;
  `);

  console.log("Migration v5 complete");
}


/*
|--------------------------------------------------------------------------
| VERSION 6
|--------------------------------------------------------------------------
*/
function migrateToVersion6() {
  console.log("Running migration: v6");

  const columns = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(notes);"
  );

  const hasSyncedTitle = columns.some(
    (column) => column.name === "synced_title"
  );

  const hasSyncedContent = columns.some(
    (column) => column.name === "synced_content"
  );

  if (!hasSyncedTitle) {
    db.execSync(`
      ALTER TABLE notes
      ADD COLUMN synced_title TEXT;
    `);
  }

  if (!hasSyncedContent) {
    db.execSync(`
      ALTER TABLE notes
      ADD COLUMN synced_content TEXT;
    `);
  }

  // Verify both columns exist.
  const updatedColumns = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(notes);"
  );

  const verifiedTitle = updatedColumns.some(
    (column) => column.name === "synced_title"
  );

  const verifiedContent = updatedColumns.some(
    (column) => column.name === "synced_content"
  );

  if (!verifiedTitle || !verifiedContent) {
    throw new Error(
      "Migration v6 failed: synced note columns are missing."
    );
  }

  db.execSync(`
    PRAGMA user_version = 6;
  `);

  console.log("Migration v6 complete");
}
