(function () {
  'use strict';

  function parse(text) {
    const result = {};
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) {
        throw new Error(`Invalid properties line ${index + 1}: missing "="`);
      }
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    });
    return result;
  }

  function escapeValue(value) {
    const str = String(value ?? '');
    if (/[\s=#:]/u.test(str)) {
      return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return str;
  }

  function format(text) {
    const data = parse(text);
    return Object.keys(data)
      .sort()
      .map((key) => `${key}=${escapeValue(data[key])}`)
      .join('\n');
  }

  function minify(text) {
    const data = parse(text);
    return Object.keys(data)
      .map((key) => `${key}=${escapeValue(data[key])}`)
      .join('\n');
  }

  function validate(text) {
    parse(text);
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (trimmed.startsWith('{') || trimmed.startsWith('<')) return 0;
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith('#'));
    if (lines.length === 0) return 0;
    const propLines = lines.filter((line) => /^[\w.-]+\s*=/.test(line.trim())).length;
    if (propLines >= Math.max(1, lines.length * 0.6)) {
      return 0.5;
    }
    return 0;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.properties = {
    id: 'properties',
    label: 'Properties',
    extensions: ['properties', 'env'],
    parse,
    format,
    minify,
    validate,
    detect,
  };
})();
