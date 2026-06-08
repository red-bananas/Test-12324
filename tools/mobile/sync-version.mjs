import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { listApps, resolveAppDir } from './paths.mjs';

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver (expected x.y.z): ${version}`);
  }
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
  };
}

function semverToVersionCode({ major, minor, patch }) {
  return major * 10_000 + minor * 100 + patch;
}

const slug = process.argv[2];
const version = process.argv[3];

if (!slug || !version) {
  console.error('Usage: node tools/mobile/sync-version.mjs <slug> <version>');
  process.exit(1);
}

const entries = listApps(slug);
if (entries.length === 0) {
  console.error(`Unknown mobile app: ${slug}`);
  process.exit(1);
}

const [, config] = entries[0];
const appDir = resolveAppDir(config);
const parts = parseVersion(version);
const versionCode = semverToVersionCode(parts);

const appJsonPath = join(appDir, 'app.json');
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = version;
appJson.expo.android = appJson.expo.android ?? {};
appJson.expo.android.versionCode = versionCode;
writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

const packageJsonPath = join(appDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
packageJson.version = version;
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

const appYamlPath = join(appDir, 'app.yaml');
if (existsSync(appYamlPath)) {
  const lines = readFileSync(appYamlPath, 'utf8').split('\n');
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith('version:')) {
      found = true;
      return `version: ${version}`;
    }
    return line;
  });
  if (!found) {
    next.push(`version: ${version}`);
  }
  writeFileSync(appYamlPath, `${next.join('\n').replace(/\n?$/, '\n')}`);
}

console.log(`Synced ${slug} → v${version} (versionCode ${versionCode})`);
