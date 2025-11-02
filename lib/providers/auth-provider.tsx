'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { authService } from '../services/auth-service'
import { UserProfile } from '../types/database'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await authService.getSession()
        if (session?.user) {
          setUser(session.user)
          const userProfile = await authService.getUserProfile(session.user.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      setUser(user)
      
      if (user) {
        const userProfile = await authService.getUserProfile(user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await authService.signIn({ email, password })
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true)
      await authService.signUp({ email, password, username })
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      // Convert null values to undefined for UpdateProfileData compatibility
      const updateData = {
        username: updates.username,
        fullName: updates.full_name ?? undefined,
        bio: updates.bio ?? undefined,
        website: updates.website ?? undefined,
        avatar_url: updates.avatar_url ?? undefined
      }
      
      const updatedProfile = await authService.updateUserProfile(user.id, updateData)
      setProfile(updatedProfile)
    } catch (error) {
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const userProfile = await authService.getUserProfile(user.id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}