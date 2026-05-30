import { execSync } from 'node:child_process';
import { loadRegistry, repoRoot } from './paths.mjs';

const registry = loadRegistry();

for (const slug of Object.keys(registry.extensions)) {
  execSync(`node tools/extensions/zip.mjs ${slug}`, { cwd: repoRoot, stdio: 'inherit' });
}
