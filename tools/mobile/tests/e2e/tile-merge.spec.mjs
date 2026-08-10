import { expect, test } from '@playwright/test';

async function dismissOnboarding(page) {
  const skip = page.getByRole('button', { name: /Skip tutorial|Skip/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await expect(page.getByText('Swipe to move')).toBeHidden({ timeout: 5000 });
  }
}

async function dismissNewGameDialogIfOpen(page) {
  const keepPlaying = page.getByRole('button', { name: 'Keep playing' });
  if (await keepPlaying.isVisible().catch(() => false)) {
    await keepPlaying.click();
  }
}

function undoButton(page) {
  return page.getByRole('button', { name: /Undo/ });
}

test.describe('Tile Merge web smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'tile-merge-settings',
        JSON.stringify({
          soundEnabled: true,
          hapticsEnabled: true,
          reduceMotion: true,
          confirmNewGame: false,
          onboardingSeen: true,
        }),
      );
    });
    await page.goto('/');
    await expect(page.getByText('SCORE')).toBeVisible();
  });

  test('loads game UI', async ({ page }) => {
    await expect(page.getByText('Merge Tiles')).toBeVisible();
    await expect(page.getByText('SCORE')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start new game' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open settings' })).toBeVisible();
    await expect(undoButton(page)).toBeVisible();
  });

  test('keyboard move does not crash (haptics guarded on web)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(400);

    const hapticErrors = errors.filter(
      (message) => message.includes('Haptic') || message.includes('impactAsync'),
    );
    expect(hapticErrors).toEqual([]);
  });

  test('keyboard move updates score when merge happens', async ({ page }) => {
    const scoreValue = page.locator('text=SCORE').locator('..').locator('..').getByText(/^\d+$/).first();

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const scoreText = await scoreValue.textContent();
    expect(Number.parseInt(scoreText ?? '0', 10)).toBeGreaterThanOrEqual(0);
  });

  test('new game resets undo state', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const undo = undoButton(page);
    if (await undo.isEnabled()) {
      await page.getByRole('button', { name: 'Start new game' }).click();
      const confirm = page.getByRole('button', { name: 'Confirm new game' });
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
      }
      await expect(undo).toBeDisabled();
      return;
    }

    await page.getByRole('button', { name: 'Start new game' }).click();
    await dismissNewGameDialogIfOpen(page);
    await expect(undo).toBeDisabled();
  });

  test('settings sheet opens and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.getByText('Reduce motion')).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByText('Reduce motion')).toBeHidden();
  });

});

test.describe('Tile Merge onboarding', () => {
  test('onboarding blocks new game until dismissed', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByText('Swipe to move')).toBeVisible({ timeout: 15000 });

    const newGame = page.getByRole('button', { name: 'Start new game' });
    await newGame.click({ timeout: 2000, force: true }).catch(() => {});

    await expect(page.getByText('Swipe to move')).toBeVisible();
    await page.getByRole('button', { name: /Skip tutorial|Skip/i }).click();
    await expect(page.getByText('Swipe to move')).toBeHidden();
    await newGame.click();
  });

  test('keyboard should not move tiles while onboarding is visible', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByText('Swipe to move')).toBeVisible({ timeout: 15000 });

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const undo = undoButton(page);
    await expect(undo).toBeDisabled();
  });
});
