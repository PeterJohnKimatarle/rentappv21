'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Hook to synchronize NextAuth Google session with local AuthContext
export function useGoogleAuth() {
  const { data: session, status } = useSession()
  const { login } = useAuth()

  useEffect(() => {
    const syncGoogleUser = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        // Check if user is already logged in via AuthContext
        const currentUser = localStorage.getItem('rentapp_user')

        if (!currentUser) {
          // User signed in with Google but not in AuthContext
          // Try to find them in localStorage and log them in
          try {
            const storedUsers = JSON.parse(localStorage.getItem('rentapp_users') || '[]')
            const userEmail = session.user.email
            const googleUser = storedUsers.find((u: any) =>
              u.email.toLowerCase() === userEmail?.toLowerCase()
            )

            if (googleUser) {
              // Remove password before setting as current user
              const { password: _, ...safeUser } = googleUser
              localStorage.setItem('rentapp_user', JSON.stringify(safeUser))
              console.log('Synchronized Google user with AuthContext:', safeUser)
            }
          } catch (error) {
            console.error('Error syncing Google user:', error)
          }
        }
      }
    }

    syncGoogleUser()
  }, [session, status])

  return {
    isGoogleAuthenticated: status === 'authenticated',
    googleUser: session?.user,
    isLoading: status === 'loading'
  }
}
