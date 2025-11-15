import type { Article } from '@/types/article'
import ArticleCard from './ArticleCard'

interface ArticleListProps {
  articles: Article[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-6">
        {articles.map((article, index) => (
          <ArticleCard key={index} article={article} />
        ))}
      </div>
    </div>
  )
}

