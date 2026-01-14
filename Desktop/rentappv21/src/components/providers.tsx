'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { GoogleAuthSync } from './GoogleAuthSync'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <GoogleAuthSync />
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}
