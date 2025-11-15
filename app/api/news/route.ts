import { NextResponse } from 'next/server'
import type { NewsApiResponse, Article } from '@/types/article'
import { createArticleId } from '@/lib/utils'
import { cacheArticles } from '@/lib/articleCache'
import { fetchNewsWithFallback, newsApiProvider, gNewsProvider } from '@/lib/newsProviders'

export async function GET() {
  // Support multiple API providers
  const newsApiKey = process.env.NEWS_API_KEY
  const gNewsApiKey = process.env.GNEWS_API_KEY

  // Check if at least one API key is configured
  if (!newsApiKey && !gNewsApiKey) {
    console.error('No news API keys configured')
    return NextResponse.json(
      { 
        error: 'No news API key configured',
        message: 'Please set NEWS_API_KEY or GNEWS_API_KEY in your environment variables. Get free API keys from newsapi.org or gnews.io'
      },
      { status: 500 }
    )
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
      return NextResponse.json(
        {
          error: 'No articles found',
          message: 'No articles are available at the moment. This might be a temporary issue. Please try again later.',
          articles: []
        },
        { status: 200 }
      )
    }
    
    // Add internal IDs to articles for clean URLs
    const articlesWithIds: Article[] = data.articles.map((article) => ({
      ...article,
      _id: createArticleId(article),
    }))
    
    // Cache articles for later retrieval
    cacheArticles(articlesWithIds, createArticleId)
    
    return NextResponse.json({
      ...data,
      articles: articlesWithIds,
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request Timeout',
          message: 'The request took too long to complete. This could be due to network issues or NewsAPI being temporarily unavailable. Please try again in a few moments.',
        },
        { status: 504 }
      )
    }
    
    // Handle network errors
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return NextResponse.json(
        { 
          error: 'Connection Error',
          message: 'Unable to connect to the news service. Please check your internet connection and try again.',
        },
        { status: 503 }
      )
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to fetch news',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

