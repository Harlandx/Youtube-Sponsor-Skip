// This is where all the magic happens - detecting and skipping sponsor segments
class YouTubeSponsorSkip {
  constructor() {
    this.video = null;
    this.videoId = null;
    this.sponsorSegments = [];
    this.isEnabled = true;
    this.skipCount = 0;
    this.currentSegment = null;
    
    this.init();
  }

  init() {
    // YouTube takes a moment to load, so let's wait for it
    this.waitForYouTube();
    
    // YouTube is a single-page app, so we need to watch for navigation
    this.observeNavigation();
    
    // Check if the user has any custom settings
    this.loadSettings();
  }

  waitForYouTube() {
    const checkForVideo = () => {
      const video = document.querySelector('video');
      if (video && video.src) {
        this.setupVideoMonitoring(video);
      } else {
        // Keep checking until we find a video element
        setTimeout(checkForVideo, 1000);
      }
    };
    checkForVideo();
  }

  observeNavigation() {
    // Since YouTube doesn't reload pages when you click videos, we need to watch for URL changes
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      const videoIdMatch = currentUrl.match(/[?&]v=([^&]+)/);
      const newVideoId = videoIdMatch ? videoIdMatch[1] : null;
      
      if (newVideoId && newVideoId !== this.videoId) {
        this.videoId = newVideoId;
        this.loadSponsorSegments();
        this.setupVideoMonitoring();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupVideoMonitoring(specificVideo = null) {
    this.video = specificVideo || document.querySelector('video');
    
    if (!this.video) return;

    // Clean up any old listeners first
    this.video.removeEventListener('timeupdate', this.handleTimeUpdate.bind(this));
    
    // Listen for video time updates so we can skip sponsor segments
    this.video.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
    
    // Figure out which video we're watching
    const urlParams = new URLSearchParams(window.location.search);
    const newVideoId = urlParams.get('v');
    
    if (newVideoId && newVideoId !== this.videoId) {
      this.videoId = newVideoId;
      this.loadSponsorSegments();
    }
  }

  async loadSponsorSegments() {
    if (!this.videoId) return;

    try {
      // Hit up the SponsorBlock API - it's a community database of sponsor segments
      const response = await fetch(`https://sponsor.ajay.app/api/skipSegments?videoID=${this.videoId}&categories=["sponsor","selfpromo","interaction","intro","outro","preview","music_offtopic"]`);
      
      if (response.ok) {
        const segments = await response.json();
        this.sponsorSegments = segments.map(segment => ({
          start: segment.segment[0],
          end: segment.segment[1],
          category: segment.category,
          uuid: segment.UUID
        }));
        console.log(`Found ${this.sponsorSegments.length} sponsor segments for this video`);
      } else {
        this.sponsorSegments = [];
      }
    } catch (error) {
      console.log('Could not load sponsor segments:', error);
      this.sponsorSegments = [];
      
      // Maybe try some basic detection as a fallback
      this.detectSponsorsWithHeuristics();
    }
  }

  detectSponsorsWithHeuristics() {
    // This is where we'd try to detect sponsors ourselves if the API doesn't have data
    // Could look for common phrases like "this video is sponsored by" etc.
    // But honestly, the community database is way better than anything we could build here
    // So for now, we'll just rely on SponsorBlock
  }

  handleTimeUpdate() {
    if (!this.isEnabled || !this.video || this.sponsorSegments.length === 0) return;

    const currentTime = this.video.currentTime;
    
    // See if we're currently in a sponsor segment
    for (const segment of this.sponsorSegments) {
      if (currentTime >= segment.start && currentTime < segment.end) {
        if (this.currentSegment !== segment) {
          this.currentSegment = segment;
          this.skipSponsorSegment(segment);
        }
        return;
      }
    }
    
    this.currentSegment = null;
  }

  skipSponsorSegment(segment) {
    if (!this.video) return;

    // Let the user know we skipped something
    this.showSkipNotification(segment);
    
    // Jump to the end of the sponsor segment
    this.video.currentTime = segment.end + 0.1; // Add a tiny buffer to be safe
    this.skipCount++;
    
    console.log(`Skipped ${segment.category} segment: ${segment.start}s - ${segment.end}s`);
  }

  showSkipNotification(segment) {
    // Remove existing notification
    const existingNotification = document.querySelector('.sponsor-skip-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'sponsor-skip-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        ⏭️ Skipped ${segment.category} segment
        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">
          ${Math.round(segment.end - segment.start)}s saved
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['sponsorSkipEnabled']);
      this.isEnabled = result.sponsorSkipEnabled !== false; // Default to true
    } catch (error) {
      console.log('Could not load settings:', error);
      this.isEnabled = true;
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        sponsorSkipEnabled: this.isEnabled
      });
    } catch (error) {
      console.log('Could not save settings:', error);
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveSettings();
    
    const status = this.isEnabled ? 'enabled' : 'disabled';
    console.log(`YouTube Sponsor Skip ${status}`);
    
    // Show status notification
    this.showStatusNotification(status);
  }

  showStatusNotification(status) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${status === 'enabled' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      ">
        YouTube Sponsor Skip ${status}
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 2000);
  }

  getStats() {
    return {
      skipCount: this.skipCount,
      isEnabled: this.isEnabled,
      currentVideo: this.videoId,
      segmentsFound: this.sponsorSegments.length
    };
  }
}

// Start up the extension
let sponsorSkip;

// Wait for the page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    sponsorSkip = new YouTubeSponsorSkip();
  });
} else {
  sponsorSkip = new YouTubeSponsorSkip();
}

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    sponsorSkip.toggle();
    sendResponse({ success: true, enabled: sponsorSkip.isEnabled });
  } else if (request.action === 'getStats') {
    sendResponse(sponsorSkip.getStats());
  }
  return true;
});

// Make it available in the console for debugging
window.sponsorSkip = sponsorSkip;
