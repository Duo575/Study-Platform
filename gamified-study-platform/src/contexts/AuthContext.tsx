import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, type AuthUser } from '../services/auth'
import type { LoginForm, RegisterForm } from '../types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (data: RegisterForm) => Promise<void>
  signIn: (data: LoginForm) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: {
    username?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await AuthService.getSession()
        if (session?.user) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (data: RegisterForm) => {
    setLoading(true)
    try {
      await AuthService.signUp(data)
      // User will be set via the auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signIn = async (data: LoginForm) => {
    setLoading(true)
    try {
      await AuthService.signIn(data)
      // User will be set via the auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email)
  }

  const updatePassword = async (newPassword: string) => {
    await AuthService.updatePassword(newPassword)
  }

  const updateProfile = async (updates: {
    username?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }) => {
    await AuthService.updateProfile(updates)
    // Refresh user data
    const updatedUser = await AuthService.getCurrentUser()
    setUser(updatedUser)
  }

  const uploadAvatar = async (file: File) => {
    return await AuthService.uploadAvatar(file)
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}