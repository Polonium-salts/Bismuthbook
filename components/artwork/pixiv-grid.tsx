"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

interface CardPosition {
  left: number
  top: number
  width: number
  height: number
}

export function PixivGrid({ 
  artworks, 
  className, 
  onLoadMore, 
  hasMore = false, 
  isLoading = false 
}: PixivGridProps) {
  const [columns, setColumns] = useState(4)
  const [columnHeights, setColumnHeights] = useState<number[]>([])
  const [cardPositions, setCardPositions] = useState<Map<string, CardPosition>>(new Map())
  const [containerHeight, setContainerHeight] = useState(400)
  const gridRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 响应式列数计算 - 更精细的断点
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 480) setColumns(2)      // xs
      else if (width < 640) setColumns(2) // sm
      else if (width < 768) setColumns(3) // md
      else if (width < 1024) setColumns(4) // lg
      else if (width < 1280) setColumns(5) // xl
      else if (width < 1536) setColumns(6) // 2xl
      else setColumns(7)                   // 3xl+
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // 初始化列高度
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0))
    setCardPositions(new Map())
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

  // 获取最短列的索引
  const getShortestColumnIndex = useCallback(() => {
    return columnHeights.indexOf(Math.min(...columnHeights))
  }, [columnHeights])

  // 计算卡片位置
  const calculateCardPosition = useCallback((artworkId: string, cardHeight: number) => {
    if (!gridRef.current) return null

    const containerWidth = gridRef.current.offsetWidth
    const gap = 12 // 间距
    const columnWidth = (containerWidth - gap * (columns - 1)) / columns
    
    const columnIndex = getShortestColumnIndex()
    const left = columnIndex * (columnWidth + gap)
    const top = columnHeights[columnIndex]
    
    const position: CardPosition = {
      left,
      top,
      width: columnWidth,
      height: cardHeight
    }

    // 更新列高度
    setColumnHeights(prev => {
      const newHeights = [...prev]
      newHeights[columnIndex] += cardHeight + gap
      return newHeights
    })

    // 更新容器高度
    setContainerHeight(Math.max(...columnHeights))

    return position
  }, [columns, columnHeights, getShortestColumnIndex])

  // 处理卡片高度计算完成
  const handleCardHeightCalculated = useCallback((artworkId: string, height: number) => {
    const position = calculateCardPosition(artworkId, height)
    if (position) {
      setCardPositions(prev => new Map(prev.set(artworkId, position)))
    }
  }, [calculateCardPosition])

  return (
    <div className={cn("w-full", className)}>
      {/* Pixiv风格的瀑布流网格 */}
      <div 
        ref={gridRef}
        className="relative transition-all duration-300"
        style={{ 
          height: `${containerHeight}px`,
          minHeight: '400px'
        }}
      >
        {artworks.map((artwork) => {
          const position = cardPositions.get(artwork.id)
          return (
            <PixivCard
              key={artwork.id}
              artwork={artwork}
              columns={columns}
              onHeightCalculated={(height) => handleCardHeightCalculated(artwork.id, height)}
              style={position ? {
                position: 'absolute',
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${position.width}px`,
                transform: 'translateZ(0)', // 启用硬件加速
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              } : {
                position: 'absolute',
                opacity: 0,
                transform: 'translateZ(0)'
              }}
            />
          )
        })}
      </div>

      {/* 加载更多触发器 */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center mt-8"
        >
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">发现更多精彩作品...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}