# weneed-mcp

Manage your [WeNeed](https://app.weneed.ch) (Coop Switzerland) shopping lists with Claude. Add items, check them off, search the Coop catalog, and more.

> **Important**
> This is **not an official MCP server** and is **not affiliated with Coop or WeNeed** in any way.
> It uses a reverse-engineered Firebase backend and may **stop working at any time** if Coop changes their infrastructure.
> **Use at your own risk.**

## What you can do

Once installed, just talk to Claude naturally:

- "What's on my shopping list?"
- "Add milk and eggs to my list"
- "Check off the bananas"
- "Search the catalog for gluten-free pasta"
- "Remove the yogurt from my list"

> **Note:** If you use shared lists, actions taken through this server will be visible to all participants.

## Install

You need a [WeNeed](https://app.weneed.ch) account (email/password) to use this.

### Claude Desktop (recommended)

1. Download [weneed-mcp.mcpb](https://github.com/lewpgs/weneed-mcp/releases/latest/download/weneed-mcp.mcpb)
2. Install it:

   **macOS** - Double-click the file, or drag and drop it onto the Claude Desktop app icon

   **Windows** - In Claude Desktop, go to File > Settings > Extensions > Advanced Settings > Install Extension and select the file

3. Enter your WeNeed email and password when prompted. Your credentials are stored securely in your OS keychain.

That's it. You're ready to go.

---

## Advanced setup

These methods require [Node.js 18+](https://nodejs.org) installed on your machine.

### Claude Code

```bash
claude mcp add weneed -e WENEED_EMAIL=your-email@example.com \
  -e WENEED_PASSWORD=your-password -- npx -y weneed-mcp
```

### Claude Desktop (manual) / Cursor

Add the following to your config file:

- **Claude Desktop** - `claude_desktop_config.json`
- **Cursor** - `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global)

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

### Test connection

Verify your credentials work before wiring it into a client:

```bash
WENEED_EMAIL='your-email@example.com' WENEED_PASSWORD='your-password' npx weneed-mcp
```

## Available tools

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

## How it works

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
