import Header from '@/components/Header'
import ArticleContent from '@/components/ArticleContent'
import { fetchArticleById } from '@/lib/fetchArticle'
import { notFound } from 'next/navigation'

async function getArticle(id: string) {
  // Call the shared function directly (no HTTP request needed)
  return await fetchArticleById(id)
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

