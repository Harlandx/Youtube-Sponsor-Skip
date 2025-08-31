// This handles the popup that appears when you click the extension icon

class PopupManager {
  constructor() {
    this.isEnabled = true;
    this.stats = {
      skipCount: 0,
      currentVideo: null,
      segmentsFound: 0
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadCurrentState();
  }

  setupEventListeners() {
    // Wire up the toggle switch
    const toggleSwitch = document.getElementById('toggleSwitch');
    toggleSwitch.addEventListener('click', () => {
      this.toggleExtension();
    });

    // Wire up the refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', () => {
      this.refreshStats();
    });

    // Wire up the settings button (though it doesn't do much yet)
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn.addEventListener('click', () => {
      this.openSettings();
    });
  }

  async loadCurrentState() {
    try {
      // Figure out what tab we're looking at
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('youtube.com')) {
        this.showNotYouTubeMessage();
        return;
      }

      // Ask the content script for the current stats
      chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Could not connect to content script:', chrome.runtime.lastError);
          this.showConnectionError();
          return;
        }

        if (response) {
          this.updateUI(response);
        }
      });

    } catch (error) {
      console.error('Error loading state:', error);
      this.showConnectionError();
    }
  }

  async toggleExtension() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Could not toggle extension:', chrome.runtime.lastError);
          return;
        }

        if (response) {
          this.isEnabled = response.enabled;
          this.updateToggleUI();
        }
      });

    } catch (error) {
      console.error('Error toggling extension:', error);
    }
  }

  refreshStats() {
    this.loadCurrentState();
    
    // Show brief feedback
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = '✓ Updated';
    refreshBtn.style.background = 'rgba(76, 175, 80, 0.3)';
    
    setTimeout(() => {
      refreshBtn.textContent = originalText;
      refreshBtn.style.background = '';
    }, 1000);
  }

  openSettings() {
    // TODO: Maybe add a proper settings page someday
    alert('Settings page coming soon!\n\nFor now, you can:\n• Toggle the extension on/off\n• View stats for the current video\n• The extension automatically uses SponsorBlock database');
  }

  updateUI(data) {
    this.isEnabled = data.isEnabled;
    this.stats = {
      skipCount: data.skipCount || 0,
      currentVideo: data.currentVideo,
      segmentsFound: data.segmentsFound || 0
    };

    this.updateToggleUI();
    this.updateStatsUI();
  }

  updateToggleUI() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusIndicator = document.getElementById('statusIndicator');

    if (this.isEnabled) {
      toggleSwitch.classList.add('active');
      statusIndicator.className = 'status-indicator status-enabled';
    } else {
      toggleSwitch.classList.remove('active');
      statusIndicator.className = 'status-indicator status-disabled';
    }
  }

  updateStatsUI() {
    document.getElementById('skipCount').textContent = this.stats.skipCount;
    document.getElementById('segmentsFound').textContent = this.stats.segmentsFound;
    
    const videoStatus = document.getElementById('videoStatus');
    if (this.stats.currentVideo) {
      videoStatus.textContent = 'Active';
      videoStatus.style.background = 'rgba(76, 175, 80, 0.3)';
    } else {
      videoStatus.textContent = 'None';
      videoStatus.style.background = 'rgba(158, 158, 158, 0.3)';
    }
  }

  showNotYouTubeMessage() {
    document.body.innerHTML = `
      <div class="header">
        <h1>🚫 YouTube Sponsor Skip</h1>
        <p>This extension only works on YouTube</p>
      </div>
      <div style="text-align: center; padding: 20px; opacity: 0.8;">
        <p>Navigate to a YouTube video to use this extension.</p>
      </div>
    `;
  }

  showConnectionError() {
    const statsSection = document.querySelector('.stats-section');
    statsSection.innerHTML = `
      <div class="stats-title">⚠️ Connection Error</div>
      <p style="font-size: 13px; opacity: 0.8; margin: 0;">
        Could not connect to YouTube page. Try refreshing the page.
      </p>
    `;
  }
}

// Start everything up when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Listen for any messages (though we don't really use this right now)
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
  // Could handle messages from the background script here if needed
  return true;
});
