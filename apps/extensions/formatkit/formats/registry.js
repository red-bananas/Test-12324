(function () {
  'use strict';

  const ORDER = ['json', 'yaml', 'xml', 'toml', 'csv', 'sql', 'properties'];

  function list() {
    return ORDER.map((id) => window.FormatKitFormats[id]).filter(Boolean);
  }

  function get(id) {
    if (!id || id === 'auto') return null;
    return window.FormatKitFormats[id] || null;
  }

  function detectFormat(text) {
    let best = { id: 'json', score: 0 };
    list().forEach((format) => {
      const score = format.detect(text);
      if (score > best.score) {
        best = { id: format.id, score };
      }
    });
    return best.score > 0 ? best.id : 'json';
  }

  function resolveFormat(id, text) {
    if (id && id !== 'auto') {
      const format = get(id);
      if (!format) throw new Error(`Unknown format: ${id}`);
      return format;
    }
    return get(detectFormat(text));
  }

  function formatAuto(text, indent) {
    const primary = detectFormat(text);
    const tryOrder = [primary, ...ORDER.filter((formatId) => formatId !== primary)];
    let lastError = null;

    for (const formatId of tryOrder) {
      const format = get(formatId);
      if (!format) continue;
      try {
        format.validate(text);
        return { output: format.format(text, indent), formatId };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to format input');
  }

  window.FormatKitRegistry = {
    list,
    get,
    detectFormat,
    resolveFormat,
    formatAuto,
    order: ORDER,
  };
})();
