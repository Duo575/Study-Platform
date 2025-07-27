import React, { useState } from 'react';
import { StoreItem } from '../../types';
import { useStoreStore } from '../../store/storeStore';

interface StoreItemModalProps {
  item: StoreItem;
  isOpen: boolean;
  onClose: () => void;
}

export const StoreItemModal: React.FC<StoreItemModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const {
    userEconomy,
    checkPurchaseEligibility,
    processPurchase,
    getInventoryItemById,
    useInventoryItem,
  } = useStoreStore();

  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const inventoryItem = getInventoryItemById(item.id);
  const isOwned = !!inventoryItem;
  const eligibility = checkPurchaseEligibility(item.id, quantity);

  const handlePurchase = async () => {
    if (!eligibility.canPurchase) return;

    setIsPurchasing(true);
    setPurchaseMessage(null);

    try {
      const result = await processPurchase(item.id, quantity);

      if (result.success) {
        setPurchaseMessage(`Successfully purchased ${quantity}x ${item.name}!`);
        setQuantity(1);
      } else {
        setPurchaseMessage(`Purchase failed: ${result.error}`);
      }
    } catch (error) {
      setPurchaseMessage(
        `Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleUseItem = () => {
    if (!inventoryItem || inventoryItem.quantity === 0) return;

    useInventoryItem(item.id, 1);
    setPurchaseMessage(`Used 1x ${item.name}!`);
  };

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

  if (!isOpen) return null;

  return (
    <div className="store-item-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="modal-header flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="modal-body p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Item Image and Basic Info */}
            <div>
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    '/images/placeholder-item.png';
                }}
              />

              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(item.rarity)}`}
                >
                  {item.rarity.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Category: {item.category.replace('_', ' ')}
                </span>
              </div>

              {isOwned && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">✓ Owned</span>
                    <span className="text-green-600">
                      Quantity: {inventoryItem.quantity}
                    </span>
                  </div>
                  {inventoryItem.usedCount && inventoryItem.usedCount > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Used {inventoryItem.usedCount} times
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div>
              <p className="text-gray-700 mb-4">{item.description}</p>

              {/* Effects */}
              {item.effects && item.effects.length > 0 && (
                <div className="effects mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Effects:</h3>
                  <div className="space-y-2">
                    {item.effects.map((effect, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="font-medium capitalize">
                          {effect.type.replace('_', ' ')}:
                        </span>
                        <span>+{effect.value}</span>
                        {effect.duration && (
                          <span className="text-gray-500">
                            (for {effect.duration} min)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unlock Requirements */}
              {item.unlockRequirements &&
                item.unlockRequirements.length > 0 && (
                  <div className="unlock-requirements mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Requirements:
                    </h3>
                    <div className="space-y-1">
                      {item.unlockRequirements.map((req, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {req.description}
                          {req.current !== undefined && (
                            <span className="ml-2 text-gray-500">
                              ({req.current}/{req.target})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Stock Info */}
              {item.stock !== undefined && (
                <div className="stock-info mb-4">
                  <span className="text-sm text-gray-600">
                    Stock:{' '}
                    {item.stock === 0
                      ? 'Out of stock'
                      : `${item.stock} available`}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="price mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {getCurrencyIcon(item.currency)} {item.price}
                  </span>
                  <span className="text-gray-500">per item</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Message */}
          {purchaseMessage && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                purchaseMessage.includes('Successfully')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {purchaseMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="user-balance">
            <span className="text-sm text-gray-600">Your balance:</span>
            <div className="flex gap-4 mt-1">
              <span className="flex items-center gap-1">
                🪙 {userEconomy.coins}
              </span>
              <span className="flex items-center gap-1">
                💎 {userEconomy.premiumCoins}
              </span>
            </div>
          </div>

          <div className="actions flex gap-3">
            {isOwned &&
              item.effects &&
              item.effects.length > 0 &&
              inventoryItem.quantity > 0 && (
                <button
                  onClick={handleUseItem}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Use Item
                </button>
              )}

            {!isOwned && (
              <>
                <div className="quantity-selector flex items-center gap-2">
                  <label className="text-sm text-gray-600">Qty:</label>
                  <input
                    type="number"
                    min="1"
                    max={item.stock || 99}
                    value={quantity}
                    onChange={e =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={!eligibility.canPurchase || isPurchasing}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    eligibility.canPurchase && !isPurchasing
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isPurchasing
                    ? 'Purchasing...'
                    : `Purchase (${getCurrencyIcon(item.currency)} ${item.price * quantity})`}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
