import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadRegistry, resolveExtensionDir } from './paths.mjs';

function walkFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function validateExtension(slug, config) {
  const sourceDir = resolveExtensionDir(config);
  const manifestPath = join(sourceDir, 'manifest.json');
  const errors = [];

  if (!existsSync(manifestPath)) {
    errors.push(`${slug}: missing manifest.json`);
    return errors;
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(`${slug}: invalid manifest.json (${error.message})`);
    return errors;
  }

  for (const field of ['manifest_version', 'name', 'version']) {
    if (!manifest[field]) {
      errors.push(`${slug}: manifest missing "${field}"`);
    }
  }

  const referenced = new Set(['manifest.json']);
  const fileLike = /\.(js|html|css|json|png|svg|webp|woff2?|ttf|mp3|wav|wasm)$/i;

  function isFileReference(value, key = '') {
    if (typeof value !== 'string' || value.length === 0) return false;
    if (/^(https?:|file:|<all_urls>|\*)/.test(value)) return false;
    if (key === 'description' || key === 'name' || key === 'version') return false;
    if (fileLike.test(value)) return true;
    if (key === 'service_worker' || key === 'js' || key === 'css') return true;
    if (value.includes('/') && !value.includes(' ')) return true;
    return false;
  }

  function collectRefs(value, key = '') {
    if (typeof value === 'string') {
      if (isFileReference(value, key)) {
        referenced.add(value);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item) => collectRefs(item, key));
    } else if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        collectRefs(childValue, childKey);
      }
    }
  }

  collectRefs(manifest);

  for (const file of referenced) {
    const filePath = join(sourceDir, file);
    if (!existsSync(filePath)) {
      errors.push(`${slug}: referenced file missing: ${file}`);
    }
  }

  const allFiles = walkFiles(sourceDir);
  if (allFiles.length === 0) {
    errors.push(`${slug}: no files in ${config.dir}`);
  }

  console.log(`OK  ${slug} (${config.displayName}) v${manifest.version ?? '?'}`);
  return errors;
}

const registry = loadRegistry();
const target = process.argv[2];
const slugs = target ? [target] : Object.keys(registry.extensions);
const allErrors = [];

for (const slug of slugs) {
  const config = registry.extensions[slug];
  if (!config) {
    allErrors.push(`Unknown extension slug: ${slug}`);
    continue;
  }
  allErrors.push(...validateExtension(slug, config));
}

if (allErrors.length > 0) {
  console.error('\nValidation failed:');
  for (const error of allErrors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log('\nAll extensions valid.');
