import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "real_estate.db";

export async function initializeDatabase(
  db: SQLite.SQLiteDatabase
) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      location TEXT,
      property_type TEXT,
      image_uri TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("SQLite database initialized successfully!");
}
