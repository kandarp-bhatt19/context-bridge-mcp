"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const save_context_1 = require("./tools/save_context");
const load_context_1 = require("./tools/load_context");
const list_contexts_1 = require("./tools/list_contexts");
const remove_context_1 = require("./tools/remove_context");
const export_contexts_1 = require("./tools/export_contexts");
const server = new index_js_1.Server({ name: 'context-bridge-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: [
        {
            ...save_context_1.saveContextSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
            },
        },
        {
            ...load_context_1.loadContextSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
            },
        },
        {
            ...list_contexts_1.listContextsSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
            },
        },
        {
            ...remove_context_1.removeContextSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
            },
        },
        {
            ...export_contexts_1.exportContextsSchema,
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: false,
            },
        },
    ],
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    try {
        switch (name) {
            case 'save_context': {
                const result = (0, save_context_1.saveContext)(args);
                return {
                    content: [{ type: 'text', text: `Context saved successfully. ID: ${result.id}` }],
                };
            }
            case 'load_context': {
                const result = (0, load_context_1.loadContext)(args);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            case 'list_contexts': {
                const result = (0, list_contexts_1.listContextsTool)(args);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            case 'remove_context': {
                const result = (0, remove_context_1.removeContext)(args);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            case 'export_contexts': {
                const result = (0, export_contexts_1.exportContexts)(args);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            default:
                return {
                    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [{ type: 'text', text: `Error: ${message}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map