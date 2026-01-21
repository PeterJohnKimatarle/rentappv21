'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { GoogleAuthSync } from './GoogleAuthSync'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <LanguageProvider>
          <GoogleAuthSync />
          {children}
        </LanguageProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
