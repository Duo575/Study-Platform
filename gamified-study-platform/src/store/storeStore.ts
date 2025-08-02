import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  StoreState,
  StoreItem,
  InventoryItem,
  UserEconomy,
  Purchase,
  PurchaseResult,
  PurchaseEligibility,
  StoreFilters,
  StoreCategory,
  CoinTransaction,
  StoreError,
} from '../types';
import StoreManager from '../services/storeManager';

interface StoreActions {
  // Store Items Management
  setStoreItems: (items: StoreItem[]) => void;
  addStoreItem: (item: StoreItem) => void;
  updateStoreItem: (itemId: string, updates: Partial<StoreItem>) => void;
  removeStoreItem: (itemId: string) => void;

  // Inventory Management
  setUserInventory: (inventory: InventoryItem[]) => void;
  addToInventory: (item: InventoryItem) => void;
  updateInventoryItem: (
    itemId: string,
    updates: Partial<InventoryItem>
  ) => void;
  removeFromInventory: (itemId: string) => void;
  useInventoryItem: (itemId: string, quantity?: number) => void;

  // Economy Management
  setUserEconomy: (economy: UserEconomy) => void;
  updateCoins: (amount: number) => void;
  updatePremiumCoins: (amount: number) => void;
  addCoinTransaction: (transaction: CoinTransaction) => void;

  // Purchase Management
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (purchaseId: string, updates: Partial<Purchase>) => void;
  checkPurchaseEligibility: (
    itemId: string,
    quantity: number
  ) => PurchaseEligibility;
  processPurchase: (
    itemId: string,
    quantity: number
  ) => Promise<PurchaseResult>;

  // Filters and Search
  setFilters: (filters: Partial<StoreFilters>) => void;
  resetFilters: () => void;

  // Loading and Error States
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Utility Actions
  getFilteredItems: () => StoreItem[];
  getItemById: (itemId: string) => StoreItem | undefined;
  getInventoryItemById: (itemId: string) => InventoryItem | undefined;
  getUserBalance: () => { coins: number; premiumCoins: number };

  // Reset and Initialization
  resetStore: () => void;
  initializeStore: () => Promise<void>;
}

const initialState: StoreState = {
  items: [],
  categories: [
    'pet_food',
    'pet_accessories',
    'themes',
    'environments',
    'music_packs',
    'power_ups',
    'decorations',
  ],
  userInventory: [],
  userEconomy: {
    coins: 0,
    premiumCoins: 0,
    totalEarned: 0,
    totalSpent: 0,
    purchaseHistory: [],
    inventory: [],
    dailyCoinLimit: 100,
    dailyCoinsEarned: 0,
  },
  purchaseHistory: [],
  isLoading: false,
  error: null,
  coins: 0, // Add missing coins property
  filters: {
    category: 'all',
    rarity: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    showOwned: false,
  },
};

