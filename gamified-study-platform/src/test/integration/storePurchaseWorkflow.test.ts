import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStoreStore } from '../../store/storeStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePetStore } from '../../store/petStore';
import StoreManager from '../../services/storeManager';
import type {
  StoreItem,
  UserEconomy,
  PurchaseResult,
  InventoryItem,
  StoreFilters,
} from '../../types';

// Mock the store manager
vi.mock('../../services/storeManager', () => {
  const mockStoreManager = {
    getInstance: vi.fn(),
    getStoreItems: vi.fn(),
    getItemsByCategory: vi.fn(),
    getItemById: vi.fn(),
    getCategories: vi.fn(),
    checkPurchaseEligibility: vi.fn(),
    processPurchase: vi.fn(),
    addStoreItem: vi.fn(),
    updateStoreItem: vi.fn(),
    removeStoreItem: vi.fn(),
    validateItem: vi.fn(),
    getAffordableItems: vi.fn(),
    getRecommendedItems: vi.fn(),
  };

  return {
    default: {
      getInstance: () => mockStoreManager,
    },
  };
});

// Mock other stores
vi.mock('../../store/gamificationStore', () => ({
  useGamificationStore: {
    getState: vi.fn(() => ({
      coins: 1000,
      premiumCoins: 50,
      updateCoins: vi.fn(),
      updatePremiumCoins: vi.fn(),
      addAchievement: vi.fn(),
    })),
  },
}));

vi.mock('../../store/petStore', () => ({
  usePetStore: {
    getState: vi.fn(() => ({
      pet: {
        id: 'pet-123',
        name: 'Fluffy',
        happiness: 80,
        health: 90,
      },
      feedPet: vi.fn(),
      playWithPet: vi.fn(),
    })),
  },
}));

