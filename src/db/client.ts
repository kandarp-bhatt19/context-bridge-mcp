import Database from 'better-sqlite3';
import * as fs from 'fs';
import { config } from '../config';
import { runMigrations } from './schema';

export interface Facts {
  current_task: string;
  key_decisions: string[];
  open_questions: string[];
  entities: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ContextRecord {
  id: string;
  title: string;
  username: string;
  source_tool: string;
  tags: string[];
  facts: Facts;
  last_messages: Message[];
  created_at: string;
  updated_at: string;
}

interface RawRow {
  id: string;
  title: string;
  username: string;
  source_tool: string;
  tags: string;
  facts: string;
  last_messages: string;
  created_at: string;
  updated_at: string;
}

function deserialize(row: RawRow): ContextRecord {
  return {
    ...row,
    tags: JSON.parse(row.tags),
    facts: JSON.parse(row.facts),
    last_messages: JSON.parse(row.last_messages),
  };
}

function openDb(): Database.Database {
  fs.mkdirSync(config.dbDir, { recursive: true });
  const db = new Database(config.dbPath);
  runMigrations(db);
  return db;
}

const db = openDb();

export function insertContext(record: ContextRecord): void {
  const stmt = db.prepare(`
    INSERT INTO contexts (id, title, username, source_tool, tags, facts, last_messages, created_at, updated_at)
    VALUES (@id, @title, @username, @source_tool, @tags, @facts, @last_messages, @created_at, @updated_at)
  `);

  stmt.run({
    ...record,
    tags: JSON.stringify(record.tags),
    facts: JSON.stringify(record.facts),
    last_messages: JSON.stringify(record.last_messages),
  });
}

export function findById(id: string): ContextRecord | null {
  const row = db.prepare('SELECT * FROM contexts WHERE id = ?').get(id) as RawRow | undefined;
  return row ? deserialize(row) : null;
}

export function findByTitle(title: string): ContextRecord | null {
  const row = db.prepare(
    'SELECT * FROM contexts WHERE title LIKE ? ORDER BY created_at DESC LIMIT 1'
  ).get(`%${title}%`) as RawRow | undefined;
  return row ? deserialize(row) : null;
}

export function findByTag(tag: string): ContextRecord | null {
  const row = db.prepare(
    'SELECT * FROM contexts WHERE tags LIKE ? ORDER BY created_at DESC LIMIT 1'
  ).get(`%"${tag}"%`) as RawRow | undefined;
  return row ? deserialize(row) : null;
}

export function findLatest(): ContextRecord | null {
  const row = db.prepare(
    'SELECT * FROM contexts ORDER BY created_at DESC LIMIT 1'
  ).get() as RawRow | undefined;
  return row ? deserialize(row) : null;
}

export function deleteById(id: string): { deleted: boolean; title?: string } {
  const row = db.prepare('SELECT title FROM contexts WHERE id = ?').get(id) as { title: string } | undefined;
  if (!row) return { deleted: false };
  db.prepare('DELETE FROM contexts WHERE id = ?').run(id);
  return { deleted: true, title: row.title };
}

export function deleteAll(): { count: number } {
  const result = db.prepare('DELETE FROM contexts').run();
  return { count: result.changes };
}

export function listContexts(opts: {
  tag?: string;
  source_tool?: string;
  limit?: number;
}): ContextRecord[] {
  const { tag, source_tool, limit = 20 } = opts;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (tag) {
    conditions.push(`tags LIKE ?`);
    params.push(`%"${tag}"%`);
  }
  if (source_tool) {
    conditions.push(`source_tool = ?`);
    params.push(source_tool);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(
    `SELECT * FROM contexts ${where} ORDER BY created_at DESC LIMIT ?`
  ).all([...params, limit]) as RawRow[];

  return rows.map(deserialize);
}
