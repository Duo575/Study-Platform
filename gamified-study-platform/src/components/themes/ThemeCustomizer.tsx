import React, { useState, useEffect } from 'react';
import { Theme, ThemeCustomization } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { themeService } from '../../services/themeService';

interface ThemeCustomizerProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customizations: Record<string, string>) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  theme,
  isOpen,
  onClose,
  onSave,
}) => {
  const [customizations, setCustomizations] = useState<Record<string, string>>(
    {}
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && theme) {
      // Load existing customizations
      const existing = themeService.getThemeCustomizations(theme.id);
      if (existing) {
        setCustomizations(existing.customizations);
      } else {
        setCustomizations({});
      }
      setHasChanges(false);
    }
  }, [isOpen, theme]);

  const handleColorChange = (variable: string, value: string) => {
    const newCustomizations = {
      ...customizations,
      [variable]: value,
    };
    setCustomizations(newCustomizations);
    setHasChanges(true);

    // Apply preview if in preview mode
    if (previewMode) {
      const root = document.documentElement;
      root.style.setProperty(variable, value);
    }
  };

  const handlePreviewToggle = () => {
    if (!previewMode) {
      // Start preview
      setPreviewMode(true);
      const root = document.documentElement;
      Object.entries(customizations).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    } else {
      // Stop preview
      setPreviewMode(false);
      // Restore original theme
      const root = document.documentElement;
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  };

  const handleSave = () => {
    onSave(customizations);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setCustomizations({});
    setHasChanges(true);

    if (previewMode) {
      // Apply original theme colors
      const root = document.documentElement;
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  };

  const handleClose = () => {
    if (previewMode) {
      // Restore original theme
      const root = document.documentElement;
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    onClose();
  };

  const getColorValue = (variable: string): string => {
    return (
      customizations[variable] || theme.cssVariables[variable] || '#000000'
    );
  };

  const getVariableLabel = (variable: string): string => {
    return variable
      .replace('--theme-', '')
      .replace('-', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isValidColor = (color: string): boolean => {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  };

  if (!isOpen) return null;

  const colorVariables = Object.keys(theme.cssVariables).filter(
    key => !key.includes('shadow') && !key.includes('gradient')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Customize Theme</h2>
            <p className="text-gray-600 mt-1">
              Personalize "{theme.name}" to match your preferences
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Preview Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviewToggle}
                className={`px-4 py-2 rounded-lg font-medium ${
                  previewMode
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {previewMode ? 'Stop Preview' : 'Start Preview'}
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Reset to Original
              </button>
            </div>

            {hasChanges && (
              <div className="text-sm text-orange-600 font-medium">
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        {/* Customization Content */}
        <div className="flex h-96">
          {/* Color Controls */}
          <div className="w-1/2 p-6 overflow-y-auto border-r">
            <h3 className="font-semibold text-gray-900 mb-4">Color Palette</h3>

            <div className="space-y-4">
              {colorVariables.map(variable => (
                <div key={variable} className="color-control">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getVariableLabel(variable)}
                  </label>

                  <div className="flex items-center gap-3">
                    {/* Color Picker */}
                    <input
                      type="color"
                      value={getColorValue(variable)}
                      onChange={e =>
                        handleColorChange(variable, e.target.value)
                      }
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />

                    {/* Text Input */}
                    <input
                      type="text"
                      value={getColorValue(variable)}
                      onChange={e => {
                        if (
                          isValidColor(e.target.value) ||
                          e.target.value === ''
                        ) {
                          handleColorChange(variable, e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#000000"
                    />

                    {/* Reset Individual */}
                    <button
                      onClick={() =>
                        handleColorChange(
                          variable,
                          theme.cssVariables[variable]
                        )
                      }
                      className="px-2 py-2 text-gray-400 hover:text-gray-600"
                      title="Reset to original"
                    >
                      ↺
                    </button>
                  </div>

                  {/* Original Color Reference */}
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>Original:</span>
                    <div
                      className="w-4 h-4 border border-gray-300 rounded"
                      style={{ backgroundColor: theme.cssVariables[variable] }}
                    />
                    <span>{theme.cssVariables[variable]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="w-1/2 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>

            <div className="preview-container">
              {/* Theme Preview Card */}
              <div
                className="w-full h-64 rounded-lg border-2 p-4 relative overflow-hidden"
                style={{
                  backgroundColor: getColorValue('--theme-background'),
                  borderColor: getColorValue('--theme-border'),
                  color: getColorValue('--theme-text'),
                }}
              >
                {/* Header */}
                <div
                  className="h-8 rounded mb-3 flex items-center px-3"
                  style={{ backgroundColor: getColorValue('--theme-primary') }}
                >
                  <div className="w-4 h-4 bg-white bg-opacity-30 rounded"></div>
                  <div className="ml-2 text-white text-sm font-medium">
                    Header
                  </div>
                </div>

                {/* Content Area */}
                <div
                  className="h-32 rounded p-3 mb-3"
                  style={{ backgroundColor: getColorValue('--theme-surface') }}
                >
                  <div
                    className="h-3 rounded mb-2"
                    style={{
                      backgroundColor: getColorValue('--theme-secondary'),
                      width: '80%',
                    }}
                  ></div>
                  <div
                    className="h-2 rounded mb-2"
                    style={{
                      backgroundColor: getColorValue('--theme-text-secondary'),
                      width: '60%',
                    }}
                  ></div>
                  <div
                    className="h-2 rounded"
                    style={{
                      backgroundColor: getColorValue('--theme-text-secondary'),
                      width: '40%',
                    }}
                  ></div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{
                      backgroundColor: getColorValue('--theme-primary'),
                    }}
                  >
                    Primary
                  </div>
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: getColorValue('--theme-accent') }}
                  >
                    Accent
                  </div>
                </div>
              </div>

              {/* Color Palette Display */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Current Palette
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {colorVariables.slice(0, 8).map(variable => (
                    <div key={variable} className="text-center">
                      <div
                        className="w-full h-8 rounded border border-gray-300 mb-1"
                        style={{ backgroundColor: getColorValue(variable) }}
                      />
                      <div className="text-xs text-gray-600 truncate">
                        {getVariableLabel(variable)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {Object.keys(customizations).length} customizations applied
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Customizations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
