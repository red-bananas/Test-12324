import { test, expect } from './fixtures.mjs';

test.describe('File Info popup', () => {
  test('renders shell, leaves loading, shows actions', async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await expect(page.locator('.title')).toHaveText('File Info');
    await expect(page.locator('#loading')).toBeHidden({ timeout: 10000 });

    for (const id of ['#copyDimsBtn', '#downloadBtn', '#copyBtn', '#exportBtn']) {
      await expect(page.locator(id)).toBeAttached();
    }
  });
});
