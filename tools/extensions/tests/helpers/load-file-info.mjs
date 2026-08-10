import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../../..');
const FILE_INFO_ROOT = join(REPO_ROOT, 'apps/extensions/file-info');

/** Load File Info browser globals (FileInfoShared, FileInfoExif) into a sandbox. */
export function loadFileInfo() {
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);
  for (const file of ['shared.js', 'exif.js']) {
    const code = readFileSync(join(FILE_INFO_ROOT, file), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }

  return { shared: sandbox.FileInfoShared, exif: sandbox.FileInfoExif };
}

export { FILE_INFO_ROOT, REPO_ROOT };
