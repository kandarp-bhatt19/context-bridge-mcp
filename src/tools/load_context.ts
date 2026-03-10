import { findById, findByTitle, findByTag, findLatest, ContextRecord } from '../db/client';

interface LoadContextInput {
  id?: string;
  title?: string;
  tag?: string;
  latest?: boolean;
}

function formatAnnouncement(ctx: ContextRecord): string {
  const transcript = ctx.last_messages
    .map(m => `[${m.role}]: ${m.content}`)
    .join('\n');

  const decisions = ctx.facts.key_decisions.length
    ? ctx.facts.key_decisions.map(d => `  - ${d}`).join('\n')
    : '  (none)';

  const questions = ctx.facts.open_questions.length
    ? ctx.facts.open_questions.map(q => `  - ${q}`).join('\n')
    : '  (none)';

  const entities = ctx.facts.entities.length
    ? ctx.facts.entities.join(', ')
    : '(none)';

  return [
    `📂 Loaded context: "${ctx.title}"`,
    `Saved from: ${ctx.source_tool} on ${ctx.created_at}`,
    ``,
    `Current task: ${ctx.facts.current_task}`,
    `Key decisions:\n${decisions}`,
    `Open questions:\n${questions}`,
    `Entities in play: ${entities}`,
    ``,
    `--- Last messages ---`,
    transcript,
  ].join('\n');
}

export function loadContext(input: LoadContextInput): string {
  if (!input.id && !input.title && !input.tag && !input.latest) {
    return 'Error: Provide at least one of: id, title, tag, or latest=true.';
  }

  let record: ContextRecord | null = null;

  if (input.id) {
    record = findById(input.id);
  } else if (input.title) {
    record = findByTitle(input.title);
  } else if (input.tag) {
    record = findByTag(input.tag);
  } else if (input.latest) {
    record = findLatest();
  }

  if (!record) {
    const hint = input.title
      ? `No context found with title matching '${input.title}'.`
      : input.tag
      ? `No context found with tag '${input.tag}'.`
      : input.id
      ? `No context found with id '${input.id}'.`
      : 'No contexts saved yet.';
    return `${hint} Try list_contexts to browse available records.`;
  }

  return formatAnnouncement(record);
}

export const loadContextSchema = {
  name: 'load_context',
  description: 'Retrieves a saved context and announces it in the conversation. Provide one of: id, title, tag, or latest=true.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Exact UUID of the context to load',
      },
      title: {
        type: 'string',
        description: 'Fuzzy title search (matches substrings)',
      },
      tag: {
        type: 'string',
        description: 'Filter by a single tag',
      },
      latest: {
        type: 'boolean',
        description: 'If true, loads the most recently saved context',
      },
    },
  },
} as const;
