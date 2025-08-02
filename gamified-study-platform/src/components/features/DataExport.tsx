import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useDataExport } from '../../hooks/useDataExport';
import type { DataExportForm, ExportOptions } from '../../types';

const DataExport: React.FC = () => {
  const { user } = useAuth();
  const {
    isExporting,
    exportProgress,
    backups,
    isLoadingBackups,
    error,
    exportData,
    createBackup,
    loadBackups,
    deleteBackup,
    clearError,
  } = useDataExport();

  const [activeTab, setActiveTab] = useState<'export' | 'backup'>('export');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: _errors },
  } = useForm<DataExportForm>({
    defaultValues: {
      format: 'json',
      includePersonalData: true,
      includeProgressData: true,
      includeGameData: true,
      includeStudyData: true,
      dateRangeEnabled: false,
    },
  });

  const dateRangeEnabled = watch('dateRangeEnabled');

  useEffect(() => {
    if (user && activeTab === 'backup') {
      loadBackups(user.id);
    }
  }, [user, activeTab, loadBackups]);

  const onSubmit = async (data: DataExportForm) => {
    if (!user) return;

    const options: ExportOptions = {
      format: data.format,
      includePersonalData: data.includePersonalData,
      includeProgressData: data.includeProgressData,
      includeGameData: data.includeGameData,
      includeStudyData: data.includeStudyData,
    };

    if (data.dateRangeEnabled && data.startDate && data.endDate) {
      options.dateRange = {
        start: data.startDate,
        end: data.endDate,
      };
    }

    await exportData(user.id, options);
  };

  const handleCreateBackup = async () => {
    if (!user) return;
    await createBackup(user.id);
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!user) return;
    try {
      await deleteBackup(user.id, backupId);
      setShowDeleteConfirm(null);
    } catch (_err) {
      // Error is handled by the hook
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Export Data
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Backup & Restore
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {exportProgress && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    {exportProgress.stage === 'error'
                      ? 'Export Failed'
                      : 'Exporting Data'}
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    {exportProgress.message}
                  </p>
                  {exportProgress.stage !== 'error' &&
                    exportProgress.stage !== 'complete' && (
                      <div className="mt-2">
                        <div className="bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${exportProgress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                </div>
                {exportProgress.stage === 'complete' && (
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Export Your Data
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Download your study data in various formats. Choose what data to
                include and the format you prefer.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="json"
                        {...register('format')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">JSON</div>
                        <div className="text-sm text-gray-500">
                          Complete data structure
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="csv"
                        {...register('format')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">CSV</div>
                        <div className="text-sm text-gray-500">
                          Spreadsheet format
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="pdf"
                        {...register('format')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">PDF</div>
                        <div className="text-sm text-gray-500">
                          Summary report
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data to Include
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('includePersonalData')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Personal Information</div>
                        <div className="text-sm text-gray-500">
                          Profile, preferences, and settings
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('includeStudyData')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Study Data</div>
                        <div className="text-sm text-gray-500">
                          Courses, sessions, and progress
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('includeGameData')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Gamification Data</div>
                        <div className="text-sm text-gray-500">
                          XP, achievements, and pet information
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('includeProgressData')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Progress Analytics</div>
                        <div className="text-sm text-gray-500">
                          Statistics and performance data
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      {...register('dateRangeEnabled')}
                      className="mr-3"
                    />
                    <span className="font-medium">Limit to Date Range</span>
                  </label>

                  {dateRangeEnabled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          {...register('startDate')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          {...register('endDate')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Backup & Restore
                  </h2>
                  <p className="text-sm text-gray-600">
                    Create backups of your data and restore from previous
                    backups.
                  </p>
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={isExporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Creating...' : 'Create Backup'}
                </button>
              </div>

              {isLoadingBackups ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Loading backups...
                  </p>
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No backups
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first backup to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map(backup => (
                    <div
                      key={backup.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {backup.filename}
                          </h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <span>
                              Created: {format(backup.createdAt, 'PPp')}
                            </span>
                            <span className="mx-2">•</span>
                            <span>Size: {formatFileSize(backup.fileSize)}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">
                              {backup.backupType} backup
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowDeleteConfirm(backup.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Delete Backup
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this backup? This action cannot
                be undone.
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBackup(showDeleteConfirm)}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExport;
