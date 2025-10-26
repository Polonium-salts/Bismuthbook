"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  Bookmark, 
  Eye,
  User,
  Calendar,
  Tag
} from "lucide-react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { useAuth } from "@/lib/providers/auth-provider"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { cn } from "@/lib/utils"

interface PixivHoverPreviewProps {
  artwork: ImageWithUserAndStats
  isVisible: boolean
  position: { x: number; y: number }
  onClose: () => void
}

export function PixivHoverPreview({ 
  artwork, 
  isVisible, 
  position, 
  onClose 
}: PixivHoverPreviewProps) {
  const { user } = useAuth()
  const { isLiked, isFavorited, toggleLike, toggleFavorite } = useInteractions(artwork.id)
  const previewRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // 计算预览框位置，确保不超出屏幕边界
  const calculatePosition = () => {
    if (!previewRef.current) return { left: position.x, top: position.y }

    const rect = previewRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let left = position.x + 20 // 默认在鼠标右侧
    let top = position.y - rect.height / 2 // 垂直居中

    // 如果右侧空间不够，显示在左侧
    if (left + rect.width > viewportWidth - 20) {
      left = position.x - rect.width - 20
    }

    // 如果上方空间不够，调整到下方
    if (top < 20) {
      top = 20
    } else if (top + rect.height > viewportHeight - 20) {
      top = viewportHeight - rect.height - 20
    }

    return { left, top }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      await toggleLike()
    }
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      await toggleFavorite()
    }
  }

  if (!isVisible) return null

  const finalPosition = calculatePosition()

  return (
    <div
      ref={previewRef}
      className={cn(
        "fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
        "w-80 max-h-96 overflow-hidden transition-all duration-200 ease-out",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2"
      )}
      style={{
        left: finalPosition.left,
        top: finalPosition.top,
      }}
      onMouseLeave={onClose}
    >
      {/* 图片预览 */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={artwork.image_url}
          alt={artwork.title || "作品"}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* 加载骨架屏 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
        )}

        {/* 统计信息悬浮层 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{artwork.like_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bookmark className="h-4 w-4" />
                <span>{artwork.favorite_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{artwork.view_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button
            size="sm"
            variant={isLiked ? "default" : "secondary"}
            className={cn(
              "h-8 w-8 p-0 rounded-full backdrop-blur-sm transition-all duration-200",
              isLiked 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-white/80 hover:bg-white text-gray-700"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </Button>
          <Button
            size="sm"
            variant={isFavorited ? "default" : "secondary"}
            className={cn(
              "h-8 w-8 p-0 rounded-full backdrop-blur-sm transition-all duration-200",
              isFavorited 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-white/80 hover:bg-white text-gray-700"
            )}
            onClick={handleFavorite}
          >
            <Bookmark className={cn("h-4 w-4", isFavorited && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* 详情信息 */}
      <div className="p-4 space-y-3">
        {/* 标题 */}
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
          {artwork.title || "无标题"}
        </h3>

        {/* 标签 */}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artwork.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {artwork.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{artwork.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 作者信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700">
              <AvatarImage src={artwork.user_profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {artwork.user_profiles?.username || "匿名用户"}
              </p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(artwork.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* 描述 */}
        {artwork.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {artwork.description}
          </p>
        )}
      </div>
    </div>
  )
}