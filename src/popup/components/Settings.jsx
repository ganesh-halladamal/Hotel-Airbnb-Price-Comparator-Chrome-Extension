import React from 'react';

const Settings = ({ settings, updateSettings }) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const handleSettingChange = (key, value) => {
    updateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
        Settings
      </h3>

      {/* Currency Setting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Currency
        </label>
        <select
          value={settings.currency}
          onChange={(e) => handleSettingChange('currency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {currencies.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      {/* Notifications Setting */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Price Drop Notifications
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get notified when prices decrease for your favorites
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', !settings.notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dark Mode Setting */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use dark theme for the extension
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Auto-refresh Setting */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-refresh Prices
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatically update prices every 5 minutes
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoRefresh ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          About
        </h4>
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p>Hotel Price Compare v1.0.0</p>
          <p>Compare prices across multiple booking platforms</p>
          <button
            onClick={() => window.open('https://github.com/yourrepo/hotel-price-compare', '_blank')}
            className="text-primary-600 hover:text-primary-700 underline"
          >
            View on GitHub
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all settings and clear favorites?')) {
              chrome.storage.local.clear();
              updateSettings({
                currency: 'USD',
                notifications: true,
                darkMode: false,
                autoRefresh: false
              });
            }
          }}
          className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
};

export default Settings;
