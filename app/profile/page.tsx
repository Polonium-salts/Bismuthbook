"use client"

import { useState, useEffect, useCallback } from "react"
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
import { User, AlertCircle } from "lucide-react"
import { toast } from "sonner"

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

  // 获取用户统计数据
  const fetchUserStats = useCallback(async (userId: string) => {
    try {
      // 获取作品数量
      const { count: artworksCount } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // 获取关注统计
      const followStats = await followService.getFollowStats(userId)

      // 获取获赞数量（用户作品的总获赞数）
      const { data: userImages } = await supabase
        .from('images')
        .select('like_count')
        .eq('user_id', userId)

      const totalLikes = userImages?.reduce((sum, img) => sum + (img.like_count || 0), 0) || 0

      setUserStats({
        artworks: artworksCount || 0,
        followers: followStats.followers,
        following: followStats.following,
        likes: totalLikes
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }, [])

  // 获取用户作品
  const fetchUserArtworks = useCallback(async (userId: string) => {
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

      // 转换为 ImageWithUserAndStats 格式
      const artworksWithStats = data?.map(artwork => ({
        ...artwork,
        likes: [], // 空数组，因为我们只需要统计数据
        favorites: [], // 空数组，因为我们只需要统计数据
        comments: [] // 空数组，因为我们只需要统计数据
      })) || []

      setUserArtworks(artworksWithStats)
    } catch (error) {
      console.error('Error in fetchUserArtworks:', error)
    } finally {
      setArtworksLoading(false)
    }
  }, [])

  // 获取用户资料
  const fetchUserProfile = useCallback(async () => {
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
  }, [user, fetchUserStats, fetchUserArtworks])

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
          likes: [], // 空数组，因为我们只需要统计数据
          favorites: [], // 空数组，因为我们只需要统计数据
          comments: [] // 空数组，因为我们只需要统计数据
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
          likes: [], // 空数组，因为我们只需要统计数据
          favorites: [], // 空数组，因为我们只需要统计数据
          comments: [] // 空数组，因为我们只需要统计数据
        }
      }) || []

      setFavoriteArtworks(favoritesWithStats)
    } catch (error) {
      console.error('Error in fetchFavoriteArtworks:', error)
    } finally {
      setFavoritesLoading(false)
    }
  }

  // 监听用户状态变化
  useEffect(() => {
    if (user) {
      fetchUserProfile()
    } else {
      // 未登录用户，清空加载状态
      setLoading(false)
    }
  }, [user, fetchUserProfile])

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
                onClick={() => router.push('/?auth=login')} 
                className="w-full"
              >
                登录账号
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/?auth=register')}
                className="w-full"
              >
                注册新账号
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* 用户资料骨架屏 */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
              <div className="flex gap-4">
                <Skeleton className="w-24 h-10" />
                <Skeleton className="w-24 h-10" />
              </div>
            </div>
          </div>
          
          {/* 统计数据骨架屏 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="w-8 h-8 mx-auto mb-2" />
                  <Skeleton className="w-16 h-4 mx-auto" />
                </CardContent>
              </Card>
            ))}
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
      <div className="container mx-auto px-4 py-8">
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
        <Tabs defaultValue="artworks" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="artworks">我的作品</TabsTrigger>
            <TabsTrigger value="liked" onClick={() => fetchLikedArtworks()}>
              喜欢的作品
            </TabsTrigger>
            <TabsTrigger value="favorites" onClick={() => fetchFavoriteArtworks()}>
              收藏夹
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="mt-6">
            <UserArtworkGrid
              artworks={userArtworks}
              loading={artworksLoading}
              emptyMessage="还没有发布任何作品"
            />
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <UserArtworkGrid
              artworks={likedArtworks}
              loading={likedLoading}
              emptyMessage="还没有喜欢任何作品"
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
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