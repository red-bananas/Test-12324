importScripts('shared.js');

const MENU_COPY_DIMS = 'file-info-copy-dimensions';
const MENU_DOWNLOAD = 'file-info-download-image';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_COPY_DIMS,
      title: 'Copy image dimensions',
      contexts: ['image']
    });
    chrome.contextMenus.create({
      id: MENU_DOWNLOAD,
      title: 'Download image',
      contexts: ['image']
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === MENU_COPY_DIMS && info.srcUrl) {
    try {
      await ensureContentScript(tab.id);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getImageDimensions',
        srcUrl: info.srcUrl
      });
      const text = response?.text;
      if (!text) throw new Error('Could not read dimensions');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (value) => navigator.clipboard.writeText(value),
        args: [text]
      });
    } catch (error) {
      console.error('Copy dimensions failed', error);
    }
    return;
  }

  if (info.menuItemId === MENU_DOWNLOAD && info.srcUrl) {
    try {
      await downloadFile(info.srcUrl, suggestFilenameFromUrl(info.srcUrl));
    } catch (error) {
      console.error('Download failed', error);
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'downloadFile') {
    downloadFile(message.url, message.fileName)
      .then((downloadId) => sendResponse({ ok: true, downloadId }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.action === 'exportInfo') {
    exportInfoText(message.text, message.fileName)
      .then((downloadId) => sendResponse({ ok: true, downloadId }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  return false;
});

async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['shared.js', 'content.js']
    });
  } catch {
    /* already present, or page does not allow injection */
  }
}

async function downloadFile(url, filename) {
  if (!url) throw new Error('No URL to download');

  if (url.startsWith('file://')) {
    throw new Error('Local files cannot be downloaded by the extension. Use the browser Save command (Ctrl+S).');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
    throw new Error('This URL cannot be downloaded.');
  }

  return chrome.downloads.download({
    url,
    filename: filename || undefined,
    saveAs: false,
    conflictAction: 'uniquify'
  });
}

async function exportInfoText(text, filename) {
  const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
  return chrome.downloads.download({
    url: dataUrl,
    filename: filename || 'file-info.txt',
    saveAs: false,
    conflictAction: 'uniquify'
  });
}

function suggestFilenameFromUrl(url) {
  try {
    const name = new URL(url).pathname.split('/').pop();
    if (name) return decodeURIComponent(name);
  } catch {
    /* ignore */
  }
  return 'download';
}

