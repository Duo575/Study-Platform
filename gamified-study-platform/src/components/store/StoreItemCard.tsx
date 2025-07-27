import React from 'react';
import { StoreItem, UserEconomy } from '../../types';
import { useStoreStore } from '../../store/storeStore';

interface StoreItemCardProps {
  item: StoreItem;
  userEconomy: UserEconomy;
  onClick: () => void;
}

export const StoreItemCard: React.FC<StoreItemCardProps> = ({
  item,
  userEconomy,
  onClick,
}) => {
  const { checkPurchaseEligibility, getInventoryItemById } = useStoreStore();

  const inventoryItem = getInventoryItemById(item.id);
  const isOwned = !!inventoryItem;
  const eligibility = checkPurchaseEligibility(item.id, 1);

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

  return (
    <div
      className={`store-item-card cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg rounded-lg border-2 p-4 ${getRarityColor(
        item.rarity
      )} ${!eligibility.canPurchase && !isOwned ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Item Image */}
      <div className="item-image mb-3 relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-32 object-cover rounded-lg"
          onError={e => {
            (e.target as HTMLImageElement).src = '/images/placeholder-item.png';
          }}
        />

        {/* Rarity Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getRarityTextColor(
            item.rarity
          )} bg-white bg-opacity-90`}
        >
          {item.rarity.toUpperCase()}
        </div>

        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
            OWNED{' '}
            {inventoryItem.quantity > 1 ? `(${inventoryItem.quantity})` : ''}
          </div>
        )}

        {/* Stock Badge */}
        {item.stock !== undefined && item.stock < 10 && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
            {item.stock === 0 ? 'OUT OF STOCK' : `${item.stock} LEFT`}
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="item-info">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Effects Preview */}
        {item.effects && item.effects.length > 0 && (
          <div className="effects-preview mb-3">
            <div className="flex flex-wrap gap-1">
              {item.effects.slice(0, 2).map((effect, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  {effect.type.replace('_', ' ')} +{effect.value}
                </span>
              ))}
              {item.effects.length > 2 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  +{item.effects.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Purchase Status */}
        <div className="flex justify-between items-center">
          <div className="price flex items-center gap-1">
            <span className="text-lg font-bold text-gray-900">
              {getCurrencyIcon(item.currency)} {item.price}
            </span>
          </div>

          <div className="purchase-status">
            {isOwned ? (
              <span className="text-sm text-green-600 font-medium">Owned</span>
            ) : eligibility.canPurchase ? (
              <span className="text-sm text-blue-600 font-medium">
                Available
              </span>
            ) : (
              <span className="text-sm text-red-600 font-medium">
                {eligibility.reason === 'Insufficient funds'
                  ? "Can't afford"
                  : 'Locked'}
              </span>
            )}
          </div>
        </div>

        {/* Unlock Requirements Preview */}
        {item.unlockRequirements &&
          item.unlockRequirements.length > 0 &&
          !isOwned && (
            <div className="unlock-requirements mt-2">
              <div className="text-xs text-gray-500">
                Requires: {item.unlockRequirements[0].description}
                {item.unlockRequirements.length > 1 &&
                  ` +${item.unlockRequirements.length - 1} more`}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
