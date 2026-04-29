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

  updateSections(pageSettings);
  updateLiveVideos(pageSettings);
}

function updateSections(pageSettings) {
  const sections = document.querySelectorAll("ytd-rich-section-renderer");

  sections.forEach(section => {
    const header = section.querySelector("#title");
    if (!header) return;

    const text = header.innerText.trim().toLowerCase();

    let shouldHide = false;

    if (pageSettings.hideLatest &&
        (text.includes("latest") || text.includes("most relevant"))) {
      shouldHide = true;
    }

    if (pageSettings.hideShorts && text.includes("shorts")) {
      shouldHide = true;
    }

    if (pageSettings.hideLive && text.includes("live")) {
      shouldHide = true;
    }

    section.classList.toggle("ytc-hidden", shouldHide);
  });

  // Shorts shelf fallback
  document.querySelectorAll("ytd-reel-shelf-renderer").forEach(el => {
    el.classList.toggle("ytc-hidden", pageSettings.hideShorts);
  });
}

function updateLiveVideos(pageSettings) {
  const videos = document.querySelectorAll(
    "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer"
  );

  videos.forEach(video => {
    let isLive = false;

    const badge = video.querySelector(
      "ytd-badge-supported-renderer, .badge-style-type-live-now"
    );

    const overlay = video.querySelector(
      "ytd-thumbnail-overlay-time-status-renderer"
    );

    const aria = video.querySelector("[aria-label]");

    if (badge && badge.innerText.toLowerCase().includes("live")) {
      isLive = true;
    }

    if (overlay && overlay.innerText.toLowerCase().includes("live")) {
      isLive = true;
    }

    if (aria && aria.getAttribute("aria-label").toLowerCase().includes("live")) {
      isLive = true;
    }

    const shouldHide = pageSettings.hideLive && isLive;

    video.classList.toggle("ytc-hidden", shouldHide);
  });
}