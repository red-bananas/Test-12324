import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(toolsDir, '../..');
export const registryPath = join(toolsDir, 'extensions.json');

export function loadRegistry() {
  return JSON.parse(readFileSync(registryPath, 'utf8'));
}

export function resolveExtensionDir(config) {
  return resolve(repoRoot, config.dir);
}

export function distZipPath(slug) {
  return join(repoRoot, 'dist', slug, `${slug}.zip`);
}
