"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { UserProfileHeader } from "@/components/user/user-profile-header"
import dynamic from "next/dynamic"

const UserArtworkGrid = dynamic(() => import("@/components/user/user-artwork-grid").then(mod => ({ default: mod.UserArtworkGrid })), {
  loading: () => <div className="flex items-center justify-center p-8">加载作品中...</div>
})
import { useAuth } from "@/lib/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { UserProfile, ImageWithUserAndStats } from "@/lib/types/database"
import { followService } from "@/lib/services/follow-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, AlertCircle, Settings } from "lucide-react"
import { toast } from "sonner"
import { AuthModal } from "@/components/auth/auth-modal"

interface UserStats {
  artworks: number
  followers: number
  following: number
  likes: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userArtworks, setUserArtworks] = useState<ImageWithUserAndStats[]>([])
  const [likedArtworks, setLikedArtworks] = useState<ImageWithUserAndStats[]>([])
  const [favoriteArtworks, setFavoriteArtworks] = useState<ImageWithUserAndStats[]>([])
  const [loading, setLoading] = useState(true)
  const [artworksLoading, setArtworksLoading] = useState(false)
  const [likedLoading, setLikedLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  // 当用户状态改变时，获取用户资料
  useEffect(() => {
    if (user) {
      fetchUserProfile()
    } else {
      // 未登录用户，清空加载状态
      setLoading(false)
    }
  }, [user])

  // 获取用户资料
  const fetchUserProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        toast.error('获取用户资料失败')
        return
      }

      setUserProfile(data)
      
      // 获取用户统计数据和作品
      await Promise.all([
        fetchUserStats(user.id),
        fetchUserArtworks(user.id)
      ])
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      toast.error('获取用户资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取用户统计数据
  const fetchUserStats = async (userId: string) => {
    try {
      // 获取作品数量
      const { count: artworksCount } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // 获取关注统计
      const followStats = await followService.getFollowStats(userId)

      // 获取获赞数量 - 统计用户所有作品的点赞数
      const { data: userImages } = await supabase
        .from('images')
        .select('id')
        .eq('user_id', userId)
        .eq('is_published', true)

      let likesCount = 0
      if (userImages && userImages.length > 0) {
        const imageIds = userImages.map(img => img.id)
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('image_id', imageIds)
        
        likesCount = count || 0
      }

      setUserStats({
        artworks: artworksCount || 0,
        followers: followStats.followers,
        following: followStats.following,
        likes: likesCount || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  // 获取用户作品
  const fetchUserArtworks = async (userId: string) => {
    try {
      setArtworksLoading(true)
      
      const { data, error } = await supabase
        .from('images')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user artworks:', error)
        return
      }

      // 使用数据库中已有的统计字段，并添加必需的数组属性
      const artworksWithStats = data?.map(artwork => ({
        ...artwork,
        likes_count: artwork.like_count || 0,
        views_count: artwork.view_count || 0,
        comments_count: artwork.comment_count || 0,
        likes: [],
        favorites: [],
        comments: []
      })) || []

      setUserArtworks(artworksWithStats)
    } catch (error) {
      console.error('Error in fetchUserArtworks:', error)
    } finally {
      setArtworksLoading(false)
    }
  }

  // 获取喜欢的作品
  const fetchLikedArtworks = async () => {
    if (!user) return

    try {
      setLikedLoading(true)
      
      const { data, error } = await supabase
        .from('likes')
        .select(`
          images!inner(
            *,
            user_profiles!inner(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching liked artworks:', error)
        return
      }

      const likedWithStats = data?.map(item => {
        const artwork = item.images
        return {
          ...artwork,
          likes_count: artwork.like_count || 0,
          views_count: artwork.view_count || 0,
          comments_count: artwork.comment_count || 0,
          likes: [],
          favorites: [],
          comments: []
        }
      }) || []

      setLikedArtworks(likedWithStats)
    } catch (error) {
      console.error('Error in fetchLikedArtworks:', error)
    } finally {
      setLikedLoading(false)
    }
  }

  // 获取收藏的作品
  const fetchFavoriteArtworks = async () => {
    if (!user) return

    try {
      setFavoritesLoading(true)
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          images!inner(
            *,
            user_profiles!inner(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching favorite artworks:', error)
        return
      }

      const favoritesWithStats = data?.map(item => {
        const artwork = item.images
        return {
          ...artwork,
          likes_count: artwork.like_count || 0,
          views_count: artwork.view_count || 0,
          comments_count: artwork.comment_count || 0,
          likes: [],
          favorites: [],
          comments: []
        }
      }) || []

      setFavoriteArtworks(favoritesWithStats)
    } catch (error) {
      console.error('Error in fetchFavoriteArtworks:', error)
    } finally {
      setFavoritesLoading(false)
    }
  }

  // 如果用户未登录，显示登录提示
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">个人资料</h2>
            <p className="text-muted-foreground mb-6">
              登录后查看和管理您的个人资料、作品和收藏
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setAuthMode("login")
                  setShowAuthModal(true)
                }} 
                className="w-full"
              >
                登录账号
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAuthMode("register")
                  setShowAuthModal(true)
                }}
                className="w-full"
              >
                注册新账号
              </Button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authMode}
        />
      </MainLayout>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* 用户资料骨架屏 - 移动端优化 */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-full h-4" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-9" />
              <Skeleton className="flex-1 h-9" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!userProfile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">无法加载个人资料</h2>
            <p className="text-muted-foreground mb-4">请稍后重试</p>
            <Button onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* 用户资料头部 */}
        <UserProfileHeader
          userProfile={userProfile}
          userStats={userStats || { artworks: 0, followers: 0, following: 0, likes: 0 }}
          isOwnProfile={true}
          isFollowing={false}
          followLoading={false}
          onFollowToggle={() => {}}
        />

        {/* 作品展示区域 */}
        <Tabs defaultValue="artworks" className="mt-6 sm:mt-8">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="artworks" className="text-xs sm:text-sm">我的作品</TabsTrigger>
            <TabsTrigger value="liked" onClick={() => fetchLikedArtworks()} className="text-xs sm:text-sm">
              喜欢
            </TabsTrigger>
            <TabsTrigger value="favorites" onClick={() => fetchFavoriteArtworks()} className="text-xs sm:text-sm">
              收藏
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="mt-4 sm:mt-6">
            <UserArtworkGrid
              artworks={userArtworks}
              loading={artworksLoading}
              emptyMessage="还没有发布任何作品"
            />
          </TabsContent>

          <TabsContent value="liked" className="mt-4 sm:mt-6">
            <UserArtworkGrid
              artworks={likedArtworks}
              loading={likedLoading}
              emptyMessage="还没有喜欢任何作品"
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-4 sm:mt-6">
            <UserArtworkGrid
              artworks={favoriteArtworks}
              loading={favoritesLoading}
              emptyMessage="收藏夹是空的"
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}