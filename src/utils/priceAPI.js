import { StorageService } from './storage.js';

export class PriceAPI {
  constructor() {
    this.storage = new StorageService();
    this.rapidApiKey = null;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
  }

  async comparePrices(listing) {
    if (!listing) return [];

    const cacheKey = this.generateCacheKey(listing);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.prices;
    }

    const prices = await this.fetchAllPrices(listing);
    
    this.cache.set(cacheKey, {
      prices,
      timestamp: Date.now()
    });

    return prices;
  }

  async fetchAllPrices(listing) {
    const promises = [
      this.fetchBookingComPrice(listing),
      this.fetchAirbnbPrice(listing),
      this.fetchExpediaPrice(listing),
      this.fetchKayakPrice(listing)
    ];

    const results = await Promise.allSettled(promises);
    const prices = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        prices.push(result.value);
      }
    });

    return prices.sort((a, b) => a.price - b.price);
  }

  async fetchBookingComPrice(listing) {
    try {
      const searchQuery = this.buildSearchQuery(listing);
      const mockData = this.generateMockPrice('booking.com', listing);
      
      return {
        platform: 'booking.com',
        price: mockData.price,
        originalPrice: mockData.originalPrice,
        rating: mockData.rating,
        reviews: mockData.reviews,
        availability: mockData.availability,
        cancellation: mockData.cancellation,
        url: `https://www.booking.com/searchresults.html?${searchQuery}`,
        currency: 'USD',
        period: 'night'
      };
    } catch (error) {
      console.error('Booking.com API error:', error);
      return null;
    }
  }

  async fetchAirbnbPrice(listing) {
    try {
      const searchQuery = this.buildSearchQuery(listing);
      const mockData = this.generateMockPrice('airbnb', listing);
      
      return {
        platform: 'airbnb',
        price: mockData.price,
        originalPrice: mockData.originalPrice,
        rating: mockData.rating,
        reviews: mockData.reviews,
        availability: mockData.availability,
        cancellation: 'Free cancellation',
        url: `https://www.airbnb.com/s/homes?${searchQuery}`,
        currency: 'USD',
        period: 'night'
      };
    } catch (error) {
      console.error('Airbnb API error:', error);
      return null;
    }
  }

  async fetchExpediaPrice(listing) {
    try {
      const searchQuery = this.buildSearchQuery(listing);
      const mockData = this.generateMockPrice('expedia', listing);
      
      return {
        platform: 'expedia',
        price: mockData.price,
        originalPrice: mockData.originalPrice,
        rating: mockData.rating,
        reviews: mockData.reviews,
        availability: mockData.availability,
        cancellation: 'Free cancellation',
        url: `https://www.expedia.com/Hotel-Search?${searchQuery}`,
        currency: 'USD',
        period: 'night'
      };
    } catch (error) {
      console.error('Expedia API error:', error);
      return null;
    }
  }

  async fetchKayakPrice(listing) {
    try {
      const searchQuery = this.buildSearchQuery(listing);
      const mockData = this.generateMockPrice('kayak', listing);
      
      return {
        platform: 'kayak',
        price: mockData.price,
        originalPrice: mockData.originalPrice,
        rating: mockData.rating,
        reviews: mockData.reviews,
        availability: mockData.availability,
        cancellation: 'Varies by property',
        url: `https://www.kayak.com/hotels?${searchQuery}`,
        currency: 'USD',
        period: 'night'
      };
    } catch (error) {
      console.error('Kayak API error:', error);
      return null;
    }
  }

  generateMockPrice(platform, listing) {
    const basePrice = listing.price || 100;
    const variance = 0.3;
    const randomMultiplier = 1 + (Math.random() - 0.5) * variance;
    const price = Math.round(basePrice * randomMultiplier);
    const hasDiscount = Math.random() > 0.6;
    
    return {
      price: hasDiscount ? Math.round(price * 0.85) : price,
      originalPrice: hasDiscount ? price : null,
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: Math.floor(Math.random() * 1000 + 50),
      availability: Math.random() > 0.1 ? 'Available' : 'Limited',
      cancellation: Math.random() > 0.3 ? 'Free cancellation' : 'Non-refundable'
    };
  }

  buildSearchQuery(listing) {
    const params = new URLSearchParams();
    
    if (listing.location) {
      params.append('query', listing.location);
    }
    
    if (listing.name) {
      params.append('hotel', listing.name);
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    params.append('checkin', today.toISOString().split('T')[0]);
    params.append('checkout', tomorrow.toISOString().split('T')[0]);
    params.append('guests', '2');
    
    return params.toString();
  }

  generateCacheKey(listing) {
    return `${listing.platform}-${listing.id}-${listing.name}-${listing.location}`;
  }

  async convertCurrency(price, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return price;

    const cacheKey = `rate-${fromCurrency}-${toCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
      return price * cached.rate;
    }

    try {
      const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
      
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });

      return price * rate;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return price;
    }
  }

  async fetchExchangeRate(fromCurrency, toCurrency) {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    return data.rates[toCurrency] || 1;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }
}
