import { supabase } from '../supabase'
import { UserProfile, UserProfileInsert, UserProfileUpdate } from '../types/database'
import { User, AuthError } from '@supabase/supabase-js'

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
  avatarFile?: File
}

class AuthService {
  // Sign up new user
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName || ''
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const profileData: UserProfileInsert = {
          id: authData.user.id,
          username: data.username,
          full_name: data.fullName || null,
          avatar_url: null,
          bio: null,
          website: null
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData)

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Don't throw error here as the user is already created
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

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

      const { data, error } = await supabase.storage
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error getting user by username:', error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
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