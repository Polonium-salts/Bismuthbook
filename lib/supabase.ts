import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface User {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  website?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_urls?: string[]
  created_at: string
  updated_at: string
  // 从视图获取的额外字段
  username?: string
  display_name?: string
  avatar_url?: string
  likes_count?: number
  comments_count?: number
  reposts_count?: number
  is_liked?: boolean
  is_reposted?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_id?: string
  created_at: string
  updated_at: string
  // 从视图获取的额外字段
  username?: string
  display_name?: string
  avatar_url?: string
  likes_count?: number
}

export interface Like {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  created_at: string
}

export interface Repost {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Artwork {
  id: string
  user_id: string
  title?: string
  description?: string
  image_url?: string
  thumbnail_url?: string
  image_urls?: string[]
  tags?: string[]
  likes_count?: number
  views_count?: number
  comments_count?: number
  is_public?: boolean
  created_at: string
  updated_at: string
  // 从关联查询获取的用户信息
  users?: {
    id: string
    username: string
    avatar_url?: string
  }
}

// API 函数
export const api = {
  // 贴子相关
  async getPosts(limit = 20, offset = 0, userId?: string) {
    const { data, error } = await supabase.rpc('get_public_feed', {
      user_id_param: userId || null,
      limit_param: limit,
      offset_param: offset
    })
    
    if (error) throw error
    return (data || []) as Post[]
  },

  async createPost(content: string, imageUrls?: string[]) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_urls: imageUrls
      })
      .select()
      .single()

    if (error) throw error
    return data as Post
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
  },

  // 点赞相关
  async toggleLike(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (existingLike) {
      // 取消点赞
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)
      
      if (error) throw error
      return false
    } else {
      // 添加点赞
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          post_id: postId
        })
      
      if (error) throw error
      return true
    }
  },

  async likePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId
      })
    
    if (error) throw error
  },

  async unlikePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)
    
    if (error) throw error
  },

  // 转发相关
  async toggleRepost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    // 检查是否已转发
    const { data: existingRepost } = await supabase
      .from('reposts')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (existingRepost) {
      // 取消转发
      const { error } = await supabase
        .from('reposts')
        .delete()
        .eq('id', existingRepost.id)
      
      if (error) throw error
      return false
    } else {
      // 添加转发
      const { error } = await supabase
        .from('reposts')
        .insert({
          user_id: user.id,
          post_id: postId
        })
      
      if (error) throw error
      return true
    }
  },

  async repostPost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { error } = await supabase
      .from('reposts')
      .insert({
        user_id: user.id,
        post_id: postId
      })
    
    if (error) throw error
  },

  async unrepostPost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { error } = await supabase
      .from('reposts')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)
    
    if (error) throw error
  },

  // 评论相关
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments_with_details')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Comment[]
  },

  async createComment(postId: string, content: string, parentId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId
      })
      .select()
      .single()

    if (error) throw error
    return data as Comment
  },

  // 用户相关
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 从auth.users获取用户信息，并格式化为User类型
    return {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.username || user.email!.split('@')[0],
      display_name: user.user_metadata?.display_name || user.email!.split('@')[0],
      bio: user.user_metadata?.bio || '',
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    } as User
  },

  async updateUserProfile(userData: { username?: string; display_name?: string; bio?: string; avatar_url?: string }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    // 更新auth.users的user_metadata
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        ...userData
      }
    })

    if (error) throw error
    return data.user
  },

  // 图片上传
  async uploadImage(file: File, bucket = 'images') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  }
}