"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveContextSchema = void 0;
exports.saveContext = saveContext;
const uuid_1 = require("uuid");
const client_1 = require("../db/client");
function saveContext(input) {
    const now = new Date().toISOString();
    const id = (0, uuid_1.v4)();
    (0, client_1.insertContext)({
        id,
        title: input.title,
        username: input.username,
        source_tool: input.source_tool,
        tags: input.tags,
        facts: input.facts,
        last_messages: input.messages,
        created_at: now,
        updated_at: now,
    });
    return { id };
}
exports.saveContextSchema = {
    name: 'save_context',
    description: 'Persists the current session context to SQLite. Claude must extract facts and tags before calling this tool.',
    inputSchema: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'Human-readable name for this context',
            },
            username: {
                type: 'string',
                description: 'User identifier',
            },
            source_tool: {
                type: 'string',
                enum: ['chat', 'code', 'cowork'],
                description: 'Which Claude tool is saving this context',
            },
            facts: {
                type: 'object',
                description: 'Auto-extracted session summary',
                properties: {
                    current_task: { type: 'string' },
                    key_decisions: { type: 'array', items: { type: 'string' } },
                    open_questions: { type: 'array', items: { type: 'string' } },
                    entities: { type: 'array', items: { type: 'string' } },
                },
                required: ['current_task', 'key_decisions', 'open_questions', 'entities'],
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: '3-5 short tags describing this session',
            },
            messages: {
                type: 'array',
                description: 'Last 10 messages as role/content pairs',
                items: {
                    type: 'object',
                    properties: {
                        role: { type: 'string', enum: ['user', 'assistant'] },
                        content: { type: 'string' },
                    },
                    required: ['role', 'content'],
                },
            },
        },
        required: ['title', 'username', 'source_tool', 'facts', 'tags', 'messages'],
    },
};
//# sourceMappingURL=save_context.js.map