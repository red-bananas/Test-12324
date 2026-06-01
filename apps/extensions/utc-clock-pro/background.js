importScripts('timezones.js');

let showBadgeSeconds = true;
let use24HourFormat = true;
let badgeTimezone = 'tz/utc';

let cachedIconLabel = '';
let cachedBadgeText = '';
let badgeColorsApplied = false;
let tickTimer = null;
let lastTitleMinute = -1;

const isMacPlatform = /Mac/i.test(navigator.userAgent);
const ICON_TEXT = '#FFCC00';
const ICON_BG = '#333333';
const FONT_FAMILY = '"Arial", "Helvetica Neue", sans-serif';
const LABEL_RATIO = 0.56;
const ICON_SIZES = [16, 32, 48, 128];
const LABEL_FONT_WEIGHT = '700';

function pad2(value) {
  return value.toString().padStart(2, '0');
}

function toDisplayHour(hours24) {
  if (use24HourFormat) {
    return hours24;
  }

  const hour12 = hours24 % 12;
  return hour12 === 0 ? 12 : hour12;
}

function formatBadgeTime(hours24, minutes, seconds) {
  const hours = toDisplayHour(hours24);

  if (showBadgeSeconds && seconds % 2 === 0) {
    return `${pad2(seconds)}s`;
  }

  if (isMacPlatform) {
    return `${pad2(hours)}${pad2(minutes)}`;
  }

  return `${pad2(hours)}:${pad2(minutes)}`;
}

function getTimeInZone(timezone, now = new Date()) {
  return getClockPartsInTimezone(now, timezone);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fitFontSize(ctx, text, maxWidth, maxHeight, fontWeight) {
  let fontSize = maxHeight;

  while (fontSize >= 1) {
    ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
    const metrics = ctx.measureText(text);
    const height = (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent)
      ? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      : fontSize;

    if (metrics.width <= maxWidth && height <= maxHeight) {
      return fontSize;
    }

    fontSize -= 0.5;
  }

  ctx.font = `${fontWeight} 1px ${FONT_FAMILY}`;
  return 1;
}

function renderTimezoneIcon(size, timezoneLabel) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const labelHeight = Math.floor(size * LABEL_RATIO);
  const pillRadius = Math.max(1, Math.round(size * 0.06));

  drawRoundedRect(ctx, 0, 0, size, size, pillRadius);
  ctx.fillStyle = ICON_BG;
  ctx.fill();

  fitFontSize(ctx, timezoneLabel, size, labelHeight, LABEL_FONT_WEIGHT);
  ctx.fillStyle = ICON_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timezoneLabel, size / 2, labelHeight / 2);

  return ctx.getImageData(0, 0, size, size);
}

function applyBadgeColorsOnce() {
  if (badgeColorsApplied) {
    return;
  }

  badgeColorsApplied = true;
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });
  chrome.action.setBadgeTextColor({ color: ICON_TEXT });
}

async function updateTimezoneIcon(force = false) {
  if (typeof OffscreenCanvas === 'undefined') {
    return;
  }

  const now = new Date();
  const timezoneLabel = getTimezoneIconLabel(badgeTimezone, now);
  if (!force && timezoneLabel === cachedIconLabel) {
    return;
  }

  cachedIconLabel = timezoneLabel;

  try {
    const imageData = {};
    ICON_SIZES.forEach((iconSize) => {
      imageData[iconSize] = renderTimezoneIcon(iconSize, timezoneLabel);
    });
    await chrome.action.setIcon({ imageData });
  } catch (error) {
    console.error('UTC Clock Pro: failed to render timezone icon', error);
  }
}

function updateToolbarTitle(now = new Date()) {
  const { minutes } = getTimeInZone(badgeTimezone, now);
  const minuteKey = now.getUTCDate() * 1440 + now.getUTCHours() * 60 + minutes;
  if (minuteKey === lastTitleMinute) {
    return;
  }

  lastTitleMinute = minuteKey;
  chrome.action.setTitle({
    title: getTimezoneToolbarTitle(badgeTimezone, now, { hour12: !use24HourFormat }),
  });
}

function updateBadge(now = new Date()) {
  applyBadgeColorsOnce();

  const { hours, minutes, seconds } = getTimeInZone(badgeTimezone, now);
  const timeString = formatBadgeTime(hours, minutes, seconds);

  if (timeString !== cachedBadgeText) {
    cachedBadgeText = timeString;
    chrome.action.setBadgeText({ text: timeString });
  }

  updateToolbarTitle(now);
}

function tickDelayMs() {
  return showBadgeSeconds ? 1000 : 60000;
}

function scheduleTick() {
  if (tickTimer) {
    clearTimeout(tickTimer);
  }

  tickTimer = setTimeout(() => {
    tickTimer = null;
    updateBadge();
    scheduleTick();
  }, tickDelayMs());
}

function restartTickSchedule() {
  cachedBadgeText = '';
  lastTitleMinute = -1;
  scheduleTick();
}

function applyStoredClocks(clocks) {
  const normalizedClocks = normalizeStoredClocks(clocks);
  const nextTimezone = normalizedClocks[0] || 'tz/utc';
  const timezoneChanged = nextTimezone !== badgeTimezone;

  badgeTimezone = nextTimezone;

  const migrated = JSON.stringify(normalizedClocks) !== JSON.stringify(clocks);
  if (migrated) {
    chrome.storage.local.set({ clocks: normalizedClocks });
  }

  if (timezoneChanged) {
    cachedIconLabel = '';
  }

  updateTimezoneIcon(true);
  updateBadge();
  restartTickSchedule();
}

chrome.storage.local.get(['showBadgeSeconds', 'use24HourFormat', 'clocks', 'iconClock'], function(result) {
  if (result.showBadgeSeconds !== undefined) {
    showBadgeSeconds = result.showBadgeSeconds;
  }
  if (result.use24HourFormat !== undefined) {
    use24HourFormat = result.use24HourFormat;
  }

  let clocks = normalizeStoredClocks(result.clocks);
  if (result.iconClock) {
    const iconTz = migrateTimezoneValue(result.iconClock);
    clocks = clocks.filter((tz) => tz !== iconTz);
    clocks.unshift(iconTz);
    chrome.storage.local.set({ clocks });
    chrome.storage.local.remove('iconClock');
  }

  applyStoredClocks(clocks);
});

chrome.storage.onChanged.addListener(function(changes, area) {
  if (area !== 'local') {
    return;
  }

  if (changes.clocks) {
    applyStoredClocks(changes.clocks.newValue);
  }

  if (changes.showBadgeSeconds) {
    showBadgeSeconds = changes.showBadgeSeconds.newValue ?? true;
    restartTickSchedule();
    updateBadge();
  }

  if (changes.use24HourFormat) {
    use24HourFormat = changes.use24HourFormat.newValue ?? true;
    cachedBadgeText = '';
    lastTitleMinute = -1;
    updateBadge();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  applyBadgeColorsOnce();
  chrome.alarms.create('updateClockFast', { periodInMinutes: 0.5 });
  chrome.alarms.create('updateClockBackup', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'updateClockFast' && alarm.name !== 'updateClockBackup') {
    return;
  }

  updateBadge();
  updateTimezoneIcon();
  restartTickSchedule();
});

chrome.runtime.onStartup.addListener(() => {
  updateBadge();
  updateTimezoneIcon(true);
  restartTickSchedule();
});
