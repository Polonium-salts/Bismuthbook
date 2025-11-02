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
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>

        {/* 网格骨架屏 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
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
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          共 {artworks.length} 件作品
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 作品网格 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {artworks.map((artwork) => (
            <ArtworkListItem key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  )
}

// 作品卡片组件
function ArtworkCard({ artwork }: { artwork: ImageWithUserAndStats }) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/artwork/${artwork.id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        {!imageError ? (
          <Image
            src={getImageUrl(artwork.image_url)}
            alt={artwork.title || '无标题'}
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
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
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
        )}
        
        {imageLoading && (
          <Skeleton className="absolute inset-0" />
        )}

        {/* 悬浮信息 */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-2 sm:p-3 w-full">
            <div className="flex items-center justify-between text-white text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{artwork.like_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{artwork.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{artwork.comment_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-2 sm:p-3">
        <h3 className="font-medium truncate mb-1 text-sm sm:text-base">
          {artwork.title || '无标题'}
        </h3>
        
        {artwork.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
            {artwork.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">
            {new Date(artwork.created_at || 0).toLocaleDateString('zh-CN')}
          </span>
          
          {artwork.category && (
            <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
              {artwork.category}
            </Badge>
          )}
        </div>
      </CardContent>
      </Card>
    </Link>
  )
}

// 作品列表项组件
function ArtworkListItem({ artwork }: { artwork: ImageWithUserAndStats }) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/artwork/${artwork.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* 缩略图 */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-lg">
            {!imageError ? (
              <Image
                src={getImageUrl(artwork.image_url)}
                alt={artwork.title || '无标题'}
                fill
                className={cn(
                  "object-cover",
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
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
              </div>
            )}
            
            {imageLoading && (
              <Skeleton className="absolute inset-0" />
            )}
          </div>

          {/* 作品信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1 sm:mb-2">
              <h3 className="font-medium truncate text-sm sm:text-base">
                {artwork.title || '无标题'}
              </h3>
              
              {artwork.category && (
                <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
                  {artwork.category}
                </Badge>
              )}
            </div>

            {artwork.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                {artwork.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{artwork.like_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{artwork.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{artwork.comment_count}</span>
                </div>
              </div>

              <span className="text-xs text-muted-foreground">
                {new Date(artwork.created_at || 0).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
    </Link>
  )
}