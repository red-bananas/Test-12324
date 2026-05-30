#!/usr/bin/env node
/**
 * Upload extension zip to Chrome Web Store and submit for review.
 * Usage: node tools/extensions/publish-cws.mjs <slug>
 */

import { readFileSync } from 'node:fs';
import { getAccessToken, resolveCwsEnv } from './cws-env.mjs';
import { distZipPath } from './paths.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node tools/extensions/publish-cws.mjs <extension-slug>');
  process.exit(1);
}

let config;
try {
  config = resolveCwsEnv(slug);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const zipPath = distZipPath(slug);
const zipBytes = readFileSync(zipPath);

async function cwsFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-api-version': '2',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  return { res, json };
}

function isAlreadyInReview(payload) {
  const text = JSON.stringify(payload).toLowerCase();
  return text.includes('in review')
    || text.includes('pending review')
    || text.includes('item_not_updatable');
}

console.log(`Using refresh token secret: ${config.refreshTokenSecret}`);
const token = await getAccessToken(config);
console.log(`Uploading ${zipPath} (${zipBytes.length} bytes) to ${config.extensionId}...`);

const uploadUrl = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${config.extensionId}?uploadType=media`;
const { res: uploadRes, json: uploadResp } = await cwsFetch(uploadUrl, token, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/zip' },
  body: zipBytes,
});
console.log('Upload response:', JSON.stringify(uploadResp, null, 2));

if (uploadResp.uploadState === 'FAILURE') {
  if (isAlreadyInReview(uploadResp)) {
    console.log('SKIP: listing is already in review — nothing to upload.');
    process.exit(0);
  }
  throw new Error(`CWS upload failed: ${JSON.stringify(uploadResp)}`);
}

if (!uploadRes.ok) {
  throw new Error(`CWS ${uploadRes.status} ${uploadUrl}: ${JSON.stringify(uploadResp)}`);
}

console.log('Submitting for review...');
const publishUrl = `https://www.googleapis.com/chromewebstore/v1.1/items/${config.extensionId}/publish`;
const { res: publishRes, json: publishResp } = await cwsFetch(publishUrl, token, {
  method: 'POST',
});
console.log('Publish response:', JSON.stringify(publishResp, null, 2));

if (!publishRes.ok) {
  if (isAlreadyInReview(publishResp)) {
    console.log('SKIP: listing is already in review — publish not needed.');
    process.exit(0);
  }
  throw new Error(`CWS ${publishRes.status} ${publishUrl}: ${JSON.stringify(publishResp)}`);
}

console.log('SUCCESS: submitted for review.');
