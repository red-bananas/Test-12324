import { test as base, chromium, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../../..');

export function extensionPath(slug) {
  const registry = JSON.parse(
    readFileSync(path.join(REPO_ROOT, 'tools/extensions/extensions.json'), 'utf8')
  );
  const dir = registry.extensions[slug]?.dir;
  if (!dir) throw new Error(`Unknown extension slug: ${slug}`);
  return path.join(REPO_ROOT, dir);
}

export const test = base.extend({
  context: async ({}, use, testInfo) => {
    const slug = testInfo.project.metadata.slug;
    const pathToExtension = extensionPath(slug);

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    await use(serviceWorker.url().split('/')[2]);
  },

  popupPage: async ({ context, extensionId }, use) => {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForSelector('#editor');
    await use(page);
  },
});

export { expect };
