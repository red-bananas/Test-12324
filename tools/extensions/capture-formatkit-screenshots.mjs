#!/usr/bin/env node
/**
 * Capture FormatKit popup screenshots for Chrome Web Store listing.
 * Usage: node tools/extensions/capture-formatkit-screenshots.mjs
 */

import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../..');
const EXT_DIR = path.join(REPO_ROOT, 'apps/extensions/formatkit');
const OUT_DIR = path.join(EXT_DIR, 'store/source');

const sampleJson = readFileSync(
  path.join(__dirname, 'tests/fixtures/formatkit/sample.json'),
  'utf8'
);
const sampleJsonMin = JSON.stringify(JSON.parse(sampleJson));
const sampleXmlMin =
  '<?xml version="1.0"?><catalog><book id="1"><title>FormatKit</title><author>Dev</author></book></catalog>';
const flowYamlMin =
  "{company: {name: TechCorp, location: 'Thane, MH', active: true}, employees: [{id: 101, name: Rahul Sharma}]}";

const POPUP_VIEWPORT = { width: 720, height: 560 };
/** Capture at 3× for supersampling when downscaled to 1280×800 / 440×280 */
const CAPTURE_DEVICE_SCALE = 3;

async function launchPopup() {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    viewport: POPUP_VIEWPORT,
    deviceScaleFactor: CAPTURE_DEVICE_SCALE,
    args: [
      `--disable-extensions-except=${EXT_DIR}`,
      `--load-extension=${EXT_DIR}`,
    ],
  });

  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker');
  }

  const extensionId = serviceWorker.url().split('/')[2];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForSelector('#editor');
  return { context, page };
}

async function snap(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.locator('body').screenshot({ path: file });
  console.log(`captured ${path.relative(REPO_ROOT, file)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { context, page } = await launchPopup();

  try {
    // 1. Pretty JSON with toolbar
    await page.locator('#editor').fill(sampleJsonMin);
    await page.locator('#formatBtn').click();
    await page.waitForTimeout(300);
    await snap(page, 'screenshot-1-json-formatted-source');

    // 2. JSON → YAML convert
    await page.locator('#editor').fill(sampleJsonMin);
    await page.locator('#targetFormat').selectOption('yaml');
    await page.locator('#convertBtn').click();
    await page.waitForTimeout(300);
    await snap(page, 'screenshot-2-json-to-yaml-source');

    // 3. Flow YAML formatted
    await page.locator('#sourceFormat').selectOption('auto');
    await page.locator('#editor').fill(flowYamlMin);
    await page.locator('#formatBtn').click();
    await page.waitForTimeout(300);
    await snap(page, 'screenshot-3-flow-yaml-source');

    // 4. XML formatted (dark theme default)
    await page.locator('#sourceFormat').selectOption('xml');
    await page.locator('#editor').fill(sampleXmlMin);
    await page.locator('#formatBtn').click();
    await page.waitForTimeout(300);
    await snap(page, 'screenshot-4-xml-formatted-source');
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
