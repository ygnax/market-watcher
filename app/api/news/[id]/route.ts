import { NextResponse } from 'next/server'
import type { Article, NewsApiResponse } from '@/types/article'
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

// Simple hash function (must match the one in utils.ts)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Support multiple API providers
  // Use hardcoded keys if env vars are not set (for testing)
  const newsApiKey = process.env.NEWS_API_KEY || HARDCODED_NEWS_API_KEY || ''
  const gNewsApiKey = process.env.GNEWS_API_KEY || HARDCODED_GNEWS_API_KEY || ''
  // Next.js already decodes the URL parameter automatically
  const articleId = params.id

  if (!newsApiKey && !gNewsApiKey) {
    return NextResponse.json(
      { error: 'No news API key configured' },
      { status: 500 }
    )
  }

  try {
    // First, check if article is in cache
    const cachedArticle = getCachedArticle(articleId)
    if (cachedArticle) {
      return NextResponse.json(cachedArticle)
    }

    // Extract the URL hash from the ID
    const urlHash = getUrlHashFromId(articleId)
    
    if (!urlHash) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    // Try multiple news providers with fallback
    const providers = []
    if (newsApiKey) providers.push(newsApiProvider)
    if (gNewsApiKey) providers.push(gNewsProvider)

    const apiKeys = {
      newsapi: newsApiKey,
      gnews: gNewsApiKey,
    }

    // Search for article across providers
    const article = await searchArticleById(articleId, createArticleId, providers, apiKeys)

    if (article) {
      return NextResponse.json(article)
    }

    // If still not found, return 404
    return NextResponse.json(
      { error: 'Article not found. The article may no longer be available in the latest news feed.' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

