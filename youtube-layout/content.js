let settings = {
  hideLatest: true,
  hideShorts: true
};

// Load settings from storage
chrome.storage.sync.get(settings, (stored) => {
  settings = stored;
  init();
});

function init() {
  removeSections();

  const observer = new MutationObserver(() => {
    removeSections();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function removeSections() {
  const sections = document.querySelectorAll("ytd-rich-section-renderer");

  sections.forEach(section => {
    const header = section.querySelector("#title");
    if (!header) return;

    const text = header.innerText.trim().toLowerCase();

    if (settings.hideLatest &&
        (text.includes("latest") || text.includes("most relevant"))) {
      section.remove();
    }

    if (settings.hideShorts && text.includes("shorts")) {
      section.remove();
    }
  });

  // Backup removal for Shorts shelf type
  if (settings.hideShorts) {
    document.querySelectorAll("ytd-reel-shelf-renderer").forEach(el => el.remove());
  }
}