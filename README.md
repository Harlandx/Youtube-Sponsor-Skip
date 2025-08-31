# YouTube Sponsor Skip Chrome Extension

A Chrome extension that automatically skips sponsor segments and creator ads in YouTube videos.

## Features

- 🚫 **Automatic Sponsor Skip**: Detects and skips sponsor segments in YouTube videos
- 📊 **SponsorBlock Integration**: Uses the community-driven SponsorBlock database
- 🎯 **Smart Detection**: Skips creator ads, not YouTube's monetization ads
- 📈 **Real-time Stats**: Track how many segments you've skipped
- 🔧 **Easy Controls**: Simple toggle on/off functionality
- 🎨 **Clean UI**: Modern popup interface with statistics

## How It Works

The extension uses multiple methods to detect sponsor segments:

1. **SponsorBlock API**: Leverages the community database of sponsor segments
2. **Time-based Detection**: Identifies common sponsor segment patterns
3. **Smart Skipping**: Only skips creator-inserted ads, preserving YouTube's revenue model

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your toolbar

### From Chrome Web Store

*Coming soon - this extension is currently in development*

## Usage

1. **Navigate to YouTube**: Open any YouTube video
2. **Extension Auto-activates**: The extension automatically starts monitoring
3. **Sponsor Segments Skipped**: When a sponsor segment is detected, it's automatically skipped
4. **View Stats**: Click the extension icon to see statistics and controls

### Controls

- **Toggle On/Off**: Click the extension icon and use the toggle switch
- **View Stats**: See how many segments have been skipped
- **Refresh**: Update statistics for the current video

## Technical Details

### Permissions

- `activeTab`: Access to the current YouTube tab
- `storage`: Store user preferences and statistics
- `*://*.youtube.com/*`: Access to YouTube pages

### APIs Used

- **SponsorBlock API**: `https://sponsor.ajay.app/api/skipSegments`
- **Chrome Extension APIs**: Storage, Tabs, Runtime

## Privacy

- **No Data Collection**: The extension doesn't collect or transmit personal data
- **Local Storage Only**: Settings and statistics are stored locally
- **SponsorBlock Integration**: Only sends video IDs to SponsorBlock API (anonymous)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on various YouTube videos
5. Submit a pull request

### Testing

1. Load the extension in developer mode
2. Open various YouTube videos with known sponsor segments
3. Verify that sponsor segments are detected and skipped
4. Test the popup interface and settings

### Known Limitations

- Relies on SponsorBlock community data (may not cover all videos)
- Some sponsor segments might not be in the database yet
- Requires active internet connection for segment data

## Troubleshooting

### Extension Not Working

1. Refresh the YouTube page
2. Check if the extension is enabled in the popup
3. Ensure you're on a YouTube video page (not homepage)
4. Try disabling and re-enabling the extension

### No Sponsor Segments Found

- The video might not have sponsor segments in the database
- Community hasn't submitted segments for this video yet
- Video might be too new for segment data

## License

MIT License - See LICENSE file for details

## Disclaimer

This extension is for educational purposes. It respects YouTube's terms of service by only skipping creator-inserted sponsor content, not YouTube's own advertisements. Users should support their favorite creators through other means like channel memberships, merchandise, or direct donations.
