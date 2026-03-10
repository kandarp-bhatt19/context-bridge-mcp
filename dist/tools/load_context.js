"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextSchema = void 0;
exports.loadContext = loadContext;
const client_1 = require("../db/client");
function formatAnnouncement(ctx) {
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
function loadContext(input) {
    if (!input.id && !input.title && !input.tag && !input.latest) {
        return 'Error: Provide at least one of: id, title, tag, or latest=true.';
    }
    let record = null;
    if (input.id) {
        record = (0, client_1.findById)(input.id);
    }
    else if (input.title) {
        record = (0, client_1.findByTitle)(input.title);
    }
    else if (input.tag) {
        record = (0, client_1.findByTag)(input.tag);
    }
    else if (input.latest) {
        record = (0, client_1.findLatest)();
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
exports.loadContextSchema = {
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
};
//# sourceMappingURL=load_context.js.map