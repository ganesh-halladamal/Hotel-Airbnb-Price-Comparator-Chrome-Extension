export class StorageService {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key, defaultValue = null) {
    try {
      const result = await this.storage.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  async set(key, value) {
    try {
      await this.storage.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  async remove(key) {
    try {
      await this.storage.remove(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  async clear() {
    try {
      await this.storage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  async getSettings() {
    return await this.get('settings', {
      currency: 'USD',
      notifications: true,
      darkMode: false,
      autoCompare: true,
      autoRefresh: false
    });
  }

  async updateSettings(newSettings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    return await this.set('settings', updatedSettings);
  }

  async getFavorites() {
    return await this.get('favorites', []);
  }

  async addToFavorites(listing) {
    const favorites = await this.getFavorites();
    const existingIndex = favorites.findIndex(fav => fav.id === listing.id);
    
    if (existingIndex === -1) {
      favorites.push({
        ...listing,
        addedAt: Date.now()
      });
      return await this.set('favorites', favorites);
    }
    
    return false;
  }

  async removeFromFavorites(listingId) {
    const favorites = await this.getFavorites();
    const filteredFavorites = favorites.filter(fav => fav.id !== listingId);
    return await this.set('favorites', filteredFavorites);
  }

  async getTrackedListings() {
    return await this.get('trackedListings', []);
  }

  async addToTracked(listing) {
    const tracked = await this.getTrackedListings();
    const existingIndex = tracked.findIndex(item => item.id === listing.id);
    
    if (existingIndex === -1) {
      tracked.push({
        ...listing,
        trackedAt: Date.now(),
        lastPrice: listing.price
      });
      return await this.set('trackedListings', tracked);
    }
    
    return false;
  }

  async removeFromTracked(listingId) {
    const tracked = await this.getTrackedListings();
    const filteredTracked = tracked.filter(item => item.id !== listingId);
    return await this.set('trackedListings', filteredTracked);
  }

  async cacheListing(listing) {
    const cache = await this.get('listingCache', {});
    cache[listing.id] = {
      ...listing,
      cachedAt: Date.now()
    };
    return await this.set('listingCache', cache);
  }

  async getCachedListing(listingId) {
    const cache = await this.get('listingCache', {});
    return cache[listingId] || null;
  }

  async clearOldCache(maxAge = 24 * 60 * 60 * 1000) {
    const cache = await this.get('listingCache', {});
    const now = Date.now();
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].cachedAt > maxAge) {
        delete cache[key];
      }
    });
    
    return await this.set('listingCache', cache);
  }

  async getSearchHistory() {
    return await this.get('searchHistory', []);
  }

  async addToSearchHistory(search) {
    const history = await this.getSearchHistory();
    history.unshift({
      ...search,
      timestamp: Date.now()
    });
    
    const maxHistory = 50;
    const trimmedHistory = history.slice(0, maxHistory);
    
    return await this.set('searchHistory', trimmedHistory);
  }

  async clearSearchHistory() {
    return await this.set('searchHistory', []);
  }

  async getUserPreferences() {
    return await this.get('userPreferences', {
      preferredPlatforms: ['booking.com', 'airbnb', 'expedia'],
      priceAlertThreshold: 0.1,
      maxPriceRange: 500,
      minRating: 4.0,
      amenities: ['WiFi', 'Free Parking', 'Breakfast']
    });
  }

  async updateUserPreferences(preferences) {
    const current = await this.getUserPreferences();
    const updated = { ...current, ...preferences };
    return await this.set('userPreferences', updated);
  }

  async getUsageStats() {
    return await this.get('usageStats', {
      totalComparisons: 0,
      totalSavings: 0,
      favoritePlatforms: {},
      lastUsed: null
    });
  }

  async updateUsageStats(action, data = {}) {
    const stats = await this.getUsageStats();
    
    stats.totalComparisons = (stats.totalComparisons || 0) + 1;
    stats.lastUsed = Date.now();
    
    if (action === 'savings' && data.savings) {
      stats.totalSavings = (stats.totalSavings || 0) + data.savings;
    }
    
    if (data.platform) {
      stats.favoritePlatforms[data.platform] = 
        (stats.favoritePlatforms[data.platform] || 0) + 1;
    }
    
    return await this.set('usageStats', stats);
  }

  async exportData() {
    const data = {
      settings: await this.getSettings(),
      favorites: await this.getFavorites(),
      trackedListings: await this.getTrackedListings(),
      searchHistory: await this.getSearchHistory(),
      userPreferences: await this.getUserPreferences(),
      usageStats: await this.getUsageStats(),
      exportedAt: Date.now()
    };
    
    return data;
  }

  async importData(data) {
    try {
      if (data.settings) await this.set('settings', data.settings);
      if (data.favorites) await this.set('favorites', data.favorites);
      if (data.trackedListings) await this.set('trackedListings', data.trackedListings);
      if (data.searchHistory) await this.set('searchHistory', data.searchHistory);
      if (data.userPreferences) await this.set('userPreferences', data.userPreferences);
      if (data.usageStats) await this.set('usageStats', data.usageStats);
      
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
}
