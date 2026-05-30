import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  testMatch: '**/*.spec.mjs',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  projects: [
    {
      name: 'formatkit',
      metadata: { slug: 'formatkit' },
    },
  ],
});
