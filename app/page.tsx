"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ArtworkGrid } from "@/components/artwork/artwork-grid"
import { SearchBar } from "@/components/search/search-bar"
import { SearchFilters } from "@/components/search/search-filters"
import { useImages, usePopularImages, useCategories, usePopularTags } from "@/lib/hooks/use-images"
import { useAuth } from "@/lib/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({})
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
    categories,
    isLoading: categoriesLoading
  } = useCategories()

  const {
    tags: popularTags,
    isLoading: tagsLoading
  } = usePopularTags(50)

  // 根据搜索状态决定显示的数据
  const displayImages = searchQuery || Object.keys(filters).length > 0 ? searchResults : popularImages
  const isLoading = searchQuery || Object.keys(filters).length > 0 ? searchLoading : popularLoading
  const error = searchQuery || Object.keys(filters).length > 0 ? searchError : popularError

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleLoadMore = () => {
    if (searchQuery || Object.keys(filters).length > 0) {
      loadMoreSearch()
    }
  }

  const handleRefresh = () => {
    if (searchQuery || Object.keys(filters).length > 0) {
      refreshSearch()
    } else {
      refreshPopular()
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* 搜索区域 */}
        <div className="bg-gradient-to-r from-background to-muted/20 rounded-xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              发现精彩作品
            </h1>
            <p className="text-muted-foreground">探索来自世界各地的艺术家的创意作品</p>
          </div>
          
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
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

        {/* 结果区域 */}
        <div className="space-y-6">
          {/* 结果标题 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-semibold">
                {searchQuery ? `搜索结果` : "热门作品"}
              </h2>
              <div className="text-sm text-muted-foreground mt-1">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : searchQuery ? (
                  `"${searchQuery}" - 找到 ${displayImages.length} 个结果`
                ) : (
                  `共 ${displayImages.length} 件作品`
                )}
              </div>
            </div>
            
            {/* 刷新按钮 */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "加载中..." : "刷新"}
            </button>
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
                onClick={handleRefresh}
                className="mt-2 text-sm text-primary hover:underline"
              >
                重试
              </button>
            </div>
          )}
          
          {/* 加载骨架屏 */}
          {isLoading && displayImages.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
          
          {/* 作品网格 */}
          {!isLoading && displayImages.length > 0 && (
            <>
              <ArtworkGrid artworks={displayImages} />
              
              {/* 加载更多按钮 */}
              {(searchQuery || Object.keys(filters).length > 0) && hasMoreSearch && (
                <div className="text-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={searchLoading}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {searchLoading ? "加载中..." : "加载更多"}
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* 无结果提示 */}
          {!isLoading && displayImages.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {searchQuery ? "没有找到相关作品" : "暂无作品"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery 
                      ? "尝试调整搜索关键词或筛选条件，或者浏览其他分类"
                      : "还没有用户上传作品，成为第一个分享者吧！"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
