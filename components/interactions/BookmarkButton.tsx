'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BookmarkButton({ 
  postId, 
  initialBookmarked = false, 
  size = 'md',
  className = ''
}: BookmarkButtonProps) {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkBookmarkStatus()
    }
  }, [user, postId])

  const checkBookmarkStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('artwork_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('检查收藏状态失败:', error)
        return
      }

      setIsBookmarked(!!data)
    } catch (err) {
      console.error('检查收藏状态失败:', err)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      // 可以显示登录提示
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isBookmarked) {
        // 取消收藏
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', postId)

        if (error) throw error

        setIsBookmarked(false)
      } else {
        // 添加收藏
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            artwork_id: postId
          })

        if (error) throw error

        setIsBookmarked(true)
      }
    } catch (err) {
      console.error('收藏操作失败:', err)
      // 恢复状态
      setIsBookmarked(!isBookmarked)
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
      onClick={handleBookmark}
      disabled={!user || isLoading}
      className={`btn btn-ghost ${sizeClasses[size]} ${
        isBookmarked ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-base-content/70 hover:bg-yellow-50'
      } hover:text-yellow-500 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${className}`}
      title={user ? (isBookmarked ? '取消收藏' : '收藏') : '请先登录'}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <Bookmark
          className={`${iconSizes[size]} ${isBookmarked ? 'fill-current' : ''} transition-all duration-200`}
        />
      )}
    </button>
  )
}