# Hotel Price Compare Chrome Extension

A powerful Chrome extension that compares hotel and Airbnb prices across multiple platforms while you browse, helping you find the best deals instantly.

## 🌟 Features

### Core Features
- **Auto-detection**: Automatically detects hotel and Airbnb listings on supported websites
- **Price Comparison**: Compare prices across Booking.com, Airbnb, Expedia, Kayak, and Skyscanner
- **Real-time Notifications**: Get alerted when prices drop for your tracked hotels
- **Currency Conversion**: Automatic currency conversion based on your location
- **Favorites System**: Save hotels for quick access and price tracking

### Advanced Features
- **Price History**: Track price trends over time
- **Smart Recommendations**: AI-powered suggestions for similar properties
- **Budget Calculator**: Estimate total trip costs
- **Dark Mode**: Comfortable viewing in low-light environments
- **Multi-language Support**: Available in English, Spanish, French, and Hindi

## 🚀 Installation

### From Source
1. Clone this repository:
```bash
git clone https://github.com/yourusername/hotel-price-compare.git
cd hotel-price-compare
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### From Chrome Web Store
Coming soon! 🎉

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18 + TailwindCSS
- **Extension APIs**: Chrome Manifest V3
- **Build Tools**: Webpack + Babel
- **Storage**: Chrome Storage API
- **Notifications**: Chrome Notifications API

### Project Structure
```
src/
├── popup/                 # Extension popup UI
│   ├── components/       # React components
│   ├── App.jsx          # Main popup app
│   └── styles.css       # TailwindCSS styles
├── content/              # Content scripts
│   ├── content.js       # Hotel detection logic
│   └── content.css      # Injected styles
├── background/           # Background service worker
│   └── background.js    # Main background script
└── utils/               # Utility modules
    ├── priceAPI.js      # Price comparison API
    ├── storage.js       # Chrome storage wrapper
    ├── notifications.js # Notification service
    └── chromeStorage.js # Simple storage helpers
```

### Available Scripts
```bash
npm run dev      # Development build with watch
npm run build    # Production build
npm run start    # Start development server
```

## 📖 Usage

### Basic Usage
1. Navigate to any hotel listing on supported sites:
   - Booking.com
   - Airbnb
   - Expedia
   - Kayak
   - Skyscanner

2. The extension will automatically detect the listing and show a "Compare Prices" button

3. Click the extension icon to see price comparisons across all platforms

### Tracking Prices
1. Add hotels to your favorites for quick access
2. Enable notifications to get price drop alerts
3. View price history and trends

### Settings
- **Currency**: Choose your preferred currency
- **Notifications**: Enable/disable price alerts
- **Dark Mode**: Toggle dark theme
- **Auto-refresh**: Automatic price updates

## 🔧 Configuration

### API Keys
To use real APIs (instead of mock data), add your API keys:

1. Create a `.env` file:
```env
RAPIDAPI_KEY=your_rapidapi_key_here
EXCHANGE_RATE_API_KEY=your_exchange_rate_key_here
```

2. Update `src/utils/priceAPI.js` to use real endpoints

### Supported Platforms
- **Booking.com**: Full integration with ratings and reviews
- **Airbnb**: Complete listing details and host info
- **Expedia**: Hotel and package deals
- **Kayak**: Aggregated prices from multiple sources
- **Skyscanner**: Flight + hotel combinations

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test on multiple booking platforms
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

**Extension not loading**
- Check that Manifest V3 is supported in your Chrome version
- Ensure all permissions are granted in `chrome://extensions/`

**Price comparison not working**
- Verify you're on a supported website
- Check network connection
- Clear extension cache in settings

**Notifications not appearing**
- Ensure notification permissions are granted
- Check Chrome notification settings
- Verify notifications are enabled in extension settings

### Debug Mode
Enable debug mode by adding `?debug=true` to any page URL to see:
- Console logs from content scripts
- API request/response details
- Storage operations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension documentation and examples
- TailwindCSS for the beautiful UI framework
- React for the component-based architecture
- All the booking platforms for making their data accessible

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Features**: Request new features via GitHub Discussions
- **Email**: support@hotelpricecompare.com
- **Discord**: Join our community server

---

Made with ❤️ by travelers, for travelers
