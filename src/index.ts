import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { saveContext, saveContextSchema } from './tools/save_context';
import { loadContext, loadContextSchema } from './tools/load_context';
import { listContextsTool, listContextsSchema } from './tools/list_contexts';
import { removeContext, removeContextSchema } from './tools/remove_context';

const server = new Server(
  { name: 'context-bridge-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      ...saveContextSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    {
      ...loadContextSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    {
      ...listContextsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    {
      ...removeContextSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'save_context': {
        const result = saveContext(args as unknown as Parameters<typeof saveContext>[0]);
        return {
          content: [{ type: 'text', text: `Context saved successfully. ID: ${result.id}` }],
        };
      }

      case 'load_context': {
        const result = loadContext(args as unknown as Parameters<typeof loadContext>[0]);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'list_contexts': {
        const result = listContextsTool(args as unknown as Parameters<typeof listContextsTool>[0]);
        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'remove_context': {
        const result = removeContext(args as unknown as Parameters<typeof removeContext>[0]);
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
