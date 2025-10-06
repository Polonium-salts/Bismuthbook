'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { api, type Post } from '@/lib/supabase'

// Post类型已从supabase导入

interface PostFeedProps {
  refreshTrigger?: number
}

export function PostFeed({ refreshTrigger }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // 从API加载帖子数据
  const loadPostsFromAPI = async (pageNum: number = 1): Promise<Post[]> => {
    try {
      const offset = (pageNum - 1) * 10
      const posts = await api.getPosts(10, offset)
      const postsArray = Array.isArray(posts) ? posts : []
      return postsArray
    } catch (error) {
      console.error('加载帖子失败:', error)
      return []
    }
  }

  const loadPosts = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const newPosts = await loadPostsFromAPI(pageNum)
      const postsArray = Array.isArray(newPosts) ? newPosts : []
      
      if (isRefresh || pageNum === 1) {
        setPosts(postsArray)
        setPage(2)
        setHasMore(postsArray.length === 10) // 如果返回的帖子数量少于10，说明没有更多数据
      } else {
        setPosts(prev => [...prev, ...postsArray])
        setPage(prev => prev + 1)
        setHasMore(postsArray.length === 10)
      }

    } catch (error) {
      console.error('加载动态失败:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadPosts(1, true)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }

  // 获取当前用户信息
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.getCurrentUser()
        setCurrentUserId(user?.id || null)
      } catch (error) {
        console.error('获取当前用户失败:', error)
      }
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    loadPosts(1)
  }, [])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      handleRefresh()
    }
  }, [refreshTrigger])

  // 无限滚动
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page])

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-base-100 border-b border-base-200/50 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-base-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-base-200 rounded w-24"></div>
                  <div className="h-4 bg-base-200 rounded w-20"></div>
                  <div className="h-4 bg-base-200 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-base-200 rounded w-full"></div>
                  <div className="h-4 bg-base-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-8 mt-4">
                  <div className="h-8 bg-base-200 rounded w-16"></div>
                  <div className="h-8 bg-base-200 rounded w-16"></div>
                  <div className="h-8 bg-base-200 rounded w-16"></div>
                  <div className="h-8 bg-base-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* 刷新按钮 */}
      <div className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-sm border-b border-base-200/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-base-content">最新动态</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-full transition-all duration-200 ${
              refreshing 
                ? 'text-base-content/40 cursor-not-allowed' 
                : 'text-base-content/60 hover:text-primary hover:bg-primary/10'
            }`}
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 动态列表 */}
      <div className="divide-y divide-base-200/50">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={currentUserId}
            onDelete={handleDeletePost}
          />
        ))}
      </div>

      {/* 加载更多 */}
      {loading && posts.length > 0 && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 text-base-content/60">
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      )}

      {/* 没有更多数据 */}
      {!hasMore && posts.length > 0 && (
        <div className="p-8 text-center text-base-content/60">
          <p>已经到底了，没有更多动态了</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && posts.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-base-content/40 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content/60 mb-2">还没有动态</h3>
          <p className="text-base-content/40">成为第一个分享动态的人吧！</p>
        </div>
      )}
    </div>
  )
}