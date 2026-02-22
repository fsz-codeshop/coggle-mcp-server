#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Read package.json version
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const version = packageJson.version;

// Read worker.ts file
const registryPath = join("src", "worker.ts");
let content = readFileSync(registryPath, "utf8");

// Replace version placeholder with actual version
content = content.replace(/version: ".*"/, `version: "${version}"`);

// Write back to file
writeFileSync(registryPath, content);

console.log(`Version injected: ${version}`);
