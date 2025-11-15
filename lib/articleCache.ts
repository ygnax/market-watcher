/**
 * Simple in-memory cache for articles
 * In production, you'd want to use Redis or a database
 */

interface CachedArticle {
  id: string
  article: any
  timestamp: number
}

const CACHE_TTL = 1000 * 60 * 60 // 1 hour
const articleCache = new Map<string, CachedArticle>()

/**
 * Store an article in the cache
 */
export function cacheArticle(id: string, article: any): void {
  articleCache.set(id, {
    id,
    article,
    timestamp: Date.now(),
  })
}

/**
 * Get an article from cache
 */
export function getCachedArticle(id: string): any | null {
  const cached = articleCache.get(id)
  
  if (!cached) {
    return null
  }
  
  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    articleCache.delete(id)
    return null
  }
  
  return cached.article
}

/**
 * Cache multiple articles at once
 */
export function cacheArticles(articles: any[], createId: (article: any) => string): void {
  articles.forEach((article) => {
    const id = createId(article)
    cacheArticle(id, article)
  })
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now()
  for (const [id, cached] of articleCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      articleCache.delete(id)
    }
  }
}

