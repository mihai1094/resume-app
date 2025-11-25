import { storageConfig } from "@/config/storage";

/**
 * @deprecated This service is deprecated as of the Firebase migration.
 * Use firestoreService from @/lib/services/firestore instead for all data persistence.
 * This file is kept for reference only and should not be used in new code.
 *
 * Storage Service
 * Handles all localStorage operations with error handling and type safety
 */
class StorageService {
  /**
   * Save data to localStorage
   */
  save<T>(key: string, data: T): boolean {
    if (typeof window === "undefined") {
      console.warn("localStorage is not available (SSR)");
      return false;
    }

    try {
      const serialized = JSON.stringify(data);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   */
  load<T>(key: string): T | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all localStorage data
   */
  clear(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  /**
   * Check if a key exists in localStorage
   */
  has(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   */
  keys(): string[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return [];
    }
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getSize(): number {
    if (typeof window === "undefined") {
      return 0;
    }

    try {
      let total = 0;
      for (const key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          total +=
            window.localStorage[key].length +
            key.length;
        }
      }
      return total;
    } catch (error) {
      console.error("Error calculating localStorage size:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

/**
 * Convenience functions for resume data
 */
export const resumeStorage = {
  save: (data: unknown) =>
    storageService.save(storageConfig.keys.resumeData, data),
  load: <T>() =>
    storageService.load<T>(storageConfig.keys.resumeData),
  remove: () =>
    storageService.remove(storageConfig.keys.resumeData),
  has: () =>
    storageService.has(storageConfig.keys.resumeData),
};

