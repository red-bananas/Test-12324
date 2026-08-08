import { expect, test } from '@playwright/test';

test.describe('Image to PDF web smoke', () => {
  test('shows the hub with camera and gallery actions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Image to PDF', { exact: true })).toBeVisible();
    await expect(page.getByText('Camera', { exact: true })).toBeVisible();
    await expect(page.getByText('Gallery', { exact: true })).toBeVisible();
    await expect(page.getByText(/100% offline/)).toBeVisible();
    await expect(page.getByText(/Your exported PDFs appear here/)).toBeVisible();
  });

  test('editor loads with e2e fixture and shows export', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/editor?e2e=1');
    await expect(page.getByText('1 pages')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crop' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rotate' })).toBeVisible();

    expect(errors).toEqual([]);
  });
});
