import Link from 'next/link'
import type { Article } from '@/types/article'
import ArticleImage from './ArticleImage'

interface ArticleContentProps {
  article: Article
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 transition-colors font-medium group"
      >
        <svg
          className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Home
      </Link>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Article Image */}
        <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-primary-100 to-primary-200">
          <ArticleImage
            src={article.urlToImage}
            alt={article.title}
            title={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
                {article.source.name}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <time dateTime={article.publishedAt} className="font-medium">
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-8"></div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-4 text-base md:text-lg">
              {article.content ? (
                <div className="whitespace-pre-wrap">{article.content}</div>
              ) : article.description ? (
                <p>{article.description}</p>
              ) : (
                <p className="text-gray-500 italic">No content available.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          {article.url && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors group"
              >
                Read original article
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

