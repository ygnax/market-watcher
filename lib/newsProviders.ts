/**
 * News API Providers
 * Supports multiple free news APIs with fallback support
 */

import type { Article, NewsApiResponse } from '@/types/article'

export interface NewsProvider {
  name: string
  fetchNews: (apiKey?: string) => Promise<NewsApiResponse>
}

/**
 * NewsAPI.org provider (original)
 */
export const newsApiProvider: NewsProvider = {
  name: 'NewsAPI',
  fetchNews: async (apiKey?: string) => {
    if (!apiKey) {
      throw new Error('NewsAPI key is required')
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=10&apiKey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MarketWatcher/1.0',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `NewsAPI error: ${response.status}`)
    }

    return response.json()
  },
}

/**
 * GNews API provider (free alternative)
 * Get API key from: https://gnews.io/
 */
export const gNewsProvider: NewsProvider = {
  name: 'GNews',
  fetchNews: async (apiKey?: string) => {
    if (!apiKey) {
      throw new Error('GNews API key is required')
    }

    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=business&lang=en&country=us&max=10&apikey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `GNews error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform GNews format to our Article format
    const articles: Article[] = (data.articles || []).map((article: any) => ({
      title: article.title || '',
      description: article.description || '',
      content: article.content || article.description || '',
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown',
      },
      url: article.url || '',
      urlToImage: article.image || undefined,
    }))

    return {
      status: 'ok',
      totalResults: articles.length,
      articles,
    } as NewsApiResponse
  },
}

/**
 * Fetch news with fallback support
 * Tries providers in order until one succeeds
 */
export async function fetchNewsWithFallback(providers: NewsProvider[], apiKeys: Record<string, string | undefined>): Promise<NewsApiResponse> {
  const errors: string[] = []

  for (const provider of providers) {
    try {
      const apiKey = apiKeys[provider.name.toLowerCase().replace('api', '').trim()]
      if (!apiKey) {
        console.warn(`${provider.name} API key not configured, skipping...`)
        continue
      }

      console.log(`Trying ${provider.name}...`)
      const result = await provider.fetchNews(apiKey)
      
      if (result.articles && result.articles.length > 0) {
        console.log(`Successfully fetched ${result.articles.length} articles from ${provider.name}`)
        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(`${provider.name}: ${errorMessage}`)
      console.warn(`${provider.name} failed:`, errorMessage)
      continue
    }
  }

  throw new Error(`All news providers failed:\n${errors.join('\n')}`)
}

/**
 * Search for a specific article across multiple pages
 * Used for finding articles by ID
 */
export async function searchArticleById(
  articleId: string,
  createIdFn: (article: Article) => string,
  providers: NewsProvider[],
  apiKeys: Record<string, string | undefined>
): Promise<Article | null> {
  // Try each provider
  for (const provider of providers) {
    try {
      const apiKey = apiKeys[provider.name.toLowerCase().replace('api', '').trim()]
      if (!apiKey) continue

      // For GNews, try multiple pages
      if (provider.name === 'GNews') {
        for (let page = 1; page <= 3; page++) {
          try {
            const response = await fetch(
              `https://gnews.io/api/v4/top-headlines?category=business&lang=en&country=us&max=100&page=${page}&apikey=${apiKey}`
            )
            
            if (response.ok) {
              const data = await response.json()
              const articles: Article[] = (data.articles || []).map((article: any) => ({
                title: article.title || '',
                description: article.description || '',
                content: article.content || article.description || '',
                publishedAt: article.publishedAt || new Date().toISOString(),
                source: { name: article.source?.name || 'Unknown' },
                url: article.url || '',
                urlToImage: article.image || undefined,
              }))

              const found = articles.find((a) => createIdFn(a) === articleId)
              if (found) return found
            }
          } catch (e) {
            continue
          }
        }
      }

      // For NewsAPI, try multiple pages
      if (provider.name === 'NewsAPI') {
        for (let page = 1; page <= 5; page++) {
          try {
            const response = await fetch(
              `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=100&page=${page}&apiKey=${apiKey}`
            )
            
            if (response.ok) {
              const data = await response.json()
              const found = data.articles?.find((a: Article) => createIdFn(a) === articleId)
              if (found) return found
            }
          } catch (e) {
            continue
          }
        }
      }
    } catch (error) {
      continue
    }
  }

  return null
}

