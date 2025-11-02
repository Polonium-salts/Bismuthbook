import { supabase } from '../supabase'
import { LikeInsert, FavoriteInsert, CommentInsert, CommentUpdate, CommentWithUser } from '../types/database'

// 缓存配置
const CACHE_DURATION = 2 * 60 * 1000 // 2分钟
const commentsCache = new Map<string, { data: CommentWithUser[], timestamp: number }>()
const interactionStatsCache = new Map<string, { data: unknown, timestamp: number }>()

class InteractionService {
  // 测试数据库连接
  async testConnection(): Promise<{ success: boolean; message: string; details?: unknown }> {
    try {
      // 测试基本连接
      const { data, error } = await supabase
        .from('comments')
        .select('id')
        .limit(1)

      if (error) {
        return {
          success: false,
          message: 'Database connection failed',
          details: {
            error: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details
          }
        }
      }

      return {
        success: true,
        message: 'Database connection successful',
        details: {
          tableAccess: 'comments table accessible',
          recordCount: data?.length || 0
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      }
    }
  }

  // 私有方法：缓存相关
  private getCacheKey(prefix: string, ...params: string[]): string {
    return `${prefix}:${params.join(':')}`
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_DURATION
  }

  private setCache<T>(cache: Map<string, { data: T, timestamp: number }>, key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() })
  }

  private getFromCache<T>(cache: Map<string, { data: T, timestamp: number }>, key: string): T | null {
    const cached = cache.get(key)
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.data
    }
    if (cached) {
      cache.delete(key)
    }
    return null
  }

  private clearRelatedCache(imageId: string): void {
    // 清理相关的评论缓存
    const keysToDelete: string[] = []
    commentsCache.forEach((_, key) => {
      if (key.includes(imageId)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => commentsCache.delete(key))

    // 清理交互统计缓存
    const statsKey = this.getCacheKey('interaction_stats', imageId)
    interactionStatsCache.delete(statsKey)
  }
  // Toggle like for an image
  async toggleLike(imageId: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    try {
      if (!imageId || !userId) {
        throw new Error('Invalid arguments: imageId and userId are required')
      }
      // Check if already liked
      const { data: existingLikes, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .limit(1)

      if (checkError) {
        throw checkError
      }

      const existingLike = existingLikes?.[0]

      if (existingLike) {
        // Remove like
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        if (deleteError) throw deleteError

        // Decrement like count
        const { error: decrementError } = await supabase.rpc('decrement_like_count', {
          image_id: imageId
        })

        if (decrementError) throw decrementError

        // Get updated like count
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('like_count')
          .eq('id', imageId)
          .single()

        if (imageError) throw imageError

        return { isLiked: false, likeCount: imageData.like_count || 0 }
      } else {
        // Add like
        const likeData: LikeInsert = {
          user_id: userId,
          image_id: imageId
        }

        const { error: insertError } = await supabase
          .from('likes')
          .insert(likeData)

        if (insertError) throw insertError

        // Increment like count
        const { error: incrementError } = await supabase.rpc('increment_like_count', {
          image_id: imageId
        })

        if (incrementError) throw incrementError

        // Get updated like count
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('like_count')
          .eq('id', imageId)
          .single()

        if (imageError) throw imageError

        return { isLiked: true, likeCount: imageData.like_count || 0 }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  // Toggle favorite for an image
  async toggleFavorite(imageId: string, userId: string): Promise<{ isFavorited: boolean }> {
    try {
      if (!imageId || !userId) {
        throw new Error('Invalid arguments: imageId and userId are required')
      }
      // Check if already favorited
      const { data: existingFavorites, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .limit(1)

      if (checkError) {
        throw checkError
      }

      const existingFavorite = existingFavorites?.[0]

      if (existingFavorite) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id)

        if (deleteError) throw deleteError

        return { isFavorited: false }
      } else {
        // Add favorite
        const favoriteData: FavoriteInsert = {
          user_id: userId,
          image_id: imageId
        }

        const { error: insertError } = await supabase
          .from('favorites')
          .insert(favoriteData)

        if (insertError) throw insertError

        return { isFavorited: true }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  // Get user's liked images
  async getUserLikedImages(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          created_at,
          images (
            *,
            user_profiles (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data?.map(like => like.images) || []
    } catch (error) {
      console.error('Error fetching liked images:', error)
      throw error
    }
  }

  // Get user's favorited images
  async getUserFavoritedImages(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          created_at,
          images (
            *,
            user_profiles (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data?.map(favorite => favorite.images) || []
    } catch (error) {
      console.error('Error fetching favorited images:', error)
      throw error
    }
  }

  // Add comment to an image
  async addComment(imageId: string, userId: string, content: string): Promise<CommentWithUser> {
    try {
      const commentData: CommentInsert = {
        content,
        user_id: userId,
        image_id: imageId
      }

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          user_profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // 注：评论数更新交由数据库触发器处理；不再额外调用 RPC

      // 清理相关缓存
      this.clearRelatedCache(imageId)

      return data as CommentWithUser
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  // Get comments for an image
  async getImageComments(imageId: string, limit = 20, offset = 0): Promise<CommentWithUser[]> {
    try {
      if (!imageId) {
        return []
      }
      // 检查缓存（仅对第一页进行缓存）
      if (offset === 0) {
        const cacheKey = this.getCacheKey('comments', imageId, limit.toString())
        const cached = this.getFromCache(commentsCache, cacheKey)
        if (cached) {
          return cached
        }
      }

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('image_id', imageId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const comments = data as CommentWithUser[]

      // 缓存第一页结果
      if (offset === 0) {
        const cacheKey = this.getCacheKey('comments', imageId, limit.toString())
        this.setCache(commentsCache, cacheKey, comments)
      }

      return comments
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined,
        supabaseError: error && typeof error === 'object' ? {
          code: (error as { code?: string }).code,
          details: (error as { details?: string }).details,
          hint: (error as { hint?: string }).hint,
          message: (error as { message?: string }).message
        } : undefined,
        imageId,
        limit,
        offset,
        timestamp: new Date().toISOString()
      }
      
      console.error('Error fetching comments:', errorDetails)
      throw error
    }
  }

  // Update comment
  async updateComment(commentId: string, userId: string, content: string): Promise<CommentWithUser> {
    try {
      // 首先获取评论的 image_id 用于清理缓存
      const { data: commentData, error: fetchError } = await supabase
        .from('comments')
        .select('image_id')
        .eq('id', commentId)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      const updateData: CommentUpdate = {
        content,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('comments')
        .update(updateData)
        .eq('id', commentId)
        .eq('user_id', userId) // Ensure user owns the comment
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // 清理相关缓存
      this.clearRelatedCache(commentData.image_id)

      return data as CommentWithUser
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  // Delete comment
  async deleteComment(commentId: string, userId: string, imageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId) // Ensure user owns the comment

      if (error) throw error

      // 注：评论数更新交由数据库触发器处理；不再额外调用 RPC

      // 清理相关缓存
      this.clearRelatedCache(imageId)
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // Check if user has liked an image
  async hasUserLikedImage(imageId: string, userId: string): Promise<boolean> {
    try {
      if (!imageId || !userId) return false
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .limit(1)

      if (error) {
        throw error
      }

      return Array.isArray(data) && data.length > 0
    } catch (error) {
      console.error('Error checking if user liked image:', error)
      return false
    }
  }

  // Check if user has favorited an image
  async hasUserFavoritedImage(imageId: string, userId: string): Promise<boolean> {
    try {
      if (!imageId || !userId) return false
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .limit(1)

      if (error) {
        throw error
      }

      return Array.isArray(data) && data.length > 0
    } catch (error) {
      console.error('Error checking if user favorited image:', error)
      return false
    }
  }

  // Get interaction stats for an image
  async getImageStats(imageId: string, userId?: string) {
    try {
      if (!imageId) {
        return {
          likeCount: 0,
          viewCount: 0,
          commentCount: 0,
          isLiked: false,
          isFavorited: false
        }
      }
      const { data: image, error: imageError } = await supabase
        .from('images')
        .select('like_count, view_count, comment_count')
        .eq('id', imageId)
        .single()

      if (imageError) throw imageError

      let isLiked = false
      let isFavorited = false

      if (userId) {
        isLiked = await this.hasUserLikedImage(imageId, userId)
        isFavorited = await this.hasUserFavoritedImage(imageId, userId)
      }

      return {
        likeCount: image.like_count,
        viewCount: image.view_count,
        commentCount: image.comment_count,
        isLiked,
        isFavorited
      }
    } catch (error) {
      console.error('Error getting image stats:', error)
      throw error
    }
  }
}

export const interactionService = new InteractionService()
