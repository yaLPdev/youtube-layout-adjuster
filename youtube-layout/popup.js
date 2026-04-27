const defaults = {
  home: {
    hideLatest: true,
    hideShorts: true
  },
  subscriptions: {
    hideLatest: true,
    hideShorts: true
  }
};

chrome.storage.sync.get(defaults, (settings) => {
  // Home
  document.getElementById("home-hideLatest").checked = settings.home.hideLatest;
  document.getElementById("home-hideShorts").checked = settings.home.hideShorts;

  // Subs
  document.getElementById("subs-hideLatest").checked = settings.subscriptions.hideLatest;
  document.getElementById("subs-hideShorts").checked = settings.subscriptions.hideShorts;
});

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("change", save);
});

function save() {
  const newSettings = {
    home: {
      hideLatest: document.getElementById("home-hideLatest").checked,
      hideShorts: document.getElementById("home-hideShorts").checked
    },
    subscriptions: {
      hideLatest: document.getElementById("subs-hideLatest").checked,
      hideShorts: document.getElementById("subs-hideShorts").checked
    }
  };

  chrome.storage.sync.set(newSettings);
}