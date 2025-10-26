"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PixivGrid } from "@/components/artwork/pixiv-grid"
import { SearchBar } from "@/components/search/search-bar"
import { useImages, useCategories } from "@/lib/hooks/use-images"
import { useAuth } from "@/lib/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid, List, Filter, Search } from "lucide-react"

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { user } = useAuth()

  // 获取分类数据
  const {
    categories,
    isLoading: categoriesLoading
  } = useCategories()

  // 获取图片数据
  const {
    images,
    isLoading,
    error,
    loadMore,
    hasMore,
    refresh,
    loadImages
  } = useImages({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 20
  })

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // 处理分类切换
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // 当分类或搜索条件改变时重新加载数据
  useEffect(() => {
    loadImages({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      searchQuery: searchQuery || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 20
    })
  }, [selectedCategory, searchQuery, loadImages])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题和搜索 */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                作品画廊
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                按分类浏览精彩作品，发现您感兴趣的创意内容
              </p>
            </div>
            
            {/* 搜索栏 */}
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* 分类标签和视图控制 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
              className="rounded-full"
            >
              全部
            </Button>
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))
            ) : (
              categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.name)}
                  className="rounded-full"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))
            )}
          </div>

          {/* 视图控制 */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? "刷新中..." : "刷新"}
            </Button>
          </div>
        </div>

        {/* 结果统计 */}
        {!isLoading && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {searchQuery ? (
                `搜索 "${searchQuery}" 在 ${selectedCategory === 'all' ? '全部分类' : selectedCategory} 中找到 ${images.length} 件作品`
              ) : (
                `${selectedCategory === 'all' ? '全部分类' : selectedCategory} 共 ${images.length} 件作品`
              )}
            </div>
          </div>
        )}
        
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
        
        {/* 作品网格 */}
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
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {searchQuery ? "没有找到相关作品" : "该分类暂无作品"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery 
                    ? "尝试调整搜索关键词或选择其他分类"
                    : "还没有用户在此分类上传作品，成为第一个分享者吧！"
                  }
                </p>
              </div>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  清除搜索
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}