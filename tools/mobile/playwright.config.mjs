import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import { loadRegistry, resolveAppDir } from './paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const slugFilter = process.env.MOBILE_E2E_SLUG;
const { apps } = loadRegistry();

const projects = Object.entries(apps)
  .filter(([slug]) => !slugFilter || slug === slugFilter)
  .map(([slug, config]) => ({
    name: slug,
    testMatch: `${slug}.spec.mjs`,
    metadata: { slug },
    use: {
      baseURL: `http://127.0.0.1:${config.webPort ?? 8081}`,
    },
  }));

const defaultSlug = slugFilter ?? Object.keys(apps)[0];
const defaultApp = apps[defaultSlug];
const defaultAppDir = resolveAppDir(defaultApp);
const webPort = defaultApp.webPort ?? 8081;

export default defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  projects,
  webServer: {
    command: `npx expo start --web --port ${webPort}`,
    cwd: defaultAppDir,
    url: `http://127.0.0.1:${webPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: {
      ...process.env,
      CI: '1',
      EXPO_NO_TELEMETRY: '1',
    },
  },
});
