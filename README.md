# context-bridge-mcp

A local MCP server that bridges Claude session context across Claude Chat, Code, and Cowork. Save structured facts, decisions, and message history to SQLite with one command. Restore full context in any Claude tool instantly. Built with TypeScript.

---

## The Problem

Claude Chat, Claude Code, and Claude Cowork each have their own memory. Switch between them and your context is gone — you're back to re-explaining your task, your decisions, your current state. Every time.

**context-bridge-mcp** solves this with two commands: one to save, one to restore.

---

## How It Works

```
Claude Chat  ──┐
Claude Code  ──┼──► save_context ──► SQLite (~/.context-bridge/contexts.db)
Claude Cowork ─┘                          │
                                          │
Claude Chat  ──┐                          │
Claude Code  ──┼──► load_context ◄────────┘
Claude Cowork ─┘
```

One local MCP server. One SQLite database. All three tools read and write to the same store.

---

## Features

- **Save context in one command** — Claude auto-extracts structured facts, decisions, open questions, entities, and tags before saving
- **Restore instantly** — load by ID, title search, tag, or just grab the latest
- **Announced loading** — when context is loaded, Claude announces it visibly so you always know what was restored
- **Browse your history** — list all saved contexts with filters
- **Remove contexts** — delete a specific context by UUID or wipe all at once
- **Append-only by default** — no accidental overwrites, full history preserved
- **Works across all Claude tools** — Chat (natural language), Code and Cowork (direct tool calls)

---

## Installation

### Prerequisites

- Node.js 18+
- Claude Desktop (for Chat + Cowork integration)
- Claude Code CLI

### 1. Clone and build

```bash
git clone https://github.com/your-username/context-bridge-mcp.git
cd context-bridge-mcp
npm install
npm run build
```

### 2. Register with Claude Code

```bash
claude mcp add context-bridge node /absolute/path/to/context-bridge-mcp/dist/index.js
```

