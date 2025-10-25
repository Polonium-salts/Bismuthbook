import { supabase } from '../supabase'
import { LikeInsert, FavoriteInsert, CommentInsert, CommentUpdate, CommentWithUser } from '../types/database'

class InteractionService {
  // Toggle like for an image
  async toggleLike(imageId: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

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

        return { isLiked: false, likeCount: imageData.like_count }
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

        return { isLiked: true, likeCount: imageData.like_count }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  // Toggle favorite for an image
  async toggleFavorite(imageId: string, userId: string): Promise<{ isFavorited: boolean }> {
    try {
      // Check if already favorited
      const { data: existingFavorite, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

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
          user_profiles (*)
        `)
        .single()

      if (error) throw error

      // Increment comment count
      const { error: incrementError } = await supabase
        .from('images')
        .update({ comment_count: supabase.sql`comment_count + 1` })
        .eq('id', imageId)

      if (incrementError) {
        console.error('Error incrementing comment count:', incrementError)
      }

      return data as CommentWithUser
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  // Get comments for an image
  async getImageComments(imageId: string, limit = 20, offset = 0): Promise<CommentWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('image_id', imageId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data as CommentWithUser[]
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  // Update comment
  async updateComment(commentId: string, userId: string, content: string): Promise<CommentWithUser> {
    try {
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
          *,
          user_profiles (*)
        `)
        .single()

      if (error) throw error

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

      // Decrement comment count
      const { error: decrementError } = await supabase
        .from('images')
        .update({ comment_count: supabase.sql`comment_count - 1` })
        .eq('id', imageId)

      if (decrementError) {
        console.error('Error decrementing comment count:', decrementError)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // Check if user has liked an image
  async hasUserLikedImage(imageId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking if user liked image:', error)
      return false
    }
  }

  // Check if user has favorited an image
  async hasUserFavoritedImage(imageId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('image_id', imageId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking if user favorited image:', error)
      return false
    }
  }

  // Get interaction stats for an image
  async getImageStats(imageId: string, userId?: string) {
    try {
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