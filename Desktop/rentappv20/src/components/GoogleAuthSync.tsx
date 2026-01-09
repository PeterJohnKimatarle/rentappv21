'use client'

import { useGoogleAuth } from '@/hooks/useGoogleAuth'

// Component that synchronizes Google authentication with AuthContext
export function GoogleAuthSync() {
  useGoogleAuth() // This handles the synchronization

  // This component doesn't render anything, it just handles synchronization
  return null
}
