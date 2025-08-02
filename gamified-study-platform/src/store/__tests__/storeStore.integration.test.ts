import { describe, it, expect, beforeEach } from 'vitest';
import { useStoreStore } from '../storeStore';
import StoreManager from '../../services/storeManager';

describe('Store Integration with StoreManager', () => {
  let storeManager: StoreManager;

  beforeEach(() => {
    const store = useStoreStore.getState();
    storeManager = StoreManager.getInstance();
    store.resetStore();
  });

  it('should initialize store with items from StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    expect(store.items.length).toBeGreaterThan(0);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should get filtered items using StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    store.setFilters({ category: 'pet_food' });
    const filteredItems = store.getFilteredItems();

    expect(
      filteredItems.every((item: any) => item.category === 'pet_food')
    ).toBe(true);
  });

  it('should check purchase eligibility using StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    // Set up user economy with sufficient funds
    store.setUserEconomy({
      coins: 1000,
      premiumCoins: 50,
      totalEarned: 1000,
      totalSpent: 0,
      purchaseHistory: [],
      inventory: [],
      dailyCoinLimit: 100,
      dailyCoinsEarned: 0,
    });

    const eligibility = store.checkPurchaseEligibility('food_basic_kibble', 1);
    expect(eligibility.canPurchase).toBe(true);
  });

  it('should process purchase using StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    // Set up user economy with sufficient funds
    store.setUserEconomy({
      coins: 1000,
      premiumCoins: 50,
      totalEarned: 1000,
      totalSpent: 0,
      purchaseHistory: [],
      inventory: [],
      dailyCoinLimit: 100,
      dailyCoinsEarned: 0,
    });

    const purchaseResult = await store.processPurchase('food_basic_kibble', 1);

    expect(purchaseResult.success).toBe(true);
    expect(purchaseResult.item.name).toBe('Basic Kibble');
    expect(purchaseResult.totalCost).toBe(10);

    // Check updated state
    const currentState = useStoreStore.getState();
    expect(currentState.userEconomy.coins).toBe(990); // 1000 - 10
    expect(currentState.userInventory.length).toBe(1);
    expect(currentState.purchaseHistory.length).toBe(1);
  });

  it('should get item by ID using StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    const item = store.getItemById('food_basic_kibble');
    expect(item).toBeDefined();
    expect(item?.name).toBe('Basic Kibble');
  });

  it('should add new item using StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    const newItem = {
      id: 'test_integration_item',
      name: 'Integration Test Item',
      description: 'An item for integration testing',
      category: 'pet_food' as const,
      price: 25,
      currency: 'coins' as const,
      rarity: 'common' as const,
      imageUrl: '/test.png',
      isLimited: false,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.addStoreItem(newItem);

    const addedItem = store.getItemById('test_integration_item');
    expect(addedItem).toEqual(newItem);

    const currentState = useStoreStore.getState();
    expect(currentState.items).toContainEqual(newItem);
  });

  it('should update item using StoreManager', async () => {
    const store = useStoreStore.getState();
    await store.initializeStore();

    store.updateStoreItem('food_basic_kibble', {
      price: 15,
      description: 'Updated description',
    });

    const updatedItem = store.getItemById('food_basic_kibble');
    expect(updatedItem?.price).toBe(15);
    expect(updatedItem?.description).toBe('Updated description');
  });

  it('should verify StoreManager singleton integration', async () => {
    const store = useStoreStore.getState();
    const managerFromStore = StoreManager.getInstance();
    expect(managerFromStore).toBe(storeManager);

    // Initialize the store first
    await store.initializeStore();

    // Verify that both store and direct manager access return same items
    const storeState = useStoreStore.getState();
    const managerItems = storeManager.getStoreItems();
    expect(storeState.items).toEqual(managerItems);
  });
});
