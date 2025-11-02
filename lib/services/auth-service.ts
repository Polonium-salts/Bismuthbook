import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { UserProfile, UserProfileInsert, UserProfileUpdate } from '../types/database'

export interface SignUpData {
  email: string
  password: string
  username: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateProfileData {
  username?: string
  fullName?: string
  bio?: string
  website?: string
  avatar_url?: string
  avatarFile?: File
}

class AuthService {
  // Cache configuration
  private static readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
  private userProfileCache = new Map<string, { data: UserProfile; timestamp: number }>()
  private usernameCache = new Map<string, { data: UserProfile | null; timestamp: number }>()

  // Cache helper methods
  private getCacheKey(key: string): string {
    return key.toLowerCase()
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > AuthService.CACHE_DURATION
  }

  private setCache<T>(cache: Map<string, { data: T; timestamp: number }>, key: string, data: T): void {
    cache.set(this.getCacheKey(key), { data, timestamp: Date.now() })
  }

  private getFromCache<T>(cache: Map<string, { data: T; timestamp: number }>, key: string): T | null {
    const cached = cache.get(this.getCacheKey(key))
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.data
    }
    if (cached) {
      cache.delete(this.getCacheKey(key))
    }
    return null
  }

  private clearUserCache(userId: string): void {
    this.userProfileCache.delete(this.getCacheKey(userId))
    // Clear username cache entries that might reference this user
    const entries = Array.from(this.usernameCache.entries())
    for (const [key, value] of entries) {
      if (value.data?.id === userId) {
        this.usernameCache.delete(key)
      }
    }
  }
  // Sign up new user
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.username // 使用用户名作为显示名称
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const profileData: UserProfileInsert = {
          id: authData.user.id,
          username: data.username,
          full_name: data.username, // 使用用户名作为显示名称
          avatar_url: null,
          bio: null,
          website: null
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData)

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Try to create a minimal profile as fallback
          const fallbackProfile = {
            id: authData.user.id,
            username: `user_${authData.user.id.substring(0, 8)}`,
            full_name: `user_${authData.user.id.substring(0, 8)}`, // 使用用户名作为显示名称
            avatar_url: null,
            bio: null,
            website: null
          }
          
          const { error: fallbackError } = await supabase
            .from('user_profiles')
            .insert(fallbackProfile)
            
          if (fallbackError) {
            console.error('Error creating fallback user profile:', fallbackError)
          }
        }
      }

      return authData
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // Sign in user
  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) throw error

      return authData
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cached = this.getFromCache(this.userProfileCache, userId)
      if (cached) {
        return cached
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      // Cache the result
      if (data) {
        this.setCache(this.userProfileCache, userId, data)
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile> {
    try {
      let avatarUrl: string | undefined

      // Upload avatar if provided
      if (updates.avatarFile) {
        avatarUrl = await this.uploadAvatar(userId, updates.avatarFile)
      }

      const profileUpdates: UserProfileUpdate = {
        username: updates.username,
        full_name: updates.fullName,
        bio: updates.bio,
        website: updates.website,
        updated_at: new Date().toISOString()
      }

      if (avatarUrl) {
        profileUpdates.avatar_url = avatarUrl
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Clear cache and update with new data
      this.clearUserCache(userId)
      if (data) {
        this.setCache(this.userProfileCache, userId, data)
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // Upload user avatar
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  // Check if username is available
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error

      return data.length === 0
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cached = this.getFromCache(this.usernameCache, username)
      if (cached !== null) {
        return cached
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      if (error) throw error

      // Cache the result (including null results)
      this.setCache(this.usernameCache, username, data)
      
      // Also cache in user profile cache if data exists
      if (data) {
        this.setCache(this.userProfileCache, data.id, data)
      }

      return data
    } catch (error) {
      console.error('Error getting user by username:', error)
      return null
    }
  }

  // Ensure user profile exists for authenticated user
  async ensureUserProfile(user: User): Promise<UserProfile | null> {
    try {
      // Check if profile exists
      const existingProfile = await this.getUserProfile(user.id)
      if (existingProfile) {
        return existingProfile
      }

      // Create missing profile
      const profileData: UserProfileInsert = {
        id: user.id,
        username: user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
        full_name: user.user_metadata?.full_name || 'User',
        avatar_url: null,
        bio: null,
        website: null
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating missing user profile:', error)
        return null
      }

      // Cache the newly created profile
      if (data) {
        this.setCache(this.userProfileCache, data.id, data)
        this.setCache(this.usernameCache, data.username, data)
      }

      return data
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null
      
      // Ensure user profile exists when user signs in
      if (user && event === 'SIGNED_IN') {
        await this.ensureUserProfile(user)
      }
      
      callback(user)
    })
  }

  // Get session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }
}

export const authService = new AuthService()