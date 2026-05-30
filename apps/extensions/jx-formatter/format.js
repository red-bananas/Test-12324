// Format and minify utilities for JSON and XML

function detectType(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  
  // Check for JSON by looking for starting characters
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    // Additional validation to ensure it's actually JSON
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch (e) {
      // Not valid JSON, continue checks
    }
  }
  
  // Check for XML by looking for XML syntax
  if (trimmed.startsWith('<') && (trimmed.includes('</') || trimmed.includes('/>'))) {
    return 'xml';
  }
  
  return null;
}

function formatJSON(input) {
  try {
    // Parse and then stringify with 2 space indentation
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }
}

function minifyJSON(input) {
  try {
    // Parse and then stringify without indentation
    return JSON.stringify(JSON.parse(input));
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }
}

function formatXML(input) {
  try {
    // Simple XML pretty print
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    let xml = input.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    
    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/.+>$/)) {
        indent = 0;
      } else if (node.match(/^<\//)) {
        if (pad !== 0) pad -= 2;
      } else if (node.match(/^<[^!?]+[^\/]>/)) {
        indent = 2;
      }
      formatted += ' '.repeat(pad) + node + '\n';
      pad += indent;
    });
    
    return formatted.trim();
  } catch (e) {
    throw new Error('XML formatting failed: ' + e.message);
  }
}

function minifyXML(input) {
  try {
    // Remove whitespace between tags and trim
    return input
      .replace(/>\s+</g, '><')
      .replace(/\s+</g, '<')
      .replace(/>\s+/g, '>')
      .trim();
  } catch (e) {
    throw new Error('XML minification failed: ' + e.message);
  }
}

function tryFormat(input, mode) {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  const type = detectType(input);
  if (!type) {
    throw new Error('Input is not valid JSON or XML');
  }
  
  if (type === 'json') {
    if (mode === 'format') return formatJSON(input);
    if (mode === 'minify') return minifyJSON(input);
  } else if (type === 'xml') {
    if (mode === 'format') return formatXML(input);
    if (mode === 'minify') return minifyXML(input);
  }
  
  throw new Error('Unknown format mode or content type');
}

// Export for popup.js
window.JxFormatter = {
  detectType,
  formatJSON,
  minifyJSON,
  formatXML,
  minifyXML,
  tryFormat
}; 