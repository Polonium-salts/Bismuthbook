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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((result) => (
            <GridResultCard key={result.id} result={result} />
          ))}
        </div>
        
        {hasMore && onLoadMore && (
          <div className="flex justify-center pt-8">
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              {isLoading ? "加载中..." : "加载更多"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <ListResultCard key={result.id} result={result} />
      ))}
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="rounded-full"
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
    <div className="flex gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
      {/* 缩略图 - YouTube 风格 */}
      <Link 
        href={`/artwork/${result.id}`}
        className="relative flex-shrink-0 w-60 h-36 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
      >
        <Image
          src={result.image_url}
          alt={result.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="240px"
        />
        {/* 时长标签（如果需要） */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
          图片
        </div>
      </Link>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* 标题 */}
            <Link href={`/artwork/${result.id}`}>
              <h3 className="text-lg font-medium line-clamp-2 hover:text-blue-600 transition-colors">
                {result.title}
              </h3>
            </Link>

            {/* 元数据 */}
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {(result.view_count || 0).toLocaleString()} 次观看
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo}
              </span>
            </div>

            {/* 作者信息 */}
            {result.user_profiles?.username ? (
              <Link 
                href={`/user/${result.user_profiles.username}`}
                className="flex items-center gap-2 mt-3 hover:text-blue-600 transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={result.user_profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {result.user_profiles?.username || result.user_profiles?.full_name || '匿名用户'}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 mt-3 text-gray-500">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={result.user_profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {result.user_profiles?.full_name || '匿名用户'}
                </span>
              </div>
            )}

            {/* 描述 */}
            {result.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                {result.description}
              </p>
            )}

            {/* 标签和分类 */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {result.category && (
                <Badge variant="secondary" className="text-xs">
                  {result.category}
                </Badge>
              )}
              {result.tags?.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* 互动数据 */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {(result.like_count || 0).toLocaleString()}
              </span>
              {result.comment_count !== undefined && result.comment_count !== null && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {result.comment_count.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* 更多选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>分享</DropdownMenuItem>
              <DropdownMenuItem>保存到收藏</DropdownMenuItem>
              <DropdownMenuItem>举报</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function GridResultCard({ result }: { result: SearchResult }) {
  const timeAgo = result.created_at ? getTimeAgo(result.created_at) : '未知时间'

  return (
    <div className="group">
      {/* 缩略图 */}
      <Link 
        href={`/artwork/${result.id}`}
        className="relative block aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3"
      >
        <Image
          src={result.image_url}
          alt={result.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </Link>

      {/* 内容 */}
      <div className="space-y-2">
        {/* 标题 */}
        <Link href={`/artwork/${result.id}`}>
          <h3 className="font-medium line-clamp-2 hover:text-blue-600 transition-colors">
            {result.title}
          </h3>
        </Link>

        {/* 作者 */}
        {result.user_profiles?.username ? (
          <Link 
            href={`/user/${result.user_profiles.username}`}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={result.user_profiles?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {result.user_profiles?.username || result.user_profiles?.full_name || '匿名用户'}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <Avatar className="h-6 w-6">
              <AvatarImage src={result.user_profiles?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {result.user_profiles?.full_name || '匿名用户'}
            </span>
          </div>
        )}

        {/* 元数据 */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {(result.view_count || 0).toLocaleString()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {(result.like_count || 0).toLocaleString()}
          </span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}
