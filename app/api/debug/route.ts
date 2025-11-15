import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check if environment variables are being read correctly
 * Only works in development or with a secret key
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  // Only allow in development or with secret key
  if (process.env.NODE_ENV === 'production' && secret !== process.env.DEBUG_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check environment variables (without exposing the actual keys)
  const newsApiKey = process.env.NEWS_API_KEY
  const gNewsApiKey = process.env.GNEWS_API_KEY

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    apiKeys: {
      NEWS_API_KEY: {
        present: !!newsApiKey,
        length: newsApiKey?.length || 0,
        startsWith: newsApiKey?.substring(0, 4) || 'N/A',
      },
      GNEWS_API_KEY: {
        present: !!gNewsApiKey,
        length: gNewsApiKey?.length || 0,
        startsWith: gNewsApiKey?.substring(0, 4) || 'N/A',
      },
    },
    message: 'Use this endpoint to verify your API keys are being read correctly in Vercel',
  })
}

