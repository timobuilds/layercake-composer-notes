export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

class BrowserLocalStorageBackend implements StorageBackend {
  getItem(key: string): string | null {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  }
  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  }
}

let backend: StorageBackend = new BrowserLocalStorageBackend();

export function setStorageBackend(newBackend: StorageBackend) {
  backend = newBackend;
}

export function getStorageBackend(): StorageBackend {
  return backend;
}


