import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreStore } from '../../store/storeStore';
import { StoreCategory, StoreItem } from '../../types';
import { StoreItemCard } from './StoreItemCard';
import { StoreCategoryFilter } from './StoreCategoryFilter';
import { StoreItemModal } from './StoreItemModal';
import { UserBalance } from './UserBalance';
import { InventoryDisplay } from './InventoryDisplay';
import { LoadingAnimation, StaggerAnimation } from '../ui/AnimationComponents';

interface StoreInterfaceProps {
  className?: string;
}

export const StoreInterface: React.FC<StoreInterfaceProps> = ({
  className = '',
}) => {
  const {
    items,
    categories,
    filters,
    isLoading,
    error,
    userEconomy,
    getFilteredItems,
    setFilters,
    initializeStore,
  } = useStoreStore();

  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const filteredItems = getFilteredItems();

  const handleCategoryChange = (category: StoreCategory | 'all') => {
    setFilters({ category });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters({ sortBy: sortBy as any, sortOrder });
  };

  const handleItemClick = (item: StoreItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className={`store-interface ${className}`}>
        <LoadingAnimation
          isLoading={true}
          type="progress"
          message="Loading store items..."
          className="h-64"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`store-interface ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading store</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`store-interface ${className}`}>
      {/* Header */}
      <div className="store-header mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Store</h1>
          <div className="flex gap-4">
            <UserBalance economy={userEconomy} />
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showInventory ? 'Hide Inventory' : 'Show Inventory'}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <StoreCategoryFilter
            categories={categories}
            selectedCategory={filters.category || 'all'}
            onCategoryChange={handleCategoryChange}
          />

          <div className="flex gap-2">
            <select
              value={filters.sortBy || 'name'}
              onChange={e =>
                handleSortChange(e.target.value, filters.sortOrder || 'asc')
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="newest">Sort by Newest</option>
            </select>

            <button
              onClick={() =>
                handleSortChange(
                  filters.sortBy || 'name',
                  filters.sortOrder === 'asc' ? 'desc' : 'asc'
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search items..."
            value={filters.search || ''}
            onChange={e => setFilters({ search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Inventory Display */}
      {showInventory && (
        <div className="mb-6">
          <InventoryDisplay />
        </div>
      )}

      {/* Items Grid */}
      <div className="store-items">
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">
                No items found matching your criteria.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <StaggerAnimation staggerDelay={0.1}>
                {filteredItems.map(item => (
                  <StoreItemCard
                    key={item.id}
                    item={item}
                    userEconomy={userEconomy}
                    onClick={() => handleItemClick(item)}
                  />
                ))}
              </StaggerAnimation>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <StoreItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
