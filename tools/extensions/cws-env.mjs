import { loadRegistry, registryPath } from './paths.mjs';

export function getExtensionEntry(slug) {
  const registry = loadRegistry();
  const entry = registry.extensions[slug];
  if (!entry) {
    throw new Error(`Unknown slug: ${slug}`);
  }
  return entry;
}

export function resolveCwsEnv(slug) {
  const entry = getExtensionEntry(slug);
  const clientId = process.env.CHROME_CLIENT_ID?.trim();
  const clientSecret = process.env.CHROME_CLIENT_SECRET?.trim();
  const extensionId = (
    process.env[entry.extensionIdSecret]?.trim()
    || entry.chromeWebStoreId?.trim()
    || ''
  );

  let refreshToken = '';
  let refreshTokenSecret = 'CHROME_REFRESH_TOKEN';

  if (entry.refreshTokenSecret) {
    const dedicated = process.env[entry.refreshTokenSecret]?.trim();
    if (dedicated) {
      refreshToken = dedicated;
      refreshTokenSecret = entry.refreshTokenSecret;
    }
  }

  if (!refreshToken) {
    refreshToken = process.env.CHROME_REFRESH_TOKEN?.trim() || '';
  }

  const missing = [];
  if (!clientId) missing.push('CHROME_CLIENT_ID');
  if (!clientSecret) missing.push('CHROME_CLIENT_SECRET');
  if (!refreshToken) {
    missing.push(entry.refreshTokenSecret || 'CHROME_REFRESH_TOKEN');
  }
  if (!extensionId) missing.push(entry.extensionIdSecret);

  if (missing.length) {
    const err = new Error(`Missing env: ${missing.join(', ')}`);
    err.missing = missing;
    err.entry = entry;
    throw err;
  }

  return {
    entry,
    clientId,
    clientSecret,
    refreshToken,
    refreshTokenSecret,
    extensionId,
  };
}

export async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

export function formatCws404Help(entry, extensionId) {
  const fileInfoId = process.env.FILE_INFO_EXTENSION_ID?.trim();
  return [
    '',
    'HTTP 404 usually means one of:',
    `  1. Wrong extension ID — confirm ${entry.extensionIdSecret} in the Developer Dashboard URL`,
    `  2. OAuth token is not from the publisher account that owns this listing`,
    '',
    `Tried: ${extensionId} for ${entry.displayName}`,
    fileInfoId
      ? 'If file-info verify succeeds with the same CHROME_REFRESH_TOKEN, the extension ID is likely wrong.'
      : '',
  ].filter(Boolean).join('\n');
}

// Keep registry path discoverable for debugging
export { registryPath };
