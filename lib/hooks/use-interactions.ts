import { useState, useCallback } from 'react'
import { interactionService } from '../services/interaction-service'
import { useAuth } from '../providers/auth-provider'
import { toast } from 'sonner'

interface InteractionState {
  isLiked: boolean
  isFavorited: boolean
  likeCount: number
  viewCount: number
  commentCount: number
  isLoading: boolean
}

export function useInteractions(imageId: string, initialStats?: Partial<InteractionState>) {
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

// Hook for managing comments
export function useComments(imageId: string) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load comments
  const loadComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await interactionService.getImageComments(imageId)
      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
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

    setIsSubmitting(true)
    try {
      const newComment = await interactionService.addComment(imageId, user.id, content.trim())
      setComments(prev => [newComment, ...prev])
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
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
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