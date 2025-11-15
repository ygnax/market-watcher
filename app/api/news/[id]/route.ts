import { NextResponse } from 'next/server'
import { fetchArticleById } from '@/lib/fetchArticle'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Next.js already decodes the URL parameter automatically
  const articleId = params.id

  const article = await fetchArticleById(articleId)

  if (!article) {
    return NextResponse.json(
      { error: 'Article not found. The article may no longer be available in the latest news feed.' },
      { status: 404 }
    )
  }

  return NextResponse.json(article)
}

