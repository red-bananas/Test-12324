import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  projects: [
    {
      name: 'formatkit',
      testMatch: '**/formatkit.spec.mjs',
      metadata: { slug: 'formatkit' },
    },
    {
      name: 'file-info',
      testMatch: '**/file-info.spec.mjs',
      metadata: { slug: 'file-info' },
    },
  ],
});
