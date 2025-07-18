import React, { useState } from 'react';
import { debugAuth, testSignIn, createTestUser } from '../../utils/authDebug';

export function AuthDebugPanel() {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    const results = await debugAuth();
    setDebugResults(results);
    setLoading(false);
  };

  const handleCreateTestUser = async () => {
    setLoading(true);
    const result = await createTestUser();
    console.log('Test user creation result:', result);
    setLoading(false);
  };

  const handleTestSignIn = async () => {
    setLoading(true);
    const result = await testSignIn('test@studyquest.com', 'TestPass123!');
    console.log('Test sign-in result:', result);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-lg mb-3">🔧 Auth Debug Panel</h3>

      <div className="space-y-2">
        <button
          onClick={runDebug}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Debug Auth'}
        </button>

        <button
          onClick={handleCreateTestUser}
          disabled={loading}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Create Test User
        </button>

        <button
          onClick={handleTestSignIn}
          disabled={loading}
          className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
        >
          Test Sign In
        </button>
      </div>

      {debugResults && (
        <div className="mt-3 text-xs">
          <div className="font-semibold">Debug Results:</div>
          <div
            className={`${debugResults.connectionOk ? 'text-green-600' : 'text-red-600'}`}
          >
            Connection: {debugResults.connectionOk ? '✅' : '❌'}
          </div>
          <div
            className={`${debugResults.sessionOk ? 'text-green-600' : 'text-red-600'}`}
          >
            Session: {debugResults.sessionOk ? '✅' : '❌'}
          </div>
          <div
            className={`${debugResults.configOk ? 'text-green-600' : 'text-red-600'}`}
          >
            Config: {debugResults.configOk ? '✅' : '❌'}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-600">
        Check browser console for detailed logs
      </div>
    </div>
  );
}
