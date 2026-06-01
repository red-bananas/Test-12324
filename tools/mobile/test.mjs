import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { listApps, resolveAppDir } from './paths.mjs';

const slugFilter = process.argv[2];
const entries = listApps(slugFilter);

if (entries.length === 0) {
  console.error(slugFilter ? `Unknown mobile app: ${slugFilter}` : 'No mobile apps in registry');
  process.exit(1);
}

for (const [slug, config] of entries) {
  const appDir = resolveAppDir(config);
  const nodeModules = join(appDir, 'node_modules');

  if (!existsSync(nodeModules)) {
    console.log(`[mobile test] installing deps for ${slug}...`);
    const install = spawnSync('npm', ['install', '--legacy-peer-deps'], {
      cwd: appDir,
      stdio: 'inherit',
      shell: true,
    });
    if (install.status !== 0) {
      process.exit(install.status ?? 1);
    }
  }

  console.log(`[mobile test] ${slug}`);
  const result = spawnSync('npm', ['test'], {
    cwd: appDir,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`[mobile test] OK (${entries.length} app(s))`);
