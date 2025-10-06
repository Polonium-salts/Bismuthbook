'use client'

import { useState, useEffect } from 'react'
import { ArtworkGrid } from '@/components/artwork/ArtworkGrid'
import { supabase } from '@/lib/supabase'
import { Clock, Sparkles, Calendar, Filter } from 'lucide-react'
import type { Post } from '@/lib/supabase'

interface PostWithUser extends Post {
  user_email: string
  username: string
  display_name: string
  avatar_url?: string
}

type SortOption = 'newest' | 'updated' | 'popular_recent'

export default function LatestPage() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchLatestPosts()
  }, [sortBy])

  const fetchLatestPosts = async () => {
    setLoading(true)
    try {
      // 使用与首页相同的RPC函数获取数据
      const { data, error } = await supabase.rpc('get_public_feed', {
        user_id_param: null,
        limit_param: 100, // 增加获取数量以确保有足够的作品内容
        offset_param: 0
      })

      if (error) throw error
      
      let allData = data || []
      
      // 过滤出只有图片的作品内容（排除纯文字动态）
      const artworkPosts = allData.filter((post: any) => {
        return post.image_urls && 
               Array.isArray(post.image_urls) && 
               post.image_urls.length > 0 &&
               post.image_urls[0] !== null &&
               post.image_urls[0] !== ''
      })
      
      let sortedData = artworkPosts
      
      // 根据排序方式处理数据
      switch (sortBy) {
        case 'newest':
          // 默认已经按created_at降序排列
          break
        case 'updated':
          sortedData = sortedData.sort((a: any, b: any) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          break
        case 'popular_recent':
          // 最近7天内的热门作品
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          sortedData = sortedData
            .filter((post: any) => new Date(post.created_at) >= weekAgo)
            .sort((a: any, b: any) => {
              // 先按点赞数排序，再按创建时间排序
              if (b.likes_count !== a.likes_count) {
                return b.likes_count - a.likes_count
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
          break
      }
      
      // 限制最终显示的作品数量
      setPosts(sortedData.slice(0, 50))
    } catch (error) {
      console.error('Error fetching latest posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return '最新发布'
      case 'updated': return '最近更新'
      case 'popular_recent': return '近期热门'
    }
  }

  const getSortIcon = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return <Sparkles className="w-4 h-4" />
      case 'updated': return <Clock className="w-4 h-4" />
      case 'popular_recent': return <Calendar className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return '刚刚'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-base-content">
              最新作品
            </h1>
            <p className="text-base-content/70 text-sm md:text-base">
              发现最新发布的艺术作品
            </p>
          </div>
        </div>

        {/* 筛选按钮 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline btn-sm gap-2"
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="bg-base-100 rounded-lg p-4 border border-base-200 shadow-md">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-base-content/70 mr-2">排序方式:</span>
            {(['newest', 'updated', 'popular_recent'] as SortOption[]).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`btn btn-sm ${
                  sortBy === sort 
                    ? 'btn-primary' 
                    : 'btn-outline hover:btn-primary'
                } transition-all duration-200`}
              >
                {getSortIcon(sort)}
                {getSortLabel(sort)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {!loading && (
        <div className="stats shadow-md bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="stat-title">最新作品</div>
            <div className="stat-value text-primary">{posts.length}</div>
            <div className="stat-desc">{getSortLabel(sortBy)}</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Clock className="w-8 h-8" />
            </div>
            <div className="stat-title">最新发布</div>
            <div className="stat-value text-secondary">
              {posts.length > 0 ? formatTimeAgo(posts[0].created_at) : '-'}
            </div>
            <div className="stat-desc">最近一次更新</div>
          </div>
        </div>
      )}

      {/* 作品网格 */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card bg-base-200 animate-pulse">
                <div className="aspect-square bg-base-300 rounded-t-lg"></div>
                <div className="card-body p-3 md:p-4">
                  <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {posts.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200 border border-base-200 hover:-translate-y-1">
                <figure className="aspect-square relative overflow-hidden">
                  <img
                    src={post.image_urls[0]}
                    alt={post.content.split('\n')[0] || '作品'}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 badge badge-secondary badge-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    新
                  </div>
                  <div className="absolute bottom-2 left-2 badge badge-ghost badge-sm bg-black/50 text-white border-none">
                    {formatTimeAgo(post.created_at)}
                  </div>
                </figure>
                <div className="card-body p-3 md:p-4 bg-base-50">
                  <h3 className="card-title text-sm md:text-base text-base-content line-clamp-2">
                    {post.content.split('\n')[0] || '无标题'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="avatar">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                        <span className="text-xs font-medium text-primary-content">
                          {post.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs md:text-sm text-base-content/80 font-medium">
                      {post.username || '未知用户'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-base-200">
                    <div className="flex items-center gap-3 text-xs text-base-content/70 font-medium">
                      <span>❤️ {post.likes_count || 0}</span>
                      <span>💬 {post.comments_count || 0}</span>
                    </div>
                    {post.content.includes('标签:') && (
                      <div className="badge badge-outline badge-xs">
                        #{post.content.split('标签:')[1]?.split('\n')[0]?.trim() || ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-base-content/70 mb-2">
              暂无最新作品
            </h3>
            <p className="text-base-content/50">
              等待艺术家们的精彩创作
            </p>
          </div>
        )}
      </div>
    </div>
  )
}