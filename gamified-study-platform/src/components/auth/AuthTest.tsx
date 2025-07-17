import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function AuthTest() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Auth Status</h3>
      {user ? (
        <div>
          <p className="text-green-600">✅ User is authenticated</p>
          <p>Email: {user.email}</p>
          <p>Username: {user.profile?.username || 'Not set'}</p>
        </div>
      ) : (
        <p className="text-red-600">❌ User is not authenticated</p>
      )}
    </div>
  )
}