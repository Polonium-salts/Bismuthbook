import { useState, useEffect, useCallback } from 'react'
import { imageService } from '../services/image-service'
import { ImageWithUser } from '../types/database'

interface UseImagesOptions {
  limit?: number
  sortBy?: 'created_at' | 'like_count' | 'view_count'
  sortOrder?: 'asc' | 'desc'
  category?: string
  tags?: string[]
  userId?: string
  autoLoad?: boolean
}

interface UseImagesReturn {
  images: ImageWithUser[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  loadImages: (options?: UseImagesOptions) => Promise<void>
}

export function useImages(initialOptions: UseImagesOptions = {}): UseImagesReturn {
  const [images, setImages] = useState<ImageWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [options, setOptions] = useState<UseImagesOptions>({
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    autoLoad: true,
    ...initialOptions
  })

  const loadImages = useCallback(async (newOptions?: UseImagesOptions, append = false) => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const currentOptions = newOptions ? { ...options, ...newOptions } : options
      const currentOffset = append ? offset : 0

      const data = await imageService.getImages({
        ...currentOptions,
        offset: currentOffset
      })

      if (append) {
        setImages(prev => [...prev, ...data])
      } else {
        setImages(data)
        setOffset(0)
      }

      setOffset(currentOffset + (currentOptions.limit || 20))
      setHasMore(data.length === (currentOptions.limit || 20))

      if (newOptions) {
        setOptions(currentOptions)
      }
    } catch (err) {
      console.error('Error loading images:', err)
      setError(err instanceof Error ? err.message : '加载图片失败')
    } finally {
      setIsLoading(false)
    }
  }, [options, offset, isLoading])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await loadImages(undefined, true)
  }, [hasMore, isLoading, loadImages])

  const refresh = useCallback(async () => {
    setOffset(0)
    await loadImages()
  }, [loadImages])

  useEffect(() => {
    if (options.autoLoad) {
      loadImages()
    }
  }, []) // Only run on mount

  return {
    images,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadImages
  }
}

// Hook for popular images
export function usePopularImages(timeframe: 'day' | 'week' | 'month' | 'all' = 'week', limit = 20) {
  const [images, setImages] = useState<ImageWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPopularImages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await imageService.getPopularImages(limit, timeframe)
      setImages(data)
    } catch (err) {
      console.error('Error loading popular images:', err)
      setError(err instanceof Error ? err.message : '加载热门图片失败')
    } finally {
      setIsLoading(false)
    }
  }, [limit, timeframe])

  useEffect(() => {
    loadPopularImages()
  }, [loadPopularImages])

  return {
    images,
    isLoading,
    error,
    refresh: loadPopularImages
  }
}

// Hook for recent images
export function useRecentImages(limit = 20) {
  const [images, setImages] = useState<ImageWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecentImages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await imageService.getRecentImages(limit)
      setImages(data)
    } catch (err) {
      console.error('Error loading recent images:', err)
      setError(err instanceof Error ? err.message : '加载最新图片失败')
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadRecentImages()
  }, [loadRecentImages])

  return {
    images,
    isLoading,
    error,
    refresh: loadRecentImages
  }
}

// Hook for user images
export function useUserImages(userId: string, limit = 20) {
  const [images, setImages] = useState<ImageWithUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const loadUserImages = useCallback(async (append = false) => {
    if (isLoading || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = append ? offset : 0
      const data = await imageService.getUserImages(userId, limit, currentOffset)

      if (append) {
        setImages(prev => [...prev, ...data])
      } else {
        setImages(data)
        setOffset(0)
      }

      setOffset(currentOffset + limit)
      setHasMore(data.length === limit)
    } catch (err) {
      console.error('Error loading user images:', err)
      setError(err instanceof Error ? err.message : '加载用户图片失败')
    } finally {
      setIsLoading(false)
    }
  }, [userId, limit, offset, isLoading])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await loadUserImages(true)
  }, [hasMore, isLoading, loadUserImages])

  const refresh = useCallback(async () => {
    setOffset(0)
    await loadUserImages()
  }, [loadUserImages])

  useEffect(() => {
    if (userId) {
      loadUserImages()
    }
  }, [userId]) // Only depend on userId

  return {
    images,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}

// Hook for categories
export function useCategories() {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await imageService.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError(err instanceof Error ? err.message : '加载分类失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    isLoading,
    error,
    refresh: loadCategories
  }
}

// Hook for popular tags
export function usePopularTags(limit = 20) {
  const [tags, setTags] = useState<{ name: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTags = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await imageService.getPopularTags(limit)
      setTags(data)
    } catch (err) {
      console.error('Error loading tags:', err)
      setError(err instanceof Error ? err.message : '加载标签失败')
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  return {
    tags,
    isLoading,
    error,
    refresh: loadTags
  }
}