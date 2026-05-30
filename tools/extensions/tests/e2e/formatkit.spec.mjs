import { test, expect } from './fixtures.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleJson = readFileSync(
  path.join(__dirname, '../fixtures/formatkit/sample.json'),
  'utf8'
);
const sampleJsonMin = JSON.stringify(JSON.parse(sampleJson));
const flowYamlMin =
  "{company: {name: TechCorp, location: 'Thane, MH', active: true}, employees: [{id: 101, name: Rahul Sharma}]}";

test.describe('FormatKit popup', () => {
  test('formats JSON via Format button with valid status', async ({ popupPage }) => {
    await popupPage.locator('#editor').fill(sampleJsonMin);
    await popupPage.locator('#formatBtn').click();
    await expect(popupPage.locator('#statusValid')).toContainText('Valid');
    await expect(popupPage.locator('#statusFormat')).toContainText('JSON');
    await expect(popupPage.locator('#sourceFormat')).toHaveValue('auto');
    const formatted = await popupPage.locator('#editor').inputValue();
    expect(formatted).toContain('\n');
  });

  test('auto-formats on paste when clipboard has minified JSON', async ({ popupPage, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await popupPage.locator('#editor').click();
    await popupPage.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, sampleJsonMin);
    await popupPage.locator('#pasteBtn').click();
    await expect(popupPage.locator('#statusValid')).toContainText('Valid');
    await expect(popupPage.locator('#sourceFormat')).toHaveValue('auto');
    const pasted = await popupPage.locator('#editor').inputValue();
    expect(pasted).toContain('\n');
  });

  test('formats flow-style YAML via Format button', async ({ popupPage }) => {
    await popupPage.locator('#editor').fill(flowYamlMin);
    await popupPage.locator('#formatBtn').click();
    await expect(popupPage.locator('#statusValid')).toContainText('Valid');
    await expect(popupPage.locator('#statusFormat')).toContainText('YAML');
    const formatted = await popupPage.locator('#editor').inputValue();
    expect(formatted).toContain('company:');
    expect(formatted.trim()).not.toMatch(/^\{/);
  });

  test('converts JSON to YAML, minifies to flow, then formats back to block', async ({ popupPage }) => {
    await popupPage.locator('#targetFormat').selectOption('yaml');
    await popupPage.locator('#editor').fill(sampleJsonMin);
    await popupPage.locator('#convertBtn').click();

    await expect(popupPage.locator('#statusValid')).toContainText('Valid');
    await expect(popupPage.locator('#statusFormat')).toContainText('YAML');

    const afterConvert = await popupPage.locator('#editor').inputValue();
    expect(afterConvert).toContain('application:');
    expect(afterConvert.trim()).not.toMatch(/^\{/);

    await popupPage.locator('#minifyBtn').click();
    const afterMinify = await popupPage.locator('#editor').inputValue();
    expect(afterMinify.trim()).toMatch(/^\{/);

    await popupPage.locator('#formatBtn').click();
    const afterFormat = await popupPage.locator('#editor').inputValue();
    expect(afterFormat).toContain('application:');
    expect(afterFormat.trim()).not.toMatch(/^\{/);
    await expect(popupPage.locator('#statusValid')).toContainText('Valid');
  });

  test('source format override validates against selected format', async ({ popupPage }) => {
    await popupPage.locator('#sourceFormat').selectOption('json');
    await popupPage.locator('#editor').fill('name: test\n');
    await expect(popupPage.locator('#statusValid')).toContainText('Invalid');
    await popupPage.locator('#sourceFormat').selectOption('yaml');
    await expect(popupPage.locator('#statusValid')).toContainText('Valid');
  });

  test('undo and redo restore content after convert', async ({ popupPage }) => {
    await popupPage.locator('#editor').fill('{"a":1}');
    await popupPage.locator('#targetFormat').selectOption('yaml');
    await popupPage.locator('#convertBtn').click();
    await expect(popupPage.locator('#editor')).not.toHaveValue('{"a":1}');

    await popupPage.locator('#undoBtn').click();
    await expect(popupPage.locator('#editor')).toHaveValue('{"a":1}');

    await popupPage.locator('#redoBtn').click();
    await expect(popupPage.locator('#editor')).not.toHaveValue('{"a":1}');
  });

  test('find panel locates text in editor', async ({ popupPage }) => {
    await popupPage.locator('#editor').fill('hello world\nhello again');
    await popupPage.locator('#findToggleBtn').click();
    await popupPage.locator('#searchInput').fill('hello');
    await expect(popupPage.locator('#searchCount')).toContainText('1 of 2');

    await popupPage.locator('#searchNext').click();
    await expect(popupPage.locator('#searchCount')).toContainText('2 of 2');

    const selection = await popupPage.evaluate(() => {
      const el = document.getElementById('editor');
      return el.value.slice(el.selectionStart, el.selectionEnd);
    });
    expect(selection).toBe('hello');
  });

  test('line gutter stays aligned when editor scrolls', async ({ popupPage }) => {
    const lines = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n');
    await popupPage.locator('#editor').fill(lines);
    await popupPage.waitForFunction(() => {
      const pane = document.getElementById('editorPane');
      return pane.scrollHeight > pane.clientHeight + 10;
    });

    await popupPage.evaluate(() => {
      document.getElementById('editorPane').scrollTop = 120;
    });
    await popupPage.waitForFunction(() => document.getElementById('lineGutter').style.transform === 'translateY(-120px)');
  });

  test('shows source select, format button and toolbar on one row', async ({ popupPage }) => {
    await expect(popupPage.locator('#sourceFormat')).toBeVisible();
    await expect(popupPage.locator('#sourceFormat')).toHaveValue('auto');
    await expect(popupPage.locator('#formatBtn')).toHaveAttribute('aria-label', 'Format');
    await expect(popupPage.locator('#pasteBtn')).toBeVisible();
    await expect(popupPage.locator('#copyBtn')).toBeVisible();
    await expect(popupPage.locator('#downloadBtn')).toBeVisible();
    await expect(popupPage.locator('#clearBtn')).toBeVisible();
    await expect(popupPage.locator('#autoFormatToggle')).toHaveCount(0);

    const toolbarBox = await popupPage.locator('.toolbar-row').boundingBox();
    const sourceBox = await popupPage.locator('#sourceFormat').boundingBox();
    const formatBox = await popupPage.locator('#formatBtn').boundingBox();
    expect(toolbarBox).toBeTruthy();
    expect(sourceBox).toBeTruthy();
    expect(formatBox).toBeTruthy();
    expect(Math.abs(sourceBox.y - formatBox.y)).toBeLessThan(4);
  });

  test('shows line numbers for editor content', async ({ popupPage }) => {
    await popupPage.locator('#editor').fill('line1\nline2\nline3');
    await popupPage.waitForFunction(() => {
      const gutter = document.getElementById('lineGutter');
      return gutter.textContent.includes('3');
    });
    const gutter = await popupPage.locator('#lineGutter').textContent();
    expect(gutter).toContain('1');
    expect(gutter).toContain('3');
  });
});
