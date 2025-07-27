import React, { useState } from 'react';
import { useStoreStore } from '../../store/storeStore';
import { InventoryItem } from '../../types';

export const InventoryDisplay: React.FC = () => {
  const { userInventory, getItemById, useInventoryItem, isLoading } =
    useStoreStore();

  const [filter, setFilter] = useState<'all' | 'usable' | 'equipped'>('all');

  const handleUseItem = (itemId: string) => {
    useInventoryItem(itemId, 1);
  };

  const getFilteredInventory = () => {
    let filtered = userInventory;

    switch (filter) {
      case 'usable':
        filtered = userInventory.filter(invItem => {
          const storeItem = getItemById(invItem.itemId);
          return storeItem?.effects && storeItem.effects.length > 0;
        });
        break;
      case 'equipped':
        filtered = userInventory.filter(invItem => invItem.isEquipped);
        break;
      default:
        break;
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime()
    );
  };

  const filteredInventory = getFilteredInventory();

  if (isLoading) {
    return (
      <div className="inventory-display">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-display bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Inventory</h2>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'usable', 'equipped'] as const).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📦</div>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'Your inventory is empty. Visit the store to purchase items!'
              : `No ${filter} items found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredInventory.map(invItem => {
            const storeItem = getItemById(invItem.itemId);

            if (!storeItem) {
              return (
                <div
                  key={invItem.id}
                  className="inventory-item-card bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-red-600 text-sm">Item not found</p>
                </div>
              );
            }

            const isUsable = storeItem.effects && storeItem.effects.length > 0;

            return (
              <div
                key={invItem.id}
                className="inventory-item-card bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                {/* Item Image */}
                <div className="relative mb-2">
                  <img
                    src={storeItem.imageUrl}
                    alt={storeItem.name}
                    className="w-full h-20 object-cover rounded"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        '/images/placeholder-item.png';
                    }}
                  />

                  {/* Quantity Badge */}
                  {invItem.quantity > 1 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {invItem.quantity}
                    </div>
                  )}

                  {/* Equipped Badge */}
                  {invItem.isEquipped && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      ✓
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="item-info">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {storeItem.name}
                  </h3>

                  <div className="text-xs text-gray-500 mb-2">
                    Acquired:{' '}
                    {new Date(invItem.acquiredAt).toLocaleDateString()}
                  </div>

                  {/* Usage Stats */}
                  {invItem.usedCount && invItem.usedCount > 0 && (
                    <div className="text-xs text-gray-500 mb-2">
                      Used: {invItem.usedCount} times
                      {invItem.lastUsed && (
                        <div>
                          Last:{' '}
                          {new Date(invItem.lastUsed).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Effects Preview */}
                  {storeItem.effects && storeItem.effects.length > 0 && (
                    <div className="effects-preview mb-2">
                      <div className="flex flex-wrap gap-1">
                        {storeItem.effects.slice(0, 2).map((effect, index) => (
                          <span
                            key={index}
                            className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded"
                          >
                            {effect.type.replace('_', ' ')} +{effect.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {isUsable && invItem.quantity > 0 && (
                    <button
                      onClick={() => handleUseItem(invItem.itemId)}
                      className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Use Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inventory Stats */}
      {userInventory.length > 0 && (
        <div className="inventory-stats mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Items: {userInventory.length}</span>
            <span>
              Total Quantity:{' '}
              {userInventory.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <span>
              Items Used:{' '}
              {userInventory.reduce(
                (sum, item) => sum + (item.usedCount || 0),
                0
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
