import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { TextDecoder, TextEncoder } from 'node:util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../../..');
const FORMATKIT_ROOT = join(REPO_ROOT, 'apps/extensions/formatkit');

/** Minimal DOMParser stub — sufficient to load xml.js; real XML tests need linkedom. */
class DOMParserStub {
  parseFromString() {
    throw new Error('DOMParser not available in this test environment');
  }
}

function runScript(context, relativePath) {
  const code = readFileSync(join(FORMATKIT_ROOT, relativePath), 'utf8');
  vm.runInContext(code, context, { filename: relativePath });
}

/**
 * Load FormatKit browser IIFEs into a sandbox for unit testing.
 */
export function loadFormatKit() {
  const sandbox = {
    console,
    TextDecoder,
    TextEncoder,
    DOMParser: DOMParserStub,
    XMLSerializer: class {
      serializeToString() {
        return '';
      }
    },
    window: {},
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  sandbox.window = sandbox;

  const context = vm.createContext(sandbox);

  runScript(context, 'lib/js-yaml.min.js');
  runScript(context, 'lib/j-toml.min.js');

  for (const script of [
    'formats/json.js',
    'formats/yaml.js',
    'formats/xml.js',
    'formats/toml.js',
    'formats/csv.js',
    'formats/sql.js',
    'formats/properties.js',
    'formats/registry.js',
  ]) {
    runScript(context, script);
  }

  runScript(context, 'convert.js');
  runScript(context, 'editor-highlight.js');

  return {
    window: sandbox,
    formats: sandbox.FormatKitFormats,
    registry: sandbox.FormatKitRegistry,
    convert: sandbox.FormatKitConvert,
    highlight: sandbox.FormatKitHighlight,
  };
}

export { FORMATKIT_ROOT, REPO_ROOT };
