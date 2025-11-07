"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Search, ArrowUpRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TrendingSearch {
  query: string
  search_count: number
  unique_users?: number
  trend?: 'up' | 'down' | 'stable'
}

interface TrendingSearchesProps {
  limit?: number
  showStats?: boolean
}

export function TrendingSearches({ 
  limit = 10,
  showStats = true 
}: TrendingSearchesProps) {
  const [trending, setTrending] = useState<TrendingSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingSearches()
  }, [limit])

  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search/trending')
      const data = await response.json()
      setTrending(data.trending || [])
    } catch (error) {
      console.error('Failed to fetch trending searches:', error)
      // 使用默认数据
      setTrending([
        { query: '动漫少女', search_count: 1234 },
        { query: '科幻场景', search_count: 856 },
        { query: '概念艺术', search_count: 742 },
        { query: '角色设计', search_count: 623 },
        { query: '风景画', search_count: 512 }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            热门搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="w-12 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          热门搜索
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trending.slice(0, limit).map((item, index) => (
            <Link
              key={item.query}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* 排名 */}
              <div className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                ${index < 3 
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {index + 1}
              </div>

              {/* 搜索词 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {item.query}
                  </span>
                  {item.trend === 'up' && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      <ArrowUpRight className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
                {showStats && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.search_count.toLocaleString()} 次搜索
                    {item.unique_users && ` · ${item.unique_users.toLocaleString()} 人`}
                  </div>
                )}
              </div>

              {/* 搜索图标 */}
              <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
