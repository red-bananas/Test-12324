import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFormatKit } from '../helpers/load-formatkit.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sampleJson = readFileSync(join(__dirname, '../fixtures/formatkit/sample.json'), 'utf8');

describe('FormatKit formats', () => {
  let kit;

  before(() => {
    kit = loadFormatKit();
  });

  it('formats JSON with indentation', () => {
    const out = kit.formats.json.format('{"a":1,"b":2}', 2);
    assert.match(out, /\n/);
    assert.deepEqual(JSON.parse(out), { a: 1, b: 2 });
  });

  it('minifies JSON to a single line', () => {
    const out = kit.formats.json.minify('{\n  "a": 1\n}');
    assert.equal(out, '{"a":1}');
  });

  it('validates invalid JSON', () => {
    assert.throws(() => kit.formats.json.validate('{bad'));
  });
});

describe('FormatKit convert + auto-detect', () => {
  let kit;

  before(() => {
    kit = loadFormatKit();
  });

  it('converts JSON to YAML', () => {
    const yaml = kit.convert.convert('{"name":"test"}', 'json', 'yaml', 2);
    assert.match(yaml, /name:/);
    assert.doesNotMatch(yaml.trim(), /^\{/);
  });

  it('detects YAML after conversion', () => {
    const yaml = kit.convert.convert(sampleJson, 'json', 'yaml', 2);
    assert.equal(kit.registry.detectFormat(yaml), 'yaml');
  });

  it('minifies YAML to compact flow style (post-convert regression)', () => {
    const yaml = kit.convert.convert(sampleJson, 'json', 'yaml', 2);
    const handler = kit.registry.resolveFormat('auto', yaml);
    assert.equal(handler.id, 'yaml');
    const minified = handler.minify(yaml);
    assert.doesNotThrow(() => handler.validate(minified));
    assert.throws(() => kit.formats.json.validate(minified));
    assert.match(minified.trim(), /^\{/);
    const formatted = handler.format(minified, 2);
    assert.doesNotMatch(formatted.trim(), /^\{/);
    assert.match(formatted, /\n/);
  });

  it('formats full flow-style YAML payload to block YAML', () => {
    const flowYaml = "{company: {name: TechCorp, location: 'Thane, MH', founded: 2026, active: true}, employees: [{id: 101, name: Rahul Sharma, skills: [Java, AWS]}, {id: 102, name: Priya Patel, skills: [Python, Machine Learning]}]}";
    const { output, formatId } = kit.registry.formatAuto(flowYaml, 2);
    assert.equal(formatId, 'yaml');
    assert.match(output, /company:/);
    assert.match(output, /employees:/);
    assert.match(output, /Rahul Sharma/);
    assert.doesNotMatch(output.trim(), /^\{/);
  });

  it('minifies JSON then format restores pretty JSON', () => {
    const minified = kit.formats.json.minify('{\n  "a": 1,\n  "b": 2\n}');
    assert.equal(minified, '{"a":1,"b":2}');
    const { output, formatId } = kit.registry.formatAuto(minified, 2);
    assert.equal(formatId, 'json');
    assert.match(output, /\n/);
    assert.deepEqual(JSON.parse(output), { a: 1, b: 2 });
  });

  it('detects flow YAML over JSON for brace-wrapped content', () => {
    const flowYaml = '{name: test, active: true}';
    assert.equal(kit.registry.detectFormat(flowYaml), 'yaml');
    assert.equal(kit.registry.detectFormat('{"name":"test","active":true}'), 'json');
  });
});

describe('FormatKit syntax highlight', () => {
  let kit;

  before(() => {
    kit = loadFormatKit();
  });

  it('highlights JSON keys without broken nested span artifacts', () => {
    const html = kit.highlight.render('{"name":"FormatKit"}', 'json');
    assert.doesNotMatch(html, /class=<span/);
    assert.doesNotMatch(html, /[\uE010-\uE05F]/);
    assert.match(html, /<span class="tok-key">"name"<\/span>/);
    assert.match(html, /<span class="tok-string">"FormatKit"<\/span>/);
  });
});
