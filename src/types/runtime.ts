// Runtime types for Cloudflare Workers MCP template

export interface Env {
	API_KEY?: string; // Provider-specific API key
	BEARER_TOKEN?: string;
	COGGLE_API_TOKEN?: string;
	MCP_SERVER_NAME?: string;
	ENABLE_WS?: string;
	CORS_ORIGINS?: string;
	// Add other provider-specific env vars as needed
}

export interface AppConfig {
	serverName: string;
	enableWebSocket: boolean;
	corsOrigins: string[];
	bearerToken?: string;
	apiKey?: string;
	// Provider-specific config will extend this
}

// Provider interfaces
export interface MCPServerFactory {
	registerTools(server: any, api: any): void;
}

export interface MCPProvider {
	name: string;
	createAPI(env: Env): any;
	createServerFactory(): MCPServerFactory;
	getRequiredEnvVars(): string[];
}
