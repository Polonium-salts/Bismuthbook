'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, Link as LinkIcon, Heart, Eye, MessageCircle } from 'lucide-react'
import type { Artwork } from '@/lib/supabase'
import FollowButton from '@/components/interactions/FollowButton'

interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  created_at: string
}

interface ArtworkWithStats extends Artwork {
  likes_count: number
  comments_count: number
  views_count: number
}

export default function UserProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'artworks' | 'liked' | 'bookmarked'>('artworks')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.username) {
      fetchUserProfile()
      fetchUserArtworks()
      if (user) {
        checkFollowStatus()
      }
    }
  }, [params.username, user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', params.username)
        .single()

      if (error) throw error
      setProfile(data)

      // 获取关注数据
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', data.id)

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', data.id)

      setFollowersCount(followersCount || 0)
      setFollowingCount(followingCount || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserArtworks = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('username', params.username)
        .single()

      if (!userData) return

      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (err) {
      console.error('加载用户作品失败:', err)
    }
  }

  const checkFollowStatus = async () => {
    if (!user || !profile) return

    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single()

      setIsFollowing(!!data)
    } catch (err) {
      // 忽略错误，可能是没有找到记录
    }
  }



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-base-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-base-200 rounded w-32"></div>
              <div className="h-4 bg-base-200 rounded w-48"></div>
              <div className="h-4 bg-base-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-base-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">用户不存在</h1>
          <p className="text-base-content/70 mb-4">{error || '找不到指定的用户'}</p>
          <Link href="/" className="btn btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* 用户信息头部 */}
      <div className="bg-base-100 rounded-lg p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          {/* 头像 */}
          <div className="avatar mx-auto sm:mx-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="bg-primary text-primary-content flex items-center justify-center text-xl md:text-2xl">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* 用户信息 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <h1 className="text-xl md:text-2xl font-bold">{profile.username}</h1>
              {!isOwnProfile && user && (
                  <FollowButton
                    targetUserId={profile.id}
                    targetUsername={profile.username}
                    size="sm"
                    onFollowChange={(following) => {
                      setFollowersCount(prev => following ? prev + 1 : prev - 1)
                    }}
                  />
                )}
              {isOwnProfile && (
                <Link href="/settings" className="btn btn-outline btn-sm">
                  编辑资料
                </Link>
              )}
            </div>

            {/* 统计信息 */}
            <div className="flex justify-center sm:justify-start gap-4 md:gap-6 mb-3 md:mb-4 text-xs md:text-sm">
              <div className="text-center">
                <div className="font-medium text-lg md:text-xl">{artworks.length}</div>
                <div className="text-base-content/70">作品</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg md:text-xl">{followersCount}</div>
                <div className="text-base-content/70">关注者</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg md:text-xl">{followingCount}</div>
                <div className="text-base-content/70">关注中</div>
              </div>
            </div>

            {/* 个人简介 */}
            {profile.bio && (
              <p className="text-sm md:text-base text-base-content/80 mb-3 md:mb-4">{profile.bio}</p>
            )}

            {/* 其他信息 */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 md:gap-4 text-xs md:text-sm text-base-content/70">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                <span>加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors truncate max-w-32"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'artworks' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('artworks')}
        >
          作品 ({artworks.length})
        </button>
        {isOwnProfile && (
          <>
            <button
              className={`tab ${activeTab === 'liked' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('liked')}
            >
              点赞的作品
            </button>
            <button
              className={`tab ${activeTab === 'favorites' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              收藏的作品
            </button>
          </>
        )}
      </div>

      {/* 作品网格 */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">作品集</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {artworks.map((artwork) => (
            <Link
              key={artwork.id}
              href={`/artwork/${artwork.id}`}
              className="group relative aspect-square rounded-lg overflow-hidden bg-base-200 hover:shadow-lg transition-all duration-200"
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              
              {/* 悬停时显示的信息 */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                <h3 className="text-white font-medium text-sm line-clamp-2">
                  {artwork.title}
                </h3>
                
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{artwork.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{artwork.views_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{artwork.comments_count || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {artworks.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm md:text-base text-base-content/50 mb-3 md:mb-4">
              {isOwnProfile ? '你还没有上传任何作品' : '该用户还没有公开的作品'}
            </p>
            {isOwnProfile && (
              <Link href="/upload" className="btn btn-primary btn-sm md:btn-md">
                上传第一个作品
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}