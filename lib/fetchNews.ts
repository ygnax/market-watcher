/**
 * Shared function to fetch news articles
 * Can be called directly from server components or API routes
 */

import type { NewsApiResponse, Article } from '@/types/article'
import { createArticleId } from '@/lib/utils'
import { cacheArticles } from '@/lib/articleCache'
import { fetchNewsWithFallback, newsApiProvider, gNewsProvider } from '@/lib/newsProviders'

// ============================================================================
// TEMPORARY: Hardcoded API keys for testing on Vercel
// TODO: Remove this section and use environment variables only after testing
// ============================================================================
const HARDCODED_NEWS_API_KEY = '' // Paste your NewsAPI key here (from newsapi.org)
const HARDCODED_GNEWS_API_KEY = '' // Paste your GNews API key here (from gnews.io)
// ============================================================================

export interface FetchNewsResult {
  articles: Article[]
  error?: string
}

export async function fetchNews(): Promise<FetchNewsResult> {
  // Support multiple API providers
  // Use hardcoded keys if env vars are not set (for testing)
  const newsApiKey = process.env.NEWS_API_KEY || HARDCODED_NEWS_API_KEY || ''
  const gNewsApiKey = process.env.GNEWS_API_KEY || HARDCODED_GNEWS_API_KEY || ''

  // Debug logging (will appear in Vercel function logs)
  console.log('API Key Status:', {
    hasNewsApiKey: !!newsApiKey,
    hasGNewsApiKey: !!gNewsApiKey,
    newsApiKeyLength: newsApiKey.length,
    gNewsApiKeyLength: gNewsApiKey.length,
    envNewsApiKey: !!process.env.NEWS_API_KEY,
    envGNewsApiKey: !!process.env.GNEWS_API_KEY,
    hardcodedNewsApiKey: !!HARDCODED_NEWS_API_KEY,
    hardcodedGNewsApiKey: !!HARDCODED_GNEWS_API_KEY,
  })

  // Check if at least one API key is configured
  if (!newsApiKey && !gNewsApiKey) {
    console.error('No news API keys configured')
    return {
      articles: [],
      error: 'Please set NEWS_API_KEY or GNEWS_API_KEY in your environment variables. Get free API keys from newsapi.org or gnews.io'
    }
  }

  try {
    // Create abort controller for timeout (Vercel serverless functions have 10s timeout on free tier)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout (leave buffer)

    // Try multiple news providers with fallback
    const providers = []
    if (newsApiKey) providers.push(newsApiProvider)
    if (gNewsApiKey) providers.push(gNewsProvider)

    if (providers.length === 0) {
      throw new Error('No news providers available')
    }

    const apiKeys = {
      newsapi: newsApiKey,
      gnews: gNewsApiKey,
    }

    let data: NewsApiResponse
    try {
      data = await fetchNewsWithFallback(providers, apiKeys)
      clearTimeout(timeoutId)
    } catch (fallbackError) {
      clearTimeout(timeoutId)
      throw fallbackError
    }
    
    // Check if we got articles
    if (!data.articles || data.articles.length === 0) {
      console.warn('News providers returned empty articles array')
      return {
        articles: [],
        error: 'No articles available at the moment. This might be a temporary issue. Please try again later.'
      }
    }
    
    // Add internal IDs to articles for clean URLs
    const articlesWithIds: Article[] = data.articles.map((article) => ({
      ...article,
      _id: createArticleId(article),
    }))
    
    // Cache articles for later retrieval
    cacheArticles(articlesWithIds, createArticleId)
    
    return { articles: articlesWithIds }
  } catch (error) {
    console.error('Error fetching news:', error)
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        articles: [],
        error: 'The request took too long to complete. This could be due to network issues or NewsAPI being temporarily unavailable. Please try again in a few moments.'
      }
    }
    
    // Handle network errors
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return {
        articles: [],
        error: 'Unable to connect to the news service. Please check your internet connection and try again.'
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      articles: [],
      error: errorMessage
    }
  }
}

