(function () {
  'use strict';

  const toml = window.TOML;

  function parse(text) {
    return toml.parse(text);
  }

  function format(text) {
    const data = parse(text);
    return toml.stringify(data);
  }

  function minify(text) {
    return format(text).replace(/\n{2,}/g, '\n').trim();
  }

  function validate(text) {
    parse(text);
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (/^\[[^\]]+\]/m.test(trimmed) || /^[\w.-]+\s*=\s*.+/m.test(trimmed)) {
      try {
        parse(trimmed);
        return 0.7;
      } catch {
        return 0.15;
      }
    }
    return 0;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.toml = {
    id: 'toml',
    label: 'TOML',
    extensions: ['toml'],
    parse,
    format,
    minify,
    validate,
    detect,
  };
})();
