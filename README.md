# Coggle MCP Server

The **Coggle MCP Server** is a server implementing the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) designed to mediate interactions between Artificial Intelligence Agents (LLMs) and the mind mapping platform [Coggle](https://coggle.it). 

Built with TypeScript and designed to run on **Cloudflare Workers** infrastructure using **Server-Sent Events (SSE)** requests.

---

## 🚀 Features (Tools)

The Coggle API exposes the following tools for AIs to use:

- **`coggle_list_diagrams`**: Lists and retrieves all diagrams belonging to the user.
- **`coggle_get_diagram`**: Retrieves the complete node structure and information of a specific diagram using its ID.
- **`coggle_create_diagram`**: Creates a blank mind map / diagram in Coggle.
- **`coggle_add_node`**: Adds a new (child) node to a diagram starting from a parent node.
- **`coggle_update_node`**: Modifies existing nodes' data (text, parent node, or position).
- **`coggle_delete_node`**: Completely deletes a node and all of its descendant nodes from a diagram.

## 📦 How to Install and Run Locally

### 1. Requirements
- [Node.js](https://nodejs.org/) (version 18+)
- Account on [Coggle](https://coggle.it)
- Account on [Cloudflare](https://dash.cloudflare.com/) (for deployment)

### 2. Configuration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your Coggle App and Authentication Variables:
   First, go to [Coggle Developer Tools](https://coggle.it/developer) and create a new Client. 
   Create a `.dev.vars` file in the project's root folder and populate it with your App credentials:
   ```env
   COGGLE_CLIENT_ID=your_client_id_here
   COGGLE_CLIENT_SECRET=your_client_secret_here
   ```

3. Generate your API Access Token:
   After setting up the `.dev.vars` file, use the provided local script to execute the complete OAuth Authentication flow and generate your permanent token:
   ```bash
   npm run get-coggle-token
   ```

4. Save the Token (Local Development Environment):
   Add the token generated in the previous step to your `.dev.vars` file. 
   *(Optional)*: If you want to secure your MCP Server with authentication, you can also add a custom `BEARER_TOKEN` variable:
   ```env
   COGGLE_API_TOKEN=your_access_token_here
   BEARER_TOKEN=optional_custom_token_to_secure_mcp_server
   ```

### 3. Running the Server

To run the server locally via [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npm run dev
```

The Worker will start locally, generally at the address: `http://localhost:8787`. You can intercept the default route `http://localhost:8787/sse` in MCP connections.

## ⚙️ Connecting with Claude Desktop

Once hosted (or running through a proxy/network tunnel), you can configure your Claude Desktop application to talk natively with your Coggle via the auxiliary CLI (`@modelcontextprotocol/client-fetch`). Add the configuration below to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "coggle-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/client-fetch",
        "https://your-worker-url.workers.dev/sse"
      ]
    }
  }
}
```

## ☁️ Deployment (Cloudflare)

Deployment pushes the system as a Cloudflare Worker.

1. **Add your Production Token via Wrangler** (Only needs to be executed once):
   ```bash
   npx wrangler secret put COGGLE_API_TOKEN --env production
   ```

2. **Deploy to Production**:
   ```bash
   npm run deploy
   ```

## 📚 Additional Documentation

For in-depth documentation on how the Coggle connector and the Worker are designed, check out the `/docs` folder:
- [Official MCP (Server) Guide](docs/MCP_SERVER.md)
- [Official (Transcribed) Coggle API Documentation](docs/COGGLE_API_OFFICIAL_MAP.md)
- [Cloudflare Providers Creation Guide](docs/PROVIDERS.md)
