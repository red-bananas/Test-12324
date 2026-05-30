// https://www.timeanddate.com/time/zones/
// Curated list (84 zones). Military, Antarctica, and misc zones excluded.

const TIMEZONE_MIGRATIONS = {
  'Europe/Kiev': 'Europe/Kyiv',
  UTC: 'tz/utc',
  'Etc/UTC': 'tz/utc',
  'America/New_York': 'tz/est',
  'America/Toronto': 'tz/est',
  'America/Los_Angeles': 'tz/pst',
  'America/Chicago': 'tz/cst',
  'America/Denver': 'tz/mst',
  'America/Anchorage': 'tz/akst',
  'America/Halifax': 'tz/ast',
  'America/St_Johns': 'tz/nst',
  'Europe/London': 'tz/gmt',
  'Europe/Dublin': 'tz/ist-irish',
  'Europe/Berlin': 'tz/cet',
  'Asia/Kolkata': 'tz/ist-india',
  'Asia/Shanghai': 'tz/cst-china',
  'Asia/Tokyo': 'tz/jst',
  'Australia/Sydney': 'tz/aest',
};

const REGION_ORDER = ['UTC', 'Pacific', 'Americas', 'Atlantic', 'Europe', 'Africa', 'Asia', 'Australia'];

function zone(value, region, name, abbr, offsetMinutes) {
  return {
    value,
    region,
    defaultName: name,
    defaultAbbr: abbr,
    fixedOffsetMinutes: offsetMinutes,
    skipIntl: true,
  };
}

