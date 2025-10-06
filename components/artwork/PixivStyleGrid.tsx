'use client'

import { useState, useEffect, useRef } from 'react'
import { PixivStyleCard } from './PixivStyleCard'
import type { Artwork } from '@/lib/supabase'

interface PixivStyleGridProps {
  artworks: (Artwork & {
    users?: {
      id: string
      username: string
      avatar_url?: string
    }
  })[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  onLike?: (postId: string) => void
  onBookmark?: (postId: string) => void
}

export function PixivStyleGrid({ 
  artworks, 
  loading = false, 
  onLoadMore, 
  hasMore = false,
  onLike,
  onBookmark 
}: PixivStyleGridProps) {
  const [columns, setColumns] = useState(4)
  const gridRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)

  // 响应式列数调整
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(2)      // sm
      else if (width < 768) setColumns(3) // md
      else if (width < 1024) setColumns(4) // lg
      else if (width < 1280) setColumns(5) // xl
      else setColumns(6)                   // 2xl
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // 无限滚动
  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, loading])

  if (loading && artworks.length === 0) {
    return (
      <div className="w-full">
        <div 
          ref={gridRef}
          className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-4 animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-300 dark:bg-gray-600"
                  style={{ aspectRatio: Math.random() * 0.6 + 0.7 }}
                ></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
    // 如果正在加载，显示骨架屏
    if (loading) {
      return (
        <div className="w-full">
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4 animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-300 dark:bg-gray-600"
                    style={{ aspectRatio: Math.random() * 0.6 + 0.7 }}
                  ></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    // 如果不在加载且没有作品，显示空状态
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
          暂无作品
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          等待精彩作品的出现
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 瀑布流布局 */}
      <div 
        ref={gridRef}
        className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4"
      >
        {artworks.map((artwork) => (
          <PixivStyleCard
            key={artwork.id}
            artwork={artwork}
            onLike={onLike}
            onBookmark={onBookmark}
          />
        ))}
      </div>

      {/* 加载更多指示器 */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>加载中...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="load-more-button px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            >
              加载更多
            </button>
          )}
        </div>
      )}

      {/* 底部加载动画 */}
      {loading && artworks.length > 0 && (
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-4 animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-300 dark:bg-gray-600"
                  style={{ aspectRatio: Math.random() * 0.6 + 0.7 }}
                ></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}