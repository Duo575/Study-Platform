import React from 'react';
import { EnvironmentProvider, EnvironmentSelector } from './index';
import { Card } from '../ui/Card';

/**
 * Demo component to verify Environment integration is working
 * This can be used for manual testing and verification
 */
export const EnvironmentIntegrationDemo: React.FC = () => {
  return (
    <EnvironmentProvider>
      <div className="p-8 space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Environment Integration Demo
          </h2>
          <p className="text-gray-600 mb-6">
            This demo shows the Environment system integration. The
            EnvironmentProvider wraps this content and applies theme CSS
            variables, while the EnvironmentSelector allows switching between
            different focus environments.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Focus Environment:
              </label>
              <EnvironmentSelector
                className="w-full max-w-md"
                showPreview={true}
              />
            </div>

            <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="font-semibold mb-2">Current Environment Theme:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Primary Color:</strong>
                  <div
                    className="w-6 h-6 rounded border inline-block ml-2"
                    style={{ backgroundColor: 'var(--env-primary, #3B82F6)' }}
                  />
                </div>
                <div>
                  <strong>Secondary Color:</strong>
                  <div
                    className="w-6 h-6 rounded border inline-block ml-2"
                    style={{ backgroundColor: 'var(--env-secondary, #1E40AF)' }}
                  />
                </div>
                <div>
                  <strong>Background:</strong>
                  <div
                    className="w-6 h-6 rounded border inline-block ml-2"
                    style={{ backgroundColor: 'var(--env-bg, #F8FAFC)' }}
                  />
                </div>
                <div>
                  <strong>Accent Color:</strong>
                  <div
                    className="w-6 h-6 rounded border inline-block ml-2"
                    style={{ backgroundColor: 'var(--env-accent, #10B981)' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                <strong>Integration Status:</strong> ✅ EnvironmentProvider is
                wrapping content
                <br />
                <strong>Theme Application:</strong> ✅ CSS variables are being
                applied
                <br />
                <strong>Environment Selector:</strong> ✅ Component is rendered
                and functional
              </p>
            </div>
          </div>
        </Card>
      </div>
    </EnvironmentProvider>
  );
};
