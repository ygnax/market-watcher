import { NextResponse } from 'next/server'
import type { NewsApiResponse, Article } from '@/types/article'
import { createArticleId } from '@/lib/utils'
import { cacheArticles } from '@/lib/articleCache'

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    console.error('NEWS_API_KEY is not set in environment variables')
    return NextResponse.json(
      { 
        error: 'NewsAPI key is not configured',
        message: 'Please set NEWS_API_KEY in your environment variables'
      },
      { status: 500 }
    )
  }

  try {
    // NewsAPI free tier only supports top-headlines endpoint
    // Try top-headlines first (works with free tier)
    
    // Create abort controller for timeout (Vercel serverless functions have 10s timeout on free tier)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout (leave buffer)
    
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=10&apiKey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MarketWatcher/1.0',
        },
        // Vercel-specific: ensure we don't cache the request
        cache: 'no-store',
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: await response.text().catch(() => 'Unknown error') }
      }
      
      console.error('NewsAPI top-headlines failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      // Handle specific error codes
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Invalid API Key',
            message: 'Your NewsAPI key is invalid or expired. Please check your API key.',
            status: 401
          },
          { status: 401 }
        )
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate Limit Exceeded',
            message: 'You have exceeded the free tier rate limit (100 requests/day). Please try again later.',
            status: 429
          },
          { status: 429 }
        )
      }
      
      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: 'Failed to fetch news from NewsAPI',
          status: response.status,
          message: errorData.message || errorData.code || response.statusText || 'Unknown error',
          details: errorData
        },
        { status: response.status }
      )
    }

    const data: NewsApiResponse = await response.json()
    
    // Check if we got articles
    if (!data.articles || data.articles.length === 0) {
      console.warn('NewsAPI returned empty articles array')
      return NextResponse.json(
        {
          error: 'No articles found',
          message: 'NewsAPI returned no articles. This might be a temporary issue.',
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
          message: 'The request to NewsAPI timed out. This might be a temporary issue.',
        },
        { status: 504 }
      )
    }
    
    // Handle network errors
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return NextResponse.json(
        { 
          error: 'Network Error',
          message: 'Failed to connect to NewsAPI. Please check your internet connection or try again later.',
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

