const defaults = {
  hideLatest: true,
  hideShorts: true
};

// Load saved settings
chrome.storage.sync.get(defaults, (settings) => {
  document.getElementById("hideLatest").checked = settings.hideLatest;
  document.getElementById("hideShorts").checked = settings.hideShorts;
});

// Save when toggled
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("change", () => {
    const newSettings = {
      hideLatest: document.getElementById("hideLatest").checked,
      hideShorts: document.getElementById("hideShorts").checked
    };

    chrome.storage.sync.set(newSettings);
  });
});