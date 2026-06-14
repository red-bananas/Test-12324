#!/usr/bin/env node
/**
 * Capture File Info popup screenshots for the Chrome Web Store listing.
 * Renders the popup with representative mock data (no network needed).
 * Usage: node tools/extensions/capture-file-info-screenshots.mjs
 */

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../..');
const EXT_DIR = path.join(REPO_ROOT, 'apps/extensions/file-info');
const OUT_DIR = path.join(EXT_DIR, 'store/source');

const POPUP_VIEWPORT = { width: 380, height: 720 };
const CAPTURE_DEVICE_SCALE = 3;

const SHOTS = [
  {
    name: 'screenshot-1-image-dimensions-source',
    mock: {
      type: 'image',
      url: 'https://images.example.com/hero-banner.jpg',
      fileName: 'hero-banner.jpg',
      fileSize: '1.46 MB',
      mimeType: 'image/jpeg',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      __thumb: true,
    },
  },
  {
    name: 'screenshot-2-image-exif-gps-source',
    mock: {
      type: 'image',
      url: 'https://photos.example.com/IMG_4821.jpg',
      fileName: 'IMG_4821.jpg',
      fileSize: '5.92 MB',
      mimeType: 'image/jpeg',
      width: 6000,
      height: 4000,
      aspectRatio: '3:2',
      __thumb: true,
    },
    exif: {
      make: 'Canon',
      model: 'EOS R6',
      dateTime: '2026:05:21 14:32:10',
      gps: { lat: 48.858093, lng: 2.294694 },
    },
  },
  {
    name: 'screenshot-3-pdf-file-details-source',
    mock: {
      type: 'pdf',
      url: 'https://files.example.com/annual-report-2026.pdf',
      fileName: 'annual-report-2026.pdf',
      fileSize: '2.30 MB',
      mimeType: 'application/pdf',
      title: 'Annual Report 2026',
    },
  },
  {
    name: 'screenshot-4-video-resolution-source',
    mock: {
      type: 'video',
      url: 'https://media.example.com/promo-clip.mp4',
      fileName: 'promo-clip.mp4',
      fileSize: '18.4 MB',
      mimeType: 'video/mp4',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      duration: '1:42',
    },
  },
  {
    name: 'screenshot-5-webpage-stats-source',
    mock: {
      type: 'webpage',
      url: 'https://example.com/',
      title: 'Example — Home',
      domain: 'example.com',
      images: 42,
      links: 88,
    },
  },
];

async function launchPopup() {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    viewport: POPUP_VIEWPORT,
    deviceScaleFactor: CAPTURE_DEVICE_SCALE,
    colorScheme: 'dark',
    args: [`--disable-extensions-except=${EXT_DIR}`, `--load-extension=${EXT_DIR}`],
  });

  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) serviceWorker = await context.waitForEvent('serviceworker');

  const extensionId = serviceWorker.url().split('/')[2];
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForSelector('#container');
  // Let the auto-instantiated popup settle into its empty state first.
  await page.waitForTimeout(600);
  return { context, page };
}

async function render(page, mock, exif) {
  await page.evaluate(
    ({ mock, exif }) => {
      const PM = typeof PopupManager !== 'undefined' ? PopupManager : window.PopupManager;
      const pm = Object.create(PM.prototype);
      pm.elements = new Map();
      pm.currentFileInfo = null;
      pm.cacheElements();
      pm.displayFileInfo(mock);

      if (mock.__thumb) {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 180;
        const g = c.getContext('2d');
        const grad = g.createLinearGradient(0, 0, 320, 180);
        grad.addColorStop(0, '#ffcc00');
        grad.addColorStop(0.5, '#fb8500');
        grad.addColorStop(1, '#1f6feb');
        g.fillStyle = grad;
        g.fillRect(0, 0, 320, 180);
        const thumb = document.getElementById('heroThumb');
        thumb.src = c.toDataURL('image/jpeg', 0.92);
        document.getElementById('thumbWrap').classList.remove('hidden');
      }

      if (exif) pm.renderExif(exif);
    },
    { mock, exif }
  );
  await page.waitForTimeout(250);
}

async function snap(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.locator('#container').screenshot({ path: file });
  console.log(`captured ${path.relative(REPO_ROOT, file)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { context, page } = await launchPopup();

  try {
    for (const shot of SHOTS) {
      await render(page, shot.mock, shot.exif);
      await snap(page, shot.name);
    }
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
