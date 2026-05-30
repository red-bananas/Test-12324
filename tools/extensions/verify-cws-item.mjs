#!/usr/bin/env node
/**
 * Verify Chrome Web Store API can access an extension draft.
 * Usage: node scripts/verify-cws-item.mjs <extension-slug>
 */

import {
  formatCws404Help,
  getAccessToken,
  resolveCwsEnv,
} from './cws-env.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/verify-cws-item.mjs <extension-slug>');
  process.exit(1);
}

let config;
try {
  config = resolveCwsEnv(slug);
} catch (error) {
  console.error(error.message);
  if (error.entry?.refreshTokenSecret) {
    console.error(`Required for ${error.entry.displayName}: ${error.entry.refreshTokenSecret}`);
  }
  process.exit(1);
}

console.log(`Using refresh token secret: ${config.refreshTokenSecret}`);

let accessToken;
try {
  accessToken = await getAccessToken(config);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const url = `https://www.googleapis.com/chromewebstore/v1.1/items/${config.extensionId}?projection=DRAFT`;
const res = await fetch(url, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'x-goog-api-version': '2',
  },
});

const body = await res.text();
if (!res.ok) {
  console.error(`Cannot access ${config.entry.displayName} (${config.extensionId}): HTTP ${res.status}`);
  console.error(body);
  console.error(formatCws404Help(config.entry, config.extensionId));
  process.exit(1);
}

console.log(`OK: API access to ${config.entry.displayName} (${config.extensionId})`);
console.log(body.slice(0, 300));
