# weneed-mcp

MCP server for [WeNeed](https://app.weneed.ch) - the Coop Switzerland shopping list app.

Manage your shopping lists, add/remove items, and search the Coop product catalog through any MCP-compatible client (Claude Code, Claude Desktop, Cursor, etc.).

> **Important**
> This is **not an official MCP server** and is **not affiliated with Coop or WeNeed** in any way.
> It uses a reverse-engineered Firebase backend and may **stop working at any time** if Coop changes their infrastructure, security rules, or Cloud Functions.
> **Use at your own risk.**

## Prerequisites

- Node.js 18+
- A [WeNeed](https://app.weneed.ch) account (email/password login)

## Quick Start

```bash
npx weneed-mcp
```

Or install globally:

```bash
npm install -g weneed-mcp
```

## Configuration

### Claude Desktop (Extension)

The easiest way to get started. Download [weneed-mcp.mcpb](https://github.com/lewpgs/weneed-mcp/releases/latest/download/weneed-mcp.mcpb) and install it:

**macOS:**
- **Double-click** the downloaded file, or
- **Drag and drop** it onto the Claude Desktop app icon

**Windows:**
- In Claude Desktop, go to **File > Settings > Extensions > Advanced Settings > Install Extension** and select the downloaded file

You'll be prompted for your WeNeed credentials, which are stored securely in your OS keychain.

### Claude Code

```bash
claude mcp add weneed -e WENEED_EMAIL=your-email@example.com \
  -e WENEED_PASSWORD=your-password -- npx -y weneed-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "weneed": {
      "command": "npx",
      "args": ["-y", "weneed-mcp"],
      "env": {
        "WENEED_EMAIL": "your-email@example.com",
        "WENEED_PASSWORD": "your-password"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "weneed": {
      "command": "npx",
      "args": ["-y", "weneed-mcp"],
      "env": {
        "WENEED_EMAIL": "your-email@example.com",
        "WENEED_PASSWORD": "your-password"
      }
    }
  }
}
```

### Test Connection

Verify your credentials work before wiring it into a client:

```bash
WENEED_EMAIL='your-email@example.com' WENEED_PASSWORD='your-password' npx weneed-mcp
```

## Available Tools

| Tool | Description |
|---|---|
| `get_shopping_lists` | Get all shopping lists you have access to, including shared lists |
| `get_list_items` | Get all active items in a specific shopping list |
| `add_item` | Add a product to a shopping list by name |
| `check_item` | Mark an item as checked/bought |
| `uncheck_item` | Uncheck a previously checked item |
| `remove_item` | Remove (deactivate) an item from a list |
| `search_catalog` | Search the Coop product catalog |
| `get_categories` | Get product categories from the Coop catalog |

## Example Usage

Once configured, you can interact naturally:

- "What's on my shopping list?"
- "Add milk and eggs to my list"
- "Check off the bananas"
- "Search the catalog for gluten-free pasta"
- "Remove the yogurt from my list"

> **Note:** If you use shared lists, this MCP server can modify items visible to all participants. Keep that in mind when adding, checking, or removing items.

## How It Works

WeNeed is a Progressive Web App backed by Firebase (Firestore + Cloud Functions). This MCP server authenticates with your credentials using the Firebase JS SDK, then reads/writes directly to the same Firestore collections and calls the same Cloud Functions that the official app uses.

Your credentials are only sent to Firebase/Google's authentication servers. They are never stored or transmitted anywhere else.

## Development

```bash
git clone https://github.com/lewpgs/weneed-mcp.git
cd weneed-mcp
npm install
npm run build
node dist/index.js
```

Debug with the MCP Inspector:

```bash
WENEED_EMAIL='your-email@example.com' WENEED_PASSWORD='your-password' \
  npx -y @modelcontextprotocol/inspector npx weneed-mcp
```

## Disclaimers

- **Unofficial** - This project is not affiliated with, endorsed by, or connected to Coop or WeNeed in any way.
- **Reverse-engineered API** - This server interacts with WeNeed's Firebase backend, which is not a public API. Changes to Coop's Firebase project, Firestore security rules, or Cloud Functions could break this server without notice.
- **Credentials** - Your email and password are only used to authenticate with Firebase/Google. They are never stored or sent anywhere else.
- **Shared lists** - If you use shared shopping lists, actions taken through this MCP server (adding, checking, removing items) will be visible to all participants.
- **Use at your own risk** - No guarantees of functionality, availability, or compatibility.

## License

MIT
