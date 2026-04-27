const defaultSettings = {
  home: {
    hideLatest: true,
    hideShorts: true
  },
  subscriptions: {
    hideLatest: true,
    hideShorts: true
  }
};

let settings = defaultSettings;

// Detect page type
function getPageType() {
  const path = window.location.pathname;

  if (path === "/") return "home";
  if (path.startsWith("/feed/subscriptions")) return "subscriptions";

  return "home"; // fallback
}

// Load settings
chrome.storage.sync.get(defaultSettings, (stored) => {
  settings = stored;
  init();
});

function init() {
  run();

  const observer = new MutationObserver(run);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Handle SPA navigation (YouTube doesn’t reload pages)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      run();
    }
  }).observe(document, { subtree: true, childList: true });
}

function run() {
  const page = getPageType();
  const pageSettings = settings[page] || {};

  removeSections(pageSettings);
}

function removeSections(pageSettings) {
  const sections = document.querySelectorAll("ytd-rich-section-renderer");

  sections.forEach(section => {
    const header = section.querySelector("#title");
    if (!header) return;

    const text = header.innerText.trim().toLowerCase();

    if (pageSettings.hideLatest &&
        (text.includes("latest") || text.includes("most relevant"))) {
      section.remove();
    }

    if (pageSettings.hideShorts && text.includes("shorts")) {
      section.remove();
    }
  });

  if (pageSettings.hideShorts) {
    document.querySelectorAll("ytd-reel-shelf-renderer")
      .forEach(el => el.remove());
  }
}