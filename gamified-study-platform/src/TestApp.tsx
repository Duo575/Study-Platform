import React from 'react';

function TestApp() {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#333', fontSize: '24px' }}>
        Test App - React is Working!
      </h1>
      <p style={{ color: '#666' }}>
        If you can see this, React is rendering correctly.
      </p>
      <button
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}

export default TestApp;
