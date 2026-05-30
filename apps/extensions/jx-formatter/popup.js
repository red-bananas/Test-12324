// Jx Fromtter popup.js

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const error = document.getElementById('error');
  const formatBtn = document.getElementById('format');
  const minifyBtn = document.getElementById('minify');
  const copyBtn = document.getElementById('copy');
  const downloadBtn = document.getElementById('download');
  const pasteBtn = document.getElementById('paste');
  const themeToggle = document.getElementById('theme-toggle');
  const charCount = document.getElementById('char-count');
  const searchInput = document.getElementById('search-input');
  const searchPrev = document.getElementById('search-prev');
  const searchNext = document.getElementById('search-next');
  const searchCount = document.getElementById('search-count');

  // Constants for localStorage keys
  const STORAGE_KEY = 'jx-formatter-content';
  const THEME_KEY = 'jx-theme';

  // Search functionality
  let currentSearchIndex = -1;
  let searchMatches = [];

  function updateSearch() {
    // Clear previous highlights
    const content = editor.innerHTML;
    editor.innerHTML = content.replace(/<mark class="search-highlight.*?>(.*?)<\/mark>/g, '$1');
    
    const query = searchInput.value.trim();
    if (!query) {
      searchCount.textContent = '0/0';
      currentSearchIndex = -1;
      searchMatches = [];
      return;
    }
    
    // Get text content
    const text = getEditorText();
    
    // Find all matches
    const matches = [];
    let match;
    const regex = new RegExp(escapeRegExp(query), 'gi');
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + query.length
      });
    }
    
    searchMatches = matches;
    currentSearchIndex = matches.length > 0 ? 0 : -1;
    searchCount.textContent = `${matches.length > 0 ? currentSearchIndex + 1 : 0}/${matches.length}`;
    
    if (matches.length > 0) {
      highlightSearchMatches();
    }
  }
  
  function highlightSearchMatches() {
    if (searchMatches.length === 0) return;
    
    // Get text content
    const text = getEditorText();
    
    // Highlight all matches
    let html = '';
    let lastIndex = 0;
    
    searchMatches.forEach((match, index) => {
      const before = text.substring(lastIndex, match.start);
      const matchText = text.substring(match.start, match.end);
      html += escapeHTML(before);
      
      if (index === currentSearchIndex) {
        html += `<mark class="search-highlight-current">${escapeHTML(matchText)}</mark>`;
      } else {
        html += `<mark class="search-highlight">${escapeHTML(matchText)}</mark>`;
      }
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      html += escapeHTML(text.substring(lastIndex));
    }
    
    editor.innerHTML = html;
    
    // Scroll to current match
    if (currentSearchIndex >= 0) {
      const currentMark = editor.querySelector('.search-highlight-current');
      if (currentMark) {
        currentMark.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }
  
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  function nextSearchMatch() {
    if (searchMatches.length === 0) return;
    
    currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;
    searchCount.textContent = `${currentSearchIndex + 1}/${searchMatches.length}`;
    highlightSearchMatches();
  }
  
  function prevSearchMatch() {
    if (searchMatches.length === 0) return;
    
    currentSearchIndex = (currentSearchIndex - 1 + searchMatches.length) % searchMatches.length;
    searchCount.textContent = `${currentSearchIndex + 1}/${searchMatches.length}`;
    highlightSearchMatches();
  }
  
  // Add search event listeners
  searchInput.addEventListener('input', updateSearch);
  searchNext.addEventListener('click', nextSearchMatch);
  searchPrev.addEventListener('click', prevSearchMatch);
  
  // Get plain text content from editor
  function getEditorText() {
    return editor.innerText || editor.textContent || '';
  }

  // Set text content to editor
  function setEditorText(text) {
    editor.innerHTML = '';
    editor.textContent = text;
    updateCharCount();
    
    // Save to localStorage
    saveEditorContent();
  }

  // Save editor content to localStorage
  function saveEditorContent() {
    try {
      const content = getEditorText();
      localStorage.setItem(STORAGE_KEY, content);
    } catch (e) {
      console.error('Failed to save content to localStorage:', e);
    }
  }

  // Load editor content from localStorage
  function loadEditorContent() {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) {
        setEditorText(savedContent);
        setTimeout(applySyntaxHighlighting, 10);
        return true;
      }
    } catch (e) {
      console.error('Failed to load content from localStorage:', e);
    }
    return false;
  }

  // Update character count
  function updateCharCount() {
    const text = getEditorText();
    charCount.textContent = `Characters: ${text.length}`;
  }

  // Fix for cursor position when pressing Enter
  function insertNewline() {
    try {
      // Get the current selection
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      
      // Get current text content
      const content = getEditorText();
      
      // Find position of cursor
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const caretPosition = preCaretRange.toString().length;
      
      // Split the text at cursor position and insert newline
      const beforeText = content.substring(0, caretPosition);
      const afterText = content.substring(caretPosition);
      const newText = beforeText + '\n' + afterText;
      
      // Set the new text
      editor.textContent = newText;
      
      // Position cursor after the newline
      const newPosition = caretPosition + 1;
      setCaretPosition(editor, newPosition, true);
      
      // Save content
      saveEditorContent();
    } catch (e) {
      console.error('Error inserting newline:', e);
      // Fallback
      try {
        document.execCommand('insertText', false, '\n');
        // Force scroll to caret position
        scrollToCaret();
      } catch (err) {
        console.error('Fallback newline insertion failed:', err);
      }
    }
  }

  // Function to ensure the caret is visible by scrolling if needed
  function scrollToCaret() {
    try {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Get editor coordinates
      const editorRect = editor.getBoundingClientRect();
      
      // Check if caret is below the visible area
      if (rect.bottom > editorRect.bottom) {
        // Scroll to make the caret visible with some margin
        editor.scrollTop += (rect.bottom - editorRect.bottom) + 20;
      }
      
      // Check if caret is above the visible area
      if (rect.top < editorRect.top) {
        editor.scrollTop -= (editorRect.top - rect.top) + 20;
      }
    } catch (e) {
      console.error('Failed to scroll to caret:', e);
    }
  }

  // Set cursor at a specific character position in the editor
  function setCaretPosition(element, position, shouldScroll = false) {
    // Create text node walker
    const textNodes = [];
    const walk = document.createTreeWalker(
      element, 
      NodeFilter.SHOW_TEXT,
      null, 
      false
    );
    
    // Collect all text nodes
    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    
    // Find the right text node and position
    let charCount = 0;
    let targetNode = null;
    let targetPosition = 0;
    
    for (let i = 0; i < textNodes.length; i++) {
      const nodeLength = textNodes[i].length;
      if (charCount + nodeLength >= position) {
        targetNode = textNodes[i];
        targetPosition = position - charCount;
        break;
      }
      charCount += nodeLength;
    }
    
    // If we found our target node, position the caret
    if (targetNode) {
      const range = document.createRange();
      const selection = window.getSelection();
      
      range.setStart(targetNode, targetPosition);
      range.setEnd(targetNode, targetPosition);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Scroll to make cursor visible if requested
      if (shouldScroll) {
        setTimeout(() => scrollToCaret(), 0);
      }
    } else if (textNodes.length > 0) {
      // Fallback: place at end of last text node
      const lastNode = textNodes[textNodes.length - 1];
      const range = document.createRange();
      const selection = window.getSelection();
      
      range.setStart(lastNode, lastNode.length);
      range.setEnd(lastNode, lastNode.length);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Scroll to make cursor visible if requested
      if (shouldScroll) {
        setTimeout(() => scrollToCaret(), 0);
      }
    }
  }

  // Handle line breaks in editor
  function handleLineBreaks() {
    const content = editor.innerHTML;
    if (content.includes('<br>') || content.includes('<div>')) {
      // Get clean text content while preserving cursor position
      const selection = window.getSelection();
      let cursorPosition = 0;
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Save cursor position
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorPosition = preCaretRange.toString().length;
      }
      
      // Get clean text and reset
      const textContent = getEditorText();
      editor.innerHTML = '';
      editor.textContent = textContent;
      
      // Restore cursor position
      if (cursorPosition > 0) {
        try {
          setCaretPosition(editor, cursorPosition);
        } catch (e) {
          console.error('Failed to restore cursor position after line break cleanup:', e);
        }
      }
      
      updateCharCount();
    }
  }

  // Syntax highlighting
  function applySyntaxHighlighting() {
    const content = getEditorText();
    if (!content) return;
    
    // Abort if we're in search mode
    if (searchInput.value.trim()) return;
    
    // Attempt to detect the content type
    let type;
    try {
      type = window.JxFormatter.detectType(content);
    } catch (e) {
      return;
    }
    
    if (!type) return;
    
    // Save selection state
    const selection = window.getSelection();
    let range = null;
    let cursorPosition = 0;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      // Save cursor position
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorPosition = preCaretRange.toString().length;
    }

    // Apply highlighting based on content type
    if (type === 'json') {
      try {
        editor.innerHTML = highlightJSON(content);
      } catch (e) {
        console.error('JSON highlighting failed:', e);
      }
    } else if (type === 'xml') {
      try {
        editor.innerHTML = highlightXML(content);
      } catch (e) {
        console.error('XML highlighting failed:', e);
      }
    }

    // Try to restore selection
    if (cursorPosition > 0) {
      try {
        // Place cursor at the saved position
        setCaretPosition(editor, cursorPosition);
      } catch (e) {
        console.error('Failed to restore cursor position:', e);
      }
    }
    
    // Save formatted content to localStorage
    saveEditorContent();
  }
  
  function highlightJSON(text) {
    // Basic JSON syntax highlighting with regex
    text = text.replace(/("(\\.|[^"\\])*")/g, '<span class="string">$1</span>');
    text = text.replace(/("(\\.|[^"\\])*")(?=\s*:)/g, '<span class="key">$1</span>');
    text = text.replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>');
    text = text.replace(/\b(null)\b/g, '<span class="null">$1</span>');
    text = text.replace(/\b(-?\d+\.?\d*)\b/g, '<span class="number">$1</span>');
    return text;
  }

  function highlightXML(text) {
    // Basic XML syntax highlighting with regex
    text = text.replace(/(&lt;[\/!]?)([a-zA-Z0-9_:-]+)(?=[^>]*>)/g, '$1<span class="tag">$2</span>');
    text = text.replace(/([a-zA-Z0-9_:-]+)(?=\s*=\s*"[^"]*")/g, '<span class="attr">$1</span>');
    text = text.replace(/"([^"]*)"/g, '"<span class="string">$1</span>"');
    return text;
  }

  // Theme
  function setTheme(isDark) {
    if (isDark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    
    // Reapply syntax highlighting to update colors
    setTimeout(applySyntaxHighlighting, 10);
  }
  
  themeToggle.addEventListener('click', () => {
    const currentIsDark = !document.body.classList.contains('light');
    setTheme(!currentIsDark);
  });
  
  // Init theme (default is dark in css)
  const savedTheme = localStorage.getItem(THEME_KEY);
  setTheme(savedTheme !== 'light');

  // Error display
  function showError(msg) {
    error.textContent = msg || '';
    if (msg) {
      setTimeout(() => {
        error.textContent = '';
      }, 3000);
    }
  }

  // Format
  formatBtn.addEventListener('click', () => {
    try {
      const text = getEditorText();
      const formatted = window.JxFormatter.tryFormat(text, 'format');
      setEditorText(formatted);
      setTimeout(applySyntaxHighlighting, 10);
      showError('');
    } catch (e) {
      showError(e.message || 'Failed to format');
    }
  });

  // Minify
  minifyBtn.addEventListener('click', () => {
    try {
      const text = getEditorText();
      const minified = window.JxFormatter.tryFormat(text, 'minify');
      setEditorText(minified);
      setTimeout(applySyntaxHighlighting, 10);
      showError('');
    } catch (e) {
      showError(e.message || 'Failed to minify');
    }
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    const text = getEditorText();
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => showError('Copied!'))
      .catch(() => showError('Failed to copy'));
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    const text = getEditorText();
    if (!text) return;
    
    let type = 'txt';
    try {
      type = window.JxFormatter.detectType(text) || 'txt';
    } catch (e) {
      // Default to txt on error
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Paste
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEditorText(text);
      setTimeout(applySyntaxHighlighting, 10);
      showError('Pasted!');
    } catch (e) {
      showError('Clipboard read failed');
    }
  });

  // Monitor input events to update UI
  editor.addEventListener('input', (e) => {
    // Special handling for Enter key input events
    if (e.inputType === 'insertParagraph' || 
        e.inputType === 'insertLineBreak' || 
        (e.data === null && e.inputType === 'insertText')) {
      handleLineBreaks();
    }
    
    updateCharCount();
    
    // Save content on input
    saveEditorContent();
    
    // If search is active, update search highlights
    if (searchInput.value.trim()) {
      updateSearch();
    } else {
      clearTimeout(editor.syntaxTimer);
      editor.syntaxTimer = setTimeout(applySyntaxHighlighting, 300);
    }
  });

  // Handle key events
  editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'b') { // Ctrl+B to format
      e.preventDefault();
      formatBtn.click();
      return;
    } 
    
    if (e.ctrlKey && e.key === 'm') { // Ctrl+M to minify
      e.preventDefault();
      minifyBtn.click();
      return;
    }
    
    if (e.ctrlKey && e.key === 'f') { // Ctrl+F to search
      e.preventDefault();
      searchInput.focus();
      return;
    }
    
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
      return;
    }
    
    // Improved Enter key handling
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      insertNewline();
      return;
    }
  });
  
  // Add additional Enter key handler
  editor.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      insertNewline();
    }
  });

  // Handle custom paste to preserve line breaks
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    document.execCommand('insertText', false, text);
    handleLineBreaks();
    updateCharCount();
    
    // Save content on paste
    saveEditorContent();
    
    // If search is active, update search highlights
    if (searchInput.value.trim()) {
      updateSearch();
    } else {
      clearTimeout(editor.syntaxTimer);
      editor.syntaxTimer = setTimeout(applySyntaxHighlighting, 300);
    }
  });

  // Add document level keyboard shortcut for search
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
    
    // Handle search navigation with F3
    if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
      e.preventDefault();
      if (e.shiftKey) {
        prevSearchMatch();
      } else {
        nextSearchMatch();
      }
    }
    
    // Escape in search input clears search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      updateSearch();
      editor.focus();
    }
  });

  // Make sure the editor maintains its whitespace properly
  editor.style.whiteSpace = 'pre';
  editor.style.wordWrap = 'break-word';

  // Initialize editor and UI
  if (!loadEditorContent()) {
    // If no saved content, set empty initial state
    updateCharCount();
  }
  
  editor.focus();
}); 