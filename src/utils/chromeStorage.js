export const ChromeStorage = {
  async get(key, defaultValue = null) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error('ChromeStorage get error:', error);
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('ChromeStorage set error:', error);
      return false;
    }
  },

  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('ChromeStorage remove error:', error);
      return false;
    }
  },

  async clear() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('ChromeStorage clear error:', error);
      return false;
    }
  }
};
