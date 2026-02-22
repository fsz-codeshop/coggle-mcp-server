declare module "coggle" {
	export class CoggleApiNode {
		id: string;
		text: string;
		offset: { x: number; y: number };
		parent_id?: string;
		children: CoggleApiNode[];

		addChild(
			text: string,
			offset: { x: number; y: number },
			callback: (err: any, node: CoggleApiNode) => void,
		): void;
		update(
			properties: any,
			callback: (err: any, node: CoggleApiNode) => void,
		): void;
		setText(
			text: string,
			callback: (err: any, node: CoggleApiNode) => void,
		): void;
		move(
			offset: { x: number; y: number },
			callback: (err: any, node: CoggleApiNode) => void,
		): void;
		remove(callback: (err: any) => void): void;
	}

	export class CoggleApiDiagram {
		id: string;
		title: string;

		webUrl(): string;
		getNodes(callback: (err: any, nodes: CoggleApiNode[]) => void): void;
		arrange(callback: (err: any, nodes: CoggleApiNode[]) => void): void;
	}

	export default class CoggleApi {
		constructor(options: { token: string });

		listDiagrams(
			options: any,
			callback: (err: any, diagrams: CoggleApiDiagram[]) => void,
		): void;
		createDiagram(
			title: string,
			callback: (err: any, diagram: CoggleApiDiagram) => void,
		): void;
		get(
			endpoint: string,
			query_string: string,
			callback: (err: any, body: any) => void,
		): void;
		post(
			endpoint: string,
			query_string: string,
			body: any,
			callback: (err: any, body: any) => void,
		): void;
		put(
			endpoint: string,
			query_string: string,
			body: any,
			callback: (err: any, body: any) => void,
		): void;
		delete(
			endpoint: string,
			query_string: string,
			callback: (err: any, body: any) => void,
		): void;
	}
}
