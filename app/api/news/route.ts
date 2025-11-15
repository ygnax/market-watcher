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
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=10&apiKey=${apiKey}`,
      {
        headers: {
          'User-Agent': 'Market Watcher',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('NewsAPI top-headlines failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0
      })
      
      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: 'Failed to fetch news from NewsAPI',
          status: response.status,
          message: errorData.message || errorData.code || 'Unknown error',
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

