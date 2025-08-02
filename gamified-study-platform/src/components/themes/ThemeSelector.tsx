import React, { useState, useEffect } from 'react';
import { Theme, ThemeCustomization } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { themeService } from '../../services/themeService';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    themes,
    currentTheme,
    unlockedThemes,
    purchasedThemes,
    isApplyingTheme,
    isPurchasingTheme,
    isUnlockingTheme,
    isPreviewingTheme,
    previewTheme,
    applyTheme,
    purchaseTheme,
    unlockTheme,
    startPreviewTheme: startPreview,
    stopPreview,
    loadThemes,
  } = useThemeStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizingTheme, setCustomizingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadThemes();
    }
  }, [isOpen, loadThemes]);

  // Filter themes based on search and filters
  const filteredThemes = themes.filter(theme => {
    const matchesSearch =
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesRarity =
      selectedRarity === 'all' || theme.rarity === selectedRarity;

    return matchesSearch && matchesCategory && matchesRarity;
  });

  const categories = [
    'all',
    ...Array.from(new Set(themes.map(t => t.category))),
  ];
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary'];

  const handleThemeClick = (theme: Theme) => {
    if (theme.id === currentTheme?.id) {
      return; // Already active
    }

    if (unlockedThemes.includes(theme.id)) {
      applyTheme(theme.id);
    } else {
      // Show theme details for purchase/unlock
      setCustomizingTheme(theme);
      setShowCustomization(true);
    }
  };

  const handlePreview = (theme: Theme, event: React.MouseEvent) => {
    event.stopPropagation();
    if (theme.id !== currentTheme?.id) {
      startPreview(theme.id);
    }
  };

  const handleStopPreview = (event: React.MouseEvent) => {
    event.stopPropagation();
    stopPreview();
  };

  const handlePurchase = async (theme: Theme) => {
    const success = await purchaseTheme(theme.id);
    if (success) {
      setShowCustomization(false);
      setCustomizingTheme(null);
    }
  };

  const handleUnlock = async (theme: Theme) => {
    const success = await unlockTheme(theme.id);
    if (success) {
      setShowCustomization(false);
      setCustomizingTheme(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600';
      case 'rare':
        return 'text-blue-600';
      case 'epic':
        return 'text-purple-600';
      case 'legendary':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCurrencyIcon = (currency: string) => {
    return currency === 'coins' ? '🪙' : '💎';
  };

  const canUnlockTheme = (theme: Theme) => {
    if (!theme.unlockRequirements) return true;
    return theme.unlockRequirements.every(req => req.current >= req.target);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Theme Selection
            </h2>
            <p className="text-gray-600 mt-1">
              Customize your study environment with beautiful themes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all'
                    ? 'All Categories'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Rarity Filter */}
            <select
              value={selectedRarity}
              onChange={e => setSelectedRarity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {rarities.map(rarity => (
                <option key={rarity} value={rarity}>
                  {rarity === 'all'
                    ? 'All Rarities'
                    : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Theme Info */}
        {currentTheme && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center">
                ✓
              </div>
              <div>
                <span className="font-medium text-blue-900">
                  Current Theme:{' '}
                </span>
                <span className="text-blue-700">{currentTheme.name}</span>
                {isPreviewingTheme && previewTheme && (
                  <span className="ml-2 text-sm text-orange-600">
                    (Previewing: {previewTheme.name})
                  </span>
                )}
              </div>
              {isPreviewingTheme && (
                <button
                  onClick={handleStopPreview}
                  className="ml-auto px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                >
                  Stop Preview
                </button>
              )}
            </div>
          </div>
        )}

        {/* Themes Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredThemes.map(theme => (
              <div
                key={theme.id}
                className={`theme-card cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg rounded-lg border-2 p-4 ${getRarityColor(theme.rarity)} ${
                  theme.id === currentTheme?.id ? 'ring-2 ring-blue-500' : ''
                } ${!unlockedThemes.includes(theme.id) ? 'opacity-75' : ''}`}
                onClick={() => handleThemeClick(theme)}
              >
                {/* Theme Preview */}
                <div className="theme-preview mb-3 relative">
                  <div
                    className="w-full h-24 rounded-lg border-2 border-gray-200 relative overflow-hidden"
                    style={{
                      background:
                        theme.cssVariables['--theme-background'] || '#ffffff',
                      borderColor:
                        theme.cssVariables['--theme-border'] || '#e5e7eb',
                    }}
                  >
                    {/* Mini UI Preview */}
                    <div className="absolute inset-2 flex flex-col gap-1">
                      <div
                        className="h-2 rounded"
                        style={{
                          backgroundColor:
                            theme.cssVariables['--theme-primary'],
                        }}
                      />
                      <div
                        className="h-1 w-3/4 rounded"
                        style={{
                          backgroundColor:
                            theme.cssVariables['--theme-secondary'],
                        }}
                      />
                      <div
                        className="h-1 w-1/2 rounded"
                        style={{
                          backgroundColor: theme.cssVariables['--theme-accent'],
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityTextColor(theme.rarity)} bg-white bg-opacity-90`}
                    >
                      {theme.rarity.toUpperCase()}
                    </div>
                    {theme.id === currentTheme?.id && (
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        ACTIVE
                      </div>
                    )}
                    {unlockedThemes.includes(theme.id) &&
                      theme.id !== currentTheme?.id && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                          OWNED
                        </div>
                      )}
                  </div>

                  {/* Preview Button */}
                  {theme.id !== currentTheme?.id &&
                    unlockedThemes.includes(theme.id) && (
                      <button
                        onClick={e => handlePreview(theme, e)}
                        className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-white bg-opacity-90 text-gray-700 rounded hover:bg-opacity-100"
                      >
                        Preview
                      </button>
                    )}
                </div>

                {/* Theme Info */}
                <div className="theme-info">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {theme.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {theme.description}
                  </p>

                  {/* Price and Status */}
                  <div className="flex justify-between items-center">
                    {theme.price > 0 ? (
                      <div className="price flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900">
                          {getCurrencyIcon(theme.currency)} {theme.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">
                        Free
                      </span>
                    )}

                    <div className="status">
                      {theme.id === currentTheme?.id ? (
                        <span className="text-sm text-blue-600 font-medium">
                          Active
                        </span>
                      ) : unlockedThemes.includes(theme.id) ? (
                        <span className="text-sm text-green-600 font-medium">
                          Available
                        </span>
                      ) : canUnlockTheme(theme) ? (
                        <span className="text-sm text-orange-600 font-medium">
                          Can Unlock
                        </span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unlock Requirements Preview */}
                  {theme.unlockRequirements &&
                    !unlockedThemes.includes(theme.id) && (
                      <div className="unlock-requirements mt-2">
                        <div className="text-xs text-gray-500">
                          {theme.unlockRequirements[0].description}
                          {theme.unlockRequirements.length > 1 &&
                            ` +${theme.unlockRequirements.length - 1} more`}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          {filteredThemes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No themes found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Loading States */}
        {(isApplyingTheme || isPurchasingTheme || isUnlockingTheme) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isApplyingTheme && 'Applying theme...'}
                {isPurchasingTheme && 'Processing purchase...'}
                {isUnlockingTheme && 'Unlocking theme...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Theme Details Modal */}
      {showCustomization && customizingTheme && (
        <ThemeDetailsModal
          theme={customizingTheme}
          onClose={() => {
            setShowCustomization(false);
            setCustomizingTheme(null);
          }}
          onPurchase={() => handlePurchase(customizingTheme)}
          onUnlock={() => handleUnlock(customizingTheme)}
          canUnlock={canUnlockTheme(customizingTheme)}
          isPurchasing={isPurchasingTheme}
          isUnlocking={isUnlockingTheme}
        />
      )}
    </div>
  );
};

// Theme Details Modal Component
interface ThemeDetailsModalProps {
  theme: Theme;
  onClose: () => void;
  onPurchase: () => void;
  onUnlock: () => void;
  canUnlock: boolean;
  isPurchasing: boolean;
  isUnlocking: boolean;
}

const ThemeDetailsModal: React.FC<ThemeDetailsModalProps> = ({
  theme,
  onClose,
  onPurchase,
  onUnlock,
  canUnlock,
  isPurchasing,
  isUnlocking,
}) => {
  const getCurrencyIcon = (currency: string) => {
    return currency === 'coins' ? '🪙' : '💎';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'epic':
        return 'text-purple-600 bg-purple-100';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{theme.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(theme.rarity)}`}
              >
                {theme.rarity.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">{theme.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Theme Preview */}
          <div className="mb-6">
            <div
              className="w-full h-32 rounded-lg border-2 relative overflow-hidden"
              style={{
                background:
                  theme.cssVariables['--theme-background'] || '#ffffff',
                borderColor: theme.cssVariables['--theme-border'] || '#e5e7eb',
              }}
            >
              <div className="absolute inset-4 flex flex-col gap-2">
                <div
                  className="h-4 rounded"
                  style={{
                    backgroundColor: theme.cssVariables['--theme-primary'],
                  }}
                />
                <div
                  className="h-3 w-3/4 rounded"
                  style={{
                    backgroundColor: theme.cssVariables['--theme-secondary'],
                  }}
                />
                <div
                  className="h-2 w-1/2 rounded"
                  style={{
                    backgroundColor: theme.cssVariables['--theme-accent'],
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{
                      backgroundColor: theme.cssVariables['--theme-surface'],
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{
                      backgroundColor: theme.cssVariables['--theme-text'],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{theme.description}</p>
          </div>

          {/* Color Palette */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Color Palette</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(theme.cssVariables).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: value }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {key.replace('--theme-', '').replace('-', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlock Requirements */}
          {theme.unlockRequirements && theme.unlockRequirements.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Unlock Requirements
              </h4>
              <div className="space-y-2">
                {theme.unlockRequirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {req.description}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {req.current} / {req.target}
                      </div>
                      {req.current >= req.target ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          {theme.price > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-900">Price</span>
                <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
                  {getCurrencyIcon(theme.currency)} {theme.price}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>

          {theme.price > 0 ? (
            <button
              onClick={onPurchase}
              disabled={isPurchasing || !canUnlock}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPurchasing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isPurchasing
                ? 'Purchasing...'
                : `Purchase for ${getCurrencyIcon(theme.currency)} ${theme.price}`}
            </button>
          ) : (
            <button
              onClick={onUnlock}
              disabled={isUnlocking || !canUnlock}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUnlocking && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isUnlocking
                ? 'Unlocking...'
                : canUnlock
                  ? 'Unlock Theme'
                  : 'Requirements Not Met'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
