/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, '') // Trim hyphens from end
}

/**
 * Create a simple hash from a string
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Create a unique ID for an article using title slug and URL hash
 * This creates clean, short URLs while maintaining uniqueness
 */
export function createArticleId(article: { title: string; url: string }): string {
  // Create a slug from the title
  const titleSlug = slugify(article.title.substring(0, 40))
  
  // Create a short hash from the URL for uniqueness
  const urlHash = simpleHash(article.url)
  
  return `${titleSlug}-${urlHash}`
}

/**
 * Get URL hash from article ID (for matching)
 */
export function getUrlHashFromId(id: string): string | null {
  const parts = id.split('-')
  if (parts.length < 2) return null
  // Return the hash part (last segment)
  return parts[parts.length - 1]
}

