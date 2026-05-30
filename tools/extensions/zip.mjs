import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { distZipPath, loadRegistry, repoRoot, resolveExtensionDir } from './paths.mjs';

function collectFiles(dir, base = dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, base));
    } else {
      files.push(relative(base, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

function zipExtension(slug) {
  const registry = loadRegistry();
  const ext = registry.extensions[slug];

  if (!ext) {
    const known = Object.keys(registry.extensions).join(', ');
    throw new Error(`Unknown extension "${slug}". Known: ${known}`);
  }

  const sourceDir = resolveExtensionDir(ext);
  const manifestPath = join(sourceDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    throw new Error(`Missing manifest.json in ${ext.dir}`);
  }

  JSON.parse(readFileSync(manifestPath, 'utf8'));

  const zipPath = distZipPath(slug);
  const distDir = join(repoRoot, 'dist', slug);

  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });

  const files = collectFiles(sourceDir);
  if (files.length === 0) {
    throw new Error(`No files found in ${ext.dir}`);
  }

  const zipCommand =
    process.platform === 'win32'
      ? `powershell -NoProfile -Command "Compress-Archive -Path '${sourceDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`
      : `cd "${sourceDir}" && zip -r "${zipPath}" ${files.map((f) => `"${f}"`).join(' ')}`;

  execSync(zipCommand, { stdio: 'inherit', shell: true });

  if (!existsSync(zipPath) || statSync(zipPath).size === 0) {
    throw new Error(`Failed to create zip at ${zipPath}`);
  }

  console.log(`Built ${relative(repoRoot, zipPath)} (${files.length} files)`);
}

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: node tools/extensions/zip.mjs <extension-slug>');
  process.exit(1);
}

zipExtension(slug);
