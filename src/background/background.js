import { PriceAPI } from '../utils/priceAPI.js';
import { NotificationService } from '../utils/notifications.js';
import { StorageService } from '../utils/storage.js';

class BackgroundService {
  constructor() {
    this.priceAPI = new PriceAPI();
    this.notifications = new NotificationService();
    this.storage = new StorageService();
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.setupContextMenus();
    this.setupAlarms();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'listingDetected':
          await this.handleListingDetected(request.listing);
          sendResponse({ success: true });
          break;

        case 'comparePrices':
          const prices = await this.priceAPI.comparePrices(request.listing);
          sendResponse({ prices });
          break;

        case 'addToFavorites':
          await this.storage.addToFavorites(request.listing);
          sendResponse({ success: true });
          break;

        case 'removeFromFavorites':
          await this.storage.removeFromFavorites(request.listingId);
          sendResponse({ success: true });
          break;

        case 'getFavorites':
          const favorites = await this.storage.getFavorites();
          sendResponse({ favorites });
          break;

        case 'trackPrice':
          await this.trackPriceDrop(request.listing);
          sendResponse({ success: true });
          break;

        case 'openPopup':
          chrome.action.openPopup();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background service error:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleListingDetected(listing) {
    if (!listing) return;

    const settings = await this.storage.getSettings();
    
    if (settings.autoCompare) {
      const prices = await this.priceAPI.comparePrices(listing);
      
      if (prices.length > 0) {
        const lowestPrice = Math.min(...prices.map(p => p.price));
        
        if (listing.price && lowestPrice < listing.price * 0.9) {
          await this.notifications.sendPriceDropNotification(listing, lowestPrice);
        }
      }
    }

    await this.storage.cacheListing(listing);
  }

  async trackPriceDrop(listing) {
    const tracked = await this.storage.getTrackedListings();
    const existingIndex = tracked.findIndex(item => item.id === listing.id);

    if (existingIndex === -1) {
      tracked.push({
        ...listing,
        trackedAt: Date.now(),
        lastPrice: listing.price
      });
    } else {
      tracked[existingIndex].lastPrice = listing.price;
      tracked[existingIndex].trackedAt = Date.now();
    }

    await this.storage.set('trackedListings', tracked);
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'compareHotelPrice',
      title: 'Compare Hotel Prices',
      contexts: ['selection', 'page'],
      documentUrlPatterns: [
        '*://*.booking.com/*',
        '*://*.airbnb.com/*',
        '*://*.expedia.com/*',
        '*://*.kayak.com/*'
      ]
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === 'compareHotelPrice') {
        await this.handleContextMenuCompare(tab);
      }
    });
  }

  async handleContextMenuCompare(tab) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return window.hotelDetector?.getCurrentListing();
        }
      });

      const listing = results[0]?.result;
      if (listing) {
        chrome.action.openPopup();
        
        chrome.runtime.sendMessage({
          action: 'setListingForComparison',
          listing
        });
      }
    } catch (error) {
      console.error('Context menu error:', error);
    }
  }

  setupAlarms() {
    chrome.alarms.create('priceCheck', { periodInMinutes: 30 });
    chrome.alarms.create('dailyCleanup', { periodInMinutes: 1440 });

    chrome.alarms.onAlarm.addListener(async (alarm) => {
      switch (alarm.name) {
        case 'priceCheck':
          await this.performPriceCheck();
          break;
        case 'dailyCleanup':
          await this.performDailyCleanup();
          break;
      }
    });
  }

  async performPriceCheck() {
    const tracked = await this.storage.getTrackedListings();
    const settings = await this.storage.getSettings();

    if (!settings.notifications) return;

    for (const listing of tracked) {
      try {
        const prices = await this.priceAPI.comparePrices(listing);
        const currentLowestPrice = Math.min(...prices.map(p => p.price));

        if (currentLowestPrice < listing.lastPrice * 0.95) {
          await this.notifications.sendPriceDropNotification(listing, currentLowestPrice);
          
          listing.lastPrice = currentLowestPrice;
          listing.notifiedAt = Date.now();
        }
      } catch (error) {
        console.error(`Price check failed for ${listing.name}:`, error);
      }
    }

    await this.storage.set('trackedListings', tracked);
  }

  async performDailyCleanup() {
    const cache = await this.storage.get('listingCache', {});
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > maxAge) {
        delete cache[key];
      }
    });

    await this.storage.set('listingCache', cache);
  }

  async handleInstallation() {
    const defaultSettings = {
      currency: 'USD',
      notifications: true,
      darkMode: false,
      autoCompare: true,
      autoRefresh: false
    };

    await this.storage.set('settings', defaultSettings);
    await this.storage.set('favorites', []);
    await this.storage.set('trackedListings', []);

    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
}

const backgroundService = new BackgroundService();

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await backgroundService.handleInstallation();
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.action.openPopup();
});
