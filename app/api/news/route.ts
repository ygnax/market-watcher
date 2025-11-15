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
      
      // Handle specific error codes with user-friendly messages
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Invalid API Key',
            message: 'Your NewsAPI key is invalid or expired. Please verify your API key in the Vercel environment variables settings.',
            status: 401
          },
          { status: 401 }
        )
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate Limit Exceeded',
            message: 'You have reached the daily request limit (100 requests/day on the free tier). The limit will reset tomorrow, or you can upgrade your NewsAPI plan.',
            status: 429
          },
          { status: 429 }
        )
      }
      
      if (response.status === 426) {
        return NextResponse.json(
          {
            error: 'Upgrade Required',
            message: 'This endpoint requires a paid NewsAPI plan. The free tier only supports the top-headlines endpoint.',
            status: 426
          },
          { status: 426 }
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

