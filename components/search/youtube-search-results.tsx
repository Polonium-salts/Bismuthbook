"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Eye, 
  Heart, 
  MessageCircle,
  MoreVertical,
  Clock,
  User
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SearchResult {
  id: string
  title: string
  description?: string | null
  image_url: string
  user_id: string
  user_profiles?: {
    id: string
    username?: string | null
    avatar_url?: string | null
    full_name?: string | null
  }
  created_at: string | null
  view_count: number | null
  like_count: number | null
  comment_count?: number | null
  tags?: string[] | null
  category?: string | null
}

interface YouTubeSearchResultsProps {
  results: SearchResult[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export function YouTubeSearchResults({
  results,
  onLoadMore,
  hasMore,
  isLoading
}: YouTubeSearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {results.map((result) => (
            <GridResultCard key={result.id} result={result} />
          ))}
        </div>
        
        {hasMore && onLoadMore && (
          <div className="flex justify-center pt-4 sm:pt-8">
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full"
            >
              {isLoading ? "加载中..." : "加载更多"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {results.map((result) => (
        <ListResultCard key={result.id} result={result} />
      ))}
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4 sm:pt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto rounded-full"
          >
            {isLoading ? "加载中..." : "加载更多"}
          </Button>
        </div>
      )}
    </div>
  )
}

// 简单的时间格式化函数
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}周前`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}个月前`
  return `${Math.floor(diffInSeconds / 31536000)}年前`
}

function ListResultCard({ result }: { result: SearchResult }) {
  const timeAgo = result.created_at ? getTimeAgo(result.created_at) : '未知时间'

  return (
    <Link 
      href={`/artwork/${result.id}`}
      className="flex gap-3 active:bg-gray-50 dark:active:bg-gray-800 p-2 -mx-2 rounded-lg transition-colors"
    >
      {/* 缩略图 - 移动端优化 */}
      <div className="relative flex-shrink-0 w-[140px] h-[105px] sm:w-60 sm:h-36 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <Image
          src={result.image_url}
          alt={result.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 140px, 240px"
        />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        {/* 上半部分：标题和作者 */}
        <div className="space-y-2">
          {/* 标题 */}
          <h3 className="text-sm sm:text-base font-medium line-clamp-2 leading-snug">
            {result.title}
          </h3>

          {/* 作者信息 - 移动端简化 */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
            <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
              <AvatarImage src={result.user_profiles?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {result.user_profiles?.username || result.user_profiles?.full_name || '匿名用户'}
            </span>
          </div>
        </div>

        {/* 下半部分：统计数据 */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(result.view_count || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatNumber(result.like_count || 0)}
          </span>
          {result.comment_count !== undefined && result.comment_count !== null && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatNumber(result.comment_count)}
            </span>
          )}
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{timeAgo}</span>
        </div>

        {/* 标签 - 仅在较大屏幕显示 */}
        {result.tags && result.tags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap mt-2">
            {result.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs px-1.5 py-0"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// 格式化数字显示
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

function GridResultCard({ result }: { result: SearchResult }) {
  return (
    <Link 
      href={`/artwork/${result.id}`}
      className="block active:opacity-80 transition-opacity"
    >
      {/* 缩略图 */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
        <Image
          src={result.image_url}
          alt={result.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* 内容 */}
      <div className="space-y-1.5">
        {/* 标题 */}
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">
          {result.title}
        </h3>

        {/* 作者 */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Avatar className="h-4 w-4">
            <AvatarImage src={result.user_profiles?.avatar_url || undefined} />
            <AvatarFallback>
              <User className="h-2 w-2" />
            </AvatarFallback>
          </Avatar>
          <span className="truncate">
            {result.user_profiles?.username || result.user_profiles?.full_name || '匿名用户'}
          </span>
        </div>

        {/* 统计数据 */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" />
            {formatNumber(result.like_count || 0)}
          </span>
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {formatNumber(result.view_count || 0)}
          </span>
        </div>
      </div>
    </Link>
  )
}
