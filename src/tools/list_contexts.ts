import { listContexts, ContextRecord } from '../db/client';

interface ListContextsInput {
  tag?: string;
  source_tool?: string;
  limit?: number;
}

function formatTable(records: ContextRecord[]): string {
  if (records.length === 0) {
    return 'No saved contexts found. Use save_context to save your first session.';
  }

  const header = ['ID       ', 'Title                           ', 'Source  ', 'Tags                    ', 'Created At          '].join(' | ');
  const divider = '-'.repeat(header.length);

  const rows = records.map(r => {
    const id = r.id.slice(0, 8).padEnd(9);
    const title = r.title.slice(0, 32).padEnd(32);
    const source = r.source_tool.padEnd(8);
    const tags = r.tags.join(', ').slice(0, 24).padEnd(24);
    const created = r.created_at.slice(0, 19).replace('T', ' ');
    return [id, title, source, tags, created].join(' | ');
  });

  return [header, divider, ...rows].join('\n');
}

export function listContextsTool(input: ListContextsInput): string {
  const records = listContexts({
    tag: input.tag,
    source_tool: input.source_tool,
    limit: input.limit ?? 20,
  });

  return formatTable(records);
}

export const listContextsSchema = {
  name: 'list_contexts',
  description: 'Returns a browsable list of saved contexts, sorted by most recent first.',
  inputSchema: {
    type: 'object',
    properties: {
      tag: {
        type: 'string',
        description: 'Filter results by tag',
      },
      source_tool: {
        type: 'string',
        enum: ['chat', 'code', 'cowork'],
        description: 'Filter results by source tool',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 20)',
      },
    },
  },
} as const;
