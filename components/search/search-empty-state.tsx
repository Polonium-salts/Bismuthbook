"use client"

import { Button } from "@/components/ui/button"
import { Search, Sparkles, TrendingUp } from "lucide-react"

interface SearchEmptyStateProps {
  type: 'no-query' | 'no-results' | 'error'
  query?: string
  onClearFilters?: () => void
  onRetry?: () => void
}

export function SearchEmptyState({ 
  type, 
  query, 
  onClearFilters,
  onRetry 
}: SearchEmptyStateProps) {
  if (type === 'no-query') {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* 图标 */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              开始探索创意世界
            </h3>
            <p className="text-gray-600">
              输入关键词来搜索作品、艺术家或标签
            </p>
          </div>

          {/* 热门搜索建议 */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              热门搜索
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['动漫少女', '科幻场景', '概念艺术', '角色设计', '风景画'].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'no-results') {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* 图标 */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              没有找到相关作品
            </h3>
            <p className="text-gray-600">
              {query ? (
                <>找不到与 <span className="font-semibold">&quot;{query}&quot;</span> 相关的作品</>
              ) : (
                '当前筛选条件下没有匹配的作品'
              )}
            </p>
          </div>

          {/* 建议 */}
          <div className="bg-blue-50 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm font-medium text-blue-900">搜索建议：</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>检查关键词拼写是否正确</li>
              <li>尝试使用更通用的关键词</li>
              <li>减少筛选条件</li>
              <li>尝试搜索相关的标签或分类</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          {onClearFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="rounded-full"
            >
              清除所有筛选条件
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* 图标 */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              加载失败
            </h3>
            <p className="text-gray-600">
              无法加载搜索结果，请稍后重试
            </p>
          </div>

          {/* 操作按钮 */}
          {onRetry && (
            <Button
              onClick={onRetry}
              className="rounded-full"
            >
              重新加载
            </Button>
          )}
        </div>
      </div>
    )
  }

  return null
}
