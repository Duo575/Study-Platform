import React from 'react';

function AppTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Gamified Study Platform
        </h1>
        <p className="text-lg text-gray-600">
          Application is loading successfully!
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">
            If you see this message, React is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppTest;
