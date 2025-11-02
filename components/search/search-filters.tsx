"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Filter, 
  SlidersHorizontal, 
  X,
  Calendar,
  Heart,
  Eye,
  TrendingUp
} from "lucide-react"

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void
  categories?: string[]
  popularTags?: string[]
  loading?: boolean
}

export function SearchFilters({ 
  onFiltersChange, 
  categories = [], 
  popularTags = [], 
  loading = false 
}: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    sortBy: "latest",
    timeRange: "all",
    categories: [] as string[],
    tags: [] as string[],
    minLikes: 0,
    minViews: 0
  })

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 默认分类和标签（当数据加载失败时使用）
  const defaultCategories = [
    "插画", "漫画", "概念艺术", "角色设计", "风景画", 
    "肖像画", "抽象艺术", "数字绘画", "传统艺术", "3D艺术"
  ]

  const defaultTags = [
    "原创", "同人", "动漫", "游戏", "科幻", "奇幻", 
    "现代", "古风", "可爱", "帅气", "美少女", "机甲"
  ]

  // 使用传入的数据或默认数据
  const displayCategories = categories.length > 0 ? categories : defaultCategories
  const displayTags = popularTags.length > 0 ? popularTags : defaultTags

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilters("categories", newCategories)
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    updateFilters("tags", newTags)
  }

  const clearFilters = () => {
    const defaultFilters = {
      sortBy: "latest",
      timeRange: "all",
      categories: [],
      tags: [],
      minLikes: 0,
      minViews: 0
    }
    setFilters(defaultFilters)
    onFiltersChange?.(defaultFilters)
  }

  const activeFiltersCount = 
    filters.categories.length + 
    filters.tags.length + 
    (filters.sortBy !== "latest" ? 1 : 0) +
    (filters.timeRange !== "all" ? 1 : 0)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
        {/* 排序选择 */}
        <Select value={filters.sortBy} onValueChange={(value) => updateFilters("sortBy", value)}>
          <SelectTrigger className="w-[140px] sm:w-[160px] flex-shrink-0 bg-white/90 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-lg">
          <SelectItem value="latest" className="hover:bg-blue-50 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">最新发布</span>
            </div>
          </SelectItem>
          <SelectItem value="popular" className="hover:bg-blue-50 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">最受欢迎</span>
            </div>
          </SelectItem>
          <SelectItem value="likes" className="hover:bg-blue-50 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="font-medium">最多点赞</span>
            </div>
          </SelectItem>
          <SelectItem value="views" className="hover:bg-blue-50 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="font-medium">最多浏览</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

        {/* 时间范围 */}
        <Select value={filters.timeRange} onValueChange={(value) => updateFilters("timeRange", value)}>
          <SelectTrigger className="w-[120px] sm:w-[140px] flex-shrink-0 bg-white/90 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-lg">
            <SelectItem value="all" className="hover:bg-blue-50 transition-colors duration-200">全部时间</SelectItem>
            <SelectItem value="today" className="hover:bg-blue-50 transition-colors duration-200">今天</SelectItem>
            <SelectItem value="week" className="hover:bg-blue-50 transition-colors duration-200">本周</SelectItem>
            <SelectItem value="month" className="hover:bg-blue-50 transition-colors duration-200">本月</SelectItem>
            <SelectItem value="year" className="hover:bg-blue-50 transition-colors duration-200">今年</SelectItem>
          </SelectContent>
        </Select>

        {/* 高级筛选 */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative flex-shrink-0 bg-white/90 border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300">
              <SlidersHorizontal className="mr-1 sm:mr-2 h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline font-medium">筛选</span>
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white shadow-md"
              >
                {activeFiltersCount}
              </Badge>
            )}
            </Button>
          </PopoverTrigger>
        <PopoverContent className="w-80 bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-xl" align="start">
          <div className="space-y-5 p-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">高级筛选</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-gray-100 rounded-md transition-colors duration-200">
                <X className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">清除</span>
              </Button>
            </div>

            <Separator className="bg-gray-200" />

            {/* 分类筛选 */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">分类</Label>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {displayCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                        className="border-gray-300"
                      />
                      <Label 
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer text-gray-700 font-medium"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-gray-200" />

            {/* 标签筛选 */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">热门标签</Label>
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displayTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        filters.tags.includes(tag) 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border-gray-300"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
        </Popover>
      </div>

      {/* 清除筛选按钮 */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">清除</span>
        </Button>
      )}

      {/* 活跃筛选器显示 */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 ml-2">
          <Separator orientation="vertical" className="h-6" />
          <div className="flex flex-wrap gap-1">
            {filters.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => toggleCategory(category)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => toggleTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}