import React, { useState } from 'react'
import { ProfileForm } from '../components/profile/ProfileForm'
import { PasswordUpdateForm } from '../components/profile/PasswordUpdateForm'
import { Button } from '../components/ui/Button'
import ExportWidget from '../components/features/ExportWidget'

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'data'>('profile')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Password & Security
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'data'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'password' && <PasswordUpdateForm />}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Data Export & Backup</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Export your study data or create backups for safekeeping. You can download your data in various formats or create secure backups.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ExportWidget />
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">What's included in exports?</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Study sessions and progress data</li>
                      <li>• Course information and syllabi</li>
                      <li>• Achievements and gamification data</li>
                      <li>• Personal preferences and settings</li>
                      <li>• Quest history and completion status</li>
                    </ul>
                    <div className="mt-4">
                      <a 
                        href="/data-export" 
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Advanced export options →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Data Privacy</h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Your data is securely stored and encrypted. You have full control over your information and can export or delete it at any time.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="text-blue-600 hover:text-blue-500 font-medium">
                      View Privacy Policy
                    </button>
                    <button className="text-blue-600 hover:text-blue-500 font-medium">
                      Data Processing Agreement
                    </button>
                    <button className="text-red-600 hover:text-red-500 font-medium">
                      Request Account Deletion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}