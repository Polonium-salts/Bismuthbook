"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Bookmark, 
  Eye,
  User,
  MoreHorizontal
} from "lucide-react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { useAuth } from "@/lib/providers/auth-provider"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { toast } from "sonner"
import { ImageDetail } from "../image/image-detail"
import { PixivHoverPreview } from "./pixiv-hover-preview"
import { cn } from "@/lib/utils"

interface PixivCardProps {
  artwork: ImageWithUserAndStats
  columns: number
  onHeightCalculated?: (height: number) => void
  style?: React.CSSProperties
  className?: string
}

export function PixivCard({ 
  artwork, 
  columns, 
  onHeightCalculated, 
  style, 
  className 
}: PixivCardProps) {
  const { user } = useAuth()
  const { viewCount, likeCount, isLiked, isFavorited, toggleLike, toggleFavorite, loadStats } = useInteractions(artwork.id)
  
  const [showDetail, setShowDetail] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [cardHeight, setCardHeight] = useState(0)
  const [showHoverPreview, setShowHoverPreview] = useState(false)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 加载统计数据
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // 计算卡片高度
  useEffect(() => {
    if (imageLoaded && cardRef.current) {
      const height = cardRef.current.offsetHeight
      if (height !== cardHeight) {
        setCardHeight(height)
        onHeightCalculated?.(height)
      }
    }
  }, [imageLoaded]) // 只依赖 imageLoaded，避免无限循环

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleLike()
    } catch (error) {
      toast.error("操作失败，请重试")
    }
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleFavorite()
    } catch (error) {
      toast.error("操作失败，请重试")
    }
  }

  const handleImageClick = () => {
    setShowDetail(true)
  }

  // 悬浮预览相关事件处理
  const handleMouseEnter = (e: React.MouseEvent) => {
    // 清除之前的定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // 设置悬浮位置
    setHoverPosition({ x: e.clientX, y: e.clientY })
    
    // 延迟显示预览，避免快速划过时触发
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverPreview(true)
    }, 500) // 500ms 延迟
  }

  const handleMouseLeave = () => {
    // 清除定时器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setShowHoverPreview(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // 更新鼠标位置
    setHoverPosition({ x: e.clientX, y: e.clientY })
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <>
      <div 
        ref={cardRef}
        className={cn(
          "group cursor-pointer bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ease-out transform hover:-translate-y-2 hover:scale-[1.03]",
          "border border-border/50 hover:border-blue-500/30",
          className
        )}
        style={style}
        onMouseEnter={(e) => {
          setIsHovered(true)
          handleMouseEnter(e)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          handleMouseLeave()
        }}
        onMouseMove={handleMouseMove}
        onClick={handleImageClick}
      >
        {/* 图片容器 */}
        <div className="relative overflow-hidden bg-muted/20">
          <img
            ref={imageRef}
            src={artwork.image_url}
            alt={artwork.title || "图片"}
            className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* 渐变遮罩 */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )} />
          
          {/* 左下角统计信息 */}
          <div className={cn(
            "absolute bottom-2 md:bottom-3 left-2 md:left-3 transform transition-all duration-500 delay-100",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}>
            <div className="backdrop-blur-md bg-black/30 rounded-lg md:rounded-xl p-1.5 md:p-2 border border-white/10">
              <div className="flex items-center space-x-2 md:space-x-3 text-white text-xs md:text-sm">
                <div className="flex items-center space-x-1 md:space-x-1.5 hover:text-red-400 transition-colors duration-200">
                  <Heart className={cn("w-3 h-3 md:w-4 md:h-4 transition-all duration-200", 
                    isLiked ? "fill-current text-red-400" : "hover:text-red-400"
                  )} />
                  <span>{formatCount(likeCount)}</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-1.5 hover:text-blue-400 transition-colors duration-200">
                  <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{formatCount(viewCount)}</span>
                </div>
              </div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* 右上角操作按钮组 */}
          <div className={cn(
            "absolute top-2 md:top-3 right-2 md:right-3 flex items-center space-x-1.5 md:space-x-2 transform transition-all duration-500 delay-200",
            isHovered ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="backdrop-blur-md bg-black/30 rounded-lg md:rounded-xl p-1 md:p-1.5 border border-white/10">
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "w-6 h-6 md:w-8 md:h-8 p-0 text-white hover:bg-white/20 hover:scale-110 transition-all duration-200",
                  isFavorited && "text-yellow-400 scale-110"
                )}
                onClick={handleFavorite}
              >
                <Bookmark className={cn("w-3 h-3 md:w-4 md:h-4 transition-all duration-200", 
                  isFavorited ? "fill-current text-yellow-400" : "hover:text-yellow-400"
                )} />
              </Button>
            </div>
          </div>

          {/* 加载状态 */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 卡片信息 */}
        <div className="p-3 md:p-4 space-y-2 md:space-y-3">
          {/* 标题 */}
          {artwork.title && (
            <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
              {artwork.title}
            </h3>
          )}

          {/* 标签 */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-1.5">
              {artwork.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 md:px-2.5 py-0.5 md:py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-200 cursor-pointer border border-border/30 hover:border-blue-300 dark:hover:border-blue-700"
                >
                  #{tag}
                </Badge>
              ))}
              {artwork.tags.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 md:px-2.5 py-0.5 md:py-1 border-dashed hover:bg-muted/50 transition-colors duration-200"
                >
                  +{artwork.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 作者信息和操作 */}
          <div className="flex items-center justify-between pt-1.5 md:pt-2 border-t border-border/30">
            <div className="flex items-center space-x-2 md:space-x-3 group/author cursor-pointer">
              <Avatar className="w-6 h-6 md:w-7 md:h-7 ring-2 ring-border group-hover/author:ring-blue-500 transition-all duration-200">
                <AvatarImage src={artwork.user_profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                  {artwork.user_profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover/author:text-foreground transition-colors duration-200 truncate">
                  {artwork.user_profiles?.full_name || artwork.user_profiles?.username || '匿名用户'}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {new Date(artwork.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            
            {/* 点赞按钮 */}
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 md:h-8 px-2 md:px-3 rounded-full transition-all duration-300 group/like ${
                isLiked 
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 dark:from-red-950/20 dark:to-pink-950/20 dark:text-red-400 dark:hover:from-red-950/30 dark:hover:to-pink-950/30 shadow-sm' 
                  : 'hover:bg-muted hover:shadow-sm'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5 transition-all duration-200 group-hover/like:scale-110 ${isLiked ? 'fill-current scale-110' : ''}`} />
              <span className="text-xs font-medium">{formatCount(likeCount)}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 图片详情模态框 */}
      <ImageDetail
        image={artwork}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* 悬浮预览 */}
      <PixivHoverPreview
        artwork={artwork}
        isVisible={showHoverPreview}
        position={hoverPosition}
        onClose={() => setShowHoverPreview(false)}
      />
    </>
  )
}