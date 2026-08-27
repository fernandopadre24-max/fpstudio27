// Safe Storage wrapper that gracefully falls back to memory if localStorage is restricted (e.g., inside sandboxed iframes or private windows)
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          memoryStorage[key] = val;
          return val;
        }
      }
    } catch (e) {
      // Storage access blocked or restricted
    }
    return memoryStorage[key] || null;
  },

  setItem: (key: string, value: string): void => {
    memoryStorage[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Storage quota exceeded or restricted
    }
  },

  removeItem: (key: string): void => {
    delete memoryStorage[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  },
};
