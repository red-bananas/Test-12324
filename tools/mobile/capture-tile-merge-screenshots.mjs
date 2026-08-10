#!/usr/bin/env node
/**
 * Capture Tile Merge Play Store screenshots via Expo web + mobile viewport.
 * Usage: node tools/mobile/capture-tile-merge-screenshots.mjs
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../..');
const APP_DIR = path.join(REPO_ROOT, 'apps/mobile/tile-merge');
const OUT_DIR = path.join(APP_DIR, 'store/source');
const PORT = 8099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const iPhone13 = devices['iPhone 13'];

function waitForUrl(url, timeoutMs = 180000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          resolve();
          return;
        }
      } catch {
        // server not ready
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(tick, 1500);
    };
    tick();
  });
}

function startExpoWeb() {
  const child = spawn(
    'npx',
    ['expo', 'start', '--web', '--port', String(PORT)],
    {
      cwd: APP_DIR,
      shell: true,
      stdio: 'pipe',
      env: {
        ...process.env,
        CI: '1',
        EXPO_NO_TELEMETRY: '1',
      },
    },
  );
  child.stdout?.on('data', () => {});
  child.stderr?.on('data', () => {});
  return child;
}

async function snap(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`captured ${path.relative(REPO_ROOT, file)}`);
}

async function seedSettings(page) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  await page.addInitScript((dateKey) => {
    localStorage.setItem(
      "tile-merge-settings",
      JSON.stringify({
        soundEnabled: true,
        hapticsEnabled: true,
        reduceMotion: false,
        confirmNewGame: true,
        onboardingSeen: true,
      }),
    );
    localStorage.setItem(
      "tile-merge-player-stats",
      JSON.stringify({
        gamesPlayed: 42,
        totalMerges: 318,
        highestTileEver: 2048,
        dailyBest: 5120,
        dailyBestDate: dateKey,
        lastPlayedDate: dateKey,
        currentStreak: 7,
        longestStreak: 14,
      }),
    );
    localStorage.removeItem("tile-merge-saved-session");
  }, todayKey);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const expo = startExpoWeb();

  try {
    await waitForUrl(BASE_URL);

    const browser = await chromium.launch({ channel: 'chrome' });
    const context = await browser.newContext({
      ...iPhone13,
      deviceScaleFactor: 3,
      locale: 'en-GB',
    });
    const page = await context.newPage();
    await seedSettings(page);

    await page.goto(BASE_URL);
    await page.getByText('Merge Tiles').waitFor({ timeout: 60000 });

    // Active gameplay — merge a few times
    for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(350);
    }
    await snap(page, 'screenshot-1-gameplay-source');

    // Settings — stats, offline trust, privacy policy
    await page.getByRole("button", { name: "Open settings" }).click();
    await page.getByText("Settings").waitFor({ timeout: 10000 });
    await page.getByText("Your stats").waitFor({ timeout: 10000 });
    await page.getByText("Privacy policy").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await snap(page, "screenshot-2-settings-source");
    await page.getByRole('button', { name: 'Done' }).click();
    await page.waitForTimeout(400);

    // Higher-score board state
    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowRight', 'ArrowRight', 'ArrowDown']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(350);
    }
    await snap(page, 'screenshot-3-board-source');

    for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowRight']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(350);
    }
    await snap(page, 'screenshot-4-score-source');

    await context.close();
    await browser.close();
  } finally {
    expo.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
