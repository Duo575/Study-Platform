import React from 'react';
import { StoreInterface } from './StoreInterface';

/**
 * Demo component to showcase the Store UI functionality
 * This can be used for testing and demonstration purposes
 */
export const StoreDemo: React.FC = () => {
  return (
    <div className="store-demo p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Store Demo</h1>
          <p className="text-gray-600">
            This demo showcases the complete Store UI implementation including:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Item browsing with category filters</li>
            <li>Search and sorting functionality</li>
            <li>Item details modal with purchase flow</li>
            <li>User balance display</li>
            <li>Inventory management interface</li>
            <li>Purchase confirmation and item usage</li>
          </ul>
        </div>

        <StoreInterface className="bg-white rounded-lg shadow-lg" />
      </div>
    </div>
  );
};
