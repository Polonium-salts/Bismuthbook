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
  const [columns, setColumns] = useState(4)
  const [columnHeights, setColumnHeights] = useState<number[]>([])
  const gridRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 响应式列数计算
  const updateColumns = useCallback(() => {
    const width = window.innerWidth
    if (width < 640) setColumns(2)      // sm
    else if (width < 768) setColumns(3) // md
    else if (width < 1024) setColumns(4) // lg
    else if (width < 1280) setColumns(5) // xl
    else setColumns(6)                   // 2xl
  }, [])

  useEffect(() => {
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [updateColumns])

  // 初始化列高度
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0))
  }, [columns])

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
      {/* Pixiv风格的瀑布流网格 */}
      <div 
        ref={gridRef}
        className="relative"
        style={{ 
          height: Math.max(...columnHeights) + 'px',
          minHeight: '400px'
        }}
      >
        {artworks.map((artwork, index) => (
          <PixivCard
            key={artwork.id}
            artwork={artwork}
            onHeightCalculated={() => {
              // 这里可以处理高度计算完成后的逻辑
            }}
            style={{
              position: 'absolute',
              width: `calc(${100 / columns}% - 12px)`,
              left: `${(index % columns) * (100 / columns)}%`,
              marginLeft: '6px',
              marginRight: '6px',
            }}
          />
        ))}
      </div>

      {/* 加载更多触发器 */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
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