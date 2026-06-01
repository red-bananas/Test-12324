(function () {
  'use strict';

  const editor = document.getElementById('editor');
  const editorPane = document.getElementById('editorPane');
  const editorInner = document.getElementById('editorInner');
  const editorWrap = document.getElementById('editorWrap');
  const emptyState = document.getElementById('emptyState');
  const highlightLayer = document.getElementById('highlightLayer');
  const highlightCode = document.getElementById('highlightCode');
  const lineGutter = document.getElementById('lineGutter');
  const sourceFormat = document.getElementById('sourceFormat');
  const formatBtn = document.getElementById('formatBtn');
  const targetFormat = document.getElementById('targetFormat');
  const convertBtn = document.getElementById('convertBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const statusFormat = document.getElementById('statusFormat');
  const statusValid = document.getElementById('statusValid');
  const statusValidText = document.getElementById('statusValidText');
  const statusMeta = document.getElementById('statusMeta');
  const statusError = document.getElementById('statusError');
  const statusCopy = document.getElementById('statusCopy');
  const searchInput = document.getElementById('searchInput');
  const searchCount = document.getElementById('searchCount');
  const findPanel = document.getElementById('findPanel');
  const toast = document.getElementById('toast');
  const settingsDialog = document.getElementById('settingsDialog');
  const indentSetting = document.getElementById('indentSetting');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  const LINE_HEIGHT = 20;
  const EDITOR_PAD = '12px 14px 12px 10px';

  let settings = { ...window.FormatKitSettings.DEFAULTS };
  let searchIndex = -1;
  let saveTimer = null;
  let statusTimer = null;
  let copyTimer = null;
  let lastLineCount = 1;
  let lastActiveLine = 1;
  let lastLineHeights = [20];
  let lastLinesArray = [''];
  let lastMeasuredWidth = 0;
  let lastPaneWidth = 0;
  let lastEditorHeight = 0;
  let lastEditorWidth = 0;
  let lastHighlightText = '';
  let lastHighlightFormat = '';
  let lineSyncTimer = null;
  let resizeTimer = null;
  let highlightRaf = null;

  function indent() {
    return Number(settings.indent) || 2;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function resolvedThemeName() {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.theme;
  }

  function updateThemeToggleLabel() {
    const isDark = resolvedThemeName() === 'dark';
    themeToggleBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggleBtn.setAttribute('aria-label', themeToggleBtn.title);
  }

  function applyTheme(theme) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    updateThemeToggleLabel();
  }

  function getDetectedFormatId() {
    const text = editor.value;
    if (!text.trim()) return 'json';
    return window.FormatKitRegistry.detectFormat(text);
  }

  function getFormatLabel(formatId) {
    return window.FormatKitRegistry.get(formatId)?.label || formatId.toUpperCase();
  }

  function getResolvedFormat() {
    return window.FormatKitRegistry.resolveFormat(sourceFormat.value, editor.value);
  }

  function syncEditorSize() {
    const paneHeight = editorPane.clientHeight;
    const paneWidth = editorPane.clientWidth;
    const scrollTop = editorPane.scrollTop;
    const scrollLeft = editorPane.scrollLeft;

    editor.style.width = '100%';
    let contentHeight = editor.scrollHeight;
    let contentWidth = editor.scrollWidth;

    if (contentHeight === lastEditorHeight && contentWidth === lastEditorWidth) {
      return;
    }

    if (lastEditorHeight === 0 || contentHeight < lastEditorHeight) {
      editor.style.height = '0';
      contentHeight = editor.scrollHeight;
      contentWidth = editor.scrollWidth;
    }

    if (contentHeight === lastEditorHeight && contentWidth === lastEditorWidth) {
      editor.style.height = `${contentHeight}px`;
      editor.style.width = `${Math.max(contentWidth, paneWidth)}px`;
      editorPane.scrollTop = scrollTop;
      editorPane.scrollLeft = scrollLeft;
      return;
    }

    lastEditorHeight = contentHeight;
    lastEditorWidth = contentWidth;
    editor.style.height = `${contentHeight}px`;
    highlightLayer.style.height = `${contentHeight}px`;
    editor.style.width = `${Math.max(contentWidth, paneWidth)}px`;
    highlightLayer.style.width = editor.style.width;
    editorInner.style.minHeight = `${Math.max(contentHeight, paneHeight)}px`;
    editorInner.style.minWidth = editor.style.width;
    editorPane.scrollTop = scrollTop;
    editorPane.scrollLeft = scrollLeft;
  }

  function syncScroll() {
    lineGutter.style.transform = `translateY(${-editorPane.scrollTop}px)`;
  }

  const lineMeasure = document.createElement('div');
  lineMeasure.className = 'line-measure';
  lineMeasure.setAttribute('aria-hidden', 'true');
  document.body.appendChild(lineMeasure);

  function getEditorContentWidth() {
    const style = window.getComputedStyle(editor);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    return Math.max(1, editor.clientWidth - padLeft - padRight);
  }

  function measureLogicalLineHeights(lines) {
    const width = getEditorContentWidth();
    lineMeasure.style.width = `${width}px`;
    const widthChanged = width !== lastMeasuredWidth;
    lastMeasuredWidth = width;

    return lines.map((line, index) => {
      if (!widthChanged && lastLinesArray[index] === line && lastLineHeights[index]) {
        return lastLineHeights[index];
      }
      lineMeasure.textContent = line.length ? line : ' ';
      return lineMeasure.offsetHeight;
    });
  }

  function padLineHeights(lineCount) {
    const heights = lastLineHeights.slice(0, lineCount);
    while (heights.length < lineCount) {
      heights.push(LINE_HEIGHT);
    }
    return heights;
  }

  function getEditorLines() {
    if (!editor.value.length) {
      return [''];
    }
    return editor.value.split('\n');
  }

  function focusEditorAtEnd() {
    editor.focus();
    const end = editor.value.length;
    editor.setSelectionRange(end, end);
    updateActiveLine();
  }

  function getCursorLine() {
    return editor.value.slice(0, editor.selectionStart).split('\n').length;
  }

  function updateGutterHeights(lineHeights, activeLine) {
    const nodes = lineGutter.querySelectorAll('.line-gutter-num');
    if (nodes.length !== lineHeights.length) {
      renderLineGutter(lineHeights.length, activeLine, lineHeights);
      return;
    }
    lineHeights.forEach((height, index) => {
      nodes[index].style.height = `${height}px`;
    });
    lastLineHeights = lineHeights;
  }

  function renderLineGutter(lineCount, activeLine, lineHeights) {
    lineGutter.innerHTML = Array.from({ length: lineCount }, (_, index) => {
      const lineNumber = index + 1;
      const activeClass = lineNumber === activeLine ? ' active' : '';
      const height = lineHeights[index] || LINE_HEIGHT;
      return `<span class="line-gutter-num${activeClass}" style="height:${height}px">${lineNumber}</span>`;
    }).join('');
    lastActiveLine = activeLine;
    lastLineHeights = lineHeights;
  }

  function updateActiveLine() {
    const activeLine = getCursorLine();
    if (activeLine === lastActiveLine) {
      return;
    }
    lastActiveLine = activeLine;
    const lineNodes = lineGutter.querySelectorAll('.line-gutter-num');
    if (!lineNodes.length) {
      renderLineGutter(lastLineCount, activeLine, lastLineHeights);
      return;
    }
    lineNodes.forEach((node, index) => {
      node.classList.toggle('active', index + 1 === activeLine);
    });
  }

  function syncLineLayout(options = {}) {
    const { forceGutterRender = false } = options;
    const lines = getEditorLines();
    const lineCount = lines.length;
    const activeLine = getCursorLine();
    const lineHeights = measureLogicalLineHeights(lines);
    lastLinesArray = lines.slice();

    if (forceGutterRender || lineCount !== lastLineCount) {
      lastLineCount = lineCount;
      lastEditorHeight = 0;
      lastEditorWidth = 0;
      renderLineGutter(lineCount, activeLine, lineHeights);
    } else {
      updateGutterHeights(lineHeights, activeLine);
      updateActiveLine();
    }

    syncEditorSize();
    syncScroll();
  }

  function scheduleLineSync() {
    clearTimeout(lineSyncTimer);
    lineSyncTimer = setTimeout(() => syncLineLayout(), 50);
  }

  function refreshHighlight() {
    const formatId = getDetectedFormatId();
    const text = editor.value;
    if (text === lastHighlightText && formatId === lastHighlightFormat) {
      return;
    }
    lastHighlightText = text;
    lastHighlightFormat = formatId;
    highlightCode.innerHTML = window.FormatKitHighlight.render(text, formatId);
  }

  function scheduleHighlight() {
    if (highlightRaf !== null) {
      return;
    }
    highlightRaf = requestAnimationFrame(() => {
      highlightRaf = null;
      refreshHighlight();
    });
  }

  function updateEmptyState() {
    emptyState.classList.toggle('hidden', Boolean(editor.value.trim()));
  }

  function updateHistoryButtons() {
    undoBtn.disabled = !window.FormatKitHistory.canUndo();
    redoBtn.disabled = !window.FormatKitHistory.canRedo();
  }

  function updateStatus() {
    const text = editor.value;
    const lines = text.length ? text.split(/\r?\n/).length : 0;
    statusMeta.textContent = `${lines} lines · ${text.length} chars`;
    updateEmptyState();

    editorWrap.classList.remove('is-valid');
    statusError.classList.add('hidden');
    statusError.textContent = '';
    statusValid.className = 'status-pill status-valid';

    if (!text.trim()) {
      statusFormat.textContent = '—';
      statusValidText.textContent = '—';
      return;
    }

    const detected = getDetectedFormatId();
    const detectedLabel = getFormatLabel(detected);

    try {
      const format = getResolvedFormat();
      format.validate(text);
      statusFormat.textContent = sourceFormat.value === 'auto'
        ? `Auto → ${format.label}`
        : format.label;
      statusValidText.textContent = `Valid ${format.label}`;
      statusValid.classList.add('ok');
      editorWrap.classList.add('is-valid');
    } catch (error) {
      statusFormat.textContent = sourceFormat.value === 'auto'
        ? `Auto → ${detectedLabel}?`
        : `${getFormatLabel(sourceFormat.value)}?`;
      statusValidText.textContent = 'Invalid';
      statusValid.classList.add('bad');
      statusError.textContent = error.message;
      statusError.classList.remove('hidden');
    }
  }

  function scheduleStatus() {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(updateStatus, 250);
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      settings = await window.FormatKitSettings.save({
        content: editor.value,
        sourceFormat: sourceFormat.value,
        targetFormat: targetFormat.value,
      });
    }, 300);
  }

  function tryFormatSilently() {
    try {
      const { output } = window.FormatKitRegistry.formatAuto(editor.value, indent());
      if (output !== editor.value) {
        editor.value = output;
        lastHighlightText = '';
        lastEditorHeight = 0;
        refreshHighlight();
        updateStatus();
      }
    } catch {
      /* keep raw content when nothing parses */
    }
  }

  function setEditorValue(value, options = {}) {
    const { recordUndo = false, action = null, skipAutoFormat = false } = options;

    if (recordUndo && editor.value !== value) {
      window.FormatKitHistory.pushUndo(editor.value);
      updateHistoryButtons();
      if (action) {
        window.FormatKitHistory.logAction(action, editor.value);
      }
    }

    editor.value = value;
    lastHighlightText = '';
    lastEditorHeight = 0;
    lastLinesArray = [];
    syncLineLayout({ forceGutterRender: true });
    refreshHighlight();
    updateStatus();
    scheduleSave();

    if (!skipAutoFormat && value.trim()) {
      tryFormatSilently();
    }
  }

  function runFormat() {
    try {
      const { output } = window.FormatKitRegistry.formatAuto(editor.value, indent());
      setEditorValue(output, { recordUndo: true, action: 'format', skipAutoFormat: true });
      showToast('Formatted');
    } catch (error) {
      showToast(error.message);
      updateStatus();
    }
  }

  function runAction(action) {
    const format = getResolvedFormat();

    try {
      if (action === 'minify') {
        setEditorValue(format.minify(editor.value, indent()), {
          recordUndo: true,
          action: 'minify',
          skipAutoFormat: true,
        });
        showToast('Minified');
      } else if (action === 'convert') {
        const fromId = getDetectedFormatId();
        const converted = window.FormatKitConvert.convert(editor.value, fromId, targetFormat.value, indent());
        setEditorValue(converted, {
          recordUndo: true,
          action: 'convert',
          skipAutoFormat: true,
        });
        showToast(`Converted to ${targetFormat.value.toUpperCase()}`);
      }
    } catch (error) {
      showToast(error.message);
      updateStatus();
    }
  }

  function restoreEditorContent(value) {
    editor.value = value;
    lastHighlightText = '';
    lastEditorHeight = 0;
    lastLinesArray = [];
    syncLineLayout({ forceGutterRender: true });
    refreshHighlight();
    updateStatus();
    scheduleSave();
  }

  function undoLast() {
    const previous = window.FormatKitHistory.undo(editor.value);
    if (previous === null) {
      showToast('Nothing to undo');
      return;
    }
    restoreEditorContent(previous);
    updateHistoryButtons();
    showToast('Undone');
  }

  function redoLast() {
    const next = window.FormatKitHistory.redo(editor.value);
    if (next === null) {
      showToast('Nothing to redo');
      return;
    }
    restoreEditorContent(next);
    updateHistoryButtons();
    showToast('Redone');
  }

  function showCopyFeedback() {
    statusCopy.classList.remove('hidden');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => statusCopy.classList.add('hidden'), 2500);
  }

  function copyOutput() {
    if (!editor.value) {
      showToast('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(editor.value).then(
      () => {
        showToast('Copied');
        showCopyFeedback();
      },
      () => showToast('Copy failed')
    );
  }

  async function pasteInput(text) {
    try {
      const content = text ?? await navigator.clipboard.readText();
      if (!content) {
        showToast('Clipboard is empty');
        return;
      }
      setEditorValue(content, { recordUndo: true, action: 'paste' });
      showToast('Pasted & formatted');
      editor.focus();
    } catch {
      showToast('Paste failed — allow clipboard access');
    }
  }

  function downloadOutput() {
    if (!editor.value.trim()) {
      showToast('Nothing to download');
      return;
    }
    let ext = 'txt';
    try {
      ext = getResolvedFormat().extensions?.[0] || 'txt';
    } catch {
      ext = 'txt';
    }
    const blob = new Blob([editor.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `formatkit-output.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Download started');
  }

  function clearEditor() {
    if (editor.value.trim() && !window.confirm('Clear all editor content?')) {
      return;
    }
    setEditorValue('', { recordUndo: true, action: 'clear', skipAutoFormat: true });
    showToast('Cleared');
    editor.focus();
  }

  function findMatches(query) {
    if (!query) return [];
    const text = editor.value;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matches = [];
    let index = lowerText.indexOf(lowerQuery);
    while (index !== -1) {
      matches.push(index);
      index = lowerText.indexOf(lowerQuery, index + lowerQuery.length);
    }
    return matches;
  }

  function updateSearchUI() {
    const query = searchInput.value.trim();
    const matches = findMatches(query);
    if (!query) {
      searchCount.textContent = '';
      return;
    }
    if (!matches.length) {
      searchCount.textContent = 'No matches';
      return;
    }
    const current = searchIndex >= 0 ? searchIndex + 1 : 0;
    searchCount.textContent = current
      ? `${current} of ${matches.length}`
      : `${matches.length} matches`;
  }

  function lineScrollOffset(lineNumber) {
    let offset = 0;
    for (let index = 0; index < lineNumber - 1 && index < lastLineHeights.length; index += 1) {
      offset += lastLineHeights[index];
    }
    return offset;
  }

  function scrollToLine(lineNumber) {
    const offset = lineScrollOffset(lineNumber);
    const lineHeight = lastLineHeights[lineNumber - 1] || LINE_HEIGHT;
    editorPane.scrollTop = Math.max(0, offset - lineHeight * 2);
    syncScroll();
  }

  function highlightMatch(index, length) {
    editor.focus();
    editor.setSelectionRange(index, index + length);
    scrollToLine(editor.value.slice(0, index).split(/\r?\n/).length);
  }

  function jumpToFirstMatch() {
    const query = searchInput.value.trim();
    const matches = findMatches(query);
    searchIndex = -1;
    if (!matches.length) {
      updateSearchUI();
      return;
    }
    searchIndex = 0;
    highlightMatch(matches[0], query.length);
    updateSearchUI();
  }

  function stepSearch(direction) {
    const query = searchInput.value.trim();
    const matches = findMatches(query);
    if (!matches.length) {
      showToast(query ? 'No matches' : 'Enter search text');
      updateSearchUI();
      return;
    }
    if (searchIndex < 0) {
      searchIndex = direction >= 0 ? 0 : matches.length - 1;
    } else {
      searchIndex = (searchIndex + direction + matches.length) % matches.length;
    }
    highlightMatch(matches[searchIndex], query.length);
    updateSearchUI();
  }

  function gotoLine() {
    const lineNumber = Number(document.getElementById('gotoLine').value);
    if (!lineNumber || lineNumber < 1) {
      showToast('Enter a valid line number');
      return;
    }
    const lines = editor.value.split(/\r?\n/);
    if (lineNumber > lines.length) {
      showToast('Line out of range');
      return;
    }
    let index = 0;
    for (let i = 0; i < lineNumber - 1; i += 1) {
      index += lines[i].length + 1;
    }
    editor.focus();
    editor.setSelectionRange(index, index);
    scrollToLine(lineNumber);
  }

  function openFindPanel() {
    findPanel.classList.remove('hidden');
    if (editor.selectionStart !== editor.selectionEnd) {
      const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
      if (selected && !selected.includes('\n') && selected.length <= 120) {
        searchInput.value = selected;
      }
    }
    searchInput.focus();
    searchInput.select();
    jumpToFirstMatch();
  }

  function closeFindPanel() {
    findPanel.classList.add('hidden');
    searchIndex = -1;
    searchCount.textContent = '';
    editor.focus();
  }

  async function toggleThemeQuick() {
    const next = resolvedThemeName() === 'dark' ? 'light' : 'dark';
    settings = await window.FormatKitSettings.save({ theme: next });
    applyTheme(next);
  }

  function clampIndent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 2;
    return Math.min(8, Math.max(1, Math.round(n)));
  }

  function openSettings() {
    indentSetting.value = String(clampIndent(settings.indent));
    settingsDialog.showModal();
  }

  async function saveSettingsFromDialog() {
    const nextIndent = clampIndent(indentSetting.value);
    indentSetting.value = String(nextIndent);
    settings = await window.FormatKitSettings.save({ indent: nextIndent });
    lastHighlightFormat = '';
    refreshHighlight();
    showToast('Settings saved');
  }

  async function init() {
    await window.FormatKitHistory.pruneLog();
    settings = await window.FormatKitSettings.load();
    editor.value = settings.content || '';
    sourceFormat.value = settings.sourceFormat || 'auto';
    targetFormat.value = settings.targetFormat || 'yaml';
    applyTheme(settings.theme);
    editor.classList.add('wrap');
    highlightLayer.classList.add('wrap');
    editor.style.padding = EDITOR_PAD;
    highlightLayer.style.padding = EDITOR_PAD;
    lastPaneWidth = editorPane.clientWidth;
    syncLineLayout({ forceGutterRender: true });
    refreshHighlight();
    updateStatus();
    updateHistoryButtons();
    editor.focus();
  }

  document.getElementById('minifyBtn').addEventListener('click', () => runAction('minify'));
  formatBtn.addEventListener('click', runFormat);
  convertBtn.addEventListener('click', () => runAction('convert'));
  undoBtn.addEventListener('click', undoLast);
  redoBtn.addEventListener('click', redoLast);
  document.getElementById('copyBtn').addEventListener('click', copyOutput);
  document.getElementById('pasteBtn').addEventListener('click', () => pasteInput());
  document.getElementById('emptyPasteBtn').addEventListener('click', () => pasteInput());
  document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
  document.getElementById('clearBtn').addEventListener('click', clearEditor);
  document.getElementById('findToggleBtn').addEventListener('click', openFindPanel);
  document.getElementById('findCloseBtn').addEventListener('click', closeFindPanel);
  document.getElementById('searchNext').addEventListener('click', () => stepSearch(1));
  document.getElementById('searchPrev').addEventListener('click', () => stepSearch(-1));
  document.getElementById('gotoBtn').addEventListener('click', gotoLine);
  themeToggleBtn.addEventListener('click', toggleThemeQuick);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', () => settingsDialog.close());

  settingsDialog.addEventListener('click', (event) => {
    if (event.target === settingsDialog) {
      settingsDialog.close();
    }
  });

  document.getElementById('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    saveSettingsFromDialog();
    settingsDialog.close();
  });

  editor.addEventListener('input', () => {
    searchIndex = -1;
    const lineCount = getEditorLines().length;
    updateActiveLine();
    if (lineCount !== lastLineCount) {
      lastLineCount = lineCount;
      lastEditorHeight = 0;
      lastEditorWidth = 0;
      renderLineGutter(lineCount, getCursorLine(), padLineHeights(lineCount));
    }
    scheduleLineSync();
    scheduleHighlight();
    scheduleStatus();
    scheduleSave();
  });

  editor.addEventListener('wheel', (event) => {
    const canScrollY = editorPane.scrollHeight > editorPane.clientHeight;
    const canScrollX = editorPane.scrollWidth > editorPane.clientWidth;
    if (!canScrollY && !canScrollX) return;
    editorPane.scrollTop += event.deltaY;
    editorPane.scrollLeft += event.deltaX;
    event.preventDefault();
    syncScroll();
  }, { passive: false });

  editorPane.addEventListener('scroll', syncScroll, { passive: true });

  new ResizeObserver(() => {
    const width = editorPane.clientWidth;
    if (width === lastPaneWidth) {
      return;
    }
    lastPaneWidth = width;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      lastEditorHeight = 0;
      lastMeasuredWidth = 0;
      lastLinesArray = [];
      syncLineLayout({ forceGutterRender: true });
    }, 100);
  }).observe(editorPane);

  editorPane.addEventListener('mousedown', (event) => {
    if (event.target === editor) return;
    if (!(event.target === editorPane || event.target === editorInner)) return;
    event.preventDefault();
    focusEditorAtEnd();
  });

  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editor) {
      updateActiveLine();
    }
  });

  sourceFormat.addEventListener('change', () => {
    lastHighlightFormat = '';
    refreshHighlight();
    updateStatus();
    scheduleSave();
  });

  targetFormat.addEventListener('change', scheduleSave);

  searchInput.addEventListener('input', jumpToFirstMatch);

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      stepSearch(event.shiftKey ? -1 : 1);
    }
    if (event.key === 'Escape') {
      closeFindPanel();
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      undoLast();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redoLast();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      copyOutput();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopPropagation();
      openFindPanel();
    }
  }, true);

  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = editor.selectionStart;
      editor.setRangeText(' '.repeat(indent()), start, start, 'end');
      scheduleHighlight();
      scheduleSave();
    }
    if ((event.ctrlKey || event.metaKey) && (event.key === 'Enter' || event.key === 's')) {
      event.preventDefault();
      runFormat();
    }
  });

  init();
})();
