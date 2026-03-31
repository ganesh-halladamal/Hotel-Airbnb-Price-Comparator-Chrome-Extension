export class NotificationService {
  constructor() {
    this.permissionGranted = false;
    this.checkPermission();
  }

  async checkPermission() {
    try {
      const permission = await chrome.notifications.getPermissionLevel();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Notification permission check failed:', error);
      return false;
    }
  }

  async requestPermission() {
    try {
      const permission = await chrome.notifications.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  }

  async sendPriceDropNotification(listing, newPrice) {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    const savings = listing.price - newPrice;
    const savingsPercent = ((savings / listing.price) * 100).toFixed(1);

    const notification = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Price Drop Alert! 🎉',
      message: `${listing.name} is now $${newPrice} (${savingsPercent}% off)`,
      contextMessage: `Save $${savings.toFixed(2)} on your booking`,
      buttons: [
        {
          title: 'View Deal'
        },
        {
          title: 'Dismiss'
        }
      ],
      requireInteraction: true
    };

    try {
      await chrome.notifications.create({
        ...notification,
        id: `price-drop-${listing.id}-${Date.now()}`
      });

      await this.logNotification('price_drop', {
        listingId: listing.id,
        listingName: listing.name,
        originalPrice: listing.price,
        newPrice,
        savings
      });

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async sendSearchCompleteNotification(listing, prices) {
    if (!this.permissionGranted) return false;

    const lowestPrice = Math.min(...prices.map(p => p.price));
    const bestPlatform = prices.find(p => p.price === lowestPrice).platform;
    const potentialSavings = listing.price - lowestPrice;

    let message = `Found ${prices.length} deals starting at $${lowestPrice}`;
    
    if (potentialSavings > 0) {
      message += ` (Save $${potentialSavings.toFixed(2)})`;
    }

    const notification = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Price Comparison Complete',
      message,
      contextMessage: `Best deal found on ${bestPlatform}`,
      buttons: [
        {
          title: 'View Results'
        }
      ]
    };

    try {
      await chrome.notifications.create({
        ...notification,
        id: `search-complete-${listing.id}-${Date.now()}`
      });

      return true;
    } catch (error) {
      console.error('Failed to send search notification:', error);
      return false;
    }
  }

  async sendFavoriteAddedNotification(listing) {
    if (!this.permissionGranted) return false;

    const notification = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Added to Favorites ❤️',
      message: `${listing.name} has been saved to your favorites`,
      contextMessage: 'We\'ll notify you of any price drops',
      buttons: [
        {
          title: 'View Favorites'
        }
      ]
    };

    try {
      await chrome.notifications.create({
        ...notification,
        id: `favorite-added-${listing.id}-${Date.now()}`
      });

      return true;
    } catch (error) {
      console.error('Failed to send favorite notification:', error);
      return false;
    }
  }

  async sendDailyDigestNotification(favorites, trackedListings) {
    if (!this.permissionGranted) return false;

    const totalFavorites = favorites.length;
    const totalTracked = trackedListings.length;
    const priceDrops = trackedListings.filter(listing => 
      listing.lastPrice < listing.originalPrice
    ).length;

    let message = `You have ${totalFavorites} favorites`;
    
    if (totalTracked > 0) {
      message += ` and tracking ${totalTracked} listings`;
    }
    
    if (priceDrops > 0) {
      message += `. ${priceDrops} have price drops!`;
    }

    const notification = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Daily Price Digest',
      message,
      contextMessage: 'Check for the latest deals on your saved hotels',
      buttons: [
        {
          title: 'Open Extension'
        }
      ]
    };

    try {
      await chrome.notifications.create({
        ...notification,
        id: `daily-digest-${Date.now()}`
      });

      return true;
    } catch (error) {
      console.error('Failed to send daily digest:', error);
      return false;
    }
  }

  async sendErrorNotification(error, context) {
    if (!this.permissionGranted) return false;

    const notification = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Something went wrong',
      message: 'Failed to fetch price comparisons',
      contextMessage: 'Please try again or check your connection',
      buttons: [
        {
          title: 'Retry'
        }
      ]
    };

    try {
      await chrome.notifications.create({
        ...notification,
        id: `error-${context}-${Date.now()}`
      });

      return true;
    } catch (error) {
      console.error('Failed to send error notification:', error);
      return false;
    }
  }

  async logNotification(type, data) {
    try {
      const logs = await chrome.storage.local.get('notificationLogs') || {};
      const notificationLogs = logs.notificationLogs || [];
      
      notificationLogs.push({
        type,
        data,
        timestamp: Date.now()
      });

      const maxLogs = 100;
      const trimmedLogs = notificationLogs.slice(-maxLogs);

      await chrome.storage.local.set({ notificationLogs: trimmedLogs });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  async getNotificationLogs() {
    try {
      const result = await chrome.storage.local.get('notificationLogs');
      return result.notificationLogs || [];
    } catch (error) {
      console.error('Failed to get notification logs:', error);
      return [];
    }
  }

  async clearNotificationLogs() {
    try {
      await chrome.storage.local.set({ notificationLogs: [] });
      return true;
    } catch (error) {
      console.error('Failed to clear notification logs:', error);
      return false;
    }
  }

  setupNotificationListeners() {
    chrome.notifications.onClicked.addListener((notificationId) => {
      this.handleNotificationClick(notificationId);
    });

    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      this.handleNotificationButtonClick(notificationId, buttonIndex);
    });

    chrome.notifications.onClosed.addListener((notificationId, byUser) => {
      this.handleNotificationClose(notificationId, byUser);
    });
  }

  async handleNotificationClick(notificationId) {
    chrome.action.openPopup();
  }

  async handleNotificationButtonClick(notificationId, buttonIndex) {
    if (buttonIndex === 0) {
      chrome.action.openPopup();
    }
  }

  async handleNotificationClose(notificationId, byUser) {
    if (!byUser) {
      return;
    }

    await this.logNotification('dismissed', {
      notificationId,
      timestamp: Date.now()
    });
  }

  async createScheduledNotification(type, scheduleTime, data) {
    const alarmName = `notification-${type}-${Date.now()}`;
    
    chrome.alarms.create(alarmName, {
      when: scheduleTime
    });

    await chrome.storage.local.set({
      [`scheduled-${alarmName}`]: {
        type,
        data,
        createdAt: Date.now()
      }
    });

    return alarmName;
  }

  async cancelScheduledNotification(alarmName) {
    chrome.alarms.clear(alarmName);
    await chrome.storage.local.remove(`scheduled-${alarmName}`);
  }
}
