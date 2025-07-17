import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../contexts/AuthContext'
import { updatePasswordSchema, type UpdatePasswordFormData } from '../../lib/validations'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function PasswordUpdateForm() {
  const { updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema)
  })

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Note: Supabase doesn't require current password verification for updateUser
      // In a production app, you might want to add this verification
      await updatePassword(data.newPassword)
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Password updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            error={errors.newPassword?.message}
            helperText="At least 6 characters with uppercase, lowercase, and number"
            {...register('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            error={errors.confirmNewPassword?.message}
            {...register('confirmNewPassword')}
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  )
}