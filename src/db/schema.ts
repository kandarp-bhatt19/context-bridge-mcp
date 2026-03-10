import Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contexts (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      username      TEXT NOT NULL,
      source_tool   TEXT NOT NULL,
      tags          TEXT NOT NULL,
      facts         TEXT NOT NULL,
      last_messages TEXT NOT NULL,
      created_at    DATETIME NOT NULL,
      updated_at    DATETIME NOT NULL
    );
  `);
}
