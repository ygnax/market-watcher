export interface Article {
  title: string
  content: string
  publishedAt: string
  source: {
    name: string
  }
  url: string
  urlToImage?: string
  description?: string
  // Internal ID for routing
  _id?: string
}

export interface NewsApiResponse {
  status: string
  totalResults: number
  articles: Article[]
}

