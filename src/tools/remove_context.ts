import { deleteById, deleteAll } from '../db/client';

export interface RemoveContextArgs {
  id?: string;
  all?: boolean;
  confirm?: boolean;
}

export const removeContextSchema = {
  name: 'remove_context',
  description: 'Remove a saved context by ID, or delete all contexts with two-step confirmation.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'UUID of the context to delete.',
      },
      all: {
        type: 'boolean',
        description: 'Set to true to delete all saved contexts. Must also pass confirm: true.',
      },
      confirm: {
        type: 'boolean',
        description: 'Required alongside all: true to confirm bulk deletion.',
      },
    },
  },
};

export function removeContext(args: RemoveContextArgs): string {
  const { id, all, confirm } = args;

  if (!id && !all) {
    return 'Provide an `id` to remove one context, or `all: true` (with `confirm: true`) to clear everything.';
  }

  if (all) {
    if (!confirm) {
      return '⚠️ This will permanently delete ALL saved contexts. To proceed, call remove_context again with both `all: true` and `confirm: true`.';
    }
    const { count } = deleteAll();
    return `🗑️ Deleted all contexts. ${count} record${count !== 1 ? 's' : ''} removed.`;
  }

  // Single ID deletion
  const result = deleteById(id!);
  if (!result.deleted) {
    return `No context found with id '${id}'. Try list_contexts to browse available records.`;
  }
  return `🗑️ Deleted context '${result.title}' (id: ${id}).`;
}
