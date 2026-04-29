const defaults = {
  home: { hideLatest: true, hideShorts: true, hideLive: false },
  subscriptions: { hideLatest: true, hideShorts: true, hideLive: false }
};

let currentSettings;

// Load settings
chrome.storage.sync.get(defaults, (settings) => {
  currentSettings = settings;

  set("home-hideLatest", settings.home.hideLatest);
  set("home-hideShorts", settings.home.hideShorts);
  set("home-hideLive", settings.home.hideLive);

  set("subs-hideLatest", settings.subscriptions.hideLatest);
  set("subs-hideShorts", settings.subscriptions.hideShorts);
  set("subs-hideLive", settings.subscriptions.hideLive);
});

function set(id, value) {
  document.getElementById(id).checked = value;
}

// Listen for toggle changes
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("change", saveAndSend);
});

function saveAndSend() {
  const newSettings = {
    home: {
      hideLatest: get("home-hideLatest"),
      hideShorts: get("home-hideShorts"),
      hideLive: get("home-hideLive")
    },
    subscriptions: {
      hideLatest: get("subs-hideLatest"),
      hideShorts: get("subs-hideShorts"),
      hideLive: get("subs-hideLive")
    }
  };

  chrome.storage.sync.set(newSettings);
}

function get(id) {
  return document.getElementById(id).checked;
}