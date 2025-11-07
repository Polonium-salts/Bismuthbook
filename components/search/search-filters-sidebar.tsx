"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { 
  SlidersHorizontal, 
  Grid3x3, 
  Hash, 
  Calendar,
  Heart,
  Eye,
  X
} from "lucide-react"

interface SearchFiltersSidebarProps {
  categories: string[]
  tags: string[]
  selectedCategories: string[]
  selectedTags: string[]
  minLikes: number
  minViews: number
  onCategoryToggle: (category: string) => void
  onTagToggle: (tag: string) => void
  onMinLikesChange: (value: number) => void
  onMinViewsChange: (value: number) => void
  onClearFilters: () => void
}

export function SearchFiltersSidebar({
  categories,
  tags,
  selectedCategories,
  selectedTags,
  minLikes,
  minViews,
  onCategoryToggle,
  onTagToggle,
  onMinLikesChange,
  onMinViewsChange,
  onClearFilters
}: SearchFiltersSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)

  const activeFiltersCount = selectedCategories.length + selectedTags.length + 
    (minLikes > 0 ? 1 : 0) + (minViews > 0 ? 1 : 0)

  const displayCategories = showAllCategories ? categories : categories.slice(0, 8)
  const displayTags = showAllTags ? tags : tags.slice(0, 12)

  return (
    <div className="space-y-4">
      {/* 筛选器标题 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className="w-5 h-5" />
              筛选器
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                清除 ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* 分类筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Grid3x3 className="w-4 h-4" />
            分类
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`sidebar-category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryToggle(category)}
              />
              <Label
                htmlFor={`sidebar-category-${category}`}
                className="text-sm cursor-pointer flex-1"
              >
                {category}
              </Label>
              {selectedCategories.includes(category) && (
                <Badge variant="secondary" className="text-xs">
                  ✓
                </Badge>
              )}
            </div>
          ))}
          
          {categories.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {showAllCategories ? '收起' : `显示全部 (${categories.length})`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 标签筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="w-4 h-4" />
            热门标签
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
                onClick={() => onTagToggle(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
          
          {tags.length > 12 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTags(!showAllTags)}
              className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {showAllTags ? '收起' : `显示全部 (${tags.length})`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 互动数据筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-4 h-4" />
            互动数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 最小点赞数 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-2">
                <Heart className="w-3 h-3" />
                最小点赞数
              </Label>
              <span className="text-sm font-medium text-blue-600">
                {minLikes > 0 ? minLikes : '不限'}
              </span>
            </div>
            <Slider
              value={[minLikes]}
              onValueChange={(values) => onMinLikesChange(values[0])}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>

          <Separator />

          {/* 最小浏览数 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-2">
                <Eye className="w-3 h-3" />
                最小浏览数
              </Label>
              <span className="text-sm font-medium text-blue-600">
                {minViews > 0 ? minViews : '不限'}
              </span>
            </div>
            <Slider
              value={[minViews]}
              onValueChange={(values) => onMinViewsChange(values[0])}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* 快速筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            快速筛选
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              onMinLikesChange(100)
              onMinViewsChange(1000)
            }}
          >
            热门作品
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              onMinLikesChange(0)
              onMinViewsChange(0)
            }}
          >
            全部作品
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
