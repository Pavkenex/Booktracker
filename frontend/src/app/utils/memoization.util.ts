/**
 * Simple memoization utility for caching function results
 */
export class MemoizationUtil {
  private static cache = new Map<string, any>();

  /**
   * Memoizes a function result based on its arguments
   */
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const result = fn(...args);
      this.cache.set(key, result);

      // Prevent memory leaks by limiting cache size
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    }) as T;
  }

  /**
   * Clears the memoization cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Removes specific entries from cache
   */
  static invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
