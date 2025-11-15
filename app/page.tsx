import Header from '@/components/Header'
import ArticleList from '@/components/ArticleList'
import type { Article, NewsApiResponse } from '@/types/article'

async function getNews(): Promise<Article[]> {
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
      throw new Error('Failed to fetch news')
    }

    const data: NewsApiResponse = await response.json()
    return data.articles.slice(0, 10) // Get latest 10 articles
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

export default async function Home() {
  const articles = await getNews()

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
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">Unable to load news articles.</p>
            <p className="text-sm text-gray-500">
              Please make sure your NEWS_API_KEY is configured in .env.local
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

