import * as fs from 'fs';
import { findById, insertContext, ContextRecord } from '../db/client';

interface ImportContextsInput {
  file_path: string;
}

export function importContexts(input: ImportContextsInput): string {
  const { file_path } = input;

  let raw: string;
  try {
    raw = fs.readFileSync(file_path, 'utf-8');
  } catch {
    return `Error: Could not read file at ${file_path}`;
  }

  let envelope: { contexts?: ContextRecord[] };
  try {
    envelope = JSON.parse(raw);
  } catch {
    return `Error: File is not valid JSON.`;
  }

  const contexts = envelope?.contexts;
  if (!Array.isArray(contexts) || contexts.length === 0) {
    return 'No contexts found in the export file.';
  }

  let imported = 0;
  let skipped = 0;

  for (const record of contexts) {
    if (findById(record.id)) {
      skipped++;
    } else {
      insertContext(record);
      imported++;
    }
  }

  if (imported === 0) {
    return `⚠️ No new contexts imported. All ${skipped} record(s) already exist in the database.`;
  }

  const skipNote = skipped > 0 ? ` Skipped ${skipped} duplicate(s).` : '';
  return `✅ Imported ${imported} context(s) from ${file_path}.${skipNote}`;
}

export const importContextsSchema = {
  name: 'import_contexts',
  description: 'Imports contexts from a previously exported JSON file into the local database. Skips records that already exist (safe to re-run).',
  inputSchema: {
    type: 'object',
    required: ['file_path'],
    properties: {
      file_path: {
        type: 'string',
        description: 'Absolute path to the exported JSON file (e.g. ~/.context-bridge/exports/export-2026-03-13-120000.json)',
      },
    },
  },
} as const;
