"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Download, 
  Eye, 
  MessageCircle,
  MoreHorizontal,
  Flag,
  Calendar,
  Palette,
  Monitor
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ArtworkDetailProps {
  artwork: {
    id: string
    title: string
    imageUrl: string
    description?: string
    artist: {
      name: string
      avatar: string
      bio?: string
      followers?: number
    }
    likes: number
    views: number
    comments: number
    tags: string[]
    isLiked: boolean
    isBookmarked: boolean
    createdAt?: string
    dimensions?: string
    software?: string[]
    category?: string
  }
}

export function ArtworkDetail({ artwork }: ArtworkDetailProps) {
  const [isLiked, setIsLiked] = useState(artwork.isLiked)
  const [isBookmarked, setIsBookmarked] = useState(artwork.isBookmarked)
  const [likesCount, setLikesCount] = useState(artwork.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `查看这个精美的艺术作品：${artwork.title}`,
        url: window.location.href,
      })
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleDownload = () => {
    // 这里应该实现下载功能
    console.log("下载作品:", artwork.id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* 图片区域 */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* 信息区域 */}
        <div className="space-y-4 sm:space-y-6">
          {/* 标题和操作 */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold leading-tight">{artwork.title}</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" />
                    举报
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex-1 sm:flex-none sm:min-w-[100px]"
              >
                <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{likesCount}</span>
                <span className="sm:hidden">{likesCount} 点赞</span>
              </Button>
              <div className="flex gap-2 sm:flex-1">
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="flex-1 sm:flex-none"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  <span className="ml-2 sm:hidden">收藏</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
                  <Share2 className="h-4 w-4" />
                  <span className="ml-2 sm:hidden">分享</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4" />
                  <span className="ml-2 sm:hidden">下载</span>
                </Button>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {artwork.views.toLocaleString()} 浏览
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {artwork.comments} 评论
              </div>
            </div>
          </div>

          <Separator />

          {/* 艺术家信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={artwork.artist.avatar} />
                <AvatarFallback>{artwork.artist.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{artwork.artist.name}</h3>
                {artwork.artist.followers && (
                  <p className="text-sm text-muted-foreground">
                    {artwork.artist.followers.toLocaleString()} 关注者
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm">
                关注
              </Button>
            </div>
            {artwork.artist.bio && (
              <p className="text-sm text-muted-foreground">{artwork.artist.bio}</p>
            )}
          </div>

          <Separator />

          {/* 作品描述 */}
          {artwork.description && (
            <div>
              <h4 className="font-semibold mb-2">作品描述</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {artwork.description}
              </p>
            </div>
          )}

          {/* 标签 */}
          <div>
            <h4 className="font-semibold mb-2">标签</h4>
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* 作品信息 */}
          <div className="space-y-3">
            <h4 className="font-semibold">作品信息</h4>
            <div className="space-y-2 text-sm">
              {artwork.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">发布时间:</span>
                  <span>{artwork.createdAt}</span>
                </div>
              )}
              {artwork.dimensions && (
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">尺寸:</span>
                  <span>{artwork.dimensions}</span>
                </div>
              )}
              {artwork.software && artwork.software.length > 0 && (
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">使用软件:</span>
                  <span>{artwork.software.join(", ")}</span>
                </div>
              )}
              {artwork.category && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">分类:</span>
                  <Badge variant="outline">{artwork.category}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}