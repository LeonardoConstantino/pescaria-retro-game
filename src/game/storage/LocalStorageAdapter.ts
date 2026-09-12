/**
 * Adaptador de armazenamento com interface compatível com Map,
 * persistindo dados no localStorage do navegador com fallback em memória.
 */
export class LocalStorageAdapter {
  private prefix: string;
  private cache: Map<string, any>;

  constructor(prefix = 'fishing_game:') {
    this.prefix = prefix;
    this.cache = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const fullKey = window.localStorage.key(i);
        if (fullKey && fullKey.startsWith(this.prefix)) {
          const rawKey = fullKey.slice(this.prefix.length);
          const val = window.localStorage.getItem(fullKey);
          if (val) {
            try {
              this.cache.set(rawKey, JSON.parse(val));
            } catch {
              this.cache.set(rawKey, val);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Falha ao ler localStorage:', e);
    }
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): this {
    this.cache.set(key, value);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.prefix + key, JSON.stringify(value));
      } catch (e) {
        console.warn('Falha ao salvar no localStorage:', e);
      }
    }
    return this;
  }

  delete(key: string): boolean {
    const res = this.cache.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(this.prefix + key);
      } catch (e) {
        console.warn('Falha ao remover do localStorage:', e);
      }
    }
    return res;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  getAllData(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.cache.entries()) {
      result[key] = value;
    }
    return result;
  }

  loadAllData(data: Record<string, any>): void {
    this.clear();
    for (const [key, value] of Object.entries(data)) {
      this.set(key, value);
    }
  }

  clear(): void {
    this.cache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const fullKey = window.localStorage.key(i);
        if (fullKey && fullKey.startsWith(this.prefix)) {
          keysToRemove.push(fullKey);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
  }
}
