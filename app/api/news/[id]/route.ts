import { NextResponse } from 'next/server'
import type { Article, NewsApiResponse } from '@/types/article'
import { createArticleId, getUrlHashFromId } from '@/lib/utils'
import { getCachedArticle } from '@/lib/articleCache'

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
  const apiKey = process.env.NEWS_API_KEY
  // Next.js already decodes the URL parameter automatically
  const articleId = params.id

  if (!apiKey) {
    return NextResponse.json(
      { error: 'NewsAPI key is not configured' },
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

    // NewsAPI free tier only supports top-headlines endpoint
    // Try multiple pages of top-headlines to find the article
    for (let page = 1; page <= 5; page++) {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=100&page=${page}&apiKey=${apiKey}`,
        {
          headers: {
            'User-Agent': 'Market Watcher',
          },
        }
      )

      if (response.ok) {
        const data: NewsApiResponse = await response.json()
        
        // First try: match by full ID
        let article = data.articles.find(
          (a) => createArticleId(a) === articleId
        )
        
        // Second try: match by URL hash if full ID doesn't match
        if (!article) {
          article = data.articles.find(
            (a) => simpleHash(a.url) === urlHash
          )
        }

        if (article) {
          return NextResponse.json(article)
        }
        
        // If no more articles, break
        if (data.articles.length === 0) {
          break
        }
      } else {
        // If API fails, break and try fallback
        break
      }
    }

    // Fallback to top headlines (try multiple pages)
    for (let page = 1; page <= 3; page++) {
      const fallbackResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=100&page=${page}&apiKey=${apiKey}`
      )
      
      if (fallbackResponse.ok) {
        const fallbackData: NewsApiResponse = await fallbackResponse.json()
        
        // Try matching by full ID first
        let article = fallbackData.articles.find(
          (a) => createArticleId(a) === articleId
        )
        
        // Then try by URL hash
        if (!article) {
          article = fallbackData.articles.find(
            (a) => simpleHash(a.url) === urlHash
          )
        }
        
        if (article) {
          return NextResponse.json(article)
        }
        
        if (fallbackData.articles.length === 0) {
          break
        }
      } else {
        break
      }
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

