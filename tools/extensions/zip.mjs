import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { distZipPath, loadRegistry, repoRoot, resolveExtensionDir } from './paths.mjs';

// Marketing assets, docs, and metadata must not ship inside the published package.
const IGNORE_DIRS = new Set(['store', 'node_modules', 'tests', '.git']);

function isIgnoredFile(name) {
  return (
    name === 'app.yaml' ||
    name === '.DS_Store' ||
    name === '.gitignore' ||
    name.toLowerCase().endsWith('.md')
  );
}

function collectFiles(dir, base = dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      files.push(...collectFiles(fullPath, base));
    } else if (!isIgnoredFile(entry.name)) {
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
  const stageDir = join(distDir, 'pkg');

  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(stageDir, { recursive: true });

  const files = collectFiles(sourceDir);
  if (files.length === 0) {
    throw new Error(`No files found in ${ext.dir}`);
  }

  // Stage only runtime files (structure preserved) so excluded assets never ship.
  for (const file of files) {
    const dest = join(stageDir, file);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(sourceDir, file), dest);
  }

  const zipCommand =
    process.platform === 'win32'
      ? `powershell -NoProfile -Command "Compress-Archive -Path '${stageDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`
      : `cd "${stageDir}" && zip -r "${zipPath}" .`;

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
