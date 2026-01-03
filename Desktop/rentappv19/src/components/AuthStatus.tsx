'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useSession } from 'next-auth/react'

interface AuthStatusProps {
  showDetails?: boolean
  compact?: boolean
}

export default function AuthStatus({ showDetails = false, compact = false }: AuthStatusProps) {
  const { user: localUser, isAuthenticated: localAuthenticated } = useAuth()
  const { data: session, status } = useSession()

  const googleAuthenticated = status === 'authenticated'

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${localAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={localAuthenticated ? 'text-green-700' : 'text-red-700'}>
          {localAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
        {googleAuthenticated && (
          <span className="text-blue-600 font-medium">+ Google</span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Authentication Status</h3>

      <div className="grid gap-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Local Auth:</span>
          <span className={`font-medium ${localAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
            {localAuthenticated ? '✓ Active' : '✗ Inactive'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Google Auth:</span>
          <span className={`font-medium ${googleAuthenticated ? 'text-blue-600' : 'text-gray-500'}`}>
            {googleAuthenticated ? '✓ Connected' : '○ Not Connected'}
          </span>
        </div>

        {showDetails && localUser && (
          <div className="border-t pt-3 mt-3">
            <h4 className="font-medium text-gray-900 mb-2">User Details</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-600">Name:</span> {localUser.name}</div>
              <div><span className="text-gray-600">Email:</span> {localUser.email}</div>
              <div><span className="text-gray-600">Role:</span> {localUser.role}</div>
              {localUser.profileImage && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Avatar:</span>
                  <img
                    src={localUser.profileImage}
                    alt="Profile"
                    className="w-6 h-6 rounded-full border"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {showDetails && session?.user && (
          <div className="border-t pt-3 mt-3">
            <h4 className="font-medium text-blue-900 mb-2">Google Session</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-600">Name:</span> {session.user.name}</div>
              <div><span className="text-gray-600">Email:</span> {session.user.email}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
