import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoreManager from '../storeManager';
import type {
  StoreItem,
  UserEconomy,
  StoreFilters,
  PurchaseEligibility,
  UnlockRequirement,
} from '../../types';

describe('StoreManager', () => {
  let storeManager: StoreManager;

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

  beforeEach(() => {
    // Reset singleton instance
    (StoreManager as any).instance = undefined;
    storeManager = StoreManager.getInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StoreManager.getInstance();
      const instance2 = StoreManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('initialization', () => {
    it('should initialize with default items', () => {
      const items = storeManager.getStoreItems();

      expect(items.length).toBeGreaterThan(0);
      expect(items.some(item => item.id === 'food_basic_kibble')).toBe(true);
      expect(items.some(item => item.id === 'accessory_red_collar')).toBe(true);
      expect(items.some(item => item.id === 'theme_forest_serenity')).toBe(
        true
      );
    });

    it('should have all required categories', () => {
      const categories = storeManager.getCategories();

      expect(categories).toContain('pet_food');
      expect(categories).toContain('pet_accessories');
      expect(categories).toContain('themes');
      expect(categories).toContain('environments');
      expect(categories).toContain('music_packs');
      expect(categories).toContain('power_ups');
      expect(categories).toContain('decorations');
    });
  });

  describe('getStoreItems', () => {
    it('should return all items when no filters applied', () => {
      const items = storeManager.getStoreItems();

      expect(items.length).toBeGreaterThan(5);
      expect(items.every(item => item.id && item.name && item.category)).toBe(
        true
      );
    });

    it('should filter items by category', () => {
      const filters: StoreFilters = { category: 'pet_food' };
      const items = storeManager.getStoreItems(filters);

      expect(items.every(item => item.category === 'pet_food')).toBe(true);
      expect(items.some(item => item.id === 'food_basic_kibble')).toBe(true);
    });

    it('should filter items by rarity', () => {
      const filters: StoreFilters = { rarity: 'epic' };
      const items = storeManager.getStoreItems(filters);

      expect(items.every(item => item.rarity === 'epic')).toBe(true);
      expect(items.some(item => item.id === 'food_evolution_boost')).toBe(true);
    });

    it('should filter items by price range', () => {
      const filters: StoreFilters = {
        priceRange: { min: 20, max: 100 },
      };
      const items = storeManager.getStoreItems(filters);

      expect(items.every(item => item.price >= 20 && item.price <= 100)).toBe(
        true
      );
    });

    it('should search items by name and description', () => {
      const filters: StoreFilters = { search: 'premium' };
      const items = storeManager.getStoreItems(filters);

      expect(
        items.every(
          item =>
            item.name.toLowerCase().includes('premium') ||
            item.description.toLowerCase().includes('premium')
        )
      ).toBe(true);
    });

    it('should sort items by name', () => {
      const filters: StoreFilters = { sortBy: 'name', sortOrder: 'asc' };
      const items = storeManager.getStoreItems(filters);

      for (let i = 1; i < items.length; i++) {
        expect(
          items[i].name.toLowerCase() >= items[i - 1].name.toLowerCase()
        ).toBe(true);
      }
    });

    it('should sort items by price descending', () => {
      const filters: StoreFilters = { sortBy: 'price', sortOrder: 'desc' };
      const items = storeManager.getStoreItems(filters);

      for (let i = 1; i < items.length; i++) {
        expect(items[i].price <= items[i - 1].price).toBe(true);
      }
    });

    it('should sort items by rarity', () => {
      const filters: StoreFilters = { sortBy: 'rarity', sortOrder: 'desc' };
      const items = storeManager.getStoreItems(filters);

      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      for (let i = 1; i < items.length; i++) {
        expect(
          rarityOrder[items[i].rarity] <= rarityOrder[items[i - 1].rarity]
        ).toBe(true);
      }
    });
  });

  describe('getItemsByCategory', () => {
    it('should return items for specific category', () => {
      const petFoodItems = storeManager.getItemsByCategory('pet_food');
      const themeItems = storeManager.getItemsByCategory('themes');

      expect(petFoodItems.every(item => item.category === 'pet_food')).toBe(
        true
      );
      expect(themeItems.every(item => item.category === 'themes')).toBe(true);
      expect(petFoodItems.length).toBeGreaterThan(0);
      expect(themeItems.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent category', () => {
      const items = storeManager.getItemsByCategory('non_existent' as any);

      expect(items).toEqual([]);
    });
  });

  describe('getItemById', () => {
    it('should return item by ID', () => {
      const item = storeManager.getItemById('food_basic_kibble');

      expect(item).toBeDefined();
      expect(item?.id).toBe('food_basic_kibble');
      expect(item?.name).toBe('Basic Kibble');
    });

    it('should return undefined for non-existent item', () => {
      const item = storeManager.getItemById('non_existent');

      expect(item).toBeUndefined();
    });
  });

  describe('checkPurchaseEligibility', () => {
    it('should allow purchase when all conditions are met', () => {
      const eligibility = storeManager.checkPurchaseEligibility(
        'food_basic_kibble',
        2,
        mockUserEconomy
      );

      expect(eligibility.canPurchase).toBe(true);
    });

    it('should reject purchase for non-existent item', () => {
      const eligibility = storeManager.checkPurchaseEligibility(
        'non_existent',
        1,
        mockUserEconomy
      );

      expect(eligibility.canPurchase).toBe(false);
      expect(eligibility.reason).toBe('Item not found');
    });

    it('should reject purchase for insufficient funds', () => {
      const poorUserEconomy: UserEconomy = {
        ...mockUserEconomy,
        coins: 5,
      };

      const eligibility = storeManager.checkPurchaseEligibility(
        'food_basic_kibble',
        2,
        poorUserEconomy
      );

      expect(eligibility.canPurchase).toBe(false);
      expect(eligibility.reason).toBe('Insufficient funds');
      expect(eligibility.missingCoins).toBe(15); // Need 20, have 5
    });

    it('should reject purchase for insufficient stock', () => {
      // Add item with limited stock
      const limitedItem: StoreItem = {
        id: 'limited_item',
        name: 'Limited Item',
        description: 'Only 1 in stock',
        category: 'pet_food',
        price: 10,
        currency: 'coins',
        rarity: 'rare',
        stock: 1,
        imageUrl: '/test.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storeManager.addStoreItem(limitedItem);

      const eligibility = storeManager.checkPurchaseEligibility(
        'limited_item',
        2,
        mockUserEconomy
      );

      expect(eligibility.canPurchase).toBe(false);
      expect(eligibility.reason).toBe('Insufficient stock');
    });

    it('should reject purchase when unlock requirements not met', () => {
      const eligibility = storeManager.checkPurchaseEligibility(
        'food_evolution_boost',
        1,
        mockUserEconomy,
        3 // User level 3, but item requires level 5
      );

      expect(eligibility.canPurchase).toBe(false);
      expect(eligibility.reason).toBe('Requirements not met');
      expect(eligibility.missingRequirements).toBeDefined();
    });
  });

  describe('processPurchase', () => {
    it('should process successful purchase', async () => {
      const result = await storeManager.processPurchase(
        'food_basic_kibble',
        2,
        'user-123',
        mockUserEconomy
      );

      expect(result.success).toBe(true);
      expect(result.item.id).toBe('food_basic_kibble');
      expect(result.quantity).toBe(2);
      expect(result.totalCost).toBe(20);
      expect(result.newBalance).toBe(980); // 1000 - 20
      expect(result.inventoryItem).toBeDefined();
      expect(result.transaction).toBeDefined();
    });

    it('should fail purchase for non-existent item', async () => {
      const result = await storeManager.processPurchase(
        'non_existent',
        1,
        'user-123',
        mockUserEconomy
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
    });

    it('should fail purchase for insufficient funds', async () => {
      const poorUserEconomy: UserEconomy = {
        ...mockUserEconomy,
        coins: 5,
      };

      const result = await storeManager.processPurchase(
        'food_basic_kibble',
        2,
        'user-123',
        poorUserEconomy
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient funds');
    });

    it('should update item stock after purchase', async () => {
      // Add item with stock
      const stockItem: StoreItem = {
        id: 'stock_item',
        name: 'Stock Item',
        description: 'Item with stock',
        category: 'pet_food',
        price: 10,
        currency: 'coins',
        rarity: 'common',
        stock: 5,
        imageUrl: '/test.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storeManager.addStoreItem(stockItem);

      const result = await storeManager.processPurchase(
        'stock_item',
        2,
        'user-123',
        mockUserEconomy
      );

      expect(result.success).toBe(true);

      const updatedItem = storeManager.getItemById('stock_item');
      expect(updatedItem?.stock).toBe(3); // 5 - 2
    });

    it('should handle premium coins purchase', async () => {
      // Add premium item
      const premiumItem: StoreItem = {
        id: 'premium_item',
        name: 'Premium Item',
        description: 'Costs premium coins',
        category: 'themes',
        price: 10,
        currency: 'premium_coins',
        rarity: 'epic',
        imageUrl: '/test.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storeManager.addStoreItem(premiumItem);

      const result = await storeManager.processPurchase(
        'premium_item',
        1,
        'user-123',
        mockUserEconomy
      );

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(40); // 50 - 10 premium coins
    });
  });

  describe('item management', () => {
    it('should add new store item', () => {
      const newItem: StoreItem = {
        id: 'new_item',
        name: 'New Item',
        description: 'A new test item',
        category: 'pet_food',
        price: 15,
        currency: 'coins',
        rarity: 'common',
        imageUrl: '/new-item.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storeManager.addStoreItem(newItem);

      const retrievedItem = storeManager.getItemById('new_item');
      expect(retrievedItem).toEqual(newItem);
    });

    it('should update existing store item', () => {
      const success = storeManager.updateStoreItem('food_basic_kibble', {
        price: 15,
        description: 'Updated description',
      });

      expect(success).toBe(true);

      const updatedItem = storeManager.getItemById('food_basic_kibble');
      expect(updatedItem?.price).toBe(15);
      expect(updatedItem?.description).toBe('Updated description');
      expect(updatedItem?.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail to update non-existent item', () => {
      const success = storeManager.updateStoreItem('non_existent', {
        price: 20,
      });

      expect(success).toBe(false);
    });

    it('should remove store item', () => {
      const success = storeManager.removeStoreItem('food_basic_kibble');

      expect(success).toBe(true);
      expect(storeManager.getItemById('food_basic_kibble')).toBeUndefined();
    });

    it('should fail to remove non-existent item', () => {
      const success = storeManager.removeStoreItem('non_existent');

      expect(success).toBe(false);
    });
  });

  describe('getAffordableItems', () => {
    it('should return items user can afford', () => {
      const affordableItems = storeManager.getAffordableItems(mockUserEconomy);

      expect(
        affordableItems.every(item => {
          const userBalance =
            item.currency === 'coins'
              ? mockUserEconomy.coins
              : mockUserEconomy.premiumCoins;
          return userBalance >= item.price;
        })
      ).toBe(true);
    });

    it('should filter by currency type', () => {
      const coinItems = storeManager.getAffordableItems(
        mockUserEconomy,
        'coins'
      );
      const premiumItems = storeManager.getAffordableItems(
        mockUserEconomy,
        'premium_coins'
      );

      expect(coinItems.every(item => item.currency === 'coins')).toBe(true);
      expect(
        premiumItems.every(item => item.currency === 'premium_coins')
      ).toBe(true);
    });

    it('should return empty array for user with no money', () => {
      const brokeUserEconomy: UserEconomy = {
        ...mockUserEconomy,
        coins: 0,
        premiumCoins: 0,
      };

      const affordableItems = storeManager.getAffordableItems(brokeUserEconomy);

      expect(affordableItems).toEqual([]);
    });
  });

  describe('getRecommendedItems', () => {
    it('should return recommended items', () => {
      const recommendedItems = storeManager.getRecommendedItems(
        mockUserEconomy,
        5,
        { studyHours: 30 },
        3
      );

      expect(recommendedItems.length).toBeLessThanOrEqual(3);
      expect(
        recommendedItems.every(item => {
          const userBalance =
            item.currency === 'coins'
              ? mockUserEconomy.coins
              : mockUserEconomy.premiumCoins;
          return userBalance >= item.price;
        })
      ).toBe(true);
    });

    it('should prioritize higher rarity items', () => {
      const recommendedItems = storeManager.getRecommendedItems(
        mockUserEconomy,
        10,
        { studyHours: 100 },
        5
      );

      // Should be sorted by rarity (legendary > epic > rare > common)
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      for (let i = 1; i < recommendedItems.length; i++) {
        expect(
          rarityOrder[recommendedItems[i].rarity] <=
            rarityOrder[recommendedItems[i - 1].rarity]
        ).toBe(true);
      }
    });
  });

  describe('validateItem', () => {
    it('should validate correct item', () => {
      const validItem = {
        name: 'Test Item',
        description: 'Test description',
        category: 'pet_food',
        price: 10,
        currency: 'coins',
        rarity: 'common',
      };

      expect(storeManager.validateItem(validItem)).toBe(true);
    });

    it('should reject item with missing required fields', () => {
      const invalidItem = {
        name: 'Test Item',
        // Missing description, category, etc.
      };

      expect(storeManager.validateItem(invalidItem)).toBe(false);
    });

    it('should reject item with invalid price', () => {
      const invalidItem = {
        name: 'Test Item',
        description: 'Test description',
        category: 'pet_food',
        price: -10,
        currency: 'coins',
        rarity: 'common',
      };

      expect(storeManager.validateItem(invalidItem)).toBe(false);
    });

    it('should reject item with invalid currency', () => {
      const invalidItem = {
        name: 'Test Item',
        description: 'Test description',
        category: 'pet_food',
        price: 10,
        currency: 'invalid_currency',
        rarity: 'common',
      };

      expect(storeManager.validateItem(invalidItem)).toBe(false);
    });

    it('should reject item with invalid rarity', () => {
      const invalidItem = {
        name: 'Test Item',
        description: 'Test description',
        category: 'pet_food',
        price: 10,
        currency: 'coins',
        rarity: 'invalid_rarity',
      };

      expect(storeManager.validateItem(invalidItem)).toBe(false);
    });

    it('should reject item with invalid category', () => {
      const invalidItem = {
        name: 'Test Item',
        description: 'Test description',
        category: 'invalid_category',
        price: 10,
        currency: 'coins',
        rarity: 'common',
      };

      expect(storeManager.validateItem(invalidItem)).toBe(false);
    });
  });

  describe('unlock requirements checking', () => {
    it('should check various unlock requirement types', () => {
      const requirements: UnlockRequirement[] = [
        { type: 'level', target: 5, current: 0, description: 'Reach level 5' },
        {
          type: 'coins_spent',
          target: 100,
          current: 0,
          description: 'Spend 100 coins',
        },
        {
          type: 'study_hours',
          target: 20,
          current: 0,
          description: 'Study 20 hours',
        },
      ];

      const unmetRequirements = (storeManager as any).checkUnlockRequirements(
        requirements,
        3, // userLevel
        { studyHours: 15 }, // userStats
        { totalSpent: 50 } // userEconomy
      );

      expect(unmetRequirements).toHaveLength(3); // All requirements not met
      expect(unmetRequirements[0].current).toBe(3); // User level
      expect(unmetRequirements[1].current).toBe(50); // Coins spent
      expect(unmetRequirements[2].current).toBe(15); // Study hours
    });

    it('should return empty array when all requirements are met', () => {
      const requirements: UnlockRequirement[] = [
        { type: 'level', target: 5, current: 0, description: 'Reach level 5' },
      ];

      const unmetRequirements = (storeManager as any).checkUnlockRequirements(
        requirements,
        10, // userLevel > target
        {},
        {}
      );

      expect(unmetRequirements).toHaveLength(0);
    });
  });

  describe('utility methods', () => {
    it('should generate unique IDs', () => {
      const id1 = (storeManager as any).generateId('test');
      const id2 = (storeManager as any).generateId('test');

      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should create failed transaction record', () => {
      const item = storeManager.getItemById('food_basic_kibble')!;
      const transaction = (storeManager as any).createFailedTransaction(
        'food_basic_kibble',
        2,
        item,
        'user-123',
        'Test error'
      );

      expect(transaction.id).toMatch(/^transaction_\d+_[a-z0-9]+$/);
      expect(transaction.userId).toBe('user-123');
      expect(transaction.amount).toBe(0);
      expect(transaction.type).toBe('spent');
      expect(transaction.description).toContain('Failed purchase');
      expect(transaction.description).toContain('Test error');
    });
  });
});
