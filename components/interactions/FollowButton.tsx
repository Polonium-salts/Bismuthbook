'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserMinus } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'

interface FollowButtonProps {
  targetUserId: string
  targetUsername: string
  initialFollowing?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
}

export default function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowing = false,
  size = 'md',
  variant = 'default',
  className = ''
}: FollowButtonProps) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // 不能关注自己
  if (user?.id === targetUserId) {
    return null
  }

  useEffect(() => {
    if (user) {
      checkFollowStatus()
    }
  }, [user, targetUserId])

  const checkFollowStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('检查关注状态失败:', error)
        return
      }

      setIsFollowing(!!data)
    } catch (err) {
      console.error('检查关注状态失败:', err)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      // 可以显示登录提示
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isFollowing) {
        // 取消关注
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)

        if (error) throw error

        setIsFollowing(false)
      } else {
        // 添加关注
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          })

        if (error) throw error

        setIsFollowing(true)
      }
    } catch (err) {
      console.error('关注操作失败:', err)
      // 恢复状态
      setIsFollowing(!isFollowing)
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

  const getButtonClasses = () => {
    const baseClasses = `btn ${sizeClasses[size]} transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md ${className}`
    
    if (isFollowing) {
      return `${baseClasses} btn-outline hover:btn-error group`
    }
    
    if (variant === 'outline') {
      return `${baseClasses} btn-outline btn-primary`
    }
    
    return `${baseClasses} btn-primary`
  }

  const getButtonContent = () => {
    if (isLoading) {
      return <span className="loading loading-spinner loading-sm"></span>
    }

    if (isFollowing) {
      return (
        <>
          <UserMinus className={`${iconSizes[size]} group-hover:inline hidden`} />
          <UserPlus className={`${iconSizes[size]} group-hover:hidden inline`} />
          <span className="ml-1 group-hover:hidden">已关注</span>
          <span className="ml-1 group-hover:inline hidden">取消关注</span>
        </>
      )
    }

    return (
      <>
        <UserPlus className={iconSizes[size]} />
        <span className="ml-1">关注</span>
      </>
    )
  }

  return (
    <button
      onClick={handleFollow}
      disabled={!user || isLoading}
      className={getButtonClasses()}
      title={user ? (isFollowing ? `取消关注 ${targetUsername}` : `关注 ${targetUsername}`) : '请先登录'}
    >
      {getButtonContent()}
    </button>
  )
}