"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { YouTubeSearchFilters } from "@/components/search/youtube-search-filters"
import { YouTubeSearchResults } from "@/components/search/youtube-search-results"
import { SearchEmptyState } from "@/components/search/search-empty-state"
import { useImages, useCategories, usePopularTags } from "@/lib/hooks/use-images"
import { useSearchHistory } from "@/hooks/use-search-history"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState<'created_at' | 'like_count' | 'view_count'>('created_at')
  const [timeRange, setTimeRange] = useState<string>('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 搜索历史
  const { addToHistory } = useSearchHistory()

  // 获取搜索结果
  const {
    images: searchResults,
    isLoading,
    error,
    loadMore,
    hasMore,
    refresh
  } = useImages({
    searchQuery,
    category: selectedCategories[0],
    tags: selectedTags,
    sortBy,
    limit: 20
  })

  // 获取分类和标签
  const { categories } = useCategories()
  const { tags: popularTags } = usePopularTags(30)

  // 更新 URL 和搜索历史
  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams()
      params.set("q", searchQuery)
      router.push(`/search?${params.toString()}`, { scroll: false })
      // 添加到搜索历史
      addToHistory(searchQuery)
    }
  }, [searchQuery, router, addToHistory])

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as 'created_at' | 'like_count' | 'view_count')
  }, [])

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value)
  }, [])

  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }, [])

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const handleClearFilters = useCallback(() => {
    setSortBy('created_at')
    setTimeRange('all')
    setSelectedCategories([])
    setSelectedTags([])
  }, [])

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* 返回按钮 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* YouTube 风格的筛选器 */}
        <YouTubeSearchFilters
          sortBy={sortBy}
          timeRange={timeRange}
          selectedCategories={selectedCategories}
          selectedTags={selectedTags}
          categories={categories.map(c => c.name)}
          popularTags={popularTags.map(t => t.name)}
          onSortChange={handleSortChange}
          onTimeRangeChange={handleTimeRangeChange}
          onCategoryToggle={handleCategoryToggle}
          onTagToggle={handleTagToggle}
          onClearFilters={handleClearFilters}
        />

        {/* 搜索结果统计 */}
        {searchQuery && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium">
                搜索结果：<span className="text-gray-600">&quot;{searchQuery}&quot;</span>
              </h1>
              {!isLoading && (
                <p className="text-sm text-gray-500 mt-1">
                  约 {searchResults.length} 个结果
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              刷新
            </Button>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && searchResults.length === 0 && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-60 h-36 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}



        {/* YouTube 风格的搜索结果 */}
        {!isLoading && searchResults.length > 0 && (
          <YouTubeSearchResults
            results={searchResults}
            onLoadMore={hasMore ? loadMore : undefined}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        )}

        {/* 错误状态 */}
        {error && (
          <SearchEmptyState
            type="error"
            onRetry={refresh}
          />
        )}

        {/* 无结果提示 */}
        {!isLoading && !error && searchResults.length === 0 && searchQuery && (
          <SearchEmptyState
            type="no-results"
            query={searchQuery}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* 初始状态提示 */}
        {!searchQuery && !error && (
          <SearchEmptyState type="no-query" />
        )}
      </div>
    </MainLayout>
  )
}
