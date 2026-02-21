import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { MCPServerFactory } from '../../types/runtime.js'
import type { CoggleAPI } from './api.js'

export class CoggleFactory implements MCPServerFactory {
    createServer(api: CoggleAPI, serverName: string): McpServer {
        throw new Error('Use createMcpServer from registry.ts instead')
    }

    registerTools(server: McpServer, api: CoggleAPI): void {
        server.tool(
            'coggle_list_diagrams',
            'Retrieve a list of diagrams belonging to the user',
            {},
            async () => {
                const diagrams = await api.listDiagrams()
                return {
                    content: [{ type: 'text', text: JSON.stringify(diagrams, null, 2) }],
                }
            },
        )

        server.tool(
            'coggle_get_diagram',
            'Retrieve the complete list of nodes and content structure of a specific diagram by its ID',
            {
                diagram_id: z.string().describe('The unique identifier of the diagram to retrieve'),
            },
            async ({ diagram_id }) => {
                const diagram = await api.getDiagram(diagram_id)
                return {
                    content: [{ type: 'text', text: JSON.stringify(diagram, null, 2) }],
                }
            },
        )

        server.tool(
            'coggle_create_diagram',
            'Create a new Coggle diagram',
            {
                title: z.string().describe('The title of the new diagram'),
            },
            async ({ title }) => {
                const diagram = await api.createDiagram(title)
                return {
                    content: [{ type: 'text', text: JSON.stringify(diagram, null, 2) }],
                }
            },
        )

        server.tool(
            'coggle_add_node',
            'Add a new node to a diagram',
            {
                diagram_id: z.string().describe('The ID of the diagram'),
                parent: z.string().describe('The ID of the parent node to attach the new node to'),
                text: z.string().describe('The text content of the new node'),
                offset_x: z.number().optional().describe('Optional horizontal offset from the parent node (positive is right)'),
                offset_y: z.number().optional().describe('Optional vertical offset from the parent node (positive is down)')
            },
            async ({ diagram_id, parent, text, offset_x, offset_y }) => {
                let offset = undefined;
                if (offset_x !== undefined && offset_y !== undefined) {
                    offset = { x: offset_x, y: offset_y };
                }
                const result = await api.addNode(diagram_id, parent, text, offset)
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                }
            },
        )

        server.tool(
            'coggle_update_node',
            'Modify an existing node in a diagram',
            {
                diagram_id: z.string().describe('The ID of the diagram'),
                node_id: z.string().describe('The ID of the node to update'),
                text: z.string().optional().describe('The new text content for the node (optional)'),
                parent: z.string().optional().describe('The ID of a new parent node (optional)'),
                offset_x: z.number().optional().describe('Optional new horizontal offset'),
                offset_y: z.number().optional().describe('Optional new vertical offset')
            },
            async ({ diagram_id, node_id, text, parent, offset_x, offset_y }) => {
                let offset = undefined;
                if (offset_x !== undefined && offset_y !== undefined) {
                    offset = { x: offset_x, y: offset_y };
                }
                const updates: any = {};
                if (text !== undefined) updates.text = text;
                if (parent !== undefined) updates.parent = parent;
                if (offset !== undefined) updates.offset = offset;

                const result = await api.updateNode(diagram_id, node_id, updates)
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                }
            },
        )

        server.tool(
            'coggle_delete_node',
            'Remove a node and all its descendants from a diagram',
            {
                diagram_id: z.string().describe('The ID of the diagram'),
                node_id: z.string().describe('The ID of the node to delete')
            },
            async ({ diagram_id, node_id }) => {
                const result = await api.deleteNode(diagram_id, node_id)
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                }
            },
        )
    }
}
