import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataExport } from '../../hooks/useDataExport';
import type { ExportOptions } from '../../types';

interface ExportWidgetProps {
  className?: string;
  showTitle?: boolean;
}

const ExportWidget: React.FC<ExportWidgetProps> = ({ 
  className = '', 
  showTitle = true 
}) => {
  const { user } = useAuth();
  const { isExporting, exportProgress, exportData, createBackup } = useDataExport();
  const [showOptions, setShowOptions] = useState(false);

  const handleQuickExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (!user) return;

    const options: ExportOptions = {
      format,
      includePersonalData: true,
      includeProgressData: true,
      includeGameData: true,
      includeStudyData: true
    };

    await exportData(user.id, options);
    setShowOptions(false);
  };

  const handleQuickBackup = async () => {
    if (!user) return;
    await createBackup(user.id);
    setShowOptions(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export & Backup</h3>
      )}

      {exportProgress && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">{exportProgress.message}</p>
              {exportProgress.stage !== 'error' && exportProgress.stage !== 'complete' && (
                <div className="mt-2">
                  <div className="bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {exportProgress.stage === 'complete' && (
              <svg className="h-4 w-4 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            disabled={isExporting}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Quick Export</span>
            <svg
              className={`h-4 w-4 transition-transform ${showOptions ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => handleQuickExport('json')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleQuickExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleQuickExport('pdf')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as PDF Report
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleQuickBackup}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Create Backup
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Export your study data or create a backup for safekeeping. 
          <a href="/data-export" className="text-blue-600 hover:text-blue-500 ml-1">
            Advanced options →
          </a>
        </p>
      </div>
    </div>
  );
};

export default ExportWidget;