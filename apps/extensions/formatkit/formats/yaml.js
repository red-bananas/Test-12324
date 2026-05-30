(function () {
  'use strict';

  const yaml = window.jsyaml;

  function parse(text) {
    return yaml.load(text);
  }

  function format(text, indent) {
    const data = parse(text);
    return yaml.dump(data, { indent, lineWidth: -1, noRefs: true });
  }

  function minify(text) {
    const data = parse(text);
    return yaml
      .dump(data, {
        flowLevel: 0,
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      })
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function validate(text) {
    parse(text);
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (trimmed.startsWith('---') || /^[\w.-]+\s*:/m.test(trimmed)) {
      try {
        yaml.load(trimmed);
        return 0.75;
      } catch {
        return 0.2;
      }
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        yaml.load(trimmed);
        return 0.85;
      } catch {
        /* not flow YAML */
      }
    }
    return 0;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.yaml = {
    id: 'yaml',
    label: 'YAML',
    extensions: ['yaml', 'yml'],
    parse,
    format,
    minify,
    validate,
    detect,
  };
})();
