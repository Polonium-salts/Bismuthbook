'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArtworkCard } from './ArtworkCard'
import type { Artwork } from '@/lib/supabase'

export function ArtworkGrid() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setArtworks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="h-8 bg-base-200 rounded-lg w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-base-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-sm border border-base-200 animate-pulse">
              <div className="aspect-square bg-gradient-to-br from-base-200 to-base-300 rounded-t-lg"></div>
              <div className="card-body p-3">
                <div className="h-4 bg-base-200 rounded mb-3"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full"></div>
                  <div className="h-3 bg-base-200 rounded flex-1"></div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-3">
                    <div className="h-3 w-8 bg-base-200 rounded"></div>
                    <div className="h-3 w-8 bg-base-200 rounded"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-4 w-12 bg-base-200 rounded-full"></div>
                    <div className="h-4 w-12 bg-base-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="card bg-base-100 shadow-lg border border-error/20">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-error mb-2">加载失败</h3>
            <p className="text-base-content/70 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button 
              className="btn btn-error btn-outline hover:btn-error"
              onClick={fetchArtworks}
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg border border-base-200">
          <div className="card-body text-center py-16">
            <div className="text-8xl mb-6">🎨</div>
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              还没有作品
            </h3>
            <p className="text-lg text-base-content/70 mb-8 max-w-md mx-auto">
              成为第一个分享作品的创作者吧！让你的创意在这里闪闪发光。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300">
                上传作品
              </button>
              <button className="btn btn-outline btn-lg">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          精美作品
        </h2>
        <p className="text-base-content/70">
          发现来自世界各地创作者的精彩作品
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="card bg-base-100 shadow-sm hover:shadow-xl border border-base-200 hover:border-primary/30 transition-all duration-300 group">
            <figure className="aspect-square overflow-hidden">
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </figure>
            <div className="card-body p-3">
              <h3 className="card-title text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {artwork.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-base-content/70 mb-2">
                <div className="avatar">
                  <div className="w-5 h-5 rounded-full ring-1 ring-base-300">
                    <img src={artwork.user?.avatar_url || '/default-avatar.png'} alt={artwork.user?.username} />
                  </div>
                </div>
                <span className="truncate">{artwork.user?.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-xs text-base-content/60">
                  <span className="flex items-center gap-1">
                    ❤️ {artwork.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    👁️ {artwork.views_count || 0}
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="badge badge-primary badge-xs"></div>
                  <div className="badge badge-secondary badge-xs"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-12">
          <button 
            className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                加载中...
              </>
            ) : (
              '加载更多作品'
            )}
          </button>
        </div>
      )}
    </div>
  )
}