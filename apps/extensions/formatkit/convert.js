(function () {
  'use strict';

  function objectToXml(name, value, indent, depth) {
    const pad = ' '.repeat(indent * depth);
    const padInner = ' '.repeat(indent * (depth + 1));

    if (value === null || value === undefined) {
      return `${pad}<${name} />`;
    }
    if (typeof value !== 'object') {
      return `${pad}<${name}>${escape(String(value))}</${name}>`;
    }
    if (Array.isArray(value)) {
      return value.map((item) => objectToXml(name, item, indent, depth)).join('\n');
    }

    const attrs = value['@attributes'];
    const attrText = attrs
      ? Object.entries(attrs)
          .map(([k, v]) => ` ${k}="${escape(String(v))}"`)
          .join('')
      : '';
    const entries = Object.entries(value).filter(([k]) => k !== '@attributes');
    if (entries.length === 0) {
      return `${pad}<${name}${attrText} />`;
    }

    const inner = entries
      .flatMap(([key, child]) => {
        if (Array.isArray(child)) {
          return child.map((item) => objectToXml(key, item, indent, depth + 1));
        }
        return [objectToXml(key, child, indent, depth + 1)];
      })
      .join('\n');

    return `${pad}<${name}${attrText}>\n${inner}\n${pad}</${name}>`;
  }

  function escape(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toIntermediate(fromId, text) {
    const from = window.FormatKitRegistry.get(fromId);
    if (!from) throw new Error(`Unknown source format: ${fromId}`);

    if (fromId === 'json') return from.parse(text);
    if (fromId === 'yaml') return from.parse(text);
    if (fromId === 'toml') return from.parse(text);
    if (fromId === 'properties') return from.parse(text);
    if (fromId === 'csv') return from.parse(text);
    if (fromId === 'xml') return from.toObject(text);
    if (fromId === 'sql') throw new Error('SQL conversion is not supported');
    throw new Error(`Conversion from ${fromId} is not supported`);
  }

  function fromIntermediate(toId, data, indent) {
    const to = window.FormatKitRegistry.get(toId);
    if (!to) throw new Error(`Unknown target format: ${toId}`);

    if (toId === 'json') return JSON.stringify(data, null, indent);
    if (toId === 'yaml') return window.jsyaml.dump(data, { indent, lineWidth: -1, noRefs: true });
    if (toId === 'toml') return window.TOML.stringify(data);
    if (toId === 'properties') {
      return Object.keys(data)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join('\n');
    }
    if (toId === 'csv') {
      if (!Array.isArray(data)) throw new Error('CSV target requires tabular array data');
      return data.map((row) => row.join(', ')).join('\n');
    }
    if (toId === 'xml') {
      const rootName = Object.keys(data)[0] || 'root';
      const rootValue = data[rootName] ?? data;
      return ['<?xml version="1.0" encoding="UTF-8"?>', objectToXml(rootName, rootValue, indent, 0)].join('\n');
    }
    throw new Error(`Conversion to ${toId} is not supported`);
  }

  const PAIRS = new Set([
    'json:yaml', 'yaml:json',
    'json:xml', 'xml:json',
    'json:toml', 'toml:json',
    'json:properties', 'properties:json',
    'yaml:toml', 'toml:yaml',
    'yaml:xml', 'xml:yaml',
  ]);

  function canConvert(fromId, toId) {
    if (fromId === toId) return false;
    if (fromId === 'sql' || toId === 'sql' || fromId === 'csv' || toId === 'csv') {
      return fromId === 'csv' && toId === 'json' ? false : PAIRS.has(`${fromId}:${toId}`);
    }
    return PAIRS.has(`${fromId}:${toId}`);
  }

  function convert(text, fromId, toId, indent) {
    if (!canConvert(fromId, toId)) {
      throw new Error(`Cannot convert ${fromId} to ${toId}`);
    }
    const data = toIntermediate(fromId, text);
    return fromIntermediate(toId, data, indent);
  }

  window.FormatKitConvert = {
    convert,
    canConvert,
  };
})();
