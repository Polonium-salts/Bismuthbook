"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { UserCard } from "@/components/user/user-card"
import { useAuth } from "@/lib/providers/auth-provider"
import { followService } from "@/lib/services/follow-service"
import { imageService } from "@/lib/services/image-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Users, RefreshCcw } from "lucide-react"

const PAGE_LIMIT = 20

interface FollowingUser {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
}

interface UserStats {
  followers: number
  following: number
  artworks: number
  totalLikes: number
}

export default function FollowingPage() {
  const { user, loading: authLoading } = useAuth()
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({})
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const isUnauthenticated = useMemo(() => !authLoading && !user, [authLoading, user])

  const loadFollowingUsers = useCallback(async (append = false) => {
    if (!user) return
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = append ? offset : 0
      const data = await followService.getFollowing(user.id, PAGE_LIMIT, currentOffset)

      if (append) {
        setFollowingUsers(prev => {
          const existing = new Set(prev.map(u => u.id))
          const merged = [...prev, ...data.filter(u => !existing.has(u.id))]
          return merged
        })
      } else {
        setFollowingUsers(data)
        setOffset(0)
      }

      // Load stats for each user
      const statsPromises = data.map(async (followingUser) => {
        try {
          const [followStats, userImages] = await Promise.all([
            followService.getFollowStats(followingUser.id),
            imageService.getUserImages(followingUser.id, 1000, 0)
          ])

          const totalLikes = userImages.reduce((sum, img) => sum + (img.like_count || 0), 0)

          return {
            userId: followingUser.id,
            stats: {
              followers: followStats.followers,
              following: followStats.following,
              artworks: userImages.length,
              totalLikes
            }
          }
        } catch (err) {
          console.error(`Error loading stats for user ${followingUser.id}:`, err)
          return {
            userId: followingUser.id,
            stats: { followers: 0, following: 0, artworks: 0, totalLikes: 0 }
          }
        }
      })

      const statsResults = await Promise.all(statsPromises)
      const newStats: Record<string, UserStats> = {}
      const newFollowingStatus: Record<string, boolean> = {}

      statsResults.forEach(({ userId, stats }) => {
        newStats[userId] = stats
        newFollowingStatus[userId] = true // They are all following since we got them from getFollowing
      })

      if (append) {
        setUserStats(prev => ({ ...prev, ...newStats }))
        setFollowingStatus(prev => ({ ...prev, ...newFollowingStatus }))
      } else {
        setUserStats(newStats)
        setFollowingStatus(newFollowingStatus)
      }

      setOffset(currentOffset + PAGE_LIMIT)
      setHasMore(data.length === PAGE_LIMIT)
    } catch (err) {
      console.error('Error loading following users:', err)
      setError(err instanceof Error ? err.message : '加载关注用户失败')
    } finally {
      setIsLoading(false)
    }
  }, [user, isLoading, offset])

  const refresh = useCallback(async () => {
    setOffset(0)
    await loadFollowingUsers(false)
  }, [loadFollowingUsers])

  const handleFollowChange = useCallback((userId: string, isFollowing: boolean) => {
    setFollowingStatus(prev => ({ ...prev, [userId]: isFollowing }))
    if (!isFollowing) {
      // Remove user from the list if unfollowed
      setFollowingUsers(prev => prev.filter(u => u.id !== userId))
      setUserStats(prev => {
        const newStats = { ...prev }
        delete newStats[userId]
        return newStats
      })
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user) {
      loadFollowingUsers(false)
    }
  }, [authLoading, user, loadFollowingUsers])

  if (authLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isUnauthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <Users className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">请先登录以查看关注用户</h2>
          <p className="text-muted-foreground">登录后可查看你关注的用户列表。</p>
        </div>
      </MainLayout>
    )
  }

  const emptyFollowing = followingUsers.length === 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">关注用户</h1>
            <p className="text-sm text-muted-foreground">你关注的用户列表</p>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            {isLoading ? '刷新中...' : '刷新'}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">加载失败</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button onClick={refresh} className="mt-2 text-sm text-primary hover:underline">重试</button>
          </div>
        )}

        {/* Empty state */}
        {emptyFollowing && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3">
            <Users className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-xl font-medium">你还没有关注任何人</h3>
            <p className="text-sm text-muted-foreground">去首页或用户页发现并关注喜欢的创作者吧。</p>
          </div>
        )}

        {/* User Grid */}
        {!emptyFollowing && (
          <>
            {isLoading && followingUsers.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followingUsers.map((followingUser) => (
                    <UserCard
                      key={followingUser.id}
                      user={{
                        ...followingUser,
                        avatar_url: followingUser.avatar_url || undefined,
                        bio: followingUser.bio || undefined
                      }}
                      stats={userStats[followingUser.id]}
                      isFollowing={followingStatus[followingUser.id]}
                      onFollowChange={handleFollowChange}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => loadFollowingUsers(true)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          加载中...
                        </>
                      ) : (
                        '加载更多'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

