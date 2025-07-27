import React from 'react';
import { StoreCategory } from '../../types';

interface StoreCategoryFilterProps {
  categories: StoreCategory[];
  selectedCategory: StoreCategory | 'all';
  onCategoryChange: (category: StoreCategory | 'all') => void;
}

export const StoreCategoryFilter: React.FC<StoreCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const getCategoryIcon = (category: StoreCategory | 'all') => {
    switch (category) {
      case 'all':
        return '🏪';
      case 'pet_food':
        return '🍖';
      case 'pet_accessories':
        return '👑';
      case 'themes':
        return '🎨';
      case 'environments':
        return '🏞️';
      case 'music_packs':
        return '🎵';
      case 'power_ups':
        return '⚡';
      case 'decorations':
        return '🎭';
      default:
        return '📦';
    }
  };

  const getCategoryLabel = (category: StoreCategory | 'all') => {
    switch (category) {
      case 'all':
        return 'All Items';
      case 'pet_food':
        return 'Pet Food';
      case 'pet_accessories':
        return 'Pet Accessories';
      case 'themes':
        return 'Themes';
      case 'environments':
        return 'Environments';
      case 'music_packs':
        return 'Music Packs';
      case 'power_ups':
        return 'Power-ups';
      case 'decorations':
        return 'Decorations';
      default:
        return category;
    }
  };

  const allCategories: (StoreCategory | 'all')[] = ['all', ...categories];

  return (
    <div className="store-category-filter">
      <div className="flex flex-wrap gap-2">
        {allCategories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`category-button flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <span className="text-lg">{getCategoryIcon(category)}</span>
            <span className="font-medium">{getCategoryLabel(category)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
