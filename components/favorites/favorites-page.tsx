"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/providers/auth-provider"
import { ImageCard } from "@/components/image/image-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Heart, 
  Grid3X3, 
  List, 
  Search,
  Trash2,
  Download,
  Share2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { toast } from "sonner"

interface FavoritesPageProps {
  className?: string
}

export function FavoritesPage({ className }: FavoritesPageProps) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<ImageWithUserAndStats[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title" | "author">("date")

  const loadFavorites = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          created_at,
          images (
            *,
            user_profiles (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const favoritesWithStats = data?.map(fav => ({
        ...fav.images,
        user_profiles: fav.images.user_profiles,
        likes: [],
        favorites: [],
        comments: [],
        is_liked: false,
        is_favorited: true
      })) as ImageWithUserAndStats[]

      setFavorites(favoritesWithStats || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast.error("加载收藏失败")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user, loadFavorites])

  const handleRemoveFromFavorites = async (imageId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('image_id', imageId)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => fav.id !== imageId))
      setSelectedItems(prev => prev.filter(id => id !== imageId))
      toast.success("已从收藏中移除")
    } catch (error) {
      console.error('Error removing from favorites:', error)
      toast.error("移除收藏失败")
    }
  }

  const handleBatchRemove = async () => {
    if (!user || selectedItems.length === 0) return

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .in('image_id', selectedItems)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => !selectedItems.includes(fav.id)))
      setSelectedItems([])
      toast.success(`已移除 ${selectedItems.length} 个收藏`)
    } catch (error) {
      console.error('Error batch removing favorites:', error)
      toast.error("批量移除失败")
    }
  }

  const handleSelectItem = (imageId: string) => {
    setSelectedItems(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredFavorites.map(fav => fav.id))
    }
  }

  // 过滤和排序收藏
  const filteredFavorites = favorites
    .filter(fav => 
      fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.user_profiles.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.user_profiles.username.localeCompare(b.user_profiles.username)
        case "date":
        default:
          return new Date(b.created_at || 0).getTime() - 
                 new Date(a.created_at || 0).getTime()
      }
    })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h2>
        <p className="text-gray-600">登录后即可查看您的收藏作品</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的收藏</h1>
            <p className="text-gray-600">
              {loading ? "加载中..." : `共 ${favorites.length} 个收藏`}
            </p>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索收藏的作品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "title" | "author")}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">按收藏时间</option>
            <option value="title">按标题</option>
            <option value="author">按作者</option>
          </select>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                已选择 {selectedItems.length} 项
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                批量移除
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 批量操作 */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredFavorites.length && filteredFavorites.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">全选</span>
          </label>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                下载选中
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                分享选中
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 收藏列表 */}
      {loading ? (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? "没有找到相关收藏" : "还没有收藏任何作品"}
          </h2>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? "尝试使用其他关键词搜索" 
              : "浏览作品并点击爱心图标来收藏您喜欢的作品"
            }
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery("")} variant="outline">
              清除搜索
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {filteredFavorites.map((favorite) => (
            <div key={favorite.id} className="relative group">
              {/* 选择框 */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(favorite.id)}
                  onChange={() => handleSelectItem(favorite.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/90 backdrop-blur-sm"
                />
              </div>

              {/* 移除按钮 */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveFromFavorites(favorite.id)}
                  className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <ImageCard 
                image={favorite} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}