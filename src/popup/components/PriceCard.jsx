import React from 'react';

const PriceCard = ({ price, isLowest, currency, addToFavorites }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'booking.com': '🏨',
      'airbnb': '🏠',
      'expedia': '✈️',
      'kayak': '🔍',
      'skyscanner': '🛩️'
    };
    return icons[platform.toLowerCase()] || '🏨';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'booking.com': 'bg-blue-100 text-blue-800',
      'airbnb': 'bg-pink-100 text-pink-800',
      'expedia': 'bg-yellow-100 text-yellow-800',
      'kayak': 'bg-green-100 text-green-800',
      'skyscanner': 'bg-purple-100 text-purple-800'
    };
    return colors[platform.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`border rounded-lg p-3 transition-all ${
      isLowest 
        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getPlatformIcon(price.platform)}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPlatformColor(price.platform)}`}>
            {price.platform}
          </span>
          {isLowest && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500 text-white">
              Best Price
            </span>
          )}
        </div>
        <button
          onClick={addToFavorites}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Add to favorites"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(price.price)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            /{price.period || 'night'}
          </span>
        </div>
        
        {price.originalPrice && price.originalPrice > price.price && (
          <div className="mt-1">
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(price.originalPrice)}
            </span>
            <span className="text-xs text-green-600 ml-2 font-medium">
              Save {formatPrice(price.originalPrice - price.price)}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        {price.rating && (
          <div className="flex items-center">
            <span className="text-yellow-400">⭐</span>
            <span className="ml-1">{price.rating}</span>
            {price.reviews && (
              <span className="ml-1">({price.reviews} reviews)</span>
            )}
          </div>
        )}
        
        {price.availability && (
          <div className="flex items-center">
            <span className="text-green-500">✓</span>
            <span className="ml-1">{price.availability}</span>
          </div>
        )}

        {price.cancellation && (
          <div className="flex items-center">
            <span className="text-blue-500">↩️</span>
            <span className="ml-1">{price.cancellation}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => window.open(price.url, '_blank')}
        className="w-full mt-3 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
      >
        View Deal
      </button>
    </div>
  );
};

export default PriceCard;