describe('Store Purchase Workflow Integration Tests', () => {
  const mockUserId = 'user-123';

  const mockStoreItems: StoreItem[] = [
    {
      id: 'food_basic_kibble',
      name: 'Basic Kibble',
      description: 'Standard pet food that restores health and happiness',
      category: 'pet_food',
      price: 10,
      currency: 'coins',
      rarity: 'common',
      imageUrl: '/images/items/basic_kibble.png',
      isLimited: false,
      tags: ['food', 'basic'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'accessory_red_collar',
      name: 'Red Collar',
      description: 'A stylish red collar for your pet',
      category: 'pet_accessories',
      price: 50,
      currency: 'coins',
      rarity: 'common',
      imageUrl: '/images/items/red_collar.png',
      isLimited: false,
      tags: ['accessory', 'collar'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'theme_forest_serenity',
      name: 'Forest Serenity',
      description: 'A calming forest theme with green tones',
      category: 'themes',
      price: 75,
      currency: 'coins',
      rarity: 'rare',
      imageUrl: '/images/themes/forest_serenity.png',
      isLimited: false,
      tags: ['theme', 'nature', 'forest'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'premium_theme_ocean',
      name: 'Ocean Depths',
      description: 'Premium ocean theme with animations',
      category: 'themes',
      price: 25,
      currency: 'premium_coins',
      rarity: 'epic',
      imageUrl: '/images/themes/ocean_depths.png',
      unlockRequirements: [
        {
          type: 'level',
          target: 5,
          current: 0,
          description: 'Reach level 5 to unlock',
        },
      ],
      isLimited: true,
      tags: ['theme', 'premium', 'ocean'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUserEconomy: UserEconomy = {
    coins: 1000,
    premiumCoins: 50,
    totalEarned: 2000,
    totalSpent: 1000,
    purchaseHistory: [],
    inventory: [],
    dailyCoinLimit: 100,
    dailyCoinsEarned: 25,
  };

  let mockStoreManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores
    useStoreStore.getState().resetStore();

    // Get mock store manager instance
    mockStoreManager = StoreManager.getInstance();

    // Setup default mock responses
    mockStoreManager.getStoreItems.mockReturnValue(mockStoreItems);
    mockStoreManager.getCategories.mockReturnValue([
      'pet_food',
      'pet_accessories',
      'themes',
      'environments',
      'music_packs',
    ]);
    mockStoreManager.getItemById.mockImplementation((id: string) =>
      mockStoreItems.find(item => item.id === id)
    );
    mockStoreManager.getItemsByCategory.mockImplementation((category: string) =>
      mockStoreItems.filter(item => item.category === category)
    );
    mockStoreManager.checkPurchaseEligibility.mockReturnValue({
      canPurchase: true,
    });
    mockStoreManager.validateItem.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Store Browsing and Purchase Flow', () => {
    it('should complete full store browsing and purchase workflow', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Step 1: Initialize store
      await act(async () => {
        await result.current.initializeStore();
      });

      // Verify store initialization
      expect(result.current.items).toEqual(mockStoreItems);
      expect(result.current.categories).toHaveLength(5);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Step 2: Set user economy
      act(() => {
        result.current.setUserEconomy(mockUserEconomy);
      });

      expect(result.current.userEconomy).toEqual(mockUserEconomy);

      // Step 3: Browse items by category
      act(() => {
        result.current.setFilters({ category: 'pet_food' });
      });

      const filteredItems = result.current.getFilteredItems();
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].id).toBe('food_basic_kibble');

      // Step 4: Check purchase eligibility
      const eligibility = result.current.checkPurchaseEligibility(
        'food_basic_kibble',
        2
      );
      expect(eligibility.canPurchase).toBe(true);

      // Step 5: Process purchase
      const mockPurchaseResult: PurchaseResult = {
        success: true,
        item: mockStoreItems[0],
        quantity: 2,
        totalCost: 20,
        newBalance: 980,
        inventoryItem: {
          id: 'inv-123',
          itemId: 'food_basic_kibble',
          userId: mockUserId,
          quantity: 2,
          acquiredAt: new Date(),
          usedCount: 0,
        },
        transaction: {
          id: 'tx-123',
          userId: mockUserId,
          amount: -20,
          type: 'spent',
          source: 'store_purchase',
          description: 'Purchased 2x Basic Kibble',
          timestamp: new Date(),
        },
      };

      mockStoreManager.processPurchase.mockResolvedValue(mockPurchaseResult);

      await act(async () => {
        await result.current.processPurchase('food_basic_kibble', 2);
      });

      // Verify purchase results
      expect(result.current.userEconomy.coins).toBe(980);
      expect(result.current.userInventory).toHaveLength(1);
      expect(result.current.userInventory[0].itemId).toBe('food_basic_kibble');
      expect(result.current.userInventory[0].quantity).toBe(2);
      expect(result.current.purchaseHistory).toHaveLength(1);
    });

    it('should handle purchase failure gracefully', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
        result.current.setUserEconomy(mockUserEconomy);
      });

      // Mock purchase failure
      const mockFailureResult: PurchaseResult = {
        success: false,
        item: mockStoreItems[0],
        quantity: 1,
        totalCost: 10,
        newBalance: 1000,
        error: 'Insufficient funds',
        transaction: {
          id: 'tx-failed',
          userId: mockUserId,
          amount: 0,
          type: 'spent',
          source: 'store_purchase',
          description: 'Failed purchase: Insufficient funds',
          timestamp: new Date(),
        },
      };

      mockStoreManager.processPurchase.mockResolvedValue(mockFailureResult);

      const result_purchase = await act(async () => {
        return await result.current.processPurchase('food_basic_kibble', 1);
      });

      // Verify failure handling
      expect(result_purchase.success).toBe(false);
      expect(result_purchase.error).toBe('Insufficient funds');
      expect(result.current.userEconomy.coins).toBe(1000); // Unchanged
      expect(result.current.userInventory).toHaveLength(0);
    });
  });

  describe('Premium Currency Purchase Flow', () => {
    it('should handle premium currency purchases', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store with premium item
      await act(async () => {
        await result.current.initializeStore();
        result.current.setUserEconomy(mockUserEconomy);
      });

      // Mock successful premium purchase
      const premiumItem = mockStoreItems.find(
        item => item.currency === 'premium_coins'
      )!;
      const mockPremiumResult: PurchaseResult = {
        success: true,
        item: premiumItem,
        quantity: 1,
        totalCost: 25,
        newBalance: 25, // Premium coins balance
        inventoryItem: {
          id: 'inv-premium',
          itemId: premiumItem.id,
          userId: mockUserId,
          quantity: 1,
          acquiredAt: new Date(),
          usedCount: 0,
        },
        transaction: {
          id: 'tx-premium',
          userId: mockUserId,
          amount: -25,
          type: 'spent',
          source: 'store_purchase',
          description: `Purchased 1x ${premiumItem.name}`,
          timestamp: new Date(),
        },
      };

      mockStoreManager.processPurchase.mockResolvedValue(mockPremiumResult);

      await act(async () => {
        await result.current.processPurchase(premiumItem.id, 1);
      });

      // Verify premium purchase
      expect(result.current.userEconomy.premiumCoins).toBe(25);
      expect(result.current.userInventory).toHaveLength(1);
      expect(result.current.userInventory[0].itemId).toBe(premiumItem.id);
    });
  });

  describe('Inventory Management Workflow', () => {
    it('should manage inventory items correctly', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
        result.current.setUserEconomy(mockUserEconomy);
      });

      // Add item to inventory
      const inventoryItem: InventoryItem = {
        id: 'inv-1',
        itemId: 'food_basic_kibble',
        userId: mockUserId,
        quantity: 5,
        acquiredAt: new Date(),
        usedCount: 0,
      };

      act(() => {
        result.current.addToInventory(inventoryItem);
      });

      expect(result.current.userInventory).toHaveLength(1);
      expect(result.current.userInventory[0].quantity).toBe(5);

      // Add more of the same item (should combine)
      const additionalItem: InventoryItem = {
        id: 'inv-2',
        itemId: 'food_basic_kibble',
        userId: mockUserId,
        quantity: 3,
        acquiredAt: new Date(),
        usedCount: 0,
      };

      act(() => {
        result.current.addToInventory(additionalItem);
      });

      expect(result.current.userInventory).toHaveLength(1);
      expect(result.current.userInventory[0].quantity).toBe(8);

      // Use some items
      act(() => {
        result.current.useInventoryItem('food_basic_kibble', 2);
      });

      expect(result.current.userInventory[0].quantity).toBe(6);
      expect(result.current.userInventory[0].usedCount).toBe(2);

      // Use all remaining items
      act(() => {
        result.current.useInventoryItem('food_basic_kibble', 6);
      });

      expect(result.current.userInventory).toHaveLength(0);
    });

    it('should handle inventory item updates', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Add item to inventory
      const inventoryItem: InventoryItem = {
        id: 'inv-1',
        itemId: 'food_basic_kibble',
        userId: mockUserId,
        quantity: 5,
        acquiredAt: new Date(),
        usedCount: 0,
      };

      act(() => {
        result.current.addToInventory(inventoryItem);
      });

      // Update inventory item
      act(() => {
        result.current.updateInventoryItem('food_basic_kibble', {
          quantity: 10,
          usedCount: 2,
        });
      });

      const updatedItem = result.current.userInventory[0];
      expect(updatedItem.quantity).toBe(10);
      expect(updatedItem.usedCount).toBe(2);

      // Remove inventory item
      act(() => {
        result.current.removeFromInventory('food_basic_kibble');
      });

      expect(result.current.userInventory).toHaveLength(0);
    });
  });

  describe('Store Filtering and Search Workflow', () => {
    it('should handle complex filtering workflows', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
      });

      // Test category filtering
      act(() => {
        result.current.setFilters({ category: 'themes' });
      });

      let filteredItems = result.current.getFilteredItems();
      expect(filteredItems.every(item => item.category === 'themes')).toBe(
        true
      );

      // Test rarity filtering
      act(() => {
        result.current.setFilters({ category: 'all', rarity: 'rare' });
      });

      filteredItems = result.current.getFilteredItems();
      expect(filteredItems.every(item => item.rarity === 'rare')).toBe(true);

      // Test price range filtering
      act(() => {
        result.current.setFilters({
          category: 'all',
          rarity: 'all',
          priceRange: { min: 20, max: 60 },
        });
      });

      filteredItems = result.current.getFilteredItems();
      expect(
        filteredItems.every(item => item.price >= 20 && item.price <= 60)
      ).toBe(true);

      // Test search filtering
      act(() => {
        result.current.setFilters({
          category: 'all',
          rarity: 'all',
          search: 'forest',
        });
      });

      filteredItems = result.current.getFilteredItems();
      expect(
        filteredItems.every(
          item =>
            item.name.toLowerCase().includes('forest') ||
            item.description.toLowerCase().includes('forest')
        )
      ).toBe(true);

      // Test sorting
      act(() => {
        result.current.setFilters({
          category: 'all',
          sortBy: 'price',
          sortOrder: 'desc',
        });
      });

      filteredItems = result.current.getFilteredItems();
      for (let i = 1; i < filteredItems.length; i++) {
        expect(filteredItems[i].price <= filteredItems[i - 1].price).toBe(true);
      }

      // Reset filters
      act(() => {
        result.current.resetFilters();
      });

      filteredItems = result.current.getFilteredItems();
      expect(filteredItems).toEqual(mockStoreItems);
    });

    it('should handle owned items filtering', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store and add inventory
      await act(async () => {
        await result.current.initializeStore();
      });

      const inventoryItem: InventoryItem = {
        id: 'inv-1',
        itemId: 'food_basic_kibble',
        userId: mockUserId,
        quantity: 1,
        acquiredAt: new Date(),
        usedCount: 0,
      };

      act(() => {
        result.current.addToInventory(inventoryItem);
      });

      // Filter to show only owned items
      act(() => {
        result.current.setFilters({ showOwned: true });
      });

      let filteredItems = result.current.getFilteredItems();
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].id).toBe('food_basic_kibble');

      // Filter to hide owned items
      act(() => {
        result.current.setFilters({ showOwned: false });
      });

      filteredItems = result.current.getFilteredItems();
      expect(filteredItems.every(item => item.id !== 'food_basic_kibble')).toBe(
        true
      );
    });
  });

  describe('Store Management Workflow', () => {
    it('should handle store item management', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
      });

      const initialItemCount = result.current.items.length;

      // Add new store item
      const newItem: StoreItem = {
        id: 'new_item',
        name: 'New Item',
        description: 'A new test item',
        category: 'pet_food',
        price: 15,
        currency: 'coins',
        rarity: 'common',
        imageUrl: '/new-item.png',
        isLimited: false,
        tags: ['test', 'new'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStoreManager.addStoreItem.mockImplementation(() => {
        mockStoreItems.push(newItem);
      });

      act(() => {
        result.current.addStoreItem(newItem);
      });

      expect(result.current.items).toHaveLength(initialItemCount + 1);
      expect(result.current.items.find(item => item.id === 'new_item')).toEqual(
        newItem
      );

      // Update store item
      mockStoreManager.updateStoreItem.mockReturnValue(true);

      act(() => {
        result.current.updateStoreItem('new_item', {
          price: 20,
          description: 'Updated description',
        });
      });

      const updatedItem = result.current.items.find(
        item => item.id === 'new_item'
      );
      expect(updatedItem?.price).toBe(20);
      expect(updatedItem?.description).toBe('Updated description');

      // Remove store item
      mockStoreManager.removeStoreItem.mockReturnValue(true);

      act(() => {
        result.current.removeStoreItem('new_item');
      });

      expect(
        result.current.items.find(item => item.id === 'new_item')
      ).toBeUndefined();
    });
  });

  describe('Economy Integration Workflow', () => {
    it('should integrate with gamification system for coin updates', async () => {
      const { result } = renderHook(() => useStoreStore());
      const mockGamificationStore = useGamificationStore.getState();

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
        result.current.setUserEconomy(mockUserEconomy);
      });

      // Mock successful purchase
      const mockPurchaseResult: PurchaseResult = {
        success: true,
        item: mockStoreItems[0],
        quantity: 1,
        totalCost: 10,
        newBalance: 990,
        inventoryItem: {
          id: 'inv-123',
          itemId: 'food_basic_kibble',
          userId: mockUserId,
          quantity: 1,
          acquiredAt: new Date(),
          usedCount: 0,
        },
        transaction: {
          id: 'tx-123',
          userId: mockUserId,
          amount: -10,
          type: 'spent',
          source: 'store_purchase',
          description: 'Purchased 1x Basic Kibble',
          timestamp: new Date(),
        },
      };

      mockStoreManager.processPurchase.mockResolvedValue(mockPurchaseResult);

      await act(async () => {
        await result.current.processPurchase('food_basic_kibble', 1);
      });

      // Verify coin update
      expect(result.current.userEconomy.coins).toBe(990);

      // Update coins directly
      act(() => {
        result.current.updateCoins(50);
      });

      expect(result.current.userEconomy.coins).toBe(1040);
      expect(result.current.userEconomy.totalEarned).toBe(2050);

      // Spend coins
      act(() => {
        result.current.updateCoins(-25);
      });

      expect(result.current.userEconomy.coins).toBe(1015);
      expect(result.current.userEconomy.totalSpent).toBe(1025);
    });

    it('should handle premium coin transactions', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
        result.current.setUserEconomy(mockUserEconomy);
      });

      // Update premium coins
      act(() => {
        result.current.updatePremiumCoins(25);
      });

      expect(result.current.userEconomy.premiumCoins).toBe(75);

      // Spend premium coins
      act(() => {
        result.current.updatePremiumCoins(-30);
      });

      expect(result.current.userEconomy.premiumCoins).toBe(45);

      // Prevent negative balance
      act(() => {
        result.current.updatePremiumCoins(-100);
      });

      expect(result.current.userEconomy.premiumCoins).toBe(0);
    });
  });

  describe('Error Handling and Recovery Workflows', () => {
    it('should handle store initialization errors', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Mock initialization error
      mockStoreManager.getStoreItems.mockImplementation(() => {
        throw new Error('Failed to load store items');
      });

      await act(async () => {
        await result.current.initializeStore();
      });

      expect(result.current.error).toBe('Failed to initialize store');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual([]);
    });

    it('should handle purchase processing errors', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
        result.current.setUserEconomy(mockUserEconomy);
      });

      // Mock purchase error
      mockStoreManager.processPurchase.mockRejectedValue(
        new Error('Purchase failed')
      );

      const purchaseResult = await act(async () => {
        return await result.current.processPurchase('food_basic_kibble', 1);
      });

      expect(purchaseResult.success).toBe(false);
      expect(purchaseResult.error).toBe('Purchase failed');
      expect(result.current.userEconomy.coins).toBe(1000); // Unchanged
    });

    it('should recover from temporary failures', async () => {
      const { result } = renderHook(() => useStoreStore());

      // First initialization fails
      mockStoreManager.getStoreItems.mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      await act(async () => {
        await result.current.initializeStore();
      });

      expect(result.current.error).toBe('Failed to initialize store');

      // Second initialization succeeds
      mockStoreManager.getStoreItems.mockReturnValue(mockStoreItems);

      await act(async () => {
        await result.current.initializeStore();
      });

      expect(result.current.items).toEqual(mockStoreItems);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Performance and Optimization Workflows', () => {
    it('should handle large item catalogs efficiently', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Create large item catalog
      const largeItemCatalog = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        description: `Description for item ${i}`,
        category: 'pet_food' as const,
        price: Math.floor(Math.random() * 100) + 1,
        currency: 'coins' as const,
        rarity: 'common' as const,
        imageUrl: `/item-${i}.png`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockStoreManager.getStoreItems.mockReturnValue(largeItemCatalog);

      const startTime = Date.now();

      await act(async () => {
        await result.current.initializeStore();
      });

      const initTime = Date.now() - startTime;

      // Should initialize quickly even with large catalog
      expect(initTime).toBeLessThan(1000);
      expect(result.current.items).toHaveLength(1000);

      // Filtering should also be fast
      const filterStartTime = Date.now();

      act(() => {
        result.current.setFilters({ category: 'pet_food' });
      });

      const filteredItems = result.current.getFilteredItems();
      const filterTime = Date.now() - filterStartTime;

      expect(filterTime).toBeLessThan(100);
      expect(filteredItems).toHaveLength(1000);
    });

    it('should optimize repeated operations', async () => {
      const { result } = renderHook(() => useStoreStore());

      // Initialize store
      await act(async () => {
        await result.current.initializeStore();
      });

      // Perform multiple filter operations
      const operations = [
        { category: 'pet_food' },
        { category: 'themes' },
        { rarity: 'rare' },
        { sortBy: 'price', sortOrder: 'asc' },
        { search: 'forest' },
      ];

      const startTime = Date.now();

      for (const filter of operations) {
        act(() => {
          result.current.setFilters({
            category: 'all',
            rarity: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
            search: '',
            ...filter,
          } as StoreFilters);
        });
        result.current.getFilteredItems();
      }

      const totalTime = Date.now() - startTime;

      // All operations should complete quickly
      expect(totalTime).toBeLessThan(500);
    });
  });
});
