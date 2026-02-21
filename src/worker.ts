import { validateConfig } from './config/index.js'
import { createMcpServer } from './core/registry.js'
import { AppError, errorToResponse } from './lib/errors.js'
import { corsHeaders, jsonResponse, textResponse } from './lib/http.js'
import { coggleProvider } from './providers/coggle/index.js'
import { handleHttpMcp } from './transport/http.js'
import type { Env, RequestContext } from './types/runtime.js'

// Global request ID counter
let __rid = 0

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const reqId = `${(++__rid).toString(36)}-${Date.now().toString(36).slice(-4)}`
        const url = new URL(request.url)
        const ctx: RequestContext = { reqId, url, env }

        try {
            // Validate configuration with provider requirements
            const config = validateConfig(env, coggleProvider)

            // Handle CORS preflight
            if (request.method === 'OPTIONS') {
                return new Response(null, {
                    status: 200,
                    headers: corsHeaders(config.corsOrigins),
                })
            }


            // Health endpoint
            if (request.method === 'GET' && url.pathname === '/') {
                return jsonResponse(200, {
                    status: 'ok',
                    service: 'cloudflare-mcp-template',
                    provider: coggleProvider.name,
                    version: '1.0.0',
                    timestamp: new Date().toISOString(),
                    webSocketEnabled: config.enableWebSocket,
                    serverName: config.serverName,
                })
            }

            // MCP endpoint
            if (url.pathname === '/mcp' || (request.method === 'POST' && url.pathname === '/')) {
                // Create provider API and server factory
                const api = coggleProvider.createAPI(env)
                const serverFactory = coggleProvider.createServerFactory()

                // Handle MCP request
                const response = await handleHttpMcp(request, ctx, config, serverFactory, api)

                // Add CORS headers to MCP response
                const headers = new Headers(response.headers)
                Object.entries(corsHeaders(config.corsOrigins)).forEach(([key, value]) => {
                    headers.set(key, value)
                })

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers,
                })
            }

            // 404 for unknown paths
            return textResponse(404, 'Not Found')
        } catch (error) {
            return errorToResponse(error, reqId)
        }
    },
}