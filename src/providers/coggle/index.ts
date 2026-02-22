import type { Env, MCPProvider } from "../../types/runtime.js";
import { CoggleAPI } from "./api.js";
import { CoggleFactory } from "./factory.js";

export class CoggleProvider implements MCPProvider {
	name = "coggle";

	createAPI(env: Env): CoggleAPI {
		if (!env.COGGLE_API_TOKEN) {
			throw new Error("COGGLE_API_TOKEN is required");
		}
		return new CoggleAPI(env.COGGLE_API_TOKEN);
	}

	createServerFactory(): CoggleFactory {
		return new CoggleFactory();
	}

	getRequiredEnvVars(): string[] {
		return ["COGGLE_API_TOKEN"];
	}
}

export const coggleProvider = new CoggleProvider();
