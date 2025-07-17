import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '../components/auth/RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()

  const handleRegisterSuccess = () => {
    // User will be redirected to email confirmation
    // After confirmation, they'll be redirected to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">StudyQuest</h1>
          <p className="text-gray-600">Level up your learning</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  )
}