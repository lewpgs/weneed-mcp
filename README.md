# weneed-mcp

MCP server for [WeNeed](https://app.weneed.ch) - the Coop Switzerland shopping list app.

Manage your shopping lists, add/remove items, and search the Coop product catalog through any MCP-compatible client (Claude Code, Claude Desktop, Cursor, etc.).

> **Disclaimer**: This is an unofficial MCP server. WeNeed/Coop does not provide a public API. This project reverse-engineers the app's Firebase backend and may stop working at any time if they change their infrastructure.

## Prerequisites

- Node.js 18+
- A [WeNeed](https://app.weneed.ch) account (email/password login)

## Install

```bash
npm install -g weneed-mcp
```

Or run directly with `npx`:

```bash
npx weneed-mcp
```

## Configuration

### Claude Code

```bash
claude mcp add weneed -- npx -y weneed-mcp
```

Then set your credentials as environment variables, or add them to the MCP config:

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

### From source

```bash
git clone https://github.com/lewpgs/weneed-mcp.git
cd weneed-mcp
npm install
npm run build
node dist/index.js
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

## How It Works

WeNeed is a Progressive Web App backed by Firebase (Firestore + Cloud Functions). This MCP server authenticates with your credentials using the Firebase JS SDK, then reads/writes directly to the same Firestore collections and calls the same Cloud Functions that the official app uses.

Your credentials are only sent to Firebase/Google's authentication servers. They are never stored or transmitted anywhere else.

## License

MIT
