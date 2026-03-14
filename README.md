# context-bridge-mcp

A local MCP server that bridges Claude session context across Claude Chat, Code, and Cowork. Save structured facts, decisions, and message history to SQLite with one command. Restore full context in any Claude tool instantly. Export and import as JSON. Built with TypeScript.

---

## The Problem

Claude Chat, Claude Code, and Claude Cowork each have their own memory. Switch between them and your context is gone — you're back to re-explaining your task, your decisions, your current state. Every time.

**context-bridge-mcp** solves this with two commands: one to save, one to restore. And now with Phase 2 — export your context as JSON, share it, and import it anywhere.

---

## How It Works

```
Claude Chat  ──┐
Claude Code  ──┼──► save_context ──► SQLite (~/.context-bridge/contexts.db)
Claude Cowork ─┘                          │
                                          │
Claude Chat  ──┐                          │
Claude Code  ──┼──► load_context ◄────────┘
Claude Cowork ─┘                          │
                                          │
                         export_contexts ─┼──► context.json (by ID or all)
                         import_contexts ◄┘◄── context.json
```

One local MCP server. One SQLite database. All three tools read and write to the same store. Export and import as JSON for portability and team sharing.

---

## Features

- **Save context in one command** — Claude auto-extracts structured facts, decisions, open questions, entities, and tags before saving
- **Restore instantly** — load by ID, title search, tag, or just grab the latest
- **Announced loading** — when context is loaded, Claude announces it visibly so you always know what was restored
- **Browse your history** — list all saved contexts with filters
- **Remove contexts** — delete a specific context by UUID or wipe all at once
- **Append-only by default** — no accidental overwrites, full history preserved
- **Export to JSON** — export a single context by ID, or export everything at once *(Phase 2)*
- **Import from JSON** — import contexts from a JSON file; merges safely, never overwrites existing records *(Phase 2)*
- **Works across all Claude tools** — Chat (natural language), Code and Cowork (direct tool calls)

---

## Installation

### Prerequisites

- Node.js 18+
- Claude Desktop (for Chat + Cowork integration)
- Claude Code CLI

### 1. Clone and build

```bash
git clone https://github.com/kandarp-bhatt19/context-bridge-mcp.git
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

### `export_contexts` *(Phase 2)*

Exports one or all saved contexts to a JSON file.

**Two modes:**

| Mode | Description |
|---|---|
| By ID | Exports a single context record by its exact UUID |
| Export all | Exports every context in the store |

**Inputs:**

| Field | Type | Description |
|---|---|---|
| `id` | string? | UUID of the context to export. Omit to export all. |
| `outputPath` | string? | File path for the output JSON. Defaults to `./context-export.json` |

**Output format:**

```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "Auth Flow Refactor",
    "username": "kandarp",
    "source_tool": "code",
    "tags": ["auth", "jwt", "redis"],
    "facts": {
      "current_task": "Refactoring JWT auth middleware...",
      "key_decisions": ["Use Redis for token blacklist"],
      "open_questions": ["Single-use or sliding refresh tokens?"],
      "entities": ["AuthMiddleware", "TokenService", "RedisClient"]
    },
    "last_messages": [
      { "role": "user", "content": "Let's move the token validation..." },
      { "role": "assistant", "content": "Good call. We can extract it..." }
    ],
    "created_at": "2026-03-10T14:32:00.000Z",
    "updated_at": "2026-03-10T14:32:00.000Z"
  }
]
```

**Examples:**

```
# Export a single context by ID
export context a1b2c3d4-...

# Export all contexts
export all contexts

# Export all to a specific path
export all contexts to /tmp/team-contexts.json
```

---

### `import_contexts` *(Phase 2)*

Imports contexts from a JSON file into the local SQLite store.

**Behaviour:**
- Reads a JSON file produced by `export_contexts`
- Merges imported records into the existing store
- **Never overwrites** — if a context with the same `id` already exists, it is skipped
- Returns a summary of how many records were imported vs skipped

**Inputs:**

| Field | Type | Description |
|---|---|---|
| `inputPath` | string | Path to the JSON file to import |

**Examples:**

```
# Import from a file
import contexts from /tmp/team-contexts.json

# Import contexts shared by a teammate
import_contexts inputPath "/Users/kandarp/Downloads/sprint-contexts.json"
```

**Example output:**

```
✅ Import complete
  Imported: 3 contexts
  Skipped:  1 (already exists)
  Total in file: 4
```

> ℹ️ Import is always safe. Existing contexts are never modified or deleted.

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

# Export (Phase 2)
"export context a1b2c3d4"
"export all my contexts"
"export all contexts to /tmp/team-contexts.json"

# Import (Phase 2)
"import contexts from /tmp/team-contexts.json"
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

# Export one by ID (Phase 2)
export_contexts id "a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Export all (Phase 2)
export_contexts

# Export all to a specific path (Phase 2)
export_contexts outputPath "/tmp/team-contexts.json"

# Import from file (Phase 2)
import_contexts inputPath "/tmp/team-contexts.json"
```

---

## Typical Workflow

### Single developer — switching tools

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

### Team sharing — passing context to a teammate *(Phase 2)*

**Scenario:** You've done the architecture investigation. A teammate needs to pick up from exactly where you are.

```bash
# 1. Export your current context
export_contexts outputPath "./auth-refactor-handoff.json"

# 2. Share the file (Slack, email, drop in the repo — any way you like)

# 3. Teammate imports on their machine
import_contexts inputPath "./auth-refactor-handoff.json"

# 4. Teammate loads it in their Claude tool of choice
load_context title "Auth Refactor"
# Full context announced — decisions, open questions, message history intact
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
| **Phase 1** | ✅ Done | SQLite, 4 tools (`save`, `load`, `list`, `remove`), auto extraction, announce on load |
| **Phase 2** | ✅ Done | JSON export by ID or all (`export_contexts`), JSON import with merge (`import_contexts`) |
| **Phase 3** | 🔜 Planned | Supabase/Postgres adapter, multi-device sync, team sharing |

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

**Import skipping all records**
If all records are skipped on import, the contexts already exist in your store (matched by UUID). Use `list_contexts` to verify.
