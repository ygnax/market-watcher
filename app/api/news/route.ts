import { NextResponse } from 'next/server'
import { fetchNews } from '@/lib/fetchNews'

export async function GET() {
  const result = await fetchNews()
  
  if (result.error) {
    // Determine status code based on error type
    let status = 500
    if (result.error.includes('timeout') || result.error.includes('too long')) {
      status = 504
    } else if (result.error.includes('connect') || result.error.includes('network')) {
      status = 503
    } else if (result.error.includes('API key')) {
      status = 500
    }
    
    return NextResponse.json(
      {
        error: 'Failed to fetch news',
        message: result.error,
        articles: []
      },
      { status }
    )
  }
  
  return NextResponse.json({
    status: 'ok',
    totalResults: result.articles.length,
    articles: result.articles,
  })
}

