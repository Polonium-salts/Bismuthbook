import { useState, useEffect, useCallback, useRef } from 'react'
import { imageService } from '../services/image-service'
import { ImageWithUser, ImageWithUserAndStats } from '../types/database'

// Debounce utility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

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
  images: ImageWithUserAndStats[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  loadImages: (options?: UseImagesOptions) => Promise<void>
}

export function useImages(initialOptions: UseImagesOptions = {}): UseImagesReturn {
  const [images, setImages] = useState<ImageWithUserAndStats[]>([])
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

  // Track loading state to prevent duplicate requests
  const loadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadImagesInternal = useCallback(async (newOptions?: UseImagesOptions, append = false) => {
    // Prevent duplicate requests
    if (loadingRef.current) return

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    loadingRef.current = true
    setIsLoading(true)
    setError(null)

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const currentOptions = newOptions ? { ...options, ...newOptions } : options
      const currentOffset = append ? offset : 0

      const data = await imageService.getImages({
        ...currentOptions,
        offset: currentOffset
      }, currentOptions.userId)

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      if (append) {
        setImages(prev => {
          // Prevent duplicate images
          const existingIds = new Set(prev.map(img => img.id))
          const newImages = data.filter(img => !existingIds.has(img.id))
          return [...prev, ...newImages]
        })
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
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      // Enhanced error logging
      const errorDetails = {
        message: err instanceof Error ? err.message : 'Unknown error',
        name: err instanceof Error ? err.name : 'UnknownError',
        stack: err instanceof Error ? err.stack : undefined,
        options: newOptions ? { ...options, ...newOptions } : options,
        append,
        timestamp: new Date().toISOString()
      }
      
      console.error('Error loading images:', errorDetails)
      setError(err instanceof Error ? err.message : '加载图片失败')
    } finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [options, offset])

  // Debounced version for search/filter changes
  const loadImages = useDebounce(loadImagesInternal, 300)

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return
    await loadImagesInternal(undefined, true)
  }, [hasMore, loadImagesInternal])

  const refresh = useCallback(async () => {
    setOffset(0)
    await loadImages()
  }, [loadImages])

  useEffect(() => {
    if (options.autoLoad) {
      loadImages()
    }
  }, [loadImages, options.autoLoad]) // Include dependencies

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
  const [images, setImages] = useState<ImageWithUserAndStats[]>([])
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
  const [images, setImages] = useState<ImageWithUserAndStats[]>([])
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
  }, [userId, loadUserImages]) // Include loadUserImages dependency

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