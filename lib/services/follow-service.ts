import { supabase } from '../supabase'

export interface FollowStats {
  followers: number
  following: number
}

export interface FollowUser {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

// Simple in-memory cache for follow stats
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class FollowService {
  private followStatsCache = new Map<string, CacheEntry<FollowStats>>()
  private followStatusCache = new Map<string, CacheEntry<boolean>>()
  private readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

  private getCacheKey(followerId: string, followingId: string): string {
    return `${followerId}:${followingId}`
  }

  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt
  }

  private setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    const now = Date.now()
    cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    })
  }

  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key)
    if (!entry || this.isExpired(entry)) {
      cache.delete(key)
      return null
    }
    return entry.data
  }
  // 关注用户
  async followUser(followingId: string, followerId: string): Promise<void> {
    try {
      // 防止用户关注自己
      if (followerId === followingId) {
        throw new Error('不能关注自己')
      }

      // 检查缓存中的关注状态
      const cacheKey = this.getCacheKey(followerId, followingId)
      const cachedStatus = this.getFromCache(this.followStatusCache, cacheKey)
      
      if (cachedStatus === true) {
        throw new Error('已经关注了该用户')
      }

      // 如果缓存中没有或已过期，检查数据库
      if (cachedStatus === null) {
        const { data: existingFollow, error: checkError } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', followerId)
          .eq('following_id', followingId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingFollow) {
          // 更新缓存
          this.setCache(this.followStatusCache, cacheKey, true)
          throw new Error('已经关注了该用户')
        }
      }

      // 创建关注关系
      const { error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        })

      if (insertError) throw insertError

      // 更新缓存
      this.setCache(this.followStatusCache, cacheKey, true)
      
      // 清理相关的统计缓存
      this.followStatsCache.delete(followerId)
      this.followStatsCache.delete(followingId)
    } catch (error) {
      console.error('Error following user:', error)
      throw error
    }
  }

  // 取消关注用户
  async unfollowUser(followingId: string, followerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)

      if (error) throw error

      // 更新缓存
      const cacheKey = this.getCacheKey(followerId, followingId)
      this.setCache(this.followStatusCache, cacheKey, false)
      
      // 清理相关的统计缓存
      this.followStatsCache.delete(followerId)
      this.followStatsCache.delete(followingId)
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  }

  // 检查是否关注了某个用户
  async isFollowing(followingId: string, followerId: string): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(followerId, followingId)
      
      // 先检查缓存
      const cachedStatus = this.getFromCache(this.followStatusCache, cacheKey)
      if (cachedStatus !== null) {
        return cachedStatus
      }

      // 缓存中没有，查询数据库
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      const isFollowing = !!data
      
      // 更新缓存
      this.setCache(this.followStatusCache, cacheKey, isFollowing)
      
      return isFollowing
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  }

  // 获取用户的关注统计
  async getFollowStats(userId: string): Promise<FollowStats> {
    try {
      // 先检查缓存
      const cachedStats = this.getFromCache(this.followStatsCache, userId)
      if (cachedStats !== null) {
        return cachedStats
      }

      // 并行查询关注者和关注数量以提高性能
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ])

      if (followersResult.error) throw followersResult.error
      if (followingResult.error) throw followingResult.error

      const stats = {
        followers: followersResult.count || 0,
        following: followingResult.count || 0
      }

      // 更新缓存
      this.setCache(this.followStatsCache, userId, stats)

      return stats
    } catch (error) {
      console.error('Error fetching follow stats:', error)
      return { followers: 0, following: 0 }
    }
  }

  // 获取用户的关注者列表
  async getFollowers(userId: string, limit = 20, offset = 0): Promise<FollowUser[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          created_at,
          follower:user_profiles!follows_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            bio,
            created_at
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data?.map(follow => follow.follower).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching followers:', error)
      throw error
    }
  }

  // 获取用户的关注列表
  async getFollowing(userId: string, limit = 20, offset = 0): Promise<FollowUser[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          created_at,
          following:user_profiles!follows_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            bio,
            created_at
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data?.map(follow => follow.following).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching following:', error)
      throw error
    }
  }

  // 获取互相关注的用户列表
  async getMutualFollows(userId: string, limit = 20, offset = 0): Promise<FollowUser[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:user_profiles!follows_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            bio,
            created_at
          )
        `)
        .eq('follower_id', userId)
        .in('following_id', 
          supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', userId)
        )
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data?.map(follow => follow.following).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching mutual follows:', error)
      throw error
    }
  }

  // 批量检查关注状态
  async checkMultipleFollowStatus(userIds: string[], followerId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', followerId)
        .in('following_id', userIds)

      if (error) throw error

      const followingSet = new Set(data?.map(follow => follow.following_id) || [])
      
      return userIds.reduce((acc, userId) => {
        acc[userId] = followingSet.has(userId)
        return acc
      }, {} as Record<string, boolean>)
    } catch (error) {
      console.error('Error checking multiple follow status:', error)
      return {}
    }
  }
}

export const followService = new FollowService()