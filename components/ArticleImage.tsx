'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getUnsplashImageUrl } from '@/lib/unsplash'

interface ArticleImageProps {
  src: string | null | undefined
  alt: string
  title: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}

export default function ArticleImage({
  src,
  alt,
  title,
  fill = false,
  className,
  sizes,
  priority = false,
}: ArticleImageProps) {
  const [imageSrc, setImageSrc] = useState(src || getUnsplashImageUrl(title))
  const unsplashFallback = getUnsplashImageUrl(title)

  const handleError = () => {
    // Fallback to Unsplash if image fails to load
    if (imageSrc !== unsplashFallback) {
      setImageSrc(unsplashFallback)
    }
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  )
}

