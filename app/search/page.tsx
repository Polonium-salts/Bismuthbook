'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Search, Filter, Grid, List, Heart, Eye, MessageCircle } from 'lucide-react'
import type { Artwork } from '@/lib/supabase'

interface ArtworkWithUser extends Artwork {
  users: {
    id: string
    username: string
    avatar_url?: string
  }
}

type SortOption = 'latest' | 'popular' | 'views' | 'likes'
type ViewMode = 'grid' | 'list'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [artworks, setArtworks] = useState<ArtworkWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [popularTags, setPopularTags] = useState<string[]>([])

  useEffect(() => {
    fetchArtworks()
    fetchPopularTags()
  }, [searchQuery, selectedTag, sortBy])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''
    setSearchQuery(q)
    setSelectedTag(tag)
  }, [searchParams])

  const fetchArtworks = async () => {
    setLoading(true)
    try {
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

      // 搜索条件
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      if (selectedTag) {
        query = query.contains('tags', [selectedTag])
      }

      // 排序
      switch (sortBy) {
        case 'popular':
          query = query.order('likes_count', { ascending: false })
          break
        case 'views':
          query = query.order('views_count', { ascending: false })
          break
        case 'likes':
          query = query.order('likes_count', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setArtworks(data || [])
    } catch (err) {
      console.error('搜索失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularTags = async () => {
    try {
      // 这里简化处理，实际应该统计标签使用频率
      const { data, error } = await supabase
        .from('artworks')
        .select('tags')
        .eq('is_public', true)
        .not('tags', 'is', null)
        .limit(100)

      if (error) throw error

      const tagCounts: { [key: string]: number } = {}
      data?.forEach(artwork => {
        artwork.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag]) => tag)

      setPopularTags(sortedTags)
    } catch (err) {
      console.error('获取热门标签失败:', err)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedTag) params.set('tag', selectedTag)
    
    const url = `/search${params.toString() ? `?${params.toString()}` : ''}`
    router.push(url)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTag('')
    router.push('/search')
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    params.set('tag', tag)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* 搜索头部 */}
      <div className="mb-6 md:mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
            <input
              type="text"
              className="input input-bordered w-full pl-10 text-sm md:text-base"
              placeholder="搜索作品、标题、描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm md:btn-md">
            <span className="hidden sm:inline">搜索</span>
            <span className="sm:hidden">搜索</span>
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm md:btn-md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">筛选</span>
          </button>
        </form>

        {/* 当前搜索条件 */}
        {(searchQuery || selectedTag) && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-base-content/70">当前搜索:</span>
            {searchQuery && (
              <div className="badge badge-primary gap-2">
                关键词: {searchQuery}
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSearchQuery('')
                    updateURL()
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {selectedTag && (
              <div className="badge badge-secondary gap-2">
                标签: {selectedTag}
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSelectedTag('')
                    updateURL()
                  }}
                >
                  ×
                </button>
              </div>
            )}
            <button className="btn btn-ghost btn-xs" onClick={clearFilters}>
              清除所有
            </button>
          </div>
        )}

        {/* 筛选面板 */}
        {showFilters && (
          <div className="bg-base-100 rounded-lg p-3 md:p-4 mb-4 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {/* 排序选项 */}
              <div>
                <label className="label">
                  <span className="label-text font-medium text-sm md:text-base">排序方式</span>
                </label>
                <select
                  className="select select-bordered w-full select-sm md:select-md"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="latest">最新发布</option>
                  <option value="popular">最受欢迎</option>
                  <option value="views">浏览最多</option>
                  <option value="likes">点赞最多</option>
                </select>
              </div>

              {/* 视图模式 */}
              <div>
                <label className="label">
                  <span className="label-text font-medium text-sm md:text-base">视图模式</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm md:btn-md ${viewMode === 'grid' ? 'btn-active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">网格</span>
                  </button>
                  <button
                    className={`btn btn-sm md:btn-md ${viewMode === 'list' ? 'btn-active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">列表</span>
                  </button>
                </div>
              </div>

              {/* 时间范围 */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="label">
                  <span className="label-text font-medium text-sm md:text-base">时间范围</span>
                </label>
                <select
                  className="select select-bordered w-full select-sm md:select-md"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="all">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">本周</option>
                  <option value="month">本月</option>
                  <option value="year">今年</option>
                </select>
              </div>
            </div>

            {/* 热门标签 */}
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-medium text-sm md:text-base">热门标签</span>
              </label>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    className={`badge badge-sm md:badge-md ${
                      selectedTag === tag ? 'badge-primary' : 'badge-outline'
                    } hover:badge-primary transition-colors cursor-pointer`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 结果统计 */}
        <div className="flex items-center justify-between">
          <p className="text-base-content/70">
            {loading ? '搜索中...' : `找到 ${artworks.length} 个结果`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/70">视图:</span>
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${viewMode === 'grid' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                className={`btn ${viewMode === 'list' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-base-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : artworks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/artwork/${artwork.id}`}
                className="group relative aspect-square rounded-lg overflow-hidden bg-base-200 hover:shadow-lg transition-all duration-200"
              >
                <Image
                  src={artwork.image_url}
                  alt={artwork.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* 悬停时显示的信息 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                  <div>
                    <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                      {artwork.title}
                    </h3>
                    <p className="text-white/80 text-xs">
                      by {artwork.users.username}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{artwork.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{artwork.views_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{artwork.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="bg-base-100 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-base-200">
                <div className="flex gap-4">
                  <Link href={`/artwork/${artwork.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-base-200">
                      <Image
                        src={artwork.image_url}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          href={`/artwork/${artwork.id}`}
                          className="text-lg font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {artwork.title}
                        </Link>
                        <Link
                          href={`/user/${artwork.users.username}`}
                          className="text-sm text-base-content/70 hover:text-primary transition-colors"
                        >
                          by {artwork.users.username}
                        </Link>
                      </div>
                      <div className="text-sm text-base-content/50">
                        {new Date(artwork.created_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    
                    {artwork.description && (
                      <p className="text-base-content/80 text-sm line-clamp-2 mb-2">
                        {artwork.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-base-content/70">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{artwork.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{artwork.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{artwork.comments_count || 0}</span>
                        </div>
                      </div>
                      
                      {artwork.tags && artwork.tags.length > 0 && (
                        <div className="flex gap-1">
                          {artwork.tags.slice(0, 3).map((tag, index) => (
                            <button
                              key={index}
                              className="badge badge-outline badge-sm hover:badge-primary transition-colors"
                              onClick={() => handleTagClick(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                          {artwork.tags.length > 3 && (
                            <span className="text-xs text-base-content/50">
                              +{artwork.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">没有找到相关作品</h2>
          <p className="text-base-content/70 mb-4">
            尝试使用不同的关键词或浏览热门标签
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                className="badge badge-outline hover:badge-primary transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}