import Header from '@/components/Header'
import ArticleList from '@/components/ArticleList'
import type { Article, NewsApiResponse } from '@/types/article'

async function getNews(): Promise<{ articles: Article[]; error?: string }> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/news`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || 'Failed to fetch news'
      
      // Return error message for display
      return { 
        articles: [],
        error: errorMessage
      }
    }

    const data: NewsApiResponse = await response.json()
    
    // Check if API returned an error in the response
    if (data.status === 'error' || data.articles?.length === 0) {
      return {
        articles: [],
        error: 'No articles available at the moment. Please try again later.'
      }
    }
    
    return { articles: data.articles.slice(0, 10) } // Get latest 10 articles
  } catch (error) {
    console.error('Error fetching news:', error)
    return {
      articles: [],
      error: 'Unable to connect to the news service. Please check your internet connection and try again.'
    }
  }
}

export default async function Home() {
  const { articles, error } = await getNews()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest Stock Market News
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with trusted financial news and market insights
          </p>
        </div>

        {/* Articles List */}
        {articles.length > 0 ? (
          <ArticleList articles={articles} />
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load News Articles</h2>
            {error ? (
              <p className="text-gray-600 mb-4">{error}</p>
            ) : (
              <p className="text-gray-600 mb-4">We're having trouble fetching the latest news right now.</p>
            )}
            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Possible solutions:</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Check if your API key is correctly set in Vercel environment variables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Verify your NewsAPI key is valid and active at newsapi.org</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>You may have reached the daily limit (100 requests/day on free tier)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Try refreshing the page in a few moments</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

