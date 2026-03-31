import React from 'react';
import PriceCard from './PriceCard';

const FavoritesList = ({ favorites, removeFromFavorites }) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">❤️</div>
        <p className="text-gray-500 text-sm">No favorites yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Start adding hotels to compare later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
        Your Favorite Hotels ({favorites.length})
      </h3>
      
      <div className="space-y-3">
        {favorites.map((favorite, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm truncate">{favorite.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {favorite.location}
                </p>
              </div>
              <button
                onClick={() => removeFromFavorites(favorite.id || index)}
                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                title="Remove from favorites"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏨</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {favorite.platform}
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${favorite.price}
                </div>
                <div className="text-xs text-gray-500">per night</div>
              </div>
            </div>

            {favorite.url && (
              <button
                onClick={() => window.open(favorite.url, '_blank')}
                className="w-full mt-3 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                View Deal
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
