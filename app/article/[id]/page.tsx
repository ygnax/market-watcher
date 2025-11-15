import Header from '@/components/Header'
import ArticleContent from '@/components/ArticleContent'
import type { Article } from '@/types/article'
import { notFound } from 'next/navigation'

async function getArticle(id: string): Promise<Article | null> {
  try {
    // Use absolute URL for server-side fetch
    // Next.js already decodes the params, so we need to encode it for the URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const encodedId = encodeURIComponent(id)
    const response = await fetch(`${baseUrl}/api/news/${encodedId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorData = await response.json().catch(() => ({}))
      console.error('Error fetching article:', errorData)
      return null
    }

    const article: Article = await response.json()
    return article
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ArticleContent article={article} />
      </main>
    </div>
  )
}