export const useStoreStore = create<StoreState & StoreActions>()(
  devtools(
    persist(
      (set, get) => {
        const storeManager = StoreManager.getInstance();

        return {
          ...initialState,

          // Store Items Management
          setStoreItems: items => set({ items }),

          addStoreItem: item => {
            storeManager.addStoreItem(item);
            set(state => ({
              items: [...state.items, item],
            }));
          },

          updateStoreItem: (itemId, updates) => {
            const success = storeManager.updateStoreItem(itemId, updates);
            if (success) {
              set(state => ({
                items: state.items.map(item =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }));
            }
          },

          removeStoreItem: itemId => {
            const success = storeManager.removeStoreItem(itemId);
            if (success) {
              set(state => ({
                items: state.items.filter(item => item.id !== itemId),
              }));
            }
          },

          // Inventory Management
          setUserInventory: inventory => set({ userInventory: inventory }),

          addToInventory: item =>
            set(state => {
              const existingItem = state.userInventory.find(
                inv => inv.itemId === item.itemId
              );
              if (existingItem) {
                return {
                  userInventory: state.userInventory.map(inv =>
                    inv.itemId === item.itemId
                      ? { ...inv, quantity: inv.quantity + item.quantity }
                      : inv
                  ),
                };
              }
              return {
                userInventory: [...state.userInventory, item],
              };
            }),

          updateInventoryItem: (itemId, updates) =>
            set(state => ({
              userInventory: state.userInventory.map(item =>
                item.itemId === itemId ? { ...item, ...updates } : item
              ),
            })),

          removeFromInventory: itemId =>
            set(state => ({
              userInventory: state.userInventory.filter(
                item => item.itemId !== itemId
              ),
            })),

          useInventoryItem: (itemId, quantity = 1) =>
            set(state => ({
              userInventory: state.userInventory
                .map(item => {
                  if (item.itemId === itemId) {
                    const newQuantity = Math.max(0, item.quantity - quantity);
                    const usedCount = (item.usedCount || 0) + quantity;
                    return {
                      ...item,
                      quantity: newQuantity,
                      usedCount,
                      lastUsed: new Date(),
                    };
                  }
                  return item;
                })
                .filter(item => item.quantity > 0),
            })),

          // Economy Management
          setUserEconomy: economy => set({ userEconomy: economy }),

          updateCoins: amount =>
            set(state => ({
              userEconomy: {
                ...state.userEconomy,
                coins: Math.max(0, state.userEconomy.coins + amount),
                totalEarned:
                  amount > 0
                    ? state.userEconomy.totalEarned + amount
                    : state.userEconomy.totalEarned,
                totalSpent:
                  amount < 0
                    ? state.userEconomy.totalSpent + Math.abs(amount)
                    : state.userEconomy.totalSpent,
                lastCoinEarned:
                  amount > 0 ? new Date() : state.userEconomy.lastCoinEarned,
              },
            })),

          updatePremiumCoins: amount =>
            set(state => ({
              userEconomy: {
                ...state.userEconomy,
                premiumCoins: Math.max(
                  0,
                  state.userEconomy.premiumCoins + amount
                ),
              },
            })),

          addCoinTransaction: transaction =>
            set(state => ({
              userEconomy: {
                ...state.userEconomy,
                // Note: Coin transactions would typically be stored separately
                // This is a simplified implementation
              },
            })),

          // Purchase Management
          addPurchase: purchase =>
            set(state => ({
              purchaseHistory: [...state.purchaseHistory, purchase],
              userEconomy: {
                ...state.userEconomy,
                purchaseHistory: [
                  ...state.userEconomy.purchaseHistory,
                  purchase,
                ],
              },
            })),

          updatePurchase: (purchaseId, updates) =>
            set(state => ({
              purchaseHistory: state.purchaseHistory.map(purchase =>
                purchase.id === purchaseId
                  ? { ...purchase, ...updates }
                  : purchase
              ),
            })),

          checkPurchaseEligibility: (itemId, quantity) => {
            const state = get();
            return storeManager.checkPurchaseEligibility(
              itemId,
              quantity,
              state.userEconomy
            );
          },

          processPurchase: async (itemId, quantity) => {
            const state = get();

            try {
              const result = await storeManager.processPurchase(
                itemId,
                quantity,
                'current_user', // This would come from auth context
                state.userEconomy
              );

              if (
                result.success &&
                result.inventoryItem &&
                result.transaction
              ) {
                // Update local state with the purchase results
                const purchase: Purchase = {
                  id: result.transaction.relatedId || result.transaction.id,
                  userId: 'current_user',
                  itemId,
                  quantity,
                  totalCost: result.totalCost,
                  currency: result.item.currency,
                  purchasedAt: new Date(),
                  status: 'completed',
                  transactionId: result.transaction.id,
                };

                get().addPurchase(purchase);
                get().addToInventory(result.inventoryItem);

                if (result.item.currency === 'coins') {
                  get().updateCoins(-result.totalCost);
                } else {
                  get().updatePremiumCoins(-result.totalCost);
                }

                // Update item stock if applicable
                if (result.item.stock !== undefined) {
                  get().updateStoreItem(itemId, {
                    stock: result.item.stock - quantity,
                  });
                }
              }

              return result;
            } catch (error) {
              const item = storeManager.getItemById(itemId);
              return {
                success: false,
                item: item!,
                quantity,
                totalCost: item ? item.price * quantity : 0,
                newBalance: state.userEconomy.coins,
                error:
                  error instanceof Error ? error.message : 'Purchase failed',
                transaction: {
                  id: `failed_${Date.now()}`,
                  userId: 'current_user',
                  amount: 0,
                  type: 'spent' as const,
                  source: 'store_purchase' as const,
                  description: 'Failed purchase',
                  timestamp: new Date(),
                },
              };
            }
          },

          // Filters and Search
          setFilters: filters =>
            set(state => ({
              filters: { ...state.filters, ...filters },
            })),

          resetFilters: () =>
            set({
              filters: initialState.filters,
            }),

          // Loading and Error States
          setLoading: loading => set({ isLoading: loading }),
          setError: error => set({ error }),

          // Utility Actions
          getFilteredItems: () => {
            const state = get();
            let filteredItems = storeManager.getStoreItems(state.filters);

            // Additional filtering for ownership (not handled by StoreManager)
            if (state.filters.showOwned === false) {
              const ownedItemIds = state.userInventory.map(inv => inv.itemId);
              filteredItems = filteredItems.filter(
                item => !ownedItemIds.includes(item.id)
              );
            } else if (state.filters.showOwned === true) {
              const ownedItemIds = state.userInventory.map(inv => inv.itemId);
              filteredItems = filteredItems.filter(item =>
                ownedItemIds.includes(item.id)
              );
            }

            return filteredItems;
          },

          getItemById: itemId => {
            return storeManager.getItemById(itemId);
          },

          getInventoryItemById: itemId => {
            return get().userInventory.find(item => item.itemId === itemId);
          },

          getUserBalance: () => {
            const { coins, premiumCoins } = get().userEconomy;
            return { coins, premiumCoins };
          },

          // Reset and Initialization
          resetStore: () => set(initialState),

          initializeStore: async () => {
            set({ isLoading: true, error: null });

            try {
              // Get items from StoreManager (which has default items)
              const items = storeManager.getStoreItems();

              set({
                items,
                isLoading: false,
              });
            } catch (error) {
              set({
                error:
                  error instanceof Error
                    ? error.message
                    : 'Failed to initialize store',
                isLoading: false,
              });
            }
          },
        };
      },
      {
        name: 'store-storage',
        partialize: state => ({
          userInventory: state.userInventory,
          userEconomy: state.userEconomy,
          purchaseHistory: state.purchaseHistory,
          filters: state.filters,
        }),
      }
    ),
    { name: 'StoreStore' }
  )
);
