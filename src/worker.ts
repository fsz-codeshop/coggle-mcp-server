import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { validateConfig } from "./config/index.js";
import { corsHeaders, jsonResponse } from "./lib/http.js";
import { coggleProvider } from "./providers/coggle/index.js";
import type { Env } from "./types/runtime.js";

export class CoggleMCP extends McpAgent<Env> {
	server = new McpServer({
		name: "coggle-mcp-server",
		version: "1.0.0",
	});

	async init() {
		validateConfig(this.env, coggleProvider);
		const api = coggleProvider.createAPI(this.env);
		const serverFactory = coggleProvider.createServerFactory();

		serverFactory.registerTools(this.server, api);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// Required CORS setup could be needed for non-proxy requests
		if (request.method === "OPTIONS") {
			const config = validateConfig(env, coggleProvider);
			return new Response(null, {
				status: 200,
				headers: corsHeaders(config.corsOrigins),
			});
		}

		if (
			url.pathname === "/mcp" ||
			url.pathname === "/sse" ||
			url.pathname.startsWith("/mcp/") ||
			url.pathname.startsWith("/sse/")
		) {
			// McpAgent magically handles standard MCP routes (/sse, /message) under the hood
			// We just need to proxy it cleanly.
			return CoggleMCP.serve(
				url.pathname.startsWith("/sse") ? "/sse" : "/mcp",
			).fetch(request, env, ctx);
		}

		if (request.method === "GET" && url.pathname === "/") {
			validateConfig(env, coggleProvider);
			return jsonResponse(200, {
				status: "ok",
				service: "cloudflare-mcp-template (Durable Objects Server)",
				provider: coggleProvider.name,
				version: "1.0.0",
			});
		}

		return new Response("Not found", { status: 404 });
	},
};
