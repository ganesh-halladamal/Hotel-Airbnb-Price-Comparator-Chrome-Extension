import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import PriceComparison from './components/PriceComparison';
import FavoritesList from './components/FavoritesList';
import Settings from './components/Settings';
import { ChromeStorage } from '../utils/chromeStorage';

function App() {
  const [activeTab, setActiveTab] = useState('compare');
  const [currentListing, setCurrentListing] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({
    currency: 'USD',
    notifications: true,
    darkMode: false
  });

  useEffect(() => {
    loadFavorites();
    loadSettings();
    getCurrentListing();
  }, []);

  const loadFavorites = async () => {
    const favs = await ChromeStorage.get('favorites', []);
    setFavorites(favs);
  };

  const loadSettings = async () => {
    const userSettings = await ChromeStorage.get('settings', settings);
    setSettings(userSettings);
  };

  const getCurrentListing = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentListing' });
      if (response && response.listing) {
        setCurrentListing(response.listing);
      }
    }
  };

  const addToFavorites = async (listing) => {
    const newFavorites = [...favorites, listing];
    setFavorites(newFavorites);
    await ChromeStorage.set('favorites', newFavorites);
  };

  const removeFromFavorites = async (listingId) => {
    const newFavorites = favorites.filter(fav => fav.id !== listingId);
    setFavorites(newFavorites);
    await ChromeStorage.set('favorites', newFavorites);
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    await ChromeStorage.set('settings', newSettings);
  };

  const tabs = [
    { id: 'compare', label: 'Compare', icon: '🔍' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4">
          <h1 className="text-lg font-bold">Hotel Price Compare</h1>
          <p className="text-xs opacity-90">Find the best deals instantly</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-1 text-center text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span className="block text-lg">{tab.icon}</span>
              <span className="block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 h-96 overflow-y-auto">
          {activeTab === 'compare' && (
            <PriceComparison
              currentListing={currentListing}
              addToFavorites={addToFavorites}
              settings={settings}
            />
          )}
          {activeTab === 'favorites' && (
            <FavoritesList
              favorites={favorites}
              removeFromFavorites={removeFromFavorites}
            />
          )}
          {activeTab === 'settings' && (
            <Settings settings={settings} updateSettings={updateSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
