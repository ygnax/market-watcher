/**
 * Get a stock market/finance related image from Unsplash
 * Uses a search term based on the article title or defaults to "stock market"
 */
export function getUnsplashImageUrl(searchTerm?: string): string {
  // Extract keywords from title or use default
  const term = searchTerm 
    ? encodeURIComponent(searchTerm.toLowerCase().split(' ').slice(0, 3).join(' '))
    : 'stock%20market'
  
  // Use Unsplash Source API (no API key required for basic usage)
  // This provides random images based on search term
  return `https://source.unsplash.com/800x600/?${term},finance,business`
}

/**
 * Get a more specific Unsplash image URL with better quality
 * Requires Unsplash API key for better results
 */
export function getUnsplashImageUrlWithKey(searchTerm?: string, apiKey?: string): string {
  if (!apiKey) {
    // Fallback to source API if no key
    return getUnsplashImageUrl(searchTerm)
  }
  
  const term = searchTerm 
    ? encodeURIComponent(searchTerm.toLowerCase().split(' ').slice(0, 2).join(' '))
    : 'stock%20market'
  
  // Use Unsplash API for better quality images
  return `https://api.unsplash.com/photos/random?query=${term},finance&client_id=${apiKey}&w=800&h=600&fit=crop`
}

