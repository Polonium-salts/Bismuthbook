import { useState, useCallback } from 'react'
import { interactionService } from '../services/interaction-service'
import { useAuth } from '../providers/auth-provider'
import { toast } from 'sonner'
import { CommentWithUser } from '../types/database'

interface InteractionState {
  isLiked: boolean
  isFavorited: boolean
  likeCount: number
  viewCount: number
  commentCount: number
  isLoading: boolean
}

export function useInteractions(imageId?: string, initialStats?: Partial<InteractionState>) {
  const { user } = useAuth()
  
  const [state, setState] = useState<InteractionState>({
    isLiked: false,
    isFavorited: false,
    likeCount: 0,
    viewCount: 0,
    commentCount: 0,
    isLoading: false,
    ...initialStats
  })

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (!imageId) {
      console.warn('toggleLike called without valid imageId')
      toast.error('作品尚未就绪，请稍后再试')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await interactionService.toggleLike(imageId, user.id)
      setState(prev => ({
        ...prev,
        isLiked: result.isLiked,
        likeCount: result.likeCount,
        isLoading: false
      }))

      toast.success(result.isLiked ? '已点赞' : '已取消点赞')
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('操作失败，请重试')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [imageId, user])

  // Toggle favorite
  const toggleFavorite = useCallback(async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (!imageId) {
      console.warn('toggleFavorite called without valid imageId')
      toast.error('作品尚未就绪，请稍后再试')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await interactionService.toggleFavorite(imageId, user.id)
      setState(prev => ({
        ...prev,
        isFavorited: result.isFavorited,
        isLoading: false
      }))

      toast.success(result.isFavorited ? '已收藏' : '已取消收藏')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败，请重试')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [imageId, user])

  // Load interaction stats
  const loadStats = useCallback(async () => {
    if (!imageId) {
      // Image not ready yet; skip without error
      return
    }
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const stats = await interactionService.getImageStats(imageId, user?.id)
      setState(prev => ({
        ...prev,
        ...stats,
        isLoading: false
      }))
    } catch (error) {
      console.error('Error loading stats:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [imageId, user?.id])

  return {
    ...state,
    toggleLike,
    toggleFavorite,
    loadStats
  }
}

// Transform CommentWithUser to match UI component expectations
function transformComment(comment: CommentWithUser): Comment {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at || '',
    isEdited: comment.updated_at !== comment.created_at,
    user: {
      name: comment.user_profiles.full_name || comment.user_profiles.username || 'Anonymous',
      avatar: comment.user_profiles.avatar_url || '',
      isArtist: false, // You can add this logic based on your business rules
      isVerified: false // You can add this logic based on your business rules
    },
    likes: 0, // You can add this if you have comment likes
    isLiked: false, // You can add this if you have comment likes
    replies: [] // You can add this if you have nested comments
  }
}

// Comment type for UI components
interface Comment {
  id: string
  content: string
  createdAt: string
  isEdited: boolean
  user: {
    name: string
    avatar: string
    isArtist: boolean
    isVerified: boolean
  }
  likes: number
  isLiked: boolean
  replies: Comment[]
}

// Hook for managing comments
export function useComments(imageId?: string) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load comments
  const loadComments = useCallback(async () => {
    if (!imageId) {
      return
    }
    setIsLoading(true)
    try {
      const data = await interactionService.getImageComments(imageId)
      // Transform the data to match UI expectations
      const transformedComments = data.map(transformComment)
      setComments(transformedComments)
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
        timestamp: new Date().toISOString()
      }
      
      console.error('Error loading comments:', errorDetails)
      toast.error('加载评论失败')
    } finally {
      setIsLoading(false)
    }
  }, [imageId])

  // Add comment
  const addComment = useCallback(async (content: string) => {
    if (!user) {
      toast.error('请先登录')
      return false
    }

    if (!content.trim()) {
      toast.error('评论内容不能为空')
      return false
    }

    if (!imageId) {
      toast.error('作品尚未就绪，无法发表评论')
      return false
    }

    setIsSubmitting(true)
    try {
      const newComment = await interactionService.addComment(imageId, user.id, content.trim())
      // Transform the new comment to match UI expectations
      const transformedComment = transformComment(newComment)
      setComments(prev => [transformedComment, ...prev])
      toast.success('评论发布成功')
      return true
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('发布评论失败')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [imageId, user])

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user) {
      toast.error('请先登录')
      return false
    }

    if (!content.trim()) {
      toast.error('评论内容不能为空')
      return false
    }

    try {
      const updatedComment = await interactionService.updateComment(commentId, user.id, content.trim())
      // Transform the updated comment to match UI expectations
      const transformedComment = transformComment(updatedComment)
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? transformedComment : comment
      ))
      toast.success('评论更新成功')
      return true
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('更新评论失败')
      return false
    }
  }, [user])

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) {
      toast.error('请先登录')
      return false
    }

    try {
      await interactionService.deleteComment(commentId, user.id, imageId)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      toast.success('评论删除成功')
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('删除评论失败')
      return false
    }
  }, [imageId, user])

  return {
    comments,
    isLoading,
    isSubmitting,
    loadComments,
    addComment,
    updateComment,
    deleteComment
  }
}