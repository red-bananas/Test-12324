(function () {
  'use strict';

  function parse(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) {
      throw new Error(err.textContent.replace(/\s+/g, ' ').trim());
    }
    return doc;
  }

  function serializeNode(node, indent, depth) {
    const pad = ' '.repeat(indent * depth);
    const padInner = ' '.repeat(indent * (depth + 1));

    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent.trim();
      return value ? escapeXml(value) : '';
    }

    if (node.nodeType === Node.CDATA_SECTION_NODE) {
      return `<![CDATA[${node.textContent}]]>`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const tag = node.tagName;
    const attrs = Array.from(node.attributes)
      .map((a) => ` ${a.name}="${escapeXml(a.value)}"`)
      .join('');

    const children = Array.from(node.childNodes).filter(
      (c) => !(c.nodeType === Node.TEXT_NODE && !c.textContent.trim())
    );

    if (children.length === 0) {
      return `${pad}<${tag}${attrs} />`;
    }

    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      const text = escapeXml(children[0].textContent.trim());
      return `${pad}<${tag}${attrs}>${text}</${tag}>`;
    }

    const inner = children
      .map((child) => serializeNode(child, indent, depth + 1))
      .filter(Boolean)
      .join('\n');

    return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`;
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function format(text, indent) {
    const doc = parse(text);
    const root = doc.documentElement;
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', serializeNode(root, indent, 0)];
    return lines.join('\n');
  }

  function minify(text) {
    const doc = parse(text);
    return new XMLSerializer().serializeToString(doc);
  }

  function validate(text) {
    parse(text);
    return { valid: true };
  }

  function detect(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    if (trimmed.startsWith('<')) {
      try {
        parse(trimmed);
        return 0.85;
      } catch {
        return 0.25;
      }
    }
    return 0;
  }

  function nodeToObject(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent.trim();
      return value || undefined;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return undefined;

    const obj = {};
    if (node.attributes.length) {
      obj['@attributes'] = {};
      Array.from(node.attributes).forEach((attr) => {
        obj['@attributes'][attr.name] = attr.value;
      });
    }

    const childElements = Array.from(node.childNodes).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE
    );
    const textNodes = Array.from(node.childNodes).filter(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
    );

    if (childElements.length === 0 && textNodes.length === 1) {
      return textNodes[0].textContent.trim();
    }

    childElements.forEach((child) => {
      const key = child.tagName;
      const value = nodeToObject(child);
      if (obj[key] === undefined) {
        obj[key] = value;
      } else if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    });

    return obj;
  }

  window.FormatKitFormats = window.FormatKitFormats || {};
  window.FormatKitFormats.xml = {
    id: 'xml',
    label: 'XML',
    extensions: ['xml'],
    parse,
    format,
    minify,
    validate,
    detect,
    toObject(text) {
      const doc = parse(text);
      return { [doc.documentElement.tagName]: nodeToObject(doc.documentElement) };
    },
  };
})();
