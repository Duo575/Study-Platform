import React from 'react';
import DataExport from '../components/features/DataExport';

const DataExportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Data Export & Backup</h1>
            <p className="mt-2 text-lg text-gray-600">
              Export your study data or create backups for safekeeping.
            </p>
          </div>
          
          <DataExport />
        </div>
      </div>
    </div>
  );
};

export default DataExportPage;