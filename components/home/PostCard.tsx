'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { api, type Post } from '@/lib/supabase'
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ArrowPathIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

// Post类型已从supabase导入

interface PostCardProps {
  post: Post
  currentUserId?: string
  onDelete?: (postId: string) => void
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [isReposted, setIsReposted] = useState(post.is_reposted || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [repostsCount, setRepostsCount] = useState(post.reposts_count || 0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLike = async () => {
    const newLikedState = !isLiked
    const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1
    
    // 乐观更新UI
    setIsLiked(newLikedState)
    setLikesCount(newLikesCount)
    
    try {
      if (newLikedState) {
        await api.likePost(post.id)
      } else {
        await api.unlikePost(post.id)
      }
    } catch (error) {
      // 回滚状态
      setIsLiked(isLiked)
      setLikesCount(likesCount)
      console.error('点赞操作失败:', error)
    }
  }

  const handleRepost = async () => {
    const newRepostedState = !isReposted
    const newRepostsCount = isReposted ? repostsCount - 1 : repostsCount + 1
    
    // 乐观更新UI
    setIsReposted(newRepostedState)
    setRepostsCount(newRepostsCount)
    
    try {
      if (newRepostedState) {
        await api.repostPost(post.id)
      } else {
        await api.unrepostPost(post.id)
      }
    } catch (error) {
      // 回滚状态
      setIsReposted(isReposted)
      setRepostsCount(repostsCount)
      console.error('转发操作失败:', error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.deletePost(post.id)
      onDelete?.(post.id)
      setShowDeleteConfirm(false)
      setShowDropdown(false)
    } catch (error) {
      console.error('删除动态失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // 检查是否为当前用户的帖子
  const canDelete = currentUserId && currentUserId === post.user_id

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '刚刚'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`
    
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <>
    <article className="bg-base-100 border-b border-base-200/50 p-6 hover:bg-base-50/50 dark:hover:bg-base-200/20 transition-colors duration-200 cursor-pointer">
      <div className="flex gap-4">
        {/* 用户头像 */}
        <Link href={`/user/${post.username}`} className="flex-shrink-0">
          {post.avatar_url ? (
            <img 
              src={post.avatar_url} 
              alt={post.display_name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center hover:scale-105 transition-transform duration-200">
              <UserCircleIcon className="w-8 h-8 text-primary-content" />
            </div>
          )}
        </Link>

        {/* 动态内容 */}
        <div className="flex-1 min-w-0">
          {/* 用户信息和时间 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link 
                href={`/user/${post.username}`}
                className="font-semibold text-base-content hover:text-primary transition-colors duration-200 truncate"
              >
                {post.display_name}
              </Link>
              <Link 
                href={`/user/${post.username}`}
                className="text-base-content/60 hover:text-base-content/80 transition-colors duration-200 truncate"
              >
                @{post.username}
              </Link>
              <span className="text-base-content/50">·</span>
              <time className="text-base-content/60 text-sm hover:text-base-content/80 transition-colors duration-200">
                {formatTime(post.created_at)}
              </time>
            </div>
            
            {canDelete && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-base-200/70 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5 text-base-content/60" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-base-100 border border-base-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true)
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left text-error hover:bg-base-200 transition-colors duration-200 flex items-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      删除动态
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 动态文本内容 */}
          <div className="mb-3">
            <p className="text-base-content leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 图片内容 */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className={`mb-3 rounded-2xl overflow-hidden border border-base-200/50 ${
              post.image_urls.length === 1 ? 'max-w-md' : 
              post.image_urls.length === 2 ? 'grid grid-cols-2 gap-1' :
              post.image_urls.length === 3 ? 'grid grid-cols-2 gap-1' :
              'grid grid-cols-2 gap-1'
            }`}>
              {post.image_urls.slice(0, 4).map((image, index) => (
                <div 
                  key={index} 
                  className={`relative ${
                    post.image_urls!.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`动态图片 ${index + 1}`}
                    className="w-full h-full object-cover hover:opacity-95 transition-opacity duration-200"
                  />
                  {post.image_urls!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{post.image_urls!.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex items-center justify-between max-w-md mt-4">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 group ${
                isLiked 
                  ? 'text-error hover:bg-error/10' 
                  : 'text-base-content/60 hover:text-error hover:bg-error/10'
              }`}
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button className="flex items-center gap-2 p-2 rounded-full text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all duration-200 group">
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments_count || 0}</span>
            </button>

            <button 
              onClick={handleRepost}
              className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 group ${
                isReposted 
                  ? 'text-success hover:bg-success/10' 
                  : 'text-base-content/60 hover:text-success hover:bg-success/10'
              }`}
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{repostsCount}</span>
            </button>

            <button className="flex items-center gap-2 p-2 rounded-full text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all duration-200 group">
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>

    {/* 删除确认对话框 */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
          <h3 className="text-lg font-semibold mb-2">删除动态</h3>
          <p className="text-base-content/70 mb-6">
            确定要删除这条动态吗？此操作无法撤销。
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 border border-base-300 rounded-lg hover:bg-base-200 transition-colors duration-200"
              disabled={isDeleting}
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-error text-error-content rounded-lg hover:bg-error/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '删除中...' : '删除'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}