const timezones = [
  // UTC & global
  zone('tz/utc', 'UTC', 'Coordinated Universal Time', 'UTC', 0),
  zone('tz/gmt', 'UTC', 'Greenwich Mean Time', 'GMT', 0),

  // Pacific
  zone('tz/aoe', 'Pacific', 'Anywhere on Earth', 'AoE', -720),
  zone('tz/sst', 'Pacific', 'Samoa Standard Time', 'SST', -660),
  zone('tz/hast', 'Pacific', 'Hawaii-Aleutian Standard Time', 'HAST', -600),
  zone('tz/hadt', 'Pacific', 'Hawaii-Aleutian Daylight Time', 'HADT', -540),
  zone('tz/mart', 'Pacific', 'Marquesas Time', 'MART', -570),
  zone('tz/sbt', 'Pacific', 'Solomon Islands Time', 'SBT', 660),
  zone('tz/fjt', 'Pacific', 'Fiji Time', 'FJT', 720),
  zone('tz/fjdt', 'Pacific', 'Fiji Summer Time', 'FJDT', 780),
  zone('tz/nzst', 'Pacific', 'New Zealand Standard Time', 'NZST', 720),
  zone('tz/nzdt', 'Pacific', 'New Zealand Daylight Time', 'NZDT', 780),
  zone('tz/chast', 'Pacific', 'Chatham Island Standard Time', 'CHAST', 765),
  zone('tz/chadt', 'Pacific', 'Chatham Island Daylight Time', 'CHADT', 825),
  zone('tz/tot', 'Pacific', 'Tonga Time', 'TOT', 780),
  zone('tz/lint', 'Pacific', 'Line Islands Time', 'LINT', 840),

  // Americas — North America
  zone('tz/akst', 'Americas', 'Alaska Standard Time', 'AKST', -540),
  zone('tz/akdt', 'Americas', 'Alaska Daylight Time', 'AKDT', -480),
  zone('tz/pst', 'Americas', 'Pacific Standard Time', 'PST', -480),
  zone('tz/pdt', 'Americas', 'Pacific Daylight Time', 'PDT', -420),
  zone('tz/mst', 'Americas', 'Mountain Standard Time', 'MST', -420),
  zone('tz/mdt', 'Americas', 'Mountain Daylight Time', 'MDT', -360),
  zone('tz/cst', 'Americas', 'Central Standard Time', 'CST', -360),
  zone('tz/cdt', 'Americas', 'Central Daylight Time', 'CDT', -300),
  zone('tz/est', 'Americas', 'Eastern Standard Time', 'EST', -300),
  zone('tz/edt', 'Americas', 'Eastern Daylight Time', 'EDT', -240),
  zone('tz/ast', 'Americas', 'Atlantic Standard Time', 'AST', -240),
  zone('tz/adt', 'Americas', 'Atlantic Daylight Time', 'ADT', -180),
  zone('tz/nst', 'Americas', 'Newfoundland Standard Time', 'NST', -210),
  zone('tz/ndt', 'Americas', 'Newfoundland Daylight Time', 'NDT', -150),

  // Americas — South & Central
  zone('tz/cot', 'Americas', 'Colombia Time', 'COT', -300),
  zone('tz/pet', 'Americas', 'Peru Time', 'PET', -300),
  zone('tz/vet', 'Americas', 'Venezuelan Standard Time', 'VET', -240),
  zone('tz/clt', 'Americas', 'Chile Standard Time', 'CLT', -240),
  zone('tz/cldt', 'Americas', 'Chile Summer Time', 'CLDT', -180),
  zone('tz/brt', 'Americas', 'Brasília Time', 'BRT', -180),
  zone('tz/art', 'Americas', 'Argentina Time', 'ART', -180),
  zone('tz/fnt', 'Americas', 'Fernando de Noronha Time', 'FNT', -120),

  // Atlantic
  zone('tz/cvt', 'Atlantic', 'Cape Verde Time', 'CVT', -60),

  // Africa
  zone('tz/wet', 'Africa', 'Western European Time', 'WET', 0),
  zone('tz/west', 'Africa', 'Western European Summer Time', 'WEST', 60),
  zone('tz/wat', 'Africa', 'West Africa Time', 'WAT', 60),
  zone('tz/sast', 'Africa', 'South Africa Standard Time', 'SAST', 120),
  zone('tz/eat', 'Africa', 'Eastern Africa Time', 'EAT', 180),

  // Europe
  zone('tz/bst', 'Europe', 'British Summer Time', 'BST', 60),
  zone('tz/ist-irish', 'Europe', 'Irish Standard Time', 'IST', 60),
  zone('tz/cet', 'Europe', 'Central European Time', 'CET', 60),
  zone('tz/cest', 'Europe', 'Central European Summer Time', 'CEST', 120),
  zone('tz/eet', 'Europe', 'Eastern European Time', 'EET', 120),
  zone('tz/eest', 'Europe', 'Eastern European Summer Time', 'EEST', 180),
  zone('tz/trt', 'Europe', 'Turkey Time', 'TRT', 180),
  zone('tz/msk', 'Europe', 'Moscow Standard Time', 'MSK', 180),

  // Asia
  zone('tz/ast-arabia', 'Asia', 'Arabia Standard Time', 'AST', 180),
  zone('tz/gst', 'Asia', 'Gulf Standard Time', 'GST', 240),
  zone('tz/irst', 'Asia', 'Iran Standard Time', 'IRST', 210),
  zone('tz/irdt', 'Asia', 'Iran Daylight Time', 'IRDT', 270),
  zone('tz/ist-israel', 'Asia', 'Israel Standard Time', 'IST', 120),
  zone('tz/idt', 'Asia', 'Israel Daylight Time', 'IDT', 180),
  zone('tz/aft', 'Asia', 'Afghanistan Time', 'AFT', 270),
  zone('tz/pkt', 'Asia', 'Pakistan Standard Time', 'PKT', 300),
  zone('tz/ist-india', 'Asia', 'India Standard Time', 'IST', 330),
  zone('tz/npt', 'Asia', 'Nepal Time', 'NPT', 345),
  zone('tz/bst-bangladesh', 'Asia', 'Bangladesh Standard Time', 'BST', 360),
  zone('tz/mmt', 'Asia', 'Myanmar Time', 'MMT', 390),
  zone('tz/ict', 'Asia', 'Indochina Time', 'ICT', 420),
  zone('tz/wib', 'Asia', 'Western Indonesian Time', 'WIB', 420),
  zone('tz/wita', 'Asia', 'Central Indonesian Time', 'WITA', 480),
  zone('tz/wit', 'Asia', 'Eastern Indonesian Time', 'WIT', 540),
  zone('tz/cst-china', 'Asia', 'China Standard Time', 'CST', 480),
  zone('tz/hkt', 'Asia', 'Hong Kong Time', 'HKT', 480),
  zone('tz/sgt', 'Asia', 'Singapore Time', 'SGT', 480),
  zone('tz/myt', 'Asia', 'Malaysia Time', 'MYT', 480),
  zone('tz/pht', 'Asia', 'Philippine Time', 'PHT', 480),
  zone('tz/jst', 'Asia', 'Japan Standard Time', 'JST', 540),
  zone('tz/kst', 'Asia', 'Korea Standard Time', 'KST', 540),

  // Australia
  zone('tz/awst', 'Australia', 'Australian Western Standard Time', 'AWST', 480),
  zone('tz/awdt', 'Australia', 'Australian Western Daylight Time', 'AWDT', 540),
  zone('tz/acwst', 'Australia', 'Australian Central Western Standard Time', 'ACWST', 525),
  zone('tz/acst', 'Australia', 'Australian Central Standard Time', 'ACST', 570),
  zone('tz/acdt', 'Australia', 'Australian Central Daylight Time', 'ACDT', 630),
  zone('tz/aest', 'Australia', 'Australian Eastern Standard Time', 'AEST', 600),
  zone('tz/aedt', 'Australia', 'Australian Eastern Daylight Time', 'AEDT', 660),
  zone('tz/lhst', 'Australia', 'Lord Howe Standard Time', 'LHST', 630),
  zone('tz/lhdt', 'Australia', 'Lord Howe Daylight Time', 'LHDT', 660),
];