### 3. Register with Claude Desktop (for Chat + Cowork)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "context-bridge": {
      "command": "node",
      "args": ["/absolute/path/to/context-bridge-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop after saving.

### 4. Verify

```bash
claude mcp list
# context-bridge   node   /path/to/dist/index.js
```

---

## Tools

### `save_context`

Saves the current session context to SQLite. Claude auto-extracts facts and tags before persisting.

**Inputs:**

| Field | Type | Description |
|---|---|---|
| `title` | string | Human-readable name for this context |
| `username` | string | User identifier |
| `source_tool` | string | `"chat"` \| `"code"` \| `"cowork"` |
| `facts` | object | Auto-extracted: task, decisions, open questions, entities |
| `tags` | string[] | Auto-generated topic tags |
| `messages` | array | Last 10 messages as `{role, content}` pairs |

Always creates a new record — never overwrites. Returns the saved `id`.

---

### `load_context`

Retrieves a saved context and announces it in the conversation.

**Inputs (one required):**

| Field | Type | Description |
|---|---|---|
| `id` | string? | Exact UUID lookup |
| `title` | string? | Fuzzy title search |
| `tag` | string? | Filter by tag |
| `latest` | boolean? | Load the most recently saved context |

When loaded, Claude announces:

```
📂 Loaded context: "Auth Flow Refactor"
Saved from: code on 2026-03-10 14:32

Current task: Refactoring JWT auth middleware to support refresh tokens
Key decisions: Use Redis for token blacklist, keep existing cookie strategy
Open questions: Should refresh tokens be single-use or sliding window?
Entities in play: AuthMiddleware, TokenService, RedisClient, /api/auth/refresh

--- Last messages ---
User: Let's move the token validation logic out of the route handler...
Assistant: Good call. We can extract it into a validateToken() helper...
```

---

### `list_contexts`

Returns a browsable list of saved contexts, sorted by most recent first.

**Inputs (all optional):**

| Field | Type | Description |
|---|---|---|
| `tag` | string? | Filter by tag |
| `source_tool` | string? | Filter by `"chat"` \| `"code"` \| `"cowork"` |
| `limit` | number? | Default 20 |

**Example output:**

```
ID        Title                      Tool      Tags                    Saved
────────  ─────────────────────────  ────────  ──────────────────────  ─────────────────
a1b2c3d4  Auth Flow Refactor         code      auth, jwt, redis        2026-03-10 14:32
e5f6g7h8  Sprint Planning Session    chat      planning, sprint, q2    2026-03-09 10:15
i9j0k1l2  Mobile Push Notifications  cowork    flutter, fcm, mobile    2026-03-08 16:44
```

---

### `remove_context`

Removes saved contexts from the database.

**Two modes:**

| Mode | Description |
|---|---|
| By UUID | Removes a single context record by its exact `id` |
| Remove all | Wipes the entire contexts table |

**Examples:**

```
# Remove a specific context
remove context with id a1b2c3d4-...

# Remove all saved contexts
remove all contexts
```

> ⚠️ Remove all is irreversible. There is no soft delete in Phase 1.

---

## Usage Examples

### Claude Chat (natural language)

```
# Save
"save this context as Auth Flow Refactor"

# Load
"load my last context"
"load context titled Auth Flow"
"load context with tag flutter"

# List
"list my saved contexts"
"list contexts from code"

# Remove
"remove context a1b2c3d4"
"remove all my saved contexts"
```

### Claude Code / Cowork (direct tool calls)

```
# Save
save_context with title "Sprint Planning" source_tool "code"

# Load latest
load_context latest

# Load by title
load_context title "Auth Flow"

# List all
list_contexts

# List filtered
list_contexts tag "flutter"
list_contexts source_tool "cowork"

# Remove one
remove_context id "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Remove all
remove_context all
```

---

## Typical Workflow

**Scenario:** You're deep in a Claude Code session refactoring your auth service. You need to switch to Claude Chat for a quick design discussion, then come back to Code.

```bash
# 1. In Claude Code — save before switching
save_context with title "Auth Refactor — token validation extracted"

# 2. Switch to Claude Chat — pick up where you left off
"load my last context"
# Claude announces: task, decisions, open questions, last messages

# 3. Have your discussion in Chat, then save again
"save this context as Auth Refactor — post design discussion"

# 4. Back in Claude Code — restore the updated context
load_context title "Auth Refactor — post design"
# Full context restored, carry on
```

---

## Storage

- **Location:** `~/.context-bridge/contexts.db`
- **Engine:** SQLite (via `better-sqlite3`)
- **Auto-created** on first run — no setup needed
- **Append-only** — every save creates a new record

### Schema

```sql
CREATE TABLE IF NOT EXISTS contexts (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  username      TEXT NOT NULL,
  source_tool   TEXT NOT NULL,
  tags          TEXT NOT NULL,       -- JSON array
  facts         TEXT NOT NULL,       -- JSON object
  last_messages TEXT NOT NULL,       -- JSON array of {role, content}
  created_at    DATETIME NOT NULL,
  updated_at    DATETIME NOT NULL
);
```

---

## Configuration

Edit `src/config.ts` to customize:

```typescript
export const config = {
  dbPath: path.join(os.homedir(), '.context-bridge', 'contexts.db'),
  messageCount: 10,          // number of last messages to capture
  defaultUsername: 'your-username',
};
```

---

## Roadmap

| Phase | Status | Features |
|---|---|---|
| **Phase 1** | ✅ Current | SQLite, 4 tools, auto extraction, announce on load |
| **Phase 2** | Planned | JSON export/import, CLAUDE.md write-back for Code/Cowork |
| **Phase 3** | Planned | Supabase/Postgres adapter, multi-device, team sharing |

---

## Troubleshooting

**MCP not showing in Claude Code**
```bash
claude mcp list                     # verify it's registered
claude mcp get context-bridge       # check tools are exposed
npm run build                       # rebuild if you made changes
```

**"Unknown skill" error**
Don't use `/` slash syntax. Call tools by natural language or direct tool name — not `/save_context`.

**Database not found**
The `~/.context-bridge/` directory and `contexts.db` file are auto-created on first tool call. No manual setup needed.

**Wrong path error**
Always use absolute paths in the MCP config, not relative ones.

---

## License

MIT
