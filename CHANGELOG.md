# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-20

### Added
- **MCP Server**: 🚀 Initial release of the Coggle MCP Server designed for Cloudflare Workers using Server-Sent Events (SSE).
- **Tools**: 🛠️ Implemented the following tools for interacting with the Coggle API:
  - `coggle_list_diagrams`: Retrieve a list of diagrams belonging to the user.
  - `coggle_get_diagram`: Retrieve the complete list of nodes and content structure of a specific diagram by its ID.
  - `coggle_create_diagram`: Create a new Coggle diagram.
  - `coggle_add_node`: Add a new node to a diagram.
  - `coggle_update_node`: Modify an existing node in a diagram.
  - `coggle_delete_node`: Remove a node and all its descendants from a diagram.
- **Documentation**: 📚 Developed `docs/MCP_SERVER.md` mapping the full scope of the Coggle API integration, endpoints, tool specifications, and authentication flows. Include the official Coggle API Mindmap documentation transcribed to `docs/COGGLE_API.md`.
