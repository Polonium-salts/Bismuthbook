"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Eye, Heart } from "lucide-react"
import { formatResultCount } from "@/lib/utils/search-utils"

interface SearchStatsProps {
  query?: string
  resultCount: number
  searchTime?: number
  sortBy?: string
  timeRange?: string
}

export function SearchStats({
  query,
  resultCount,
  searchTime,
  sortBy,
  timeRange
}: SearchStatsProps) {
  const getSortIcon = () => {
    switch (sortBy) {
      case 'like_count':
        return <Heart className="w-3 h-3" />
      case 'view_count':
        return <Eye className="w-3 h-3" />
      case 'created_at':
        return <Clock className="w-3 h-3" />
      default:
        return <TrendingUp className="w-3 h-3" />
    }
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case 'like_count':
        return '按点赞排序'
      case 'view_count':
        return '按浏览排序'
      case 'created_at':
        return '按时间排序'
      default:
        return '按相关性排序'
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'hour':
        return '最近一小时'
      case 'today':
        return '今天'
      case 'week':
        return '本周'
      case 'month':
        return '本月'
      case 'year':
        return '今年'
      default:
        return '全部时间'
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
      {/* 搜索关键词 */}
      {query && (
        <div className="flex items-center gap-2">
          <span>搜索：</span>
          <Badge variant="secondary" className="font-medium">
            &quot;{query}&quot;
          </Badge>
        </div>
      )}

      {/* 结果数量 */}
      <div className="flex items-center gap-1">
        <span>{formatResultCount(resultCount)}</span>
      </div>

      {/* 搜索时间 */}
      {searchTime !== undefined && (
        <div className="text-gray-500">
          ({searchTime.toFixed(2)} 秒)
        </div>
      )}

      {/* 分隔符 */}
      {(sortBy || timeRange !== 'all') && (
        <span className="text-gray-300">•</span>
      )}

      {/* 排序方式 */}
      {sortBy && (
        <Badge variant="outline" className="flex items-center gap-1">
          {getSortIcon()}
          <span>{getSortLabel()}</span>
        </Badge>
      )}

      {/* 时间范围 */}
      {timeRange && timeRange !== 'all' && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{getTimeRangeLabel()}</span>
        </Badge>
      )}
    </div>
  )
}
