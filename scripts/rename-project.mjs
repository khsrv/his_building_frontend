#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function sanitizePackageName(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "front-start";
}

const requestedName = process.argv[2];
if (!requestedName) {
  console.error("Usage: node scripts/rename-project.mjs <project-name>");
  process.exit(1);
}

const packageName = sanitizePackageName(requestedName);
const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
packageJson.name = packageName;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Updated package name -> ${packageName}`);
