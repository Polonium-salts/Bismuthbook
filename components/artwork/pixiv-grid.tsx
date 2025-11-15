"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { ImageWithUserAndStats } from "@/lib/types/database"
import { PixivCard } from "./pixiv-card"
import { cn } from "@/lib/utils"

interface PixivGridProps {
  artworks: ImageWithUserAndStats[]
  className?: string
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

const PixivGrid = memo(function PixivGrid({ 
  artworks, 
  className, 
  onLoadMore, 
  hasMore = false, 
  isLoading = false 
}: PixivGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 无限滚动
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [onLoadMore, hasMore, isLoading])

  return (
    <div className={cn("w-full", className)}>
      {/* 简单的 CSS Grid 布局 - 修复重叠问题 */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
        style={{ gridAutoRows: 'max-content' }}
      >
        {artworks.map((artwork) => (
          <div key={artwork.id} className="w-full h-full">
            <PixivCard
              artwork={artwork}
              onHeightCalculated={() => {
                // 这里可以处理高度计算完成后的逻辑
              }}
            />
          </div>
        ))}
      </div>

      {/* 加载更多触发器 */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center mt-6"
        >
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>加载更多作品...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export { PixivGrid }