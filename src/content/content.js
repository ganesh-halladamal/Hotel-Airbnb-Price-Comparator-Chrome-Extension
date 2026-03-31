class HotelListingDetector {
  constructor() {
    this.currentListing = null;
    this.observers = [];
    this.init();
  }

  init() {
    this.detectListing();
    this.setupMessageListener();
    this.observePageChanges();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getCurrentListing') {
        const listing = this.getCurrentListing();
        sendResponse({ listing });
      }
      return true;
    });
  }

  detectListing() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('booking.com')) {
      this.currentListing = this.detectBookingComListing();
    } else if (hostname.includes('airbnb')) {
      this.currentListing = this.detectAirbnbListing();
    } else if (hostname.includes('expedia')) {
      this.currentListing = this.detectExpediaListing();
    } else if (hostname.includes('kayak')) {
      this.currentListing = this.detectKayakListing();
    }

    if (this.currentListing) {
      this.notifyBackground();
    }
  }

  detectBookingComListing() {
    try {
      const nameElement = document.querySelector('[data-testid="title"]');
      const priceElement = document.querySelector('[data-testid="price-and-discounted-price"]');
      const locationElement = document.querySelector('[data-testid="address"]');
      const ratingElement = document.querySelector('[data-testid="review-score"]');
      
      if (!nameElement) return null;

      const price = this.extractPrice(priceElement?.textContent);
      
      return {
        id: this.generateId(nameElement.textContent),
        name: nameElement.textContent.trim(),
        price: price,
        location: locationElement?.textContent?.trim() || '',
        rating: ratingElement?.textContent?.trim() || '',
        platform: 'booking.com',
        url: window.location.href,
        image: this.extractMainImage(),
        amenities: this.extractAmenities()
      };
    } catch (error) {
      console.error('Booking.com detection error:', error);
      return null;
    }
  }

  detectAirbnbListing() {
    try {
      const nameElement = document.querySelector('div[data-section-id="TITLE_DEFAULT"]');
      const priceElement = document.querySelector('div[data-testid="booking-details"] div span');
      const locationElement = document.querySelector('div[data-section-id="LOCATION_DEFAULT"]');
      
      if (!nameElement) return null;

      const price = this.extractPrice(priceElement?.textContent);
      
      return {
        id: this.generateId(nameElement.textContent),
        name: nameElement.textContent.trim(),
        price: price,
        location: locationElement?.textContent?.trim() || '',
        rating: this.extractAirbnbRating(),
        platform: 'airbnb',
        url: window.location.href,
        image: this.extractMainImage(),
        amenities: this.extractAmenities()
      };
    } catch (error) {
      console.error('Airbnb detection error:', error);
      return null;
    }
  }

  detectExpediaListing() {
    try {
      const nameElement = document.querySelector('[data-stid="content-hotel-title"]');
      const priceElement = document.querySelector('[data-stid="price-lockup-text"]');
      const locationElement = document.querySelector('[data-stid="content-hotel-address"]');
      
      if (!nameElement) return null;

      const price = this.extractPrice(priceElement?.textContent);
      
      return {
        id: this.generateId(nameElement.textContent),
        name: nameElement.textContent.trim(),
        price: price,
        location: locationElement?.textContent?.trim() || '',
        platform: 'expedia',
        url: window.location.href,
        image: this.extractMainImage(),
        amenities: this.extractAmenities()
      };
    } catch (error) {
      console.error('Expedia detection error:', error);
      return null;
    }
  }

  detectKayakListing() {
    try {
      const nameElement = document.querySelector('.J0g0-name');
      const priceElement = document.querySelector('.c8x0-price');
      const locationElement = document.querySelector('.J0g0-subtitle');
      
      if (!nameElement) return null;

      const price = this.extractPrice(priceElement?.textContent);
      
      return {
        id: this.generateId(nameElement.textContent),
        name: nameElement.textContent.trim(),
        price: price,
        location: locationElement?.textContent?.trim() || '',
        platform: 'kayak',
        url: window.location.href,
        image: this.extractMainImage()
      };
    } catch (error) {
      console.error('Kayak detection error:', error);
      return null;
    }
  }

  extractPrice(priceText) {
    if (!priceText) return 0;
    
    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (priceMatch) {
      return parseFloat(priceMatch[0].replace(',', ''));
    }
    return 0;
  }

  extractAirbnbRating() {
    const ratingElement = document.querySelector('[data-testid="rating-stars"]');
    return ratingElement?.textContent?.trim() || '';
  }

  extractMainImage() {
    const imageSelectors = [
      'img[data-testid="image"]',
      '.gallery-image img',
      '[data-photo-index="0"] img',
      '.hero-image img'
    ];
    
    for (const selector of imageSelectors) {
      const img = document.querySelector(selector);
      if (img && img.src) {
        return img.src;
      }
    }
    return '';
  }

  extractAmenities() {
    const amenitySelectors = [
      '[data-testid="amenity-item"]',
      '.amenity-item',
      '.facility-item'
    ];
    
    const amenities = [];
    for (const selector of amenitySelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && !amenities.includes(text)) {
          amenities.push(text);
        }
      });
    }
    return amenities.slice(0, 5);
  }

  generateId(name) {
    return btoa(name).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  getCurrentListing() {
    return this.currentListing;
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        setTimeout(() => this.detectListing(), 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  notifyBackground() {
    chrome.runtime.sendMessage({
      action: 'listingDetected',
      listing: this.currentListing
    });
  }

  injectPriceComparisonButton() {
    if (this.currentListing && !document.querySelector('.hotel-compare-btn')) {
      const button = document.createElement('button');
      button.className = 'hotel-compare-btn';
      button.innerHTML = '🔍 Compare Prices';
      button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      
      button.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openPopup' });
      });
      
      document.body.appendChild(button);
    }
  }
}

const detector = new HotelListingDetector();
