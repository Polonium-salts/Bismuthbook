"use client"

import { useState, useEffect, useRef, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Bookmark, 
  Eye,
  User
} from "lucide-react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { useAuth } from "@/lib/providers/auth-provider"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { getImageUrl } from "@/lib/supabase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PixivCardProps {
  artwork: ImageWithUserAndStats
  onHeightCalculated?: (height: number) => void
  style?: React.CSSProperties
  className?: string
}

const PixivCard = memo(function PixivCard({ 
  artwork, 
  onHeightCalculated, 
  style, 
  className 
}: PixivCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { viewCount, likeCount, isLiked, isFavorited, toggleLike, toggleFavorite, loadStats } = useInteractions(artwork.id)
  
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // 加载统计数据
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // 计算卡片高度
  useEffect(() => {
    if (imageLoaded && cardRef.current) {
      const height = cardRef.current.offsetHeight
      onHeightCalculated?.(height)
    }
  }, [imageLoaded, onHeightCalculated])

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleLike()
    } catch {
      toast.error("操作失败，请重试")
    }
  }, [user, toggleLike])

  const handleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleFavorite()
    } catch {
      toast.error("操作失败，请重试")
    }
  }, [user, toggleFavorite])

  const handleImageClick = useCallback(() => {
    router.push(`/artwork/${artwork.id}`)
  }, [router, artwork.id])

  const formatCount = useCallback((count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }, [])

  return (
    <>
      <div 
        ref={cardRef}
        className={cn(
          "group cursor-pointer bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-4",
          className
        )}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleImageClick}
      >
        {/* 图片容器 */}
        <div className="relative overflow-hidden">
          <Image
            ref={imageRef}
            src={getImageUrl(artwork.image_url)}
            alt={artwork.title || "图片"}
            width={400}
            height={600}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* 悬浮遮罩 */}
          <div className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            {/* 统计信息 */}
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <Heart className={cn("w-5 h-5", isLiked && "fill-current text-red-400")} />
                <span className="text-sm font-medium">{formatCount(likeCount ?? 0)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">{formatCount(viewCount ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* 右上角操作按钮 */}
          <div className={cn(
            "absolute top-2 right-2 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm",
                isFavorited && "text-yellow-500"
              )}
              onClick={handleFavorite}
            >
              <Bookmark className={cn("h-4 w-4", isFavorited && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* 卡片信息 */}
        <div className="p-3 space-y-3">
          {/* 标题 */}
          {artwork.title && (
            <h3 className="font-medium text-sm line-clamp-2 leading-tight text-foreground">
              {artwork.title}
            </h3>
          )}

          {/* 标签 */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artwork.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
              {artwork.tags.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 text-muted-foreground"
                >
                  +{artwork.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* 作者信息和操作 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={artwork.user_profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {artwork.user_profiles?.full_name || artwork.user_profiles?.username || '匿名用户'}
              </span>
            </div>
            
            {/* 点赞按钮 */}
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2 text-xs hover:bg-muted/50 transition-colors",
                isLiked && "text-red-500 hover:text-red-600"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-3 w-3 mr-1", isLiked && "fill-current")} />
              {formatCount(likeCount ?? 0)}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
})

export { PixivCard }