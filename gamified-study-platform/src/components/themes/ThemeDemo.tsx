import React, { useState } from 'react';
import {
  ThemeSelector,
  ThemeCustomizer,
  QuickThemeSwitcher,
  ThemeStatusIndicator,
} from './index';
import { useTheme } from './ThemeProvider';
import { useThemeStore } from '../../store/themeStore';

export const ThemeDemo: React.FC = () => {
  const [showSelector, setShowSelector] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const { currentTheme, customizeTheme } = useTheme();
  const { themes } = useThemeStore();

  const handleCustomizationSave = (customizations: Record<string, string>) => {
    if (currentTheme) {
      customizeTheme(currentTheme.id, customizations);
    }
  };

  return (
    <div className="theme-demo p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Theme System Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Explore and customize themes for your study environment
        </p>

        {/* Theme Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowSelector(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Themes
          </button>

          <button
            onClick={() => setShowCustomizer(true)}
            disabled={!currentTheme}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Customize Current Theme
          </button>

          <QuickThemeSwitcher className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>

        {/* Current Theme Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Current Theme</h3>
          <div className="flex items-center justify-between">
            <ThemeStatusIndicator />
            {currentTheme && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Colors:</span>
                {Object.entries(currentTheme.cssVariables)
                  .slice(0, 5)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: value }}
                      title={`${key}: ${value}`}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Theme Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample UI Elements */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Sample Card</h4>
            <p className="text-gray-600 mb-4">
              This card demonstrates how the current theme affects UI elements.
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Primary
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Success
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Surface Element
            </h4>
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded"></div>
              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              <div className="h-2 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Text Elements</h4>
            <p className="text-gray-900 mb-2">Primary text color</p>
            <p className="text-gray-600 mb-2">Secondary text color</p>
            <p className="text-blue-500">Accent color text</p>
          </div>
        </div>

        {/* Theme Statistics */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Theme Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Total Themes</div>
              <div className="text-blue-900 text-lg font-bold">
                {themes.length}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Free Themes</div>
              <div className="text-blue-900 text-lg font-bold">
                {themes.filter(t => t.price === 0).length}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Premium Themes</div>
              <div className="text-blue-900 text-lg font-bold">
                {themes.filter(t => t.price > 0).length}
              </div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Categories</div>
              <div className="text-blue-900 text-lg font-bold">
                {new Set(themes.map(t => t.category)).size}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
      />

      {/* Theme Customizer Modal */}
      {currentTheme && (
        <ThemeCustomizer
          theme={currentTheme}
          isOpen={showCustomizer}
          onClose={() => setShowCustomizer(false)}
          onSave={handleCustomizationSave}
        />
      )}
    </div>
  );
};
