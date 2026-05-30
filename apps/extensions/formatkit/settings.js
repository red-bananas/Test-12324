(function () {
  'use strict';

  const DEFAULTS = {
    indent: 2,
    theme: 'dark',
    sourceFormat: 'auto',
    targetFormat: 'yaml',
    content: '',
  };

  const STORAGE_KEY = 'formatkit-settings';

  async function load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        resolve({ ...DEFAULTS, ...(result[STORAGE_KEY] || {}) });
      });
    });
  }

  async function save(partial) {
    const current = await load();
    const next = { ...current, ...partial };
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: next }, () => resolve(next));
    });
  }

  window.FormatKitSettings = {
    DEFAULTS,
    load,
    save,
  };
})();
