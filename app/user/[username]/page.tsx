"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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

export default function UserProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const username = params.username as string
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    artworks: 0,
    followers: 0,
    following: 0,
    likes: 0
  })
  const [userArtworks, setUserArtworks] = useState<ImageWithUserAndStats[]>([])
  const [loading, setLoading] = useState(true)
  const [artworksLoading, setArtworksLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // 获取用户资料
  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      if (error) throw error
      
      if (!profile) {
        toast.error('用户不存在')
        return
      }

      setUserProfile(profile)
      await fetchUserStats(profile.id)
      await fetchUserArtworks(profile.id)
      
      // 检查是否已关注该用户
      if (currentUser && currentUser.id !== profile.id) {
        await checkFollowStatus(profile.id)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('获取用户资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取用户统计数据
  const fetchUserStats = async (userId: string) => {
    try {
      // 获取已发布作品数量
      const { count: artworksCount } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_published', true)

      // 获取总点赞数
      const { data: images } = await supabase
        .from('images')
        .select('like_count')
        .eq('user_id', userId)
        .eq('is_published', true)

      const totalLikes = images?.reduce((sum, img) => sum + img.like_count, 0) || 0

      // 获取关注统计数据
      const followService = new FollowService()
      const followStats = await followService.getFollowStats(userId)

      setUserStats({
        artworks: artworksCount || 0,
        followers: followStats.followers_count,
        following: followStats.following_count,
        likes: totalLikes
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  // 获取用户作品
  const fetchUserArtworks = async (userId: string) => {
    setArtworksLoading(true)
    try {
      const { data: artworks, error } = await supabase
        .from('images')
        .select(`
          *,
          user_profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserArtworks(artworks || [])
    } catch (error) {
      console.error('Error fetching user artworks:', error)
      toast.error('获取用户作品失败')
    } finally {
      setArtworksLoading(false)
    }
  }

  // 检查关注状态
  const checkFollowStatus = async (userId: string) => {
    if (!currentUser) return

    try {
      const followService = new FollowService()
      const isFollowingUser = await followService.isFollowing(currentUser.id, userId)
      setIsFollowing(isFollowingUser)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  // 关注/取消关注用户
  const handleFollowToggle = async () => {
    if (!currentUser || !userProfile) return

    setFollowLoading(true)
    try {
      const followService = new FollowService()
      
      if (isFollowing) {
        await followService.unfollowUser(currentUser.id, userProfile.id)
        setIsFollowing(false)
        // 更新关注者数量
        setUserStats(prev => ({
          ...prev,
          followers: prev.followers - 1
        }))
        toast.success('已取消关注')
      } else {
        await followService.followUser(currentUser.id, userProfile.id)
        setIsFollowing(true)
        // 更新关注者数量
        setUserStats(prev => ({
          ...prev,
          followers: prev.followers + 1
        }))
        toast.success('已关注')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('操作失败')
    } finally {
      setFollowLoading(false)
    }
  }

  useEffect(() => {
    if (username) {
      fetchUserProfile()
    }
  }, [username, currentUser])

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 用户信息骨架屏 */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full max-w-md" />
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>
            </div>

            {/* 统计信息骨架屏 */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 作品网格骨架屏 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!userProfile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">用户不存在</h1>
            <p className="text-muted-foreground mb-6">
              抱歉，找不到用户名为 "{username}" 的用户。
            </p>
            <Button onClick={() => window.history.back()}>
              返回上一页
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const isOwnProfile = currentUser?.id === userProfile.id

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 用户信息头部 */}
          <UserProfileHeader
            userProfile={userProfile}
            userStats={userStats}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowToggle={handleFollowToggle}
          />

          {/* 作品展示区域 */}
          <div className="mt-8">
            <Tabs defaultValue="artworks" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="artworks">
                  作品 ({userStats.artworks})
                </TabsTrigger>
                <TabsTrigger value="liked">
                  喜欢的作品
                </TabsTrigger>
                <TabsTrigger value="collections">
                  收藏夹
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="artworks" className="mt-6">
                <UserArtworkGrid
                  artworks={userArtworks}
                  loading={artworksLoading}
                  emptyMessage={
                    isOwnProfile 
                      ? "您还没有发布任何作品，快去创作吧！" 
                      : "该用户还没有发布任何作品"
                  }
                />
              </TabsContent>
              
              <TabsContent value="liked" className="mt-6">
                <div className="text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">喜欢的作品功能即将上线</p>
                </div>
              </TabsContent>
              
              <TabsContent value="collections" className="mt-6">
                <div className="text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">收藏夹功能即将上线</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}