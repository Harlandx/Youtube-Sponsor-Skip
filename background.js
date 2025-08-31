// This runs in the background and handles extension setup and basic coordination

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('YouTube Sponsor Skip extension installed');
    
    // Set up some sensible defaults for new users
    chrome.storage.sync.set({
      sponsorSkipEnabled: true,
      skipCategories: ['sponsor', 'selfpromo', 'interaction', 'intro', 'outro'],
      showNotifications: true
    });

    // Take them to YouTube so they can try it out right away
    chrome.tabs.create({
      url: 'https://www.youtube.com'
    });
  }
});

// The popup handles clicking the extension icon, so we don't need to do anything here

// Keep an eye on YouTube tabs loading - mostly just for logging
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    console.log('YouTube video page loaded:', tab.url);
  }
});

// Listen for messages from the content script (like when it skips something)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logSkip') {
    console.log('Sponsor segment skipped:', request.data);
    
    // Maybe we'll add some stats tracking here later
    
    sendResponse({ success: true });
  }
  
  return true;
});

// Just log when settings change - the content script will pick up changes on its own
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    console.log('Settings changed:', changes);
    // The content script checks storage when it needs to, so no need to notify it
  }
});
