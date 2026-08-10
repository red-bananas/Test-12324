(function () {
  'use strict';

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function wrap(className, text) {
    return `<span class="tok-${className}">${text}</span>`;
  }

  const SLOT_START = 0xe000;
  const SLOT_END = 0xf8ff;


  function slotToken(id) {
    return String.fromCharCode(SLOT_START + id);
  }

  function withSlots(text, rules) {
    const slots = [];
    const mark = (className, match) => {
      const id = slots.length;
      if (id > SLOT_END - SLOT_START) {
        return wrap(className, match);
      }
      slots.push(wrap(className, match));
      return slotToken(id);
    };

    let html = escapeHtml(text);
    rules.forEach(([pattern, className]) => {
      html = html.replace(pattern, (match) => mark(className, match));
    });

    html = html.replace(/[\uE000-\uF8FF]/g, (ch) => slots[ch.charCodeAt(0) - SLOT_START]);
    return html;
  }

  function highlightJson(text) {
    return withSlots(text, [
      [/"([^"\\]|\\.)*"(?=\s*:)/g, 'key'],
      [/"([^"\\]|\\.)*"/g, 'string'],
      [/\b(true|false|null)\b/g, 'literal'],
      [/\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, 'number'],
      [/([{}[\],:])/g, 'punct'],
    ]);
  }

  function highlightYaml(text) {
    return withSlots(text, [
      [/^(\s*[\w.-]+)(?=:\s)/gm, 'key'],
      [/^---$/gm, 'punct'],
      [/'([^'\\]|\\.)*'/g, 'string'],
      [/"([^"\\]|\\.)*"/g, 'string'],
      [/\b(true|false|null|~)\b/gi, 'literal'],
      [/\b-?\d+(?:\.\d+)?\b/g, 'number'],
    ]);
  }

  function highlightXml(text) {
    return withSlots(text, [
      [/(&lt;\/?)([\w:-]+)/g, 'punct'],
      [/([\w:-]+)(=)/g, 'key'],
      [/"([^"]*)"/g, 'string'],
    ]);
  }

  function highlightGeneric(text) {
    return withSlots(text, [
      [/"([^"\\]|\\.)*"/g, 'string'],
      [/'([^'\\]|\\.)*'/g, 'string'],
      [/\b(true|false|null)\b/gi, 'literal'],
      [/\b-?\d+(?:\.\d+)?\b/g, 'number'],
    ]);
  }

  function highlightSql(text) {
    return withSlots(text, [
      [/\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END)\b/gi, 'key'],
      [/"([^"\\]|\\.)*"/g, 'string'],
      [/'([^'\\]|\\.)*'/g, 'string'],
      [/\b-?\d+(?:\.\d+)?\b/g, 'number'],
      [/([(),;=<>!+-/*])/g, 'punct'],
    ]);
  }

  function render(text, formatId) {
    if (!text) return '';
    switch (formatId) {
      case 'json':
        return highlightJson(text);
      case 'yaml':
        return highlightYaml(text);
      case 'xml':
        return highlightXml(text);
      case 'sql':
        return highlightSql(text);
      default:
        return highlightGeneric(text);
    }
  }

  window.FormatKitHighlight = { render };
})();
