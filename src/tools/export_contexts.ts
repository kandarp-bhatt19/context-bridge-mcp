import * as fs from 'fs';
import * as path from 'path';
import { findByIds, listAllContexts } from '../db/client';
import { config } from '../config';

interface ExportContextsInput {
  ids?: string[];
}

export function exportContexts(input: ExportContextsInput): string {
  const { ids } = input;

  let records;
  let missingIds: string[] = [];

  if (ids && ids.length > 0) {
    records = findByIds(ids);
    const foundIds = new Set(records.map(r => r.id));
    missingIds = ids.filter(id => !foundIds.has(id));
  } else {
    records = listAllContexts();
  }

  if (records.length === 0) {
    return 'No contexts found to export.';
  }

  fs.mkdirSync(config.exportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `export-${timestamp}.json`;
  const filePath = path.join(config.exportDir, fileName);

  const envelope = {
    exported_at: new Date().toISOString(),
    count: records.length,
    contexts: records,
  };

  fs.writeFileSync(filePath, JSON.stringify(envelope, null, 2));

  if (missingIds.length > 0) {
    return `⚠️ Exported ${records.length} context(s). Could not find IDs: ${missingIds.join(', ')}. File written to ${filePath}`;
  }

  return `✅ Exported ${records.length} context(s) to ${filePath}`;
}

export const exportContextsSchema = {
  name: 'export_contexts',
  description: 'Exports saved contexts to a JSON file for backup or inspection. Exports all contexts by default, or a specific subset by UUID.',
  inputSchema: {
    type: 'object',
    properties: {
      ids: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional list of context UUIDs to export. Omit to export all.',
      },
    },
  },
} as const;
