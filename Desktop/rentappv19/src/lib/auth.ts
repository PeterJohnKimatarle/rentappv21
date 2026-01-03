import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Types for localStorage users
interface StoredUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  bio?: string
  profileImage?: string
  role: 'tenant' | 'landlord' | 'broker' | 'staff' | 'admin'
  isApproved?: boolean
  password: string
}

const USERS_KEY = 'rentapp_users'

// Helper functions for localStorage integration
const loadStoredUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.error('Error parsing stored users:', error)
  }

  localStorage.removeItem(USERS_KEY)
  return []
}

const saveStoredUsers = (users: StoredUser[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Conditionally include Google provider only if credentials are available
const providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
} else {
  console.warn('Google OAuth credentials not found. Google sign-in will not be available.')
}

export const authConfig = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log('Google Sign In:', { user, account, profile })

      if (!user.email) {
        console.error('No email provided by Google')
        return false
      }

      try {
        // Check if user already exists in localStorage
        const storedUsers = loadStoredUsers()
        const userEmail = user.email
        const existingUser = userEmail ? storedUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase()) : null

        if (!existingUser) {
          // Create new user from Google profile
          const googleProfile = profile as any // Google profile has these properties
          const newUser: StoredUser = {
            id: `google_${Date.now()}`, // Prefix to avoid conflicts
            name: user.name || user.email,
            firstName: googleProfile?.given_name,
            lastName: googleProfile?.family_name,
            email: user.email,
            profileImage: user.image || '/images/reed-richards.png',
            role: 'tenant', // Default role
            password: '', // No password for Google users
          }

          storedUsers.push(newUser)
          saveStoredUsers(storedUsers)
          console.log('Created new user from Google:', newUser)
        } else {
          console.log('Existing user signed in with Google:', existingUser)
        }

        return true
      } catch (error) {
        console.error('Error in Google sign-in callback:', error)
        return false
      }
    },
    async jwt({ token, user, account }: any) {
      // Add user info to JWT token
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: any) {
      // Add user info to session
      if (token && session.user) {
        (session.user as any).id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign in page (optional)
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
