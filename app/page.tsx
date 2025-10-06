'use client'

import { useState, useEffect } from 'react'
import { PixivStyleGrid } from '@/components/artwork/PixivStyleGrid'
import { PixivPageTransition } from '@/components/ui/PixivLoader'
import { supabase } from '@/lib/supabase'
import type { Artwork } from '@/lib/supabase'
import { Flame, TrendingUp, Calendar, Clock, Heart, Eye, SortAsc, Filter, Grid, List, Search } from 'lucide-react'

type Period = 'daily' | 'weekly' | 'monthly' | 'all'
type SortType = 'likes' | 'views' | 'recent' | 'random'

export default function HomePage() {
  const [artworks, setArtworks] = useState<(Artwork & {
    users?: {
      id: string
      username: string
      avatar_url?: string
    }
  })[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('daily')
  const [sortType, setSortType] = useState<SortType>('likes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTrendingArtworks(true)
  }, [period, sortType])

  const fetchTrendingArtworks = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const limit = 20
      const offset = (currentPage - 1) * limit

      // 计算时间范围
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'all':
        default:
          startDate = new Date(0) // 从最早开始
          break
      }

      // 使用posts_with_details视图获取带有用户信息和统计数据的帖子
      let query = supabase
        .from('posts_with_details')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .not('image_urls', 'is', null) // 只获取有图片的帖子
        .range(offset, offset + limit - 1)

      // 根据排序类型添加排序
      switch (sortType) {
        case 'likes':
          query = query.order('likes_count', { ascending: false })
          break
        case 'views':
          // posts表没有views_count，使用likes_count作为替代
          query = query.order('likes_count', { ascending: false })
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'random':
          // 注意：这里使用简单的随机排序，实际应用中可能需要更复杂的逻辑
          query = query.order('id', { ascending: Math.random() > 0.5 })
          break
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching trending artworks:', error)
        return
      }

      // 将posts数据映射为Artwork格式
      const mappedArtworks: Artwork[] = (data || []).map(post => ({
        id: post.id!,
        user_id: post.user_id!,
        title: post.content?.substring(0, 50) || '', // 使用内容的前50个字符作为标题
        description: post.content || '',
        image_urls: post.image_urls || [],
        image_url: post.image_urls?.[0] || '',
        thumbnail_url: post.image_urls?.[0] || '',
        likes_count: post.likes_count || 0,
        views_count: post.likes_count || 0, // 使用likes_count作为views_count的替代
        comments_count: post.comments_count || 0,
        is_public: true,
        created_at: post.created_at!,
        updated_at: post.updated_at!,
        users: {
          id: post.user_id!,
          username: post.username || '',
          avatar_url: post.avatar_url || undefined
        }
      }))

      if (reset) {
        setArtworks(mappedArtworks)
        setPage(2)
      } else {
        setArtworks(prev => [...prev, ...mappedArtworks])
        setPage(prev => prev + 1)
      }

      setHasMore(mappedArtworks.length === limit)
    } catch (error) {
      console.error('Error fetching trending artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTrendingArtworks(false)
    }
  }

  const handleLike = async (postId: string) => {
    // 这里应该实现点赞逻辑
    console.log('点赞作品:', postId)
  }

  const handleBookmark = async (postId: string) => {
    // 这里应该实现收藏逻辑
    console.log('收藏作品:', postId)
  }

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'daily': return '今日'
      case 'weekly': return '本周'
      case 'monthly': return '本月'
      case 'all': return '全部'
    }
  }

  const getSortLabel = (s: SortType) => {
    switch (s) {
      case 'likes': return '点赞数'
      case 'views': return '浏览量'
      case 'recent': return '最新'
      case 'random': return '随机'
    }
  }

  // 移除全屏加载器，改为在页面内显示骨架屏

  return (
    <PixivPageTransition>
      <div className="page-enter min-h-screen bg-base-100">
      {/* Pixiv风格的顶部横幅 */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              发现精彩作品
            </h1>
            <p className="text-xl opacity-90 mb-8">
              探索来自全球创作者的优秀艺术作品
            </p>
            
            {/* 搜索栏 */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索作品、标签或创作者..."
                  className="search-input w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 筛选栏 - Pixiv风格 */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between">
            {/* 左侧筛选选项 */}
            <div className="flex items-center gap-6">
              {/* 时间段选择 */}
              <div className="flex items-center gap-2">
                {(['daily', 'weekly', 'monthly', 'all'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`filter-button pixiv-button px-4 py-2 text-sm font-medium rounded-full ${
                      period === p 
                        ? 'active bg-blue-500 text-white shadow-md' 
                        : 'text-base-content/70 hover:text-blue-500 hover:bg-base-200'
                    }`}
                  >
                    {getPeriodLabel(p)}
                  </button>
                ))}
              </div>

              {/* 分隔线 */}
              <div className="w-px h-6 bg-base-300"></div>

              {/* 排序选择 */}
              <div className="flex items-center gap-2">
                {(['likes', 'views', 'recent'] as SortType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortType(s)}
                    className={`filter-button pixiv-button px-3 py-2 text-sm font-medium rounded-full ${
                      sortType === s 
                        ? 'active bg-base-content text-base-100' 
                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                    }`}
                  >
                    {getSortLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧控制按钮 */}
            <div className="flex items-center gap-3">
              {/* 视图模式切换 */}
              <div className="flex items-center bg-base-200 rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-base-100 text-base-content shadow-sm'
                      : 'text-base-content/50 hover:text-base-content/70'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-base-100 text-base-content shadow-sm'
                      : 'text-base-content/50 hover:text-base-content/70'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* 筛选按钮 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-full transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>
          </div>

          {/* 展开的筛选选项 */}
          {showFilters && (
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    作品类型
                  </label>
                  <select className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content">
                    <option>全部</option>
                    <option>插画</option>
                    <option>漫画</option>
                    <option>动画</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    标签
                  </label>
                  <input
                    type="text"
                    placeholder="输入标签..."
                    className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    最小点赞数
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 作品网格 */}
        <div className="py-8">
          <PixivStyleGrid 
            artworks={artworks}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onLike={handleLike}
            onBookmark={handleBookmark}
          />
        </div>
      </div>
      </div>
    </PixivPageTransition>
  )
}
