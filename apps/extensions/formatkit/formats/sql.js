(function () {
  'use strict';

  const KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'ON', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP',
    'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE', 'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'CASE',
    'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'DISTINCT', 'EXISTS',
    'BETWEEN', 'LIKE', 'ASC', 'DESC', 'WITH', 'CASCADE', 'CONSTRAINT',
  ]);

  function upperKeyword(token) {
    const upper = token.toUpperCase();
    return KEYWORDS.has(upper) ? upper : token;
  }

  function format(text, indent) {
    let depth = 0;
    const pad = () => ' '.repeat(indent * depth);
    const lines = [];
    const chunks = text.replace(/\s+/g, ' ').trim().split(/(\(|\)|,|;)/);

    let buffer = '';
    chunks.forEach((chunk) => {
      const part = chunk.trim();
      if (!part) return;

      if (part === '(') {
        buffer += '(';
        depth += 1;
        return;
      }
      if (part === ')') {
        depth = Math.max(0, depth - 1);
        buffer += ')';
        return;
      }
      if (part === ',') {
        lines.push(pad() + buffer.trim() + ',');
        buffer = '';
        return;
      }
      if (part === ';') {
        if (buffer.trim()) lines.push(pad() + buffer.trim());
        lines.push(';');
        buffer = '';
        depth = 0;
        return;
      }

      const tokens = part.split(' ');
      const formatted = tokens.map(upperKeyword).join(' ');
      if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)$/i.test(formatted)) {
        if (buffer.trim()) lines.push(pad() + buffer.trim());
        buffer = formatted + ' ';
        return;
      }
      if (/^(FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|GROUP BY|ORDER BY|HAVING|SET|VALUES|ON)$/i.test(formatted)) {
        if (buffer.trim()) lines.push(pad() + buffer.trim());
        lines.push(pad() + formatted);
        buffer = ' ';
        return;
      }
      buffer += (buffer.endsWith(' ') ? '' : ' ') + formatted;
    });

    if (buffer.trim()) lines.push(pad() + buffer.trim());
    return lines.join('\n').trim();
  }

  function minify(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  function validate(text) {
    if (!text.trim()) {
      throw new Error('Empty SQL input');
    }
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i.test(trimmed)) {
      return 0.65;
    }
    return 0;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.sql = {
    id: 'sql',
    label: 'SQL',
    extensions: ['sql'],
    parse(text) {
      return text;
    },
    format,
    minify,
    validate,
    detect,
  };
})();
