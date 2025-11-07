"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  SlidersHorizontal, 
  ChevronDown,
  Calendar,
  TrendingUp,
  Heart,
  Eye,
  X
} from "lucide-react"

interface YouTubeSearchFiltersProps {
  sortBy: string
  timeRange: string
  selectedCategories: string[]
  selectedTags: string[]
  categories: string[]
  popularTags: string[]
  onSortChange: (value: string) => void
  onTimeRangeChange: (value: string) => void
  onCategoryToggle: (category: string) => void
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
}

export function YouTubeSearchFilters({
  sortBy,
  timeRange,
  selectedCategories,
  selectedTags,
  categories,
  popularTags,
  onSortChange,
  onTimeRangeChange,
  onCategoryToggle,
  onTagToggle,
  onClearFilters
}: YouTubeSearchFiltersProps) {
  const sortOptions = [
    { value: 'created_at', label: '上传日期', icon: Calendar },
    { value: 'view_count', label: '观看次数', icon: Eye },
    { value: 'like_count', label: '点赞数', icon: Heart },
    { value: 'popular', label: '热门程度', icon: TrendingUp },
  ]

  const timeRangeOptions = [
    { value: 'all', label: '不限时间' },
    { value: 'hour', label: '最近一小时' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '今年' },
  ]

  const activeFiltersCount = selectedCategories.length + selectedTags.length

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || '上传日期'
  const currentTimeRangeLabel = timeRangeOptions.find(opt => opt.value === timeRange)?.label || '不限时间'

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* 排序下拉菜单 - YouTube 风格 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 rounded-full px-4 h-9"
          >
            <span className="text-sm font-medium">{currentSortLabel}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {sortOptions.map((option) => {
            const Icon = option.icon
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`flex items-center gap-3 ${sortBy === option.value ? 'bg-gray-100' : ''}`}
              >
                <Icon className="h-4 w-4 text-gray-500" />
                <span>{option.label}</span>
                {sortBy === option.value && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 时间范围下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 rounded-full px-4 h-9"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{currentTimeRangeLabel}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {timeRangeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={`${timeRange === option.value ? 'bg-gray-100' : ''}`}
            >
              <span>{option.label}</span>
              {timeRange === option.value && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      {/* 筛选器按钮 - 移动端使用 Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="relative flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 rounded-full px-4 h-9"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">筛选器</span>
            {activeFiltersCount > 0 && (
              <Badge 
                variant="default" 
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>搜索筛选器</SheetTitle>
            <SheetDescription>
              选择分类和标签来精确搜索
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* 清除按钮 */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                清除所有筛选
              </Button>
            )}

            {/* 分类筛选 */}
            <div>
              <h3 className="font-semibold mb-3">分类</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => onCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 标签筛选 */}
            <div>
              <h3 className="font-semibold mb-3">热门标签</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => onTagToggle(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 已选筛选器显示 */}
      {selectedCategories.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 h-9"
        >
          <span className="text-sm">{category}</span>
          <button
            onClick={() => onCategoryToggle(category)}
            className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {selectedTags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 rounded-full px-3 h-9"
        >
          <span className="text-sm">#{tag}</span>
          <button
            onClick={() => onTagToggle(tag)}
            className="ml-1 hover:bg-purple-100 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* 清除所有筛选 */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-600 hover:text-gray-900 rounded-full h-9"
        >
          清除所有
        </Button>
      )}
    </div>
  )
}
