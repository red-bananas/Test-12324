import { expect, test } from '@playwright/test';

test.describe('PixShrink web smoke', () => {
  test('shows the privacy-first empty state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('PixShrink', { exact: true })).toBeVisible();
    await expect(page.getByText(/Make any photo/)).toBeVisible();
    await expect(page.getByText('100% offline · never uploaded')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose photo' })).toBeVisible();
  });

  test('editor tools and sliders work without crashing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/?e2e=1');
    await expect(page.getByText('Change photo')).toBeVisible({ timeout: 15000 });

    await page.getByRole('tab', { name: 'Resize' }).click();
    await expect(page.getByRole('button', { name: /Passport \(India\)/ })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Resize scale percentage' })).toBeVisible();

    await page.getByRole('tab', { name: 'Convert' }).click();
    await expect(page.getByRole('button', { name: 'JPG' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PNG' })).toBeVisible();

    await page.getByRole('tab', { name: 'Compress' }).click();
    await expect(page.getByRole('slider', { name: 'Compression quality' })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('exposes metadata toggle in editor', async ({ page }) => {
    await page.goto('/?e2e=1');
    await expect(page.getByText('Change photo')).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('switch', { name: 'Keep date and EXIF metadata' }),
    ).toBeVisible();
  });

  test('save actions appear after preview loads', async ({ page }) => {
    await page.goto('/?e2e=1');
    await expect(page.getByText('Change photo')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Save to gallery' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });
});
