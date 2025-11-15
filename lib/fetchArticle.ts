/**
 * Shared function to fetch a single article by ID
 * Can be called directly from server components or API routes
 */

import type { Article } from '@/types/article'
import { createArticleId, getUrlHashFromId } from '@/lib/utils'
import { getCachedArticle } from '@/lib/articleCache'
import { searchArticleById, newsApiProvider, gNewsProvider } from '@/lib/newsProviders'

// ============================================================================
// TEMPORARY: Hardcoded API keys for testing on Vercel
// TODO: Remove this section and use environment variables only after testing
// ============================================================================
const HARDCODED_NEWS_API_KEY = '' // Paste your NewsAPI key here (from newsapi.org)
const HARDCODED_GNEWS_API_KEY = '' // Paste your GNews API key here (from gnews.io)
// ============================================================================

export async function fetchArticleById(articleId: string): Promise<Article | null> {
  // Support multiple API providers
  // Use hardcoded keys if env vars are not set (for testing)
  const newsApiKey = process.env.NEWS_API_KEY || HARDCODED_NEWS_API_KEY || ''
  const gNewsApiKey = process.env.GNEWS_API_KEY || HARDCODED_GNEWS_API_KEY || ''

  // Check if at least one API key is configured
  if (!newsApiKey && !gNewsApiKey) {
    console.error('No news API keys configured for article fetch')
    return null
  }

  try {
    // First, check if article is in cache
    // Note: Cache might not persist across serverless invocations on Vercel
    const cachedArticle = getCachedArticle(articleId)
    if (cachedArticle) {
      console.log('Article found in cache:', articleId)
      return cachedArticle
    }

    // Extract the URL hash from the ID
    const urlHash = getUrlHashFromId(articleId)
    
    if (!urlHash) {
      console.error('Invalid article ID format:', articleId)
      return null
    }

    // Try multiple news providers with fallback
    const providers = []
    if (newsApiKey) providers.push(newsApiProvider)
    if (gNewsApiKey) providers.push(gNewsProvider)

    if (providers.length === 0) {
      console.error('No news providers available')
      return null
    }

    const apiKeys = {
      newsapi: newsApiKey,
      gnews: gNewsApiKey,
    }

    // Search for article across providers
    console.log('Searching for article:', articleId)
    const article = await searchArticleById(articleId, createArticleId, providers, apiKeys)

    if (article) {
      console.log('Article found:', articleId)
      return article
    }

    console.log('Article not found:', articleId)
    return null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

