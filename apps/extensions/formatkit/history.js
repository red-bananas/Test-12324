(function () {
  'use strict';

  const HISTORY_KEY = 'formatkit-history';
  const MAX_UNDO = 50;
  const TTL_MS = 24 * 60 * 60 * 1000;

  const undoStack = [];
  const redoStack = [];

  function pushUndo(content) {
    if (!content && content !== '') return;
    const top = undoStack[undoStack.length - 1];
    if (top && top.content === content) return;
    undoStack.push({ content, ts: Date.now() });
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0;
  }

  function canUndo() {
    return undoStack.length > 0;
  }

  function canRedo() {
    return redoStack.length > 0;
  }

  function clearUndo() {
    undoStack.length = 0;
    redoStack.length = 0;
  }

  function undo(currentContent) {
    if (!undoStack.length) return null;
    redoStack.push({ content: currentContent, ts: Date.now() });
    return undoStack.pop().content;
  }

  function redo(currentContent) {
    if (!redoStack.length) return null;
    undoStack.push({ content: currentContent, ts: Date.now() });
    return redoStack.pop().content;
  }

  async function loadLog() {
    return new Promise((resolve) => {
      chrome.storage.local.get(HISTORY_KEY, (result) => {
        const entries = result[HISTORY_KEY] || [];
        resolve(entries.filter((entry) => Date.now() - entry.ts < TTL_MS));
      });
    });
  }

  async function logAction(action, content) {
    const entries = await loadLog();
    entries.push({
      action,
      ts: Date.now(),
      preview: content.slice(0, 160),
      length: content.length,
    });
    const pruned = entries
      .filter((entry) => Date.now() - entry.ts < TTL_MS)
      .slice(-200);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [HISTORY_KEY]: pruned }, () => resolve(pruned));
    });
  }

  async function pruneLog() {
    const pruned = await loadLog();
    return new Promise((resolve) => {
      chrome.storage.local.set({ [HISTORY_KEY]: pruned }, () => resolve(pruned));
    });
  }

  window.FormatKitHistory = {
    pushUndo,
    undo,
    redo,
    canUndo,
    canRedo,
    clearUndo,
    logAction,
    pruneLog,
  };
})();
