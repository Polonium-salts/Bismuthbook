import { supabase, uploadImage, getImageUrl, deleteImage } from '../supabase'
import { ImageInsert, ImageUpdate, ImageWithUser, ImageWithUserAndStats } from '../types/database'

export interface UploadImageData {
  title: string
  description?: string
  tags?: string[]
  category?: string
  isPublished?: boolean
}

export interface ImageFilters {
  category?: string
  tags?: string[]
  sortBy?: 'created_at' | 'like_count' | 'view_count'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

class ImageService {
  // Upload image with metadata
  async uploadImageWithData(file: File, data: UploadImageData, userId: string) {
    try {
      // Validate file
      this.validateImageFile(file)

      // Upload image to storage
      const imagePath = await uploadImage(file)
      
      // Create image record in database
      const imageData: ImageInsert = {
        title: data.title,
        description: data.description || null,
        image_url: imagePath,
        user_id: userId,
        tags: data.tags || null,
        category: data.category || null,
        like_count: 0,
        view_count: 0,
        comment_count: 0,
        is_featured: false,
        is_published: data.isPublished || false,
        published_at: data.isPublished ? new Date().toISOString() : null
      }

      const { data: image, error } = await supabase
        .from('images')
        .insert(imageData)
        .select(`
          *,
          user_profiles (*)
        `)
        .single()

      if (error) throw error

      // Convert storage path to public URL
      const processedImage = {
        ...image,
        image_url: this.getImageUrl(image.image_url)
      }

      return processedImage as ImageWithUser
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Cache for frequently accessed data
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(prefix: string, params: Record<string, unknown>): string {
    return `${prefix}:${JSON.stringify(params)}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: unknown, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
  }

  // Test database connection and table structure
  async testConnection(): Promise<{ success: boolean; error?: string; tableInfo?: unknown }> {
    try {
      // Test basic connection
      const { error } = await supabase
        .from('images')
        .select('count(*)')
        .limit(1)

      if (error) {
        return { success: false, error: error.message }
      }

      // Get table structure info
      const { data: tableInfo } = await supabase
        .from('images')
        .select('id, title, image_url, user_id, created_at')
        .limit(1)

      return { 
        success: true, 
        tableInfo: {
          hasData: tableInfo && tableInfo.length > 0,
          sampleRecord: tableInfo?.[0] || null
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      }
    }
  }

  // Get images with filters and pagination (optimized)
  async getImages(filters: ImageFilters = {}, userId?: string): Promise<ImageWithUserAndStats[]> {
    const cacheKey = this.getCacheKey('images', { filters, userId })
    const cached = this.getFromCache<ImageWithUserAndStats[]>(cacheKey)
    if (cached) return cached

    const maxRetries = 3
    let lastError: unknown

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Optimized query - only select necessary fields
        let query = supabase
          .from('images')
          .select(`
            id,
            title,
            description,
            image_url,
            user_id,
            tags,
            category,
            like_count,
            view_count,
            comment_count,
            is_featured,
            is_published,
            published_at,
            created_at,
            user_profiles!inner (
              id,
              username,
              avatar_url,
              full_name,
              bio,
              website,
              created_at,
              updated_at
            )
          `)

        // 临时移除 is_published 过滤，因为字段不存在
        // TODO: 添加 is_published 字段到数据库后恢复此过滤
        // if (!userId) {
        //   query = query.eq('is_published', true)
        // } else {
        //   query = query.or(`is_published.eq.true,user_id.eq.${userId}`)
        // }

        // Apply filters
        if (filters.category) {
          query = query.eq('category', filters.category)
        }

        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags)
        }

        // Apply sorting with index hints
        const sortBy = filters.sortBy || 'created_at'
        const sortOrder = filters.sortOrder || 'desc'
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        // Apply pagination
        const limit = filters.limit || 20
        const offset = filters.offset || 0
        query = query.range(offset, offset + limit - 1)

        const { data, error } = await query

        if (error) throw error

        // Get user interactions in a separate optimized query if userId is provided
        // eslint-disable-next-line prefer-const
        let userInteractions: { likes: string[]; favorites: string[] } = { likes: [], favorites: [] }
        if (userId && data && data.length > 0) {
          const imageIds = data.map(img => img.id)
          
          const [likesResult, favoritesResult] = await Promise.all([
            supabase
              .from('likes')
              .select('image_id')
              .eq('user_id', userId)
              .in('image_id', imageIds),
            supabase
              .from('favorites')
              .select('image_id')
              .eq('user_id', userId)
              .in('image_id', imageIds)
          ])

          userInteractions.likes = likesResult.data?.map(like => like.image_id) || []
          userInteractions.favorites = favoritesResult.data?.map(fav => fav.image_id) || []
        }

        // Process data with optimized URL conversion and interaction status
        const processedData = data?.map(image => ({
          ...image,
          image_url: this.getImageUrl(image.image_url),
          is_liked: userInteractions.likes.includes(image.id),
          is_favorited: userInteractions.favorites.includes(image.id),
          likes: [],
          favorites: [],
          comments: []
        })) || []

        // Cache the result
        this.setCache(cacheKey, processedData)

        return processedData as ImageWithUserAndStats[]
      } catch (error) {
        lastError = error
        
        // Enhanced error logging with more details
        const errorDetails = {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'UnknownError',
          stack: error instanceof Error ? error.stack : undefined,
          supabaseError: error && typeof error === 'object' && 'code' in error ? {
            code: (error as { code?: string }).code,
            details: (error as { details?: string }).details,
            hint: (error as { hint?: string }).hint,
            message: (error as { message?: string }).message
          } : undefined,
          filters,
          userId,
          attempt,
          timestamp: new Date().toISOString()
        }
        
        console.error(`Error fetching images (attempt ${attempt}/${maxRetries}):`, errorDetails)
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  // Get popular images (trending) - optimized with caching
  async getPopularImages(limit = 20, timeframe: 'day' | 'week' | 'month' | 'all' = 'week') {
    const cacheKey = this.getCacheKey('popular', { limit, timeframe })
    const cached = this.getFromCache<ImageWithUserAndStats[]>(cacheKey)
    if (cached) return cached

    try {
      // Calculate popularity score for better ranking
      let query = supabase
        .from('images')
        .select(`
          id,
          title,
          description,
          image_url,
          user_id,
          tags,
          category,
          like_count,
          view_count,
          comment_count,
          is_featured,
          is_published,
          published_at,
          created_at,
          user_profiles!inner (
            id,
            username,
            avatar_url,
            full_name,
            bio,
            website,
            created_at,
            updated_at
          )
        `)
        .eq('is_published', true)

      // Filter by timeframe with optimized date filtering
      if (timeframe !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (timeframe) {
          case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(0)
        }

        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query
        .order('like_count', { ascending: false })
        .order('view_count', { ascending: false })
        .order('comment_count', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Convert storage paths to public URLs and calculate popularity score
      const processedData = data?.map(image => {
        const ageInDays = (Date.now() - new Date(image.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
        const popularityScore = ((image.like_count || 0) * 3 + (image.view_count || 0) * 0.1 + (image.comment_count || 0) * 2) / Math.max(1, ageInDays * 0.1)
        
        return {
          ...image,
          image_url: this.getImageUrl(image.image_url),
          popularity_score: popularityScore,
          likes: [],
          favorites: [],
          comments: [],
          is_liked: false,
          is_favorited: false
        }
      }).sort((a, b) => b.popularity_score - a.popularity_score) || []

      // Cache with shorter TTL for popular content (2 minutes)
      this.setCache(cacheKey, processedData, 2 * 60 * 1000)

      return processedData
    } catch (error) {
      console.error('Error fetching popular images:', error)
      throw error
    }
  }

  // Get images by multiple user IDs (for following feed)
  async getImagesByUserIds(
    userIds: string[],
    filters: ImageFilters = {},
    userId?: string
  ): Promise<ImageWithUserAndStats[]> {
    if (!userIds || userIds.length === 0) return []

    const cacheKey = this.getCacheKey('images_by_user_ids', { userIds: [...userIds].sort(), filters, userId })
    const cached = this.getFromCache<ImageWithUserAndStats[]>(cacheKey)
    if (cached) return cached

    try {
      let query = supabase
        .from('images')
        .select(`
          id,
          title,
          description,
          image_url,
          user_id,
          tags,
          category,
          like_count,
          view_count,
          comment_count,
          is_featured,
          is_published,
          published_at,
          created_at,
          user_profiles!inner (
            id,
            username,
            avatar_url,
            full_name,
            bio,
            website,
            created_at,
            updated_at
          )
        `)
        .in('user_id', userIds)

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at'
      const sortOrder = filters.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const limit = filters.limit || 20
      const offset = filters.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query
      if (error) throw error

      // Get user interactions if current userId provided
      // eslint-disable-next-line prefer-const
      let userInteractions: { likes: string[]; favorites: string[] } = { likes: [], favorites: [] }
      if (userId && data && data.length > 0) {
        const imageIds = data.map(img => img.id)

        const [likesResult, favoritesResult] = await Promise.all([
          supabase
            .from('likes')
            .select('image_id')
            .eq('user_id', userId)
            .in('image_id', imageIds),
          supabase
            .from('favorites')
            .select('image_id')
            .eq('user_id', userId)
            .in('image_id', imageIds)
        ])

        userInteractions.likes = likesResult.data?.map(like => like.image_id) || []
        userInteractions.favorites = favoritesResult.data?.map(fav => fav.image_id) || []
      }

      const processedData = data?.map(image => ({
        ...image,
        image_url: this.getImageUrl(image.image_url),
        is_liked: userInteractions.likes.includes(image.id),
        is_favorited: userInteractions.favorites.includes(image.id),
        likes: [],
        favorites: [],
        comments: []
      })) || []

      this.setCache(cacheKey, processedData)
      return processedData as ImageWithUserAndStats[]
    } catch (error) {
      console.error('Error fetching images by user ids:', error)
      throw error
    }
  }

  // Get recent images - optimized with caching
  async getRecentImages(limit = 20) {
    const cacheKey = this.getCacheKey('recent', { limit })
    const cached = this.getFromCache<ImageWithUserAndStats[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          id,
          title,
          description,
          image_url,
          user_id,
          tags,
          category,
          like_count,
          view_count,
          comment_count,
          is_featured,
          is_published,
          published_at,
          created_at,
          user_profiles!inner (
            id,
            username,
            avatar_url,
            full_name,
            bio,
            website,
            created_at,
            updated_at
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Convert storage paths to public URLs
      const processedData = data?.map(image => ({
        ...image,
        image_url: this.getImageUrl(image.image_url),
        likes: [],
        favorites: [],
        comments: [],
        is_liked: false,
        is_favorited: false
      })) || []

      // Cache with shorter TTL for recent content (1 minute)
      this.setCache(cacheKey, processedData, 60 * 1000)

      return processedData
    } catch (error) {
      console.error('Error fetching recent images:', error)
      throw error
    }
  }

  // Get images by category
  async getImagesByCategory(category: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          user_profiles (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('category', category)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Convert storage paths to public URLs
      const processedData = data?.map(image => ({
        ...image,
        image_url: this.getImageUrl(image.image_url)
      })) || []

      return processedData
    } catch (error) {
      console.error('Error fetching images by category:', error)
      throw error
    }
  }

  // Get related images (by tags and category)
  async getRelatedImages(imageId: string, limit = 8) {
    try {
      // First get the current image to find related ones
      const { data: currentImage, error: currentError } = await supabase
        .from('images')
        .select('category, tags')
        .eq('id', imageId)
        .single()

      if (currentError) throw currentError

      let query = supabase
        .from('images')
        .select(`
          *,
          user_profiles (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .neq('id', imageId) // Exclude current image
        .eq('is_published', true) // Only show published images

      // Find images with same category or overlapping tags
      if (currentImage.category) {
        query = query.eq('category', currentImage.category)
      }

      const { data, error } = await query
        .order('like_count', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Convert storage paths to public URLs
      const processedData = data?.map(image => ({
        ...image,
        image_url: this.getImageUrl(image.image_url)
      })) || []

      return processedData
    } catch (error) {
      console.error('Error fetching related images:', error)
      throw error
    }
  }

  // Get image statistics
  async getImageStats() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('id')

      if (error) throw error

      const totalImages = data?.length || 0

      // Get total likes
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('id')

      if (likesError) throw likesError

      const totalLikes = likesData?.length || 0

      // Get total views
      const { data: viewsData, error: viewsError } = await supabase
        .from('images')
        .select('view_count')

      if (viewsError) throw viewsError

      const totalViews = viewsData?.reduce((sum, img) => sum + (img.view_count || 0), 0) || 0

      return {
        totalImages,
        totalLikes,
        totalViews
      }
    } catch (error) {
      console.error('Error fetching image stats:', error)
      throw error
    }
  }

  // Get categories with image counts
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('category')

      if (error) throw error

      // Count images per category
      const categoryCount: Record<string, number> = {}
      data?.forEach(image => {
        if (image.category) {
          categoryCount[image.category] = (categoryCount[image.category] || 0) + 1
        }
      })

      return Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  // Get popular tags
  async getPopularTags(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('tags')

      if (error) throw error

      // Count tag occurrences
      const tagCount: Record<string, number> = {}
      data?.forEach(image => {
        if (image.tags && Array.isArray(image.tags)) {
          image.tags.forEach(tag => {
            if (typeof tag === 'string') {
              tagCount[tag] = (tagCount[tag] || 0) + 1
            }
          })
        }
      })

      return Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }))
    } catch (error) {
      console.error('Error fetching popular tags:', error)
      throw error
    }
  }

  // Get single image by ID
  async getImageById(id: string, userId?: string): Promise<ImageWithUserAndStats | null> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          user_profiles (*),
          likes!left (user_id),
          favorites!left (user_id)
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      if (!data) return null

      // Increment view count
      await this.incrementViewCount(id)

      // Process data to include user interaction status and convert image URL
      const processedData = {
        ...data,
        image_url: this.getImageUrl(data.image_url), // Convert storage path to public URL
        is_liked: userId ? data.likes.some((like: { user_id: string }) => like.user_id === userId) : false,
        is_favorited: userId ? data.favorites.some((fav: { user_id: string }) => fav.user_id === userId) : false,
        likes: [],
        favorites: [],
        comments: []
      }

      return processedData as ImageWithUserAndStats
    } catch (error) {
      console.error('Error fetching image:', error)
      throw error
    }
  }

  // Update image
  async updateImage(id: string, updates: ImageUpdate, userId: string) {
    try {
      const { data, error } = await supabase
        .from('images')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId) // Ensure user owns the image
        .select(`
          *,
          user_profiles (*)
        `)
        .single()

      if (error) throw error

      return data as ImageWithUser
    } catch (error) {
      console.error('Error updating image:', error)
      throw error
    }
  }

  // Publish image
  async publishImage(id: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('images')
        .update({
          is_published: true,
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId) // Ensure user owns the image
        .select(`
          *,
          user_profiles (*)
        `)
        .single()

      if (error) throw error

      return data as ImageWithUser
    } catch (error) {
      console.error('Error publishing image:', error)
      throw error
    }
  }

  // Unpublish image
  async unpublishImage(id: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('images')
        .update({
          is_published: false,
          published_at: null
        })
        .eq('id', id)
        .eq('user_id', userId) // Ensure user owns the image
        .select(`
          *,
          user_profiles (*)
        `)
        .single()

      if (error) throw error

      return data as ImageWithUser
    } catch (error) {
      console.error('Error unpublishing image:', error)
      throw error
    }
  }

  // Delete image
  async deleteImage(id: string, userId: string) {
    try {
      // First get the image to get the file path
      const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('image_url')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      await deleteImage(image.image_url)

      // Delete from database
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // Get user's images
  async getUserImages(userId: string, limit = 20, offset = 0): Promise<ImageWithUserAndStats[]> {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Convert storage paths to public URLs and add empty stats arrays
      const processedData = data?.map(image => ({
        ...image,
        image_url: this.getImageUrl(image.image_url),
        likes: [],
        favorites: [],
        comments: [],
        is_liked: false,
        is_favorited: false
      })) || []

      return processedData as ImageWithUserAndStats[]
    } catch (error) {
      console.error('Error fetching user images:', error)
      throw error
    }
  }

  // Search images
  async searchImages(query: string, filters: ImageFilters = {}, userId?: string): Promise<ImageWithUserAndStats[]> {
    try {
      let supabaseQuery = supabase
        .from('images')
        .select(`
          *,
          user_profiles (*),
          likes!left (user_id),
          favorites!left (user_id)
        `)
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)

      // Apply additional filters
      if (filters.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category)
      }

      if (filters.tags && filters.tags.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('tags', filters.tags)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at'
      const sortOrder = filters.sortOrder || 'desc'
      supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (filters.limit) {
        supabaseQuery = supabaseQuery.limit(filters.limit)
      }

      const { data, error } = await supabaseQuery

      if (error) throw error

      // Process data to include user interaction status and convert image URLs
      const processedData = data?.map(image => ({
        ...image,
        image_url: this.getImageUrl(image.image_url), // Convert storage path to public URL
        is_liked: userId ? image.likes.some((like: { user_id: string }) => like.user_id === userId) : false,
        is_favorited: userId ? image.favorites.some((fav: { user_id: string }) => fav.user_id === userId) : false,
        likes: [],
        favorites: [],
        comments: []
      })) || []

      return processedData as ImageWithUserAndStats[]
    } catch (error) {
      console.error('Error searching images:', error)
      throw error
    }
  }

  // Increment view count
  async incrementViewCount(imageId: string) {
    try {
      const { error } = await supabase.rpc('increment_view_count', {
        image_id: imageId
      })

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing view count:', error)
      // Don't throw error for view count increment failures
    }
  }

  // Get image URL
  getImageUrl(path: string): string {
    return getImageUrl(path)
  }

  // Validate image file
  private validateImageFile(file: File) {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be a valid image (JPEG, PNG, WebP, or GIF)')
    }
  }
}

export const imageService = new ImageService()
