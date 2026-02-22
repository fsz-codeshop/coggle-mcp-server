export interface CoggleApiDiagram {
	id: string;
	title: string;
	// other fields omitted for brevity
}

export class CoggleAPI {
	private token: string;
	private baseUrl = "https://coggle.it";

	constructor(token: string) {
		this.token = token;
	}

	private async request(endpoint: string, method: string, body?: any) {
		const url = `${this.baseUrl}${endpoint}`;
		const headers: HeadersInit = {
			Authorization: `Bearer ${this.token}`,
			Accept: "application/json",
		};

		if (body) {
			headers["Content-Type"] = "application/json";
		}

		const response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`HTTP ${response.status}: ${text}`);
		}

		return await response.json();
	}

	async listDiagrams(): Promise<CoggleApiDiagram[]> {
		return this.request("/api/1/diagrams", "GET") as Promise<
			CoggleApiDiagram[]
		>;
	}

	async createDiagram(title: string): Promise<CoggleApiDiagram> {
		return this.request("/api/1/diagrams", "POST", {
			title,
		}) as Promise<CoggleApiDiagram>;
	}

	async getDiagram(diagramId: string): Promise<any> {
		return this.request(`/api/1/diagrams/${diagramId}/nodes`, "GET");
	}

	async addNode(
		diagramId: string,
		parent: string,
		text: string,
		offset?: { x: number; y: number },
	): Promise<any> {
		const body: any = { parent, text };
		if (offset) {
			body.offset = offset;
		}
		return this.request(`/api/1/diagrams/${diagramId}/nodes`, "POST", body);
	}

	async updateNode(
		diagramId: string,
		nodeId: string,
		updates: {
			text?: string;
			parent?: string;
			offset?: { x: number; y: number };
		},
	): Promise<any> {
		return this.request(
			`/api/1/diagrams/${diagramId}/nodes/${nodeId}`,
			"PUT",
			updates,
		);
	}

	async deleteNode(diagramId: string, nodeId: string): Promise<any> {
		return this.request(
			`/api/1/diagrams/${diagramId}/nodes/${nodeId}`,
			"DELETE",
		);
	}
}
