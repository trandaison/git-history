const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const installerPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "vscode",
  "bin",
  "install"
);

if (!fs.existsSync(installerPath)) {
  process.exit(0);
}

const result = spawnSync("node", [installerPath], {
  stdio: "inherit"
});

if (result.status !== 0) {
  console.warn(
    "\n[vscode-ext] Warning: unable to install vscode.d.ts from legacy vscode installer. Continuing without blocking install."
  );
}

process.exit(0);
