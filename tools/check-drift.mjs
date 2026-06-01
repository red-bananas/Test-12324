// Catches drift between the extension registry and the apps/extensions/ folder.
// Fails (exit 1) when:
//   - a folder with manifest.json is NOT registered in tools/extensions/extensions.json
//   - a registry entry points at a dir with no manifest.json
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRegistry, resolveExtensionDir } from "./extensions/paths.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extensionsRoot = join(repoRoot, "apps", "extensions");

const registry = loadRegistry();
const registeredDirs = new Set(
  Object.values(registry.extensions).map((c) => resolve(repoRoot, c.dir)),
);

const errors = [];

// 1. Every folder with a manifest must be registered.
if (existsSync(extensionsRoot)) {
  for (const entry of readdirSync(extensionsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(extensionsRoot, entry.name);
    if (!existsSync(join(dir, "manifest.json"))) continue;
    if (!registeredDirs.has(dir)) {
      errors.push(
        `Unregistered extension: apps/extensions/${entry.name} has a manifest.json but is missing from tools/extensions/extensions.json`,
      );
    }
  }
}

// 2. Every registry entry must point at a real extension.
for (const [slug, config] of Object.entries(registry.extensions)) {
  const dir = resolveExtensionDir(config);
  if (!existsSync(join(dir, "manifest.json"))) {
    errors.push(
      `Dangling registry entry: "${slug}" -> ${config.dir} has no manifest.json`,
    );
  }
}

if (errors.length > 0) {
  console.error("Drift detected:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("No drift. Extension registry and apps/extensions/ are in sync.");
