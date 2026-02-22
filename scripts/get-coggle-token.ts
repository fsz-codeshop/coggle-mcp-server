import { randomBytes } from "crypto";
import * as dotenv from "dotenv";
import express from "express";
import * as fs from "fs";
import open from "open";
import * as path from "path";

dotenv.config({ path: [".env", ".dev.vars"] });

const CLIENT_ID = process.env.COGGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.COGGLE_CLIENT_SECRET;
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error(
		"❌ Error: COGGLE_CLIENT_ID and COGGLE_CLIENT_SECRET must be set in your .env or .dev.vars file.",
	);
	console.error(
		"Please get them from https://coggle.it/developer and add them to .dev.vars",
	);
	process.exit(1);
}

const app = express();
const state = randomBytes(16).toString("hex");

app.get("/login", (req, res) => {
	const params = new URLSearchParams({
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		response_type: "code",
		state: state,
		scope: "read write",
	});
	const authUrl = `https://coggle.it/dialog/authorize?${params.toString()}`;
	res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
	const { code, state: returnedState } = req.query;

	if (returnedState !== state) {
		return res.status(400).send("State mismatch. Possible CSRF attack.");
	}

	if (!code) {
		return res.status(400).send("No authorization code provided.");
	}

	try {
		const authHeader = "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
		const payload = {
			code: code as string,
			redirect_uri: REDIRECT_URI,
			grant_type: "authorization_code",
		};

		const response = await fetch("https://coggle.it/token", {
			method: "POST",
			headers: {
				Authorization: authHeader,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Failed to exchange token:", response.status, errorText);
			return res
				.status(500)
				.send(`Failed to get token: HTTP ${response.status} - ${errorText}`);
		}

		const data = await response.json();

		// Save to .dev.vars for use
		const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
		let content = "";
		if (fs.existsSync(devVarsPath)) {
			content = fs.readFileSync(devVarsPath, "utf8");
		}

		// Replace or add COGGLE_API_TOKEN
		if (content.includes("COGGLE_API_TOKEN=")) {
			content = content.replace(
				/COGGLE_API_TOKEN=.*/g,
				`COGGLE_API_TOKEN=${data.access_token}`,
			);
		} else {
			content += `\nCOGGLE_API_TOKEN=${data.access_token}`;
		}

		fs.writeFileSync(devVarsPath, content);

		res.send(`
      <h1>Success!</h1>
      <p>Your Access Token has been fetched and saved to <code>.dev.vars</code>.</p>
      <p>You can now safely close this window and stop the script.</p>
    `);

		console.log("✅ Successfully obtained Coggle Access Token!");
		console.log(`Token saved to ${devVarsPath}`);
		console.log(
			"You can now press Ctrl+C to stop this server and run `npm run dev` to start the Cloudflare Worker.",
		);

		setTimeout(() => {
			process.exit(0);
		}, 1000);
	} catch (err: any) {
		console.error("Error during token exchange:", err);
		res.status(500).send(`Error: ${err.message}`);
	}
});

app.listen(PORT, () => {
	console.log(`🚀 Starting OAuth flow on port ${PORT}...`);
	console.log(`Opening browser to http://localhost:${PORT}/login`);
	open(`http://localhost:${PORT}/login`);
});
