"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Heart, 
  Eye, 
  MessageCircle, 
  Upload,
  Grid3X3,
  List
} from "lucide-react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { getImageUrl } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface UserArtworkGridProps {
  artworks: ImageWithUserAndStats[]
  loading: boolean
  emptyMessage: string
}

type ViewMode = 'grid' | 'list'

export function UserArtworkGrid({ 
  artworks, 
  loading, 
  emptyMessage 
}: UserArtworkGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  if (loading) {
    return (
      <div className="space-y-4">
        {/* 工具栏骨架屏 */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-1.5">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* 网格骨架屏 - 移动端2列 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">暂无作品</h3>
        <p className="text-muted-foreground mb-6">{emptyMessage}</p>
        <Link href="/upload">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            上传作品
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 - 移动端优化 */}
      <div className="flex justify-between items-center">
        <div className="text-xs sm:text-sm text-muted-foreground">
          共 {artworks.length} 件作品
        </div>
        
        <div className="flex gap-1.5">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 作品网格 - 移动端2列 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {artworks.map((artwork) => (
            <ArtworkListItem key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  )
}

// 作品卡片组件 - 移动端优化
function ArtworkCard({ artwork }: { artwork: ImageWithUserAndStats }) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/artwork/${artwork.id}`} className="block active:opacity-80 transition-opacity">
      <div className="space-y-1.5">
        {/* 图片 */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {!imageError ? (
            <Image
              src={getImageUrl(artwork.image_url)}
              alt={artwork.title || '无标题'}
              width={400}
              height={400}
              className={cn(
                "w-full h-full object-cover",
                imageLoading && "opacity-0"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          
          {imageLoading && (
            <Skeleton className="absolute inset-0" />
          )}

          {/* 移动端底部统计信息 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <div className="flex items-center gap-2 text-white text-xs">
              <div className="flex items-center gap-0.5">
                <Heart className="w-3 h-3" />
                <span>{formatNumber(artwork.like_count || 0)}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(artwork.view_count || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 标题 - 移动端简化 */}
        <h3 className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight">
          {artwork.title || '无标题'}
        </h3>
      </div>
    </Link>
  )
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

// 作品列表项组件 - 移动端优化
function ArtworkListItem({ artwork }: { artwork: ImageWithUserAndStats }) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/artwork/${artwork.id}`} className="block active:bg-gray-50 dark:active:bg-gray-800 rounded-lg transition-colors">
      <div className="flex gap-3 p-2">
        {/* 缩略图 */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {!imageError ? (
            <Image
              src={getImageUrl(artwork.image_url)}
              alt={artwork.title || '无标题'}
              width={96}
              height={96}
              className={cn(
                "w-full h-full object-cover",
                imageLoading && "opacity-0"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          
          {imageLoading && (
            <Skeleton className="absolute inset-0" />
          )}
        </div>

        {/* 作品信息 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-medium text-sm line-clamp-2 leading-snug mb-1">
              {artwork.title || '无标题'}
            </h3>
            
            {artwork.category && (
              <Badge variant="secondary" className="text-xs">
                {artwork.category}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(artwork.like_count || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatNumber(artwork.view_count || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{formatNumber(artwork.comment_count || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}