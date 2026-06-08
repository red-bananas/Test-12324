import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listApps, resolveAppDir } from './paths.mjs';

function validateApp(slug, config) {
  const appDir = resolveAppDir(config);
  const errors = [];

  const requiredFiles = [
    'app.json',
    'eas.json',
    'package.json',
    'app/index.tsx',
    'assets/icon.png',
    'assets/adaptive-icon.png',
    'tests/game.test.ts',
    'tests/smoke.test.tsx',
    'PRIVACY.md',
    'PLAY_STORE.md',
  ];

  for (const file of requiredFiles) {
    if (!existsSync(join(appDir, file))) {
      errors.push(`${slug}: missing ${file}`);
    }
  }

  if (!existsSync(join(appDir, 'app.json'))) {
    return errors;
  }

  let appJson;
  try {
    appJson = JSON.parse(readFileSync(join(appDir, 'app.json'), 'utf8'));
  } catch (error) {
    errors.push(`${slug}: invalid app.json (${error.message})`);
    return errors;
  }

  const expo = appJson.expo ?? {};
  for (const field of ['name', 'slug', 'version']) {
    if (!expo[field]) {
      errors.push(`${slug}: app.json expo.${field} is required`);
    }
  }

  if (expo.slug !== slug) {
    errors.push(`${slug}: app.json expo.slug must be "${slug}" (got "${expo.slug}")`);
  }

  const androidPackage = expo.android?.package;
  if (!androidPackage) {
    errors.push(`${slug}: app.json expo.android.package is required`);
  } else if (config.androidPackage && androidPackage !== config.androidPackage) {
    errors.push(
      `${slug}: android package mismatch registry=${config.androidPackage} app.json=${androidPackage}`,
    );
  }

  let packageJson;
  try {
    packageJson = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8'));
  } catch (error) {
    errors.push(`${slug}: invalid package.json (${error.message})`);
    return errors;
  }

  if (!packageJson.scripts?.test) {
    errors.push(`${slug}: package.json must define a "test" script`);
  }

  return errors;
}

const slugFilter = process.argv[2];
const entries = listApps(slugFilter);

if (entries.length === 0) {
  console.error(slugFilter ? `Unknown mobile app: ${slugFilter}` : 'No mobile apps in registry');
  process.exit(1);
}

const allErrors = [];
for (const [slug, config] of entries) {
  allErrors.push(...validateApp(slug, config));
}

if (allErrors.length > 0) {
  console.error('[mobile validate] FAILED');
  for (const error of allErrors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`[mobile validate] OK (${entries.length} app(s))`);
