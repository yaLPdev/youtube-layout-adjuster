const defaultSettings = {
  home: {
    hideLatest: true,
    hideShorts: true,
    hideLive: false
  },
  subscriptions: {
    hideLatest: true,
    hideShorts: true,
    hideLive: false
  }
};

let settings = defaultSettings;

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    // Merge updated values into settings
    for (let key in changes) {
      settings[key] = changes[key].newValue;
    }

    debouncedRun(); // re-apply filters instantly
  }
});

let timeout;

function debouncedRun() {
  clearTimeout(timeout);
  timeout = setTimeout(run, 50); // runs after 50ms pause
}

// Detect page
function getPageType() {
  const path = window.location.pathname;

  if (path === "/") return "home";
  if (path.startsWith("/feed/subscriptions")) return "subscriptions";

  return "home";
}

// Load settings
chrome.storage.sync.get(defaultSettings, (stored) => {
  settings = stored;
  init();
});

// Listen for live updates from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_SETTINGS") {
    settings = msg.settings;
    debouncedRun();
  }
});

function init() {
  run();

const observer = new MutationObserver(debouncedRun);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

  // Detect SPA navigation
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    debouncedRun();
  }
}).observe(document, { subtree: true, childList: true });
}

function run() {
  const page = getPageType();
  const pageSettings = settings[page] || {};

  removeSections(pageSettings);
  removeLiveVideos(pageSettings);
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

    if (pageSettings.hideLive && text.includes("live")) {
      section.remove();
    }
  });

  if (pageSettings.hideShorts) {
    document.querySelectorAll("ytd-reel-shelf-renderer")
      .forEach(el => el.remove());
  }
}

function removeLiveVideos(pageSettings) {
  if (!pageSettings.hideLive) return;

  const videos = document.querySelectorAll(
    "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer"
  );

  videos.forEach(video => {
    // 1. Badge check (most reliable)
    const badge = video.querySelector(
      "ytd-badge-supported-renderer, .badge-style-type-live-now"
    );

    // 2. Thumbnail overlay (LIVE indicator)
    const overlay = video.querySelector(
      "ytd-thumbnail-overlay-time-status-renderer"
    );

    // 3. Accessibility label (very reliable fallback)
    const aria = video.querySelector("[aria-label]");

    let isLive = false;

    if (badge && badge.innerText.toLowerCase().includes("live")) {
      isLive = true;
    }

    if (overlay && overlay.innerText.toLowerCase().includes("live")) {
      isLive = true;
    }

    if (aria && aria.getAttribute("aria-label").toLowerCase().includes("live")) {
      isLive = true;
    }

    if (isLive) {
      video.remove();
    }
  });
}