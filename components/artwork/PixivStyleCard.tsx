'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart, Bookmark, Eye, User, MoreHorizontal, Play } from 'lucide-react'
import type { Artwork } from '@/lib/supabase'

interface PixivStyleCardProps {
  artwork: Artwork & {
    users?: {
      id: string
      username: string
      avatar_url?: string
    }
  }
  onLike?: (postId: string) => void
  onBookmark?: (postId: string) => void
}

export function PixivStyleCard({ artwork, onLike, onBookmark }: PixivStyleCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [actualAspectRatio, setActualAspectRatio] = useState<number | null>(null)

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoading(false)
    const img = e.currentTarget
    const width = img.naturalWidth
    const height = img.naturalHeight
    
    setImageDimensions({ width, height })
    
    // 计算实际宽高比，并限制在合理范围内
    let aspectRatio = width / height
    
    // 限制宽高比范围，避免过于极端的比例
    const minRatio = 0.5  // 最窄（高图）
    const maxRatio = 2.5  // 最宽（宽图）
    
    aspectRatio = Math.max(minRatio, Math.min(maxRatio, aspectRatio))
    setActualAspectRatio(aspectRatio)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    onLike?.(artwork.id)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
    onBookmark?.(artwork.id)
  }

  // 获取图片的宽高比
  const getImageAspectRatio = () => {
    // 如果已经获取到实际宽高比，使用实际值
    if (actualAspectRatio !== null) {
      return actualAspectRatio
    }
    
    // 如果还没有加载完成，使用默认值或基于ID的伪随机值
    const ratios = [1, 1.2, 1.4, 0.8, 0.7]
    const hash = artwork.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return ratios[hash % ratios.length]
  }

  // 获取图片的显示策略
  const getImageDisplayStrategy = () => {
    if (!imageDimensions) return 'cover'
    
    const { width, height } = imageDimensions
    const ratio = width / height
    
    // 对于极端比例的图片，使用contain来确保完整显示
    if (ratio > 3 || ratio < 0.33) {
      return 'contain'
    }
    
    // 对于正常比例的图片，使用cover来填充容器
    return 'cover'
  }

  const aspectRatio = getImageAspectRatio()

  return (
    <div className="mb-4 break-inside-avoid">
      <Link href={`/artwork/${artwork.id}`} className="block group">
        <div 
          className="pixiv-card card-enter relative rounded-lg overflow-hidden shadow-sm border"
          style={{
            backgroundColor: 'var(--base-100)',
            borderColor: 'var(--base-300)'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 图片容器 */}
          <div 
            className="relative overflow-hidden transition-all duration-300 ease-out"
            style={{ 
              aspectRatio: aspectRatio,
              backgroundColor: 'var(--base-200)'
            }}
          >
            {imageLoading && (
              <div 
                className="absolute inset-0 animate-pulse"
                style={{
                  background: `linear-gradient(to bottom right, var(--base-200), var(--base-300))`
                }}
              />
            )}
            
            {!imageError ? (
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className={`pixiv-card-image w-full h-full transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  objectFit: getImageDisplayStrategy()
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--base-200)' }}
              >
                <div 
                  className="text-center"
                  style={{ color: 'var(--base-content)' }}
                >
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="text-sm opacity-60">图片加载失败</div>
                </div>
              </div>
            )}

            {/* 图片尺寸信息 */}
            {imageDimensions && (
              <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white'
              }}>
                {imageDimensions.width} × {imageDimensions.height}
              </div>
            )}

            {/* 悬停时的遮罩和操作按钮 */}
            <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* 右上角操作按钮 */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={handleBookmark}
                  className={`bookmark-button p-1.5 rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
                    isBookmarked ? 'bookmarked' : ''
                  }`}
                  style={{
                    backgroundColor: isBookmarked ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
                    color: isBookmarked ? 'var(--primary-content)' : 'var(--base-content)'
                  }}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* 中心播放按钮（如果是动画） */}
              {artwork.tags && artwork.tags.includes('动画') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="p-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--base-content)'
                    }}
                  >
                    <Play className="w-6 h-6" />
                  </div>
                </div>
              )}

              {/* 底部统计信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center justify-between text-white">
                  <button
                    onClick={handleLike}
                    className={`like-button flex items-center gap-1 hover:scale-110 ${
                      isLiked ? 'liked' : ''
                    }`}
                    style={{
                      color: isLiked ? '#ef4444' : 'white'
                    }}
                  >
                    <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
                    <span className="text-sm font-medium">{(artwork.likes_count || 0) + (isLiked ? 1 : 0)}</span>
                  </button>
                  <div className="flex items-center gap-1 text-white/80">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{artwork.views_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 左上角标签 */}
            <div className="absolute top-2 left-2 flex gap-1">
              {artwork.tags && artwork.tags.includes('多图') && (
                <div className="bg-black/70 text-white px-2 py-0.5 rounded text-xs font-medium">
                  多图
                </div>
              )}
              {artwork.tags && artwork.tags.includes('动画') && (
                <div className="bg-purple-500/90 text-white px-2 py-0.5 rounded text-xs font-medium">
                  动画
                </div>
              )}
              {artwork.tags && artwork.tags.includes('R-18') && (
                <div className="bg-red-500/90 text-white px-2 py-0.5 rounded text-xs font-medium">
                  R-18
                </div>
              )}
            </div>
          </div>

          {/* 卡片信息 - Pixiv风格简洁设计 */}
          <div className="p-3">
            {/* 标题 */}
            <h3 
              className="text-sm font-medium line-clamp-2 mb-2 leading-tight transition-colors"
              style={{
                color: 'var(--base-content)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--base-content)'
              }}
            >
              {artwork.title}
            </h3>

            {/* 作者信息 */}
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
                style={{ backgroundColor: 'var(--base-200)' }}
              >
                {artwork.users?.avatar_url ? (
                  <img
                    src={artwork.users.avatar_url}
                    alt={artwork.users.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <span 
                className="text-xs truncate transition-colors"
                style={{
                  color: 'color-mix(in srgb, var(--base-content) 70%, transparent)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'color-mix(in srgb, var(--base-content) 70%, transparent)'
                }}
              >
                {artwork.users?.username || '未知用户'}
              </span>
            </div>

            {/* 简化的标签显示 */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {artwork.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="pixiv-tag inline-block px-1.5 py-0.5 text-xs rounded cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'var(--base-200)',
                      color: 'color-mix(in srgb, var(--base-content) 80%, transparent)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 10%, var(--base-200))'
                      e.currentTarget.style.color = 'var(--primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--base-200)'
                      e.currentTarget.style.color = 'color-mix(in srgb, var(--base-content) 80%, transparent)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
                {artwork.tags.length > 2 && (
                  <span className="inline-block px-1.5 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                    +{artwork.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}