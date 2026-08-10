(function () {
  'use strict';

  function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let wasQuoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        wasQuoted = true;
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push({ value: current, quoted: wasQuoted });
        current = '';
        wasQuoted = false;
      } else {
        current += ch;
      }
    }
    result.push({ value: current, quoted: wasQuoted });
    return result.map((cell) => (cell.quoted ? cell.value : cell.value.trim()));
  }

  function parse(text) {
    const lines = text.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
    return lines.map(parseLine);
  }

  function escapeCell(cell) {
    const value = String(cell ?? '');
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  function format(text) {
    const rows = parse(text);
    return rows.map((row) => row.map(escapeCell).join(', ')).join('\n');
  }

  function minify(text) {
    const rows = parse(text);
    return rows.map((row) => row.map(escapeCell).join(',')).join('\n');
  }

  function validate(text) {
    parse(text);
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (trimmed.startsWith('{') || trimmed.startsWith('<') || trimmed.startsWith('[')) return 0;
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    if (lines.length < 1) return 0;
    const commaLines = lines.filter((line) => line.includes(',')).length;
    if (commaLines >= Math.max(1, lines.length * 0.5)) {
      return 0.55;
    }
    return 0;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.csv = {
    id: 'csv',
    label: 'CSV',
    extensions: ['csv'],
    parse,
    format,
    minify,
    validate,
    detect,
  };
})();
