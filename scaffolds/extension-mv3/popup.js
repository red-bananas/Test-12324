const button = document.getElementById("action");
const result = document.getElementById("result");

button.addEventListener("click", async () => {
  const { count = 0 } = await chrome.storage.local.get("count");
  const next = count + 1;
  await chrome.storage.local.set({ count: next });
  result.textContent = `Clicked ${next} time${next === 1 ? "" : "s"}.`;
});
