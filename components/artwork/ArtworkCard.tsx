'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { MessageCircle, Eye, User } from 'lucide-react'
import LikeButton from '@/components/interactions/LikeButton'
import BookmarkButton from '@/components/interactions/BookmarkButton'
import type { Artwork } from '@/lib/supabase'

interface ArtworkCardProps {
  artwork: Artwork & {
    users?: {
      id: string
      username: string
      avatar_url?: string
    }
  }
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-200">
      <figure className="relative aspect-square overflow-hidden">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <BookmarkButton postId={artwork.id} size="sm" />
        </div>
      </figure>
      
      <div className="card-body p-3 md:p-4 bg-base-50">
        <h3 className="card-title text-base md:text-lg font-semibold line-clamp-2 text-slate-800 dark:text-slate-100">
          {artwork.title}
        </h3>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className="avatar">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full shadow-sm">
              {artwork.user?.avatar_url ? (
                <img src={artwork.user.avatar_url} alt={artwork.user.username} />
              ) : (
                <div className="bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-xs md:text-sm font-medium">
                  {artwork.user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
          <Link 
            href={`/user/${artwork.user?.username}`}
            className="text-xs md:text-sm text-slate-700 dark:text-slate-200 hover:text-primary transition-colors truncate font-medium"
          >
            {artwork.user?.username}
          </Link>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-base-200">
          <div className="flex items-center space-x-2 md:space-x-4">
            <LikeButton postId={artwork.id} size="sm" />
            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium">{artwork.comments_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
              <Eye className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium">{artwork.views_count || 0}</span>
            </div>
          </div>
        </div>

        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {artwork.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="badge badge-outline badge-xs md:badge-sm hover:badge-primary transition-colors"
              >
                {tag}
              </span>
            ))}
            {artwork.tags.length > 2 && (
              <span className="badge badge-outline badge-xs md:badge-sm text-slate-600 dark:text-slate-300">
                +{artwork.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}