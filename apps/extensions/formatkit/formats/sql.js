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
    const pad = (depth) => ' '.repeat(indent * depth);
    const keywordRegex = /\b(SELECT|FROM|WHERE|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|SET|VALUES|ON|AND|OR)\b/i;
    const rawChunks = text.replace(/\s+/g, ' ').trim().split(/(\(|\)|,|;|\b(?:SELECT|FROM|WHERE|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|SET|VALUES|ON|AND|OR)\b)/i);
    
    let depth = 0;
    const lines = [];
    let currentLine = '';

    rawChunks.forEach((chunk) => {
      const part = chunk.trim();
      if (!part) return;

      const upper = part.toUpperCase();
      const startsNewLine = /^(SELECT|FROM|WHERE|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|SET|VALUES|AND|OR)$/.test(upper);

      if (part === '(') {
        if (currentLine.trim()) lines.push(pad(depth) + currentLine.trim());
        lines.push(pad(depth) + '(');
        depth += 1;
        currentLine = '';
        return;
      }
      if (part === ')') {
        if (currentLine.trim()) lines.push(pad(depth) + currentLine.trim());
        depth = Math.max(0, depth - 1);
        lines.push(pad(depth) + ')');
        currentLine = '';
        return;
      }
      if (part === ',') {
        currentLine = currentLine.trim() + ',';
        lines.push(pad(depth) + currentLine);
        currentLine = '';
        return;
      }
      if (part === ';') {
        if (currentLine.trim()) lines.push(pad(depth) + currentLine.trim());
        lines.push(';');
        currentLine = '';
        depth = 0;
        return;
      }

      if (startsNewLine) {
        if (currentLine.trim()) lines.push(pad(depth) + currentLine.trim());
        currentLine = upperKeywordsInClause(part) + ' ';
      } else {
        currentLine += (currentLine.endsWith(' ') || currentLine === '' ? '' : ' ') + upperKeywordsInClause(part);
      }
    });

    if (currentLine.trim()) {
      lines.push(pad(depth) + currentLine.trim());
    }

    return lines.join('\n').trim();
  }

  function upperKeywordsInClause(clause) {
    return clause.split(' ').map(upperKeyword).join(' ');
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
