import Link from 'next/link'
import type { Article } from '@/types/article'
import { createArticleId } from '@/lib/utils'
import ArticleImage from './ArticleImage'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Use clean slug-based ID
  const articleId = createArticleId(article)
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={`/article/${articleId}`}>
      <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-row h-full">
        {/* Article Image - Small on Left */}
        <div className="relative w-32 md:w-40 flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
          <ArticleImage
            src={article.urlToImage}
            alt={article.title}
            title={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 128px, 160px"
          />
        </div>

        {/* Article Content */}
        <div className="p-6 flex-1 flex flex-col min-w-0">
          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {article.title}
          </h2>
          {article.description && (
            <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
              {article.description}
            </p>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">{article.source.name}</span>
            </div>
            <time className="text-sm text-gray-500 font-medium">{formattedDate}</time>
          </div>
        </div>
      </article>
    </Link>
  )
}

