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
    // Fetch stock market news from NewsAPI
    // Using "stock market" keyword search with business/finance terms
    const query = 'stock market OR stocks OR trading OR finance OR investing'
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${apiKey}`,
      {
        headers: {
          'User-Agent': 'Market Watcher',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('NewsAPI everything endpoint failed:', response.status, errorData)
      
      // Fallback to top headlines if everything endpoint fails
      const fallbackResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=10&apiKey=${apiKey}`
      )
      
      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.json().catch(() => ({}))
        console.error('NewsAPI top-headlines endpoint failed:', fallbackResponse.status, fallbackError)
        throw new Error(`Failed to fetch news: ${fallbackResponse.status}`)
      }
      
      const fallbackData: NewsApiResponse = await fallbackResponse.json()
      // Add internal IDs to articles for clean URLs
      const articlesWithIds: Article[] = fallbackData.articles.map((article) => ({
        ...article,
        _id: createArticleId(article),
      }))
      
      // Cache articles for later retrieval
      cacheArticles(articlesWithIds, createArticleId)
      
      return NextResponse.json({
        ...fallbackData,
        articles: articlesWithIds,
      })
    }

    const data: NewsApiResponse = await response.json()
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

