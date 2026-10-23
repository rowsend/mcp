#!/usr/bin/env node
// Copied into plugins/rowsend/server/rowsend-mcp.mjs by `npm run sync-plugin`; edit this file, not the copy.
// Starts the Rowsend desktop app as a stdio MCP server. Rowsend's server runs inside the app; this
// finds the app and runs it with --mcp-stdio, which relays stdio to it. The first time a client
// connects, Rowsend asks you to allow it.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// The first Rowsend version whose bridge pairs on first use, so configs need no token.
const MIN_VERSION = "1.4.2";
const DOWNLOAD = "https://rowsend.com";

const fail = (message) => {
  process.stderr.write(`${message}\n`);
  process.exit(1);
};

if (process.platform !== "darwin") {
  fail(`Rowsend runs on macOS for now. See ${DOWNLOAD}`);
}

const app = [
  process.env.ROWSEND_APP,
  "/Applications/Rowsend.app",
  join(homedir(), "Applications", "Rowsend.app"),
].find((path) => path && existsSync(join(path, "Contents", "MacOS", "Rowsend")));

if (!app) {
  fail(
    `Rowsend isn't installed. Download it from ${DOWNLOAD}, move it to Applications, then restart this MCP client.\n` +
      "If it's somewhere else, set ROWSEND_APP to its path.",
  );
}

const version = /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/.exec(
  readFileSync(join(app, "Contents", "Info.plist"), "utf8"),
)?.[1];

if (version && older(version, MIN_VERSION)) {
  fail(
    `Rowsend ${version} is too old for this connector. Update it in Rowsend → Settings → Updates, then restart this MCP client.`,
  );
}

const child = spawn(join(app, "Contents", "MacOS", "Rowsend"), ["--mcp-stdio"], {
  stdio: "inherit",
  env: process.env,
});
child.on("error", (error) => fail(`Couldn't start Rowsend: ${error.message}`));
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));

function older(a, b) {
  const [x, y] = [a, b].map((v) => v.split(/[.-]/).slice(0, 3).map(Number));
  for (let i = 0; i < 3; i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
  }
  return false;
}
