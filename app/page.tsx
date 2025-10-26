"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PixivGrid } from "@/components/artwork/pixiv-grid"
import { SearchBar } from "@/components/search/search-bar"
import { SearchFilters } from "@/components/search/search-filters"
import { useImages, usePopularImages, useCategories, usePopularTags } from "@/lib/hooks/use-images"
import { useAuth } from "@/lib/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Heart, Eye, ArrowDown, ArrowUp } from "lucide-react"

export default function Home() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'popular' | 'recent'>('popular')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'created_at' | 'like_count' | 'view_count'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 根据视图模式选择对应的 hook
  const popularHook = usePopularImages()
  const recentHook = useImages({
    category: selectedCategory,
    tags: selectedTags,
    search: searchQuery,
    sortBy,
    sortOrder
  })

  // 根据当前视图模式选择数据源
  const currentHook = viewMode === 'popular' ? popularHook : recentHook
  const { images, isLoading, error, hasMore, loadMore, refresh } = currentHook

  // 获取分类和标签数据
  const { categories, loading: categoriesLoading } = useCategories()
  const { tags, loading: tagsLoading } = usePopularTags()

  // 判断是否为搜索模式
  const isSearchMode = searchQuery.trim() !== "" || selectedCategory !== "" || selectedTags.length > 0

  const handleViewModeChange = (mode: 'popular' | 'recent') => {
    setViewMode(mode)
    // 切换模式时清空搜索条件
    if (mode === 'popular') {
      setSearchQuery("")
      setSelectedCategory("")
      setSelectedTags([])
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // 搜索时自动切换到最新模式
    if (query.trim() !== "") {
      setViewMode('recent')
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // 选择分类时自动切换到最新模式
    if (category !== "") {
      setViewMode('recent')
    }
  }

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)
    // 选择标签时自动切换到最新模式
    if (tags.length > 0) {
      setViewMode('recent')
    }
  }

  const handleSortChange = (field: 'created_at' | 'like_count' | 'view_count') => {
    if (sortBy === field) {
      // 如果点击的是当前排序字段，切换排序方向
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      // 如果点击的是新字段，设置为该字段并默认降序
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortLabel = (field: 'created_at' | 'like_count' | 'view_count') => {
    switch (field) {
      case 'created_at':
        return '时间'
      case 'like_count':
        return '点赞'
      case 'view_count':
        return '浏览'
      default:
        return ''
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 搜索和筛选区域 */}
        <div className="space-y-4">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-border/50">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="搜索作品标题、描述或标签..."
              className="w-full"
            />
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-border/50">
            <SearchFilters
              categories={categories}
              tags={tags}
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              onCategoryChange={handleCategoryChange}
              onTagsChange={handleTagsChange}
              loading={categoriesLoading || tagsLoading}
            />
          </div>
        </div>

        {/* 视图模式切换 */}
        {!isSearchMode && (
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-border/50">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center md:justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {viewMode === 'popular' ? (
                    <TrendingUp className="w-4 h-4 text-white" />
                  ) : (
                    <Clock className="w-4 h-4 text-white" />
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {viewMode === 'popular' ? '热门作品' : '最新作品'}
                </h2>
                {(images.length > 0 || isLoading) && (
                  <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/30">
                    {isLoading ? '加载中...' : `${images.length} 件作品`}
                  </span>
                )}
              </div>

              <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                {/* 视图模式切换 */}
                <div className="flex items-center bg-muted/30 rounded-xl p-1 border border-border/30">
                  <Button
                    variant={viewMode === 'popular' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('popular')}
                    className={`transition-all duration-300 rounded-lg ${
                      viewMode === 'popular' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    热门
                  </Button>
                  <Button
                    variant={viewMode === 'recent' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('recent')}
                    className={`transition-all duration-300 rounded-lg ${
                      viewMode === 'recent' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    最新
                  </Button>
                </div>

                {/* 排序控件 */}
                <div className="flex items-center bg-muted/30 rounded-xl p-1 border border-border/30">
                  {(['created_at', 'like_count', 'view_count'] as const).map((field) => (
                    <Button
                      key={field}
                      variant={sortBy === field ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleSortChange(field)}
                      className={`transition-all duration-300 rounded-lg ${
                        sortBy === field 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {field === 'created_at' && <Clock className="w-3 h-3 mr-1" />}
                      {field === 'like_count' && <Heart className="w-3 h-3 mr-1" />}
                      {field === 'view_count' && <Eye className="w-3 h-3 mr-1" />}
                      <span className="text-xs md:text-sm">{getSortLabel(field)}</span>
                      {sortBy === field && (
                        sortOrder === 'desc' ? 
                          <ArrowDown className="w-3 h-3 ml-1" /> : 
                          <ArrowUp className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>

                {/* 刷新按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                  className="hover:bg-muted/50 transition-all duration-300"
                >
                  {isLoading ? "刷新中..." : "刷新"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 结果标题 */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center space-x-2">
              {isSearchMode ? (
                <>
                  <span>搜索结果</span>
                  {searchQuery && <Badge variant="secondary">"{searchQuery}"</Badge>}
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
        
        {/* 错误状态 */}
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
        
        {/* 加载状态 */}
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
        
        {/* 作品网格 */}
        {!isLoading && images.length > 0 && (
          <PixivGrid
            artworks={images}
            onLoadMore={hasMore ? loadMore : undefined}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        )}
        
        {/* 空状态 */}
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