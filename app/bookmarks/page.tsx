"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { ImageCard } from "@/components/image/image-card"
import { useAuth } from "@/lib/providers/auth-provider"
import { interactionService } from "@/lib/services/interaction-service"
import { imageService } from "@/lib/services/image-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, RefreshCcw, Grid3X3, List, Eye, MessageCircle, User } from "lucide-react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { supabase } from "@/lib/supabase"

const PAGE_LIMIT = 20

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth()
  const [favoriteImages, setFavoriteImages] = useState<ImageWithUserAndStats[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const isUnauthenticated = useMemo(() => !authLoading && !user, [authLoading, user])

  const loadFavoriteImages = useCallback(async (append = false) => {
    if (!user) return
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = append ? offset : 0
      
      // 获取用户收藏的图片
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`
          created_at,
          images (
            id,
            title,
            description,
            image_url,
            created_at,
            user_id,
            tags,
            category,
            like_count,
            view_count,
            comment_count,
            is_featured,
            user_profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_LIMIT - 1)

      if (favoritesError) throw favoritesError

      // 转换数据格式并处理图片 URL
      const images: ImageWithUserAndStats[] = favoritesData
        .filter(fav => fav.images) // 确保图片存在
        .map(fav => ({
          ...fav.images,
          image_url: imageService.getImageUrl(fav.images.image_url), // 转换存储路径为公共 URL
          user_profiles: {
            ...fav.images.user_profiles,
            bio: null,
            created_at: null,
            updated_at: null,
            website: null
          },
          is_liked: false, // 需要单独查询用户是否点赞
          is_favorited: true, // 收藏的图片默认为已收藏
          likes: [], // 空数组，实际数据通过 useInteractions 获取
          favorites: [], // 空数组，实际数据通过 useInteractions 获取
          comments: [], // 空数组，实际数据通过 useComments 获取
          is_published: true, // 默认为已发布
          published_at: fav.images.created_at // 使用创建时间作为发布时间
        })) as ImageWithUserAndStats[]

      if (append) {
        setFavoriteImages(prev => {
          const existing = new Set(prev.map(img => img.id))
          const merged = [...prev, ...images.filter(img => !existing.has(img.id))]
          return merged
        })
      } else {
        setFavoriteImages(images)
        setOffset(0)
      }

      setOffset(currentOffset + PAGE_LIMIT)
      setHasMore(images.length === PAGE_LIMIT)
    } catch (err) {
      console.error('Error loading favorite images:', err)
      setError(err instanceof Error ? err.message : '加载收藏图片失败')
    } finally {
      setIsLoading(false)
    }
  }, [user, isLoading, offset])

  const refresh = useCallback(async () => {
    setOffset(0)
    await loadFavoriteImages(false)
  }, [loadFavoriteImages])

  const handleImageClick = useCallback((image: ImageWithUserAndStats) => {
    // 可以在这里处理图片点击事件，比如打开详情页
    console.log('Image clicked:', image.id)
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      loadFavoriteImages(false)
    }
  }, [authLoading, user, loadFavoriteImages])

  if (authLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isUnauthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <Heart className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">请先登录以查看收藏</h2>
          <p className="text-muted-foreground">登录后可查看你收藏的作品。</p>
        </div>
      </MainLayout>
    )
  }

  const emptyFavorites = favoriteImages.length === 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 视图模式切换 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">我的收藏</h1>
            <p className="text-sm text-muted-foreground">
              你收藏的图片作品 {favoriteImages.length > 0 && `(${favoriteImages.length})`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="transition-all duration-200"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              网格
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="transition-all duration-200"
            >
              <List className="w-4 h-4 mr-2" />
              列表
            </Button>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              {isLoading ? '刷新中...' : '刷新'}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">加载失败</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button onClick={refresh} className="mt-2 text-sm text-primary hover:underline">重试</button>
          </div>
        )}

        {/* Empty state */}
        {emptyFavorites && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3">
            <Heart className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-xl font-medium">你还没有收藏任何作品</h3>
            <p className="text-sm text-muted-foreground">去首页或画廊发现并收藏喜欢的作品吧。</p>
          </div>
        )}

        {/* Images Grid/List */}
        {!emptyFavorites && (
          <>
            {isLoading && favoriteImages.length === 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4" 
                : "space-y-4"
              }>
                {Array.from({ length: viewMode === 'grid' ? 12 : 6 }).map((_, i) => (
                  <div key={i} className={viewMode === 'grid' ? "space-y-3" : "flex space-x-4 p-4 border rounded-lg"}>
                    {viewMode === 'grid' ? (
                      <>
                        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {favoriteImages.map((image) => (
                      <ImageCard
                    key={image.id}
                    image={image}
                    onImageClick={handleImageClick}
                    useAspectRatio={true}
                  />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteImages.map((image) => (
                      <div key={image.id} className="flex space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-card">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={image.image_url}
                            alt={image.title || "图片"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                                {image.title || '无标题'}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {image.like_count || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  {image.user_profiles?.full_name || image.user_profiles?.username || '匿名用户'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleImageClick(image)}
                              >
                                查看
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <Button
                      variant="outline"
                      onClick={() => loadFavoriteImages(true)}
                      disabled={isLoading}
                      className="px-8"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          加载中...
                        </>
                      ) : (
                        '加载更多'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}