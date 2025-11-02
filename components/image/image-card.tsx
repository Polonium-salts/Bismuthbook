"use client"

import { useState, useEffect, memo, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Eye,
  User,
  Download,
  Share2
} from "lucide-react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { useAuth } from "@/lib/providers/auth-provider"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { useImageDimensions } from "@/lib/hooks/use-image-dimensions"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const ImageDetail = dynamic(() => import("./image-detail").then(mod => ({ default: mod.ImageDetail })), {
  loading: () => <div className="flex items-center justify-center p-8">加载中...</div>
})

interface ImageCardProps {
  image: ImageWithUserAndStats
  onImageClick?: (image: ImageWithUserAndStats) => void
  useAspectRatio?: boolean // 是否使用图片的实际比例
}

const ImageCard = memo(function ImageCard({ image, onImageClick, useAspectRatio = false }: ImageCardProps) {
  const { user } = useAuth()
  const { viewCount, commentCount, likeCount, isLiked, isFavorited, toggleLike, toggleFavorite, loadStats } = useInteractions(image.id)
  
  const [showDetail, setShowDetail] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  // 获取图片尺寸（仅在启用动态比例时）
  const { aspectRatio } = useImageDimensions(
    useAspectRatio ? image.image_url : ""
  )

  // 加载统计数据
  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleLike()
      toast.success(isLiked ? "取消点赞" : "点赞成功")
    } catch {
      toast.error("操作失败，请重试")
    }
  }, [user, toggleLike, isLiked])

  const handleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleFavorite()
      toast.success(isFavorited ? "取消收藏" : "收藏成功")
    } catch {
      toast.error("操作失败，请重试")
    }
  }, [user, toggleFavorite, isFavorited])

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      const url = `${window.location.origin}/image/${image.id}`
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制到剪贴板')
    } catch {
      toast.error('复制失败')
    }
  }, [image.id])

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    const link = document.createElement('a')
    link.href = image.image_url
    link.download = `${image.title || 'image'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('开始下载')
  }, [image.image_url, image.title])

  const handleImageClick = useCallback(() => {
    if (onImageClick) {
      onImageClick(image)
    } else {
      setShowDetail(true)
    }
  }, [onImageClick, image])

  const formatCount = useCallback((count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }, [])

  return (
    <>
      <Card 
        className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleImageClick}
      >
        <CardContent className="p-0">
          {/* 图片容器 */}
          <div 
            className={`relative overflow-hidden ${
              useAspectRatio ? '' : 'aspect-[3/4]'
            }`}
            style={useAspectRatio ? { aspectRatio: aspectRatio.toString() } : undefined}
          >
            <Image
              src={image.image_url}
              alt={image.title || "图片"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            
            {/* 悬浮操作按钮 */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute top-2 right-2 flex flex-col space-y-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              {/* 底部信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatCount(viewCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{formatCount(commentCount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 px-2 text-white hover:bg-white/20 ${
                        isLiked ? 'text-red-400' : ''
                      }`}
                      onClick={handleLike}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{formatCount(likeCount)}</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 text-white hover:bg-white/20 ${
                        isFavorited ? 'text-yellow-400' : ''
                      }`}
                      onClick={handleFavorite}
                    >
                      <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 图片信息 */}
          <div className="p-3 space-y-2">
            {/* 标题 */}
            {image.title && (
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                {image.title}
              </h3>
            )}

            {/* 标签 */}
            {image.tags && image.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {image.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                    #{tag}
                  </Badge>
                ))}
                {image.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{image.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* 作者信息 */}
            <div className="flex items-center space-x-2 pt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={image.user_profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {image.user_profiles?.full_name || image.user_profiles?.username || '匿名用户'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图片详情模态框 */}
      <ImageDetail
        image={image}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  )
})

export { ImageCard }