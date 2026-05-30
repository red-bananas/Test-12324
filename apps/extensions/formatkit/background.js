'use strict';

const MENU_ID = 'formatkit-format-json';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'Format selection as JSON',
      contexts: ['selection'],
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText || !tab?.id) return;
  try {
    const formatted = JSON.stringify(JSON.parse(info.selectionText), null, 2);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => navigator.clipboard.writeText(text),
      args: [formatted],
    });
  } catch {
    // Ignore invalid JSON selections or clipboard failures.
  }
});
