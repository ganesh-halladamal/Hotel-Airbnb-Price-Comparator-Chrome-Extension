import React, { useState, useEffect } from 'react';
import { PriceAPI } from '../../utils/priceAPI';
import LoadingSpinner from './LoadingSpinner';
import PriceCard from './PriceCard';

const PriceComparison = ({ currentListing, addToFavorites, settings }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentListing) {
      fetchPrices();
    }
  }, [currentListing]);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const priceData = await PriceAPI.comparePrices(currentListing);
      setPrices(priceData);
    } catch (err) {
      setError('Failed to fetch prices. Please try again.');
      console.error('Price comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPrices();
  };

  if (!currentListing) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">🏨</div>
        <p className="text-gray-500 text-sm">No hotel listing detected</p>
        <p className="text-gray-400 text-xs mt-1">
          Navigate to a hotel or Airbnb page to see price comparisons
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Searching for best prices..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-4xl mb-2">⚠️</div>
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const sortedPrices = prices.sort((a, b) => a.price - b.price);
  const lowestPrice = sortedPrices[0];

  return (
    <div className="space-y-4">
      {/* Current Listing Info */}
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <h3 className="font-semibold text-sm truncate">{currentListing.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {currentListing.location}
        </p>
        {currentListing.rating && (
          <div className="flex items-center mt-1">
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="text-xs ml-1">{currentListing.rating}</span>
          </div>
        )}
      </div>

      {/* Price Results */}
      <div className="space-y-3">
        {sortedPrices.map((price, index) => (
          <PriceCard
            key={price.platform}
            price={price}
            isLowest={index === 0}
            currency={settings.currency}
            addToFavorites={() => addToFavorites({ ...currentListing, ...price })}
          />
        ))}
      </div>

      {/* No Results */}
      {sortedPrices.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🔍</div>
          <p className="text-gray-500 text-sm">No prices found</p>
          <p className="text-gray-400 text-xs mt-1">
            Try checking different booking platforms
          </p>
        </div>
      )}

      {/* Refresh Button */}
      {sortedPrices.length > 0 && (
        <button
          onClick={handleRefresh}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh Prices
        </button>
      )}
    </div>
  );
};

export default PriceComparison;
