'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Share2, Download, Eye, MessageCircle, Calendar, Tag, User, Heart } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import LikeButton from '@/components/interactions/LikeButton'
import BookmarkButton from '@/components/interactions/BookmarkButton'
import FollowButton from '@/components/interactions/FollowButton'
import CommentSection from '@/components/interactions/CommentSection'
import type { Artwork, Comment } from '@/lib/supabase'

interface ArtworkWithUser extends Artwork {
  users: {
    id: string
    username: string
    avatar_url?: string
  }
}

export default function ArtworkPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [artwork, setArtwork] = useState<ArtworkWithUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (params.id) {
      fetchArtwork()
      fetchComments()
      if (user) {
        checkUserInteractions()
      }
    }
  }, [params.id, user])

  const fetchArtwork = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      // 将 post 数据转换为 artwork 格式
      const artworkData: ArtworkWithUser = {
        id: data.id,
        user_id: data.user_id,
        title: data.content?.substring(0, 50) || '',
        description: data.content || '',
        image_urls: data.image_urls || [],
        image_url: data.image_urls?.[0] || '',
        thumbnail_url: data.image_urls?.[0] || '',
        likes_count: data.likes_count || 0,
        views_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        is_public: true,
        created_at: data.created_at,
        updated_at: data.updated_at,
        users: data.users
      }
      
      setArtwork(artworkData)

      // 增加浏览量（如果有相关的 RPC 函数）
      // await supabase.rpc('increment_views', { post_id: params.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('artwork_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (err) {
      console.error('加载评论失败:', err)
    }
  }

  const checkUserInteractions = async () => {
    if (!user) return

    try {
      // 检查是否已点赞
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('artwork_id', params.id)
        .eq('user_id', user.id)
        .single()

      setIsLiked(!!likeData)

      // 检查是否已收藏
      const { data: favoriteData } = await supabase
        .from('favorites')
        .select('id')
        .eq('artwork_id', params.id)
        .eq('user_id', user.id)
        .single()

      setIsFavorited(!!favoriteData)
    } catch (err) {
      // 忽略错误，可能是没有找到记录
    }
  }



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-base-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-base-200 rounded"></div>
              <div className="h-4 bg-base-200 rounded w-3/4"></div>
              <div className="h-20 bg-base-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">作品不存在</h1>
          <p className="text-base-content/70 mb-4">{error || '找不到指定的作品'}</p>
          <button className="btn btn-primary" onClick={() => router.back()}>
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* 返回按钮 */}
      <div className="mb-4 md:mb-6">
        <button 
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* 左侧：作品图片 */}
        <div className="lg:col-span-2">
          <div className="relative aspect-square bg-base-200 rounded-lg overflow-hidden">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 作品信息 */}
        <div className="space-y-4 md:space-y-6">
          {/* 标题和作者 */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{artwork.title}</h1>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <Link 
                href={`/user/${artwork.users.username}`}
                className="flex items-center gap-2 md:gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors flex-1 min-w-0"
              >
                <div className="avatar">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full">
                    {artwork.users.avatar_url ? (
                      <Image
                        src={artwork.users.avatar_url}
                        alt={artwork.users.username}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary text-primary-content flex items-center justify-center">
                        <User className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm md:text-base truncate">{artwork.users.username}</h3>
                  <p className="text-xs md:text-sm text-base-content/70">
                    {new Date(artwork.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </Link>
              
              <FollowButton 
                targetUserId={artwork.user_id}
                targetUsername={artwork.users.username}
                size="sm"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 md:gap-4">
            <LikeButton 
              postId={artwork.id}
              initialCount={artwork.likes_count || 0}
              size="md"
              showCount={true}
            />
            <BookmarkButton 
              postId={artwork.id}
              size="md"
            />
            <button className="btn btn-outline">
              <Share2 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
            <button className="btn btn-outline">
              <Download className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">下载</span>
            </button>
          </div>

          {/* 统计信息 */}
          <div className="stats shadow stats-vertical sm:stats-horizontal">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Eye className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="stat-title text-xs md:text-sm">浏览量</div>
              <div className="stat-value text-primary text-lg md:text-2xl">{artwork.views_count || 0}</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Heart className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="stat-title text-xs md:text-sm">点赞数</div>
              <div className="stat-value text-secondary text-lg md:text-2xl">{artwork.likes_count || 0}</div>
            </div>
          </div>

          {/* 描述 */}
          {artwork.description && (
            <div>
              <h3 className="font-medium mb-2">作品描述</h3>
              <p className="text-base-content/80 whitespace-pre-wrap">
                {artwork.description}
              </p>
            </div>
          )}

          {/* 标签 */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2 text-sm md:text-base">
                <Tag className="w-4 h-4" />
                标签
              </h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {artwork.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/search?tag=${encodeURIComponent(tag)}`}
                    className="badge badge-outline badge-sm md:badge-md hover:badge-primary transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 评论区 */}
      <div className="mt-12">
        <CommentSection postId={artwork.id} />
      </div>
    </div>
  )
}