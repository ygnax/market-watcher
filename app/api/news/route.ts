import { NextResponse } from 'next/server'
import type { NewsApiResponse, Article } from '@/types/article'
import { createArticleId } from '@/lib/utils'
import { cacheArticles } from '@/lib/articleCache'

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'NewsAPI key is not configured' },
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
      // Fallback to top headlines if everything endpoint fails
      const fallbackResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=10&apiKey=${apiKey}`
      )
      
      if (!fallbackResponse.ok) {
        throw new Error('Failed to fetch news')
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
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