function migrateTimezoneValue(tzValue) {
  return TIMEZONE_MIGRATIONS[tzValue] || tzValue;
}

function findTimezoneEntry(tzValue) {
  return timezones.find((entry) => entry.value === migrateTimezoneValue(tzValue));
}

function getIanaTimeZone(tzValue) {
  const entry = findTimezoneEntry(tzValue);
  return entry?.iana || migrateTimezoneValue(tzValue);
}

function normalizeStoredClocks(clocks) {
  if (!Array.isArray(clocks) || clocks.length === 0) {
    return ['tz/utc'];
  }

  return clocks.map(migrateTimezoneValue);
}

function normalizeIconClock(iconClock, clocks) {
  const normalizedIcon = migrateTimezoneValue(iconClock);
  if (normalizedIcon && clocks.includes(normalizedIcon)) {
    return normalizedIcon;
  }

  return clocks[0];
}

function getFixedZonedDate(date, offsetMinutes) {
  // date.getTime() is UTC; apply zone offset only — not the browser's local timezone.
  return new Date(date.getTime() + offsetMinutes * 60000);
}

function getIntlTimezoneAbbreviation(tzValue, date = new Date()) {
  const entry = findTimezoneEntry(tzValue);
  if (entry?.skipIntl) {
    return entry.defaultAbbr;
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: getIanaTimeZone(tzValue),
      timeZoneName: 'short',
    }).formatToParts(date);
    const tzPart = parts.find((part) => part.type === 'timeZoneName');
    if (!tzPart?.value) {
      return null;
    }

    const value = tzPart.value.replace(/\s+/g, '');
    if (/^GMT[+-]?/.test(value)) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

function getTimezoneUtcOffsetMinutes(tzValue, date = new Date()) {
  const entry = findTimezoneEntry(migrateTimezoneValue(tzValue));
  if (entry?.fixedOffsetMinutes != null) {
    return entry.fixedOffsetMinutes;
  }

  const normalizedValue = getIanaTimeZone(tzValue);

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedValue,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value;

    if (offsetPart) {
      if (offsetPart === 'GMT') {
        return 0;
      }

      const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3] || '0', 10);
        return sign * (hours * 60 + minutes);
      }
    }
  } catch {
    return 0;
  }

  return 0;
}

function formatUtcOffset(minutes) {
  if (minutes === 0) {
    return 'UTC';
  }

  const sign = minutes >= 0 ? '+' : '-';
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;

  if (mins === 0) {
    return `UTC${sign}${hours}`;
  }

  return `UTC${sign}${hours}:${String(mins).padStart(2, '0')}`;
}

function getTimezoneOffsetLabel(tzValue, date = new Date()) {
  return formatUtcOffset(getTimezoneUtcOffsetMinutes(tzValue, date));
}

function getTimezoneShortName(tzValue, date = new Date()) {
  const entry = findTimezoneEntry(migrateTimezoneValue(tzValue));
  if (entry?.skipIntl) {
    return entry.defaultAbbr;
  }

  const intlAbbrev = getIntlTimezoneAbbreviation(tzValue, date);
  if (intlAbbrev) {
    return intlAbbrev;
  }

  if (entry) {
    return entry.defaultAbbr;
  }

  const segment = migrateTimezoneValue(tzValue).split('/').pop() || migrateTimezoneValue(tzValue);
  return segment.replace(/_/g, '').slice(0, 3).toUpperCase();
}

