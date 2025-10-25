import { supabase, uploadImage, getImageUrl, deleteImage } from '../supabase'
import { ImageInsert, ImageUpdate, ImageWithUser, ImageWithUserAndStats } from '../types/database'

export interface UploadImageData {
  title: string
  description?: string
  tags?: string[]
  category?: string
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
        is_featured: false
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

      return image as ImageWithUser
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Get images with filters and pagination
  async getImages(filters: ImageFilters = {}, userId?: string): Promise<ImageWithUserAndStats[]> {
    try {
      let query = supabase
        .from('images')
        .select(`
          *,
          user_profiles (*),
          likes!left (user_id),
          favorites!left (user_id)
        `)

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at'
      const sortOrder = filters.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Process data to include user interaction status
      const processedData = data?.map(image => ({
        ...image,
        is_liked: userId ? image.likes.some((like: any) => like.user_id === userId) : false,
        is_favorited: userId ? image.favorites.some((fav: any) => fav.user_id === userId) : false,
        likes: undefined, // Remove the raw likes data
        favorites: undefined // Remove the raw favorites data
      })) || []

      return processedData as ImageWithUserAndStats[]
    } catch (error) {
      console.error('Error fetching images:', error)
      throw error
    }
  }

  // Get popular images (trending)
  async getPopularImages(limit = 20, timeframe: 'day' | 'week' | 'month' | 'all' = 'week') {
    try {
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

      // Filter by timeframe
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
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching popular images:', error)
      throw error
    }
  }

  // Get recent images
  async getRecentImages(limit = 20) {
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
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
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
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
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

      // Find images with same category or overlapping tags
      if (currentImage.category) {
        query = query.eq('category', currentImage.category)
      }

      const { data, error } = await query
        .order('like_count', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
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
        .single()

      if (error) throw error

      if (!data) return null

      // Increment view count
      await this.incrementViewCount(id)

      // Process data to include user interaction status
      const processedData = {
        ...data,
        is_liked: userId ? data.likes.some((like: any) => like.user_id === userId) : false,
        is_favorited: userId ? data.favorites.some((fav: any) => fav.user_id === userId) : false,
        likes: undefined,
        favorites: undefined
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
  async getUserImages(userId: string, limit = 20, offset = 0): Promise<ImageWithUser[]> {
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

      return data as ImageWithUser[]
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

      // Process data to include user interaction status
      const processedData = data?.map(image => ({
        ...image,
        is_liked: userId ? image.likes.some((like: any) => like.user_id === userId) : false,
        is_favorited: userId ? image.favorites.some((fav: any) => fav.user_id === userId) : false,
        likes: undefined,
        favorites: undefined
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