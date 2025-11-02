"use client"

import { useState, useMemo, useCallback } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PixivGrid } from "@/components/artwork/pixiv-grid"
import { SearchBar } from "@/components/search/search-bar"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/search/search-filters"
import { useImages, usePopularImages, useCategories, usePopularTags } from "@/lib/hooks/use-images"
import { useAuth } from "@/lib/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock } from "lucide-react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFiltersType>({
    sortBy: 'created_at',
    timeRange: 'all',
    categories: [],
    tags: [],
    minLikes: 0,
    minViews: 0
  })
  const [viewMode, setViewMode] = useState<'popular' | 'recent' | 'search'>('popular')
  const { user } = useAuth()

  // 使用真实数据 hooks
  const {
    images: searchResults,
    isLoading: searchLoading,
    error: searchError,
    loadMore: loadMoreSearch,
    hasMore: hasMoreSearch,
    refresh: refreshSearch
  } = useImages({
    searchQuery,
    category: filters.categories?.[0],
    tags: filters.tags,
    sortBy: filters.sortBy || 'created_at',
    limit: 20
  })

  const {
    images: popularImages,
    isLoading: popularLoading,
    error: popularError,
    refresh: refreshPopular
  } = usePopularImages('week', 20)

  const {
    images: recentImages,
    isLoading: recentLoading,
    error: recentError,
    loadMore: loadMoreRecent,
    hasMore: hasMoreRecent,
    refresh: refreshRecent
  } = useImages({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 20
  })

  const {
    categories,
    isLoading: categoriesLoading
  } = useCategories()

  const {
    tags: popularTags,
    isLoading: tagsLoading
  } = usePopularTags(50)

  // 根据视图模式决定显示的数据
  const getDisplayData = () => {
    if (searchQuery || Object.keys(filters).length > 0) {
      return {
        images: searchResults,
        isLoading: searchLoading,
        error: searchError,
        loadMore: loadMoreSearch,
        hasMore: hasMoreSearch,
        refresh: refreshSearch
      }
    }
    
    switch (viewMode) {
      case 'recent':
        return {
          images: recentImages,
          isLoading: recentLoading,
          error: recentError,
          loadMore: loadMoreRecent,
          hasMore: hasMoreRecent,
          refresh: refreshRecent
        }
      case 'popular':
      default:
        return {
          images: popularImages,
          isLoading: popularLoading,
          error: popularError,
          loadMore: () => {},
          hasMore: false,
          refresh: refreshPopular
        }
    }
  }

  const { images, isLoading, error, loadMore, hasMore, refresh } = getDisplayData()

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters)
  }, [])

  const handleViewModeChange = useCallback((mode: 'popular' | 'recent' | 'search') => {
    setViewMode(mode)
    setSearchQuery("")
    setFilters({
      sortBy: 'created_at',
      timeRange: 'all',
      categories: [],
      tags: [],
      minLikes: 0,
      minViews: 0
    })
  }, [])

  const isSearchMode = useMemo(() => 
    searchQuery || Object.keys(filters).length > 0, 
    [searchQuery, filters]
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Pixiv风格的顶部横幅 */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                发现创意世界
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                探索来自全球艺术家的精彩作品，发现无限创意灵感
              </p>
            </div>
            
            {/* 搜索栏 */}
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            {/* 筛选器 */}
            <SearchFilters 
              onFiltersChange={handleFiltersChange}
              categories={categories.map(c => c.name)}
              popularTags={popularTags.map(t => t.name)}
              loading={categoriesLoading || tagsLoading}
            />
          </div>
        </div>

        {/* 视图模式切换 */}
        {!isSearchMode && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('popular')}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>热门作品</span>
              </Button>
              <Button
                variant={viewMode === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('recent')}
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>最新作品</span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? "刷新中..." : "刷新"}
            </Button>
          </div>
        )}

        {/* 结果标题 */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center space-x-2">
              {isSearchMode ? (
                <>
                  <span>搜索结果</span>
                  {searchQuery && <Badge variant="secondary">&quot;{searchQuery}&quot;</Badge>}
                </>
              ) : viewMode === 'popular' ? (
                <>
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <span>本周热门</span>
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 text-blue-500" />
                  <span>最新发布</span>
                </>
              )}
            </h2>
            <div className="text-sm text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `共 ${images.length} 件作品`
              )}
            </div>
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">加载失败</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm text-primary hover:underline"
            >
              重试
            </button>
          </div>
        )}
        
        {/* 加载骨架屏 */}
        {isLoading && images.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pixiv风格作品网格 */}
        {!isLoading && images.length > 0 && (
          <PixivGrid
            artworks={images}
            onLoadMore={hasMore ? loadMore : undefined}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        )}
        
        {/* 无结果提示 */}
        {!isLoading && images.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {isSearchMode ? "没有找到相关作品" : "暂无作品"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSearchMode 
                    ? "尝试调整搜索关键词或筛选条件，或者浏览其他分类"
                    : "还没有用户上传作品，成为第一个分享者吧！"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}