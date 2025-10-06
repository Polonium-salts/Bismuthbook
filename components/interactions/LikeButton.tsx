'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'

interface LikeButtonProps {
  postId: string
  initialLiked?: boolean
  initialCount?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export default function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
  showCount = true,
  className = ''
}: LikeButtonProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkLikeStatus()
    }
  }, [user, postId])

  const checkLikeStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('检查点赞状态失败:', error)
        return
      }

      setIsLiked(!!data)
    } catch (err) {
      console.error('检查点赞状态失败:', err)
    }
  }

  const handleLike = async () => {
    if (!user) {
      // 可以显示登录提示
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isLiked) {
        // 取消点赞
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)

        if (error) throw error

        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        // 添加点赞
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          })

        if (error) throw error

        setIsLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('点赞操作失败:', err)
      // 恢复状态
      setIsLiked(!isLiked)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      onClick={handleLike}
      disabled={!user || isLoading}
      className={`btn btn-ghost ${sizeClasses[size]} ${
        isLiked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-base-content/70 hover:bg-red-50'
      } hover:text-red-500 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${className}`}
      title={user ? (isLiked ? '取消点赞' : '点赞') : '请先登录'}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <Heart
          className={`${iconSizes[size]} ${isLiked ? 'fill-current' : ''} transition-all duration-200`}
        />
      )}
      {showCount && (
        <span className="ml-1 text-sm font-medium">
          {likeCount > 0 ? likeCount : ''}
        </span>
      )}
    </button>
  )
}