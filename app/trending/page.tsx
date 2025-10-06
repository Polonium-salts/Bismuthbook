'use client'

import { useState, useEffect } from 'react'
import { PixivStyleGrid } from '@/components/artwork/PixivStyleGrid'
import { supabase } from '@/lib/supabase'
import { Flame, TrendingUp, Calendar, Filter, SortAsc, Grid, List } from 'lucide-react'
import type { Artwork } from '@/lib/supabase'

interface ArtworkWithUser extends Artwork {
  users: {
    id: string
    username: string
    avatar_url?: string
  }
}

type TrendingPeriod = 'today' | 'week' | 'month'
type SortType = 'likes' | 'views' | 'recent' | 'random'
type ViewMode = 'grid' | 'list'

export default function TrendingPage() {
  const [artworks, setArtworks] = useState<ArtworkWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<TrendingPeriod>('week')
  const [sortType, setSortType] = useState<SortType>('likes')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setPage(1)
    setArtworks([])
    setHasMore(true)
    fetchTrendingArtworks(true)
  }, [period, sortType])

  const fetchTrendingArtworks = async (reset = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const currentPage = reset ? 1 : page
      const limit = 20
      const offset = (currentPage - 1) * limit

      let query = supabase
        .from('artworks')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('is_public', true)

      // 根据时间段筛选
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      query = query.gte('created_at', startDate.toISOString())

      // 根据排序类型排序
      switch (sortType) {
        case 'likes':
          query = query.order('likes_count', { ascending: false })
          break
        case 'views':
          query = query.order('views_count', { ascending: false })
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'random':
          // 简单的随机排序，实际项目中可能需要更复杂的实现
          query = query.order('id', { ascending: Math.random() > 0.5 })
          break
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1)

      if (error) throw error
      
      const newArtworks = data || []
      
      if (reset) {
        setArtworks(newArtworks)
        setPage(2)
      } else {
        setArtworks(prev => [...prev, ...newArtworks])
        setPage(prev => prev + 1)
      }
      
      setHasMore(newArtworks.length === limit)
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
    // 这里可以实现点赞功能
    console.log('点赞作品:', postId)
  }

  const handleBookmark = async (postId: string) => {
    // 这里可以实现收藏功能
    console.log('收藏作品:', postId)
  }

  const getPeriodLabel = (period: TrendingPeriod) => {
    switch (period) {
      case 'today': return '今日'
      case 'week': return '本周'
      case 'month': return '本月'
    }
  }

  const getPeriodIcon = (period: TrendingPeriod) => {
    switch (period) {
      case 'today': return <Calendar className="w-4 h-4" />
      case 'week': return <TrendingUp className="w-4 h-4" />
      case 'month': return <Flame className="w-4 h-4" />
    }
  }

  const getSortLabel = (sort: SortType) => {
    switch (sort) {
      case 'likes': return '最多点赞'
      case 'views': return '最多浏览'
      case 'recent': return '最新发布'
      case 'random': return '随机排序'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                热门作品
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                发现最受欢迎的艺术作品
              </p>
            </div>
          </div>
        </div>

        {/* 筛选和排序控件 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-4">
            {/* 时间段选择 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">时间段:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['today', 'week', 'month'] as TrendingPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      period === p 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getPeriodIcon(p)}
                    <span>{getPeriodLabel(p)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 排序选择 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">排序:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['likes', 'views', 'recent', 'random'] as SortType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortType(s)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      sortType === s 
                        ? 'bg-green-500 text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getSortLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        {!loading && artworks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Flame className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">热门作品</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{artworks.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总点赞数</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {artworks.reduce((sum, artwork) => sum + (artwork.likes_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">时间段</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{getPeriodLabel(period)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 作品网格 */}
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
  )
}