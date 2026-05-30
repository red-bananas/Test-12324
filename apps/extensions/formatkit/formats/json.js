(function () {
  'use strict';

  function sortKeys(value) {
    if (Array.isArray(value)) {
      return value.map(sortKeys);
    }
    if (value && typeof value === 'object') {
      const sorted = {};
      Object.keys(value).sort().forEach((key) => {
        sorted[key] = sortKeys(value[key]);
      });
      return sorted;
    }
    return value;
  }

  function parse(text) {
    return JSON.parse(text);
  }

  function format(text, indent) {
    const data = parse(text);
    return JSON.stringify(data, null, indent);
  }

  function minify(text) {
    const data = parse(text);
    return JSON.stringify(data);
  }

  function validate(text) {
    parse(text);
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 0.9;
      } catch {
        return 0.3;
      }
    }
    return 0;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.json = {
    id: 'json',
    label: 'JSON',
    extensions: ['json'],
    parse,
    format,
    minify,
    validate,
    detect,
    sortKeys(text, indent) {
      const data = sortKeys(parse(text));
      return JSON.stringify(data, null, indent);
    },
  };
})();
