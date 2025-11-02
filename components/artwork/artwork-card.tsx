"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Bookmark, Eye, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ImageWithStats } from "@/lib/types/database"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { useAuth } from "@/lib/providers/auth-provider"
import { toast } from "sonner"

interface ArtworkCardProps {
  artwork: ImageWithStats
  className?: string
}

export function ArtworkCard({ artwork, className }: ArtworkCardProps) {
  const { user } = useAuth()
  const { likeCount, viewCount, commentCount, isLiked, isFavorited, toggleLike, toggleFavorite, loadStats } = useInteractions(artwork.id)

  // 加载统计数据
  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleLike = async (e: React.MouseEvent) => {
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
      toast.success(isFavorited ? "取消收藏" : "收藏成功")
    } catch {
      toast.error("操作失败，请重试")
    }
  }

  return (
    <Link href={`/artwork/${artwork.id}`} className="block">
      <Card className={cn(
        "group overflow-hidden border-0 bg-white/80 backdrop-blur-sm",
        "shadow-sm hover:shadow-xl hover:shadow-black/10",
        "transition-all duration-500 ease-out cursor-pointer",
        "hover:-translate-y-1 rounded-xl",
        className
      )}>
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl">
            <Image
              src={artwork.image_url || artwork.url || '/placeholder-image.jpg'}
              alt={artwork.title}
              width={400}
              height={533}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 space-y-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-0 hover:scale-110 transition-all duration-300"
                  onClick={handleLike}
                >
                  <Heart className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                  )} />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border-0 hover:scale-110 transition-all duration-300"
                  onClick={handleFavorite}
                >
                  <Bookmark className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isFavorited ? "fill-blue-500 text-blue-500" : "text-gray-600 hover:text-blue-500"
                  )} />
                </Button>
              </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <Heart className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{(likeCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{(viewCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">{commentCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 bg-white/90 backdrop-blur-sm">
            <h3 
              className="font-semibold text-base line-clamp-2 leading-tight text-gray-900 group-hover:text-blue-600 transition-colors duration-300"
              title={artwork.title}
            >
              {artwork.title}
            </h3>
            
            {/* Artist info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm">
                <AvatarImage src={artwork.user_profiles?.avatar_url || undefined} alt={artwork.user_profiles?.full_name || artwork.user_profiles?.username} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {(artwork.user_profiles?.full_name || artwork.user_profiles?.username || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 truncate font-medium hover:text-gray-900 transition-colors duration-300">
                {artwork.user_profiles?.full_name || artwork.user_profiles?.username}
              </span>
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {artwork.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2.5 py-1 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full transition-colors duration-300"
                  >
                    {tag}
                  </Badge>
                ))}
                {artwork.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2.5 py-1 h-6 bg-blue-100 text-blue-700 border-0 rounded-full"
                  >
                    +{artwork.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}