function getTimezoneDisplayName(tzValue, date = new Date()) {
  const entry = findTimezoneEntry(migrateTimezoneValue(tzValue));
  if (entry) {
    return entry.defaultName;
  }

  return migrateTimezoneValue(tzValue);
}

function getTimezoneIconLabel(tzValue, date = new Date()) {
  const shortName = getTimezoneShortName(tzValue, date);
  return shortName.length > 4 ? shortName.slice(0, 4) : shortName;
}

function getTimezoneLabel(tzValue, date = new Date()) {
  const abbrev = getTimezoneShortName(tzValue, date);
  return `${getTimezoneDisplayName(tzValue, date)} (${abbrev})`;
}

function getClockPartsInTimezone(date, tzValue) {
  const entry = findTimezoneEntry(migrateTimezoneValue(tzValue));

  if (entry?.fixedOffsetMinutes != null) {
    const zoned = getFixedZonedDate(date, entry.fixedOffsetMinutes);
    return {
      hours: zoned.getUTCHours(),
      minutes: zoned.getUTCMinutes(),
      seconds: zoned.getUTCSeconds(),
    };
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: getIanaTimeZone(tzValue),
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date);

  const read = (type) => parseInt(parts.find((part) => part.type === type)?.value || '0', 10);
  return {
    hours: read('hour'),
    minutes: read('minute'),
    seconds: read('second'),
  };
}

function formatTimeInTimezone(date, tzValue, options) {
  const entry = findTimezoneEntry(migrateTimezoneValue(tzValue));

  if (entry?.fixedOffsetMinutes != null) {
    const zoned = getFixedZonedDate(date, entry.fixedOffsetMinutes);
    return zoned.toLocaleTimeString('en-US', { ...options, timeZone: 'UTC' });
  }

  return date.toLocaleTimeString('en-US', { ...options, timeZone: getIanaTimeZone(tzValue) });
}

function formatDateInTimezone(date, tzValue, options) {
  const entry = findTimezoneEntry(migrateTimezoneValue(tzValue));

  if (entry?.fixedOffsetMinutes != null) {
    const zoned = getFixedZonedDate(date, entry.fixedOffsetMinutes);
    return zoned.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
  }

  return date.toLocaleDateString('en-US', { ...options, timeZone: getIanaTimeZone(tzValue) });
}

function getTimezoneToolbarTitle(tzValue, date = new Date(), { hour12 = false } = {}) {
  const normalizedValue = migrateTimezoneValue(tzValue);
  const name = getTimezoneDisplayName(normalizedValue, date);
  const abbrev = getTimezoneShortName(normalizedValue, date);
  const time = formatTimeInTimezone(date, normalizedValue, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12,
  });
  const day = formatDateInTimezone(date, normalizedValue, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return `${name} (${abbrev})\n${time}\n${day}`;
}

function compareTimezonesByName(a, b) {
  return a.defaultName.localeCompare(b.defaultName);
}

function getTimezonesGroupedByRegion(date = new Date()) {
  const grouped = new Map();

  timezones.forEach((entry) => {
    if (!grouped.has(entry.region)) {
      grouped.set(entry.region, []);
    }
    grouped.get(entry.region).push(entry);
  });

  return REGION_ORDER
    .filter((region) => grouped.has(region))
    .map((region) => ({
      region,
      zones: grouped.get(region).slice().sort(compareTimezonesByName),
    }));
}

function buildTimezoneSelectHtml(currentTz, date = new Date(), blockedTimezones = []) {
  const blocked = new Set(blockedTimezones.filter((tz) => tz !== currentTz).map(migrateTimezoneValue));

  return getTimezonesGroupedByRegion(date).map(({ region, zones }) => {
    const options = zones
      .filter((tz) => !blocked.has(tz.value))
      .map((tz) => `
        <option value="${tz.value}" ${tz.value === migrateTimezoneValue(currentTz) ? 'selected' : ''}>
          ${getTimezoneLabel(tz.value, date)}
        </option>
      `)
      .join('');

    if (!options) {
      return '';
    }

    return `
      <optgroup label="${region}">
        ${options}
      </optgroup>
    `;
  }).join('');
}
