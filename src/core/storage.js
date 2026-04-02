export function createSafeStorage(storage = globalThis.localStorage) {
  return {
    getItem(key, fallback = null) {
      if (typeof storage?.getItem !== "function") {
        return fallback;
      }

      try {
        return storage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },

    setItem(key, value) {
      if (typeof storage?.setItem !== "function") {
        return false;
      }

      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
  };
}
