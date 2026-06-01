chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("count").then(({ count }) => {
    if (typeof count !== "number") {
      chrome.storage.local.set({ count: 0 });
    }
  });
});
