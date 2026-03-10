"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeContextSchema = void 0;
exports.removeContext = removeContext;
const client_1 = require("../db/client");
exports.removeContextSchema = {
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
function removeContext(args) {
    const { id, all, confirm } = args;
    if (!id && !all) {
        return 'Provide an `id` to remove one context, or `all: true` (with `confirm: true`) to clear everything.';
    }
    if (all) {
        if (!confirm) {
            return '⚠️ This will permanently delete ALL saved contexts. To proceed, call remove_context again with both `all: true` and `confirm: true`.';
        }
        const { count } = (0, client_1.deleteAll)();
        return `🗑️ Deleted all contexts. ${count} record${count !== 1 ? 's' : ''} removed.`;
    }
    // Single ID deletion
    const result = (0, client_1.deleteById)(id);
    if (!result.deleted) {
        return `No context found with id '${id}'. Try list_contexts to browse available records.`;
    }
    return `🗑️ Deleted context '${result.title}' (id: ${id}).`;
}
//# sourceMappingURL=remove_context.js.map