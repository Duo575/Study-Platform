import {
  StoreItem,
  StoreCategory,
  InventoryItem,
  Purchase,
  PurchaseResult,
  PurchaseEligibility,
  UserEconomy,
  UnlockRequirement,
  ItemEffect,
  StoreFilters,
  StoreError,
  CoinTransaction,
} from '../types';

/**
 * StoreManager - Handles all store operations including purchase processing,
 * inventory management, and item categorization/filtering
 */
export class StoreManager {
  private static instance: StoreManager;
  private storeItems: Map<string, StoreItem> = new Map();
  private categories: StoreCategory[] = [
    'pet_food',
    'pet_accessories',
    'themes',
    'environments',
    'music_packs',
    'power_ups',
    'decorations',
  ];

  private constructor() {
    this.initializeDefaultItems();
  }

  public static getInstance(): StoreManager {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager();
    }
    return StoreManager.instance;
  }

  /**
   * Initialize store with default items
   */
  private initializeDefaultItems(): void {
    const defaultItems: StoreItem[] = [
      // Pet Food Items
      {
        id: 'food_basic_kibble',
        name: 'Basic Kibble',
        description: 'Standard pet food that restores health and happiness',
        category: 'pet_food',
        price: 10,
        currency: 'coins',
        rarity: 'common',
        effects: [
          {
            type: 'health',
            value: 20,
            description: 'Restores 20 health points',
          },
          {
            type: 'happiness',
            value: 10,
            description: 'Increases happiness by 10 points',
          },
        ],
        imageUrl: '/images/items/basic_kibble.png',
        isLimited: false,
        tags: ['pet', 'food', 'basic'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'food_premium_treats',
        name: 'Premium Treats',
        description: 'High-quality treats that significantly boost pet stats',
        category: 'pet_food',
        price: 25,
        currency: 'coins',
        rarity: 'rare',
        effects: [
          {
            type: 'health',
            value: 40,
            description: 'Restores 40 health points',
          },
          {
            type: 'happiness',
            value: 30,
            description: 'Increases happiness by 30 points',
          },
          {
            type: 'energy',
            value: 20,
            description: 'Boosts energy by 20 points',
          },
        ],
        imageUrl: '/images/items/premium_treats.png',
        isLimited: false,
        tags: ['pet', 'food', 'premium', 'treats'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'food_evolution_boost',
        name: 'Evolution Catalyst',
        description: 'Special food that accelerates pet evolution progress',
        category: 'pet_food',
        price: 100,
        currency: 'coins',
        rarity: 'epic',
        effects: [
          {
            type: 'evolution_boost',
            value: 25,
            description: 'Increases evolution progress by 25%',
          },
          {
            type: 'health',
            value: 50,
            description: 'Restores 50 health points',
          },
        ],
        imageUrl: '/images/items/evolution_catalyst.png',
        unlockRequirements: [
          {
            type: 'level',
            value: 5,
            target: 5,
            current: 0,
            description: 'Reach level 5 to unlock',
            met: false,
          },
        ],
        isLimited: true,
        tags: ['pet', 'food', 'evolution', 'special'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Pet Accessories
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
        tags: ['pet', 'accessory', 'collar'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'accessory_golden_crown',
        name: 'Golden Crown',
        description: "A majestic crown that shows your pet's royal status",
        category: 'pet_accessories',
        price: 200,
        currency: 'coins',
        rarity: 'legendary',
        effects: [
          {
            type: 'xp_multiplier',
            value: 1.2,
            description: 'Increases XP gain by 20%',
          },
        ],
        imageUrl: '/images/items/golden_crown.png',
        unlockRequirements: [
          {
            type: 'coins_spent',
            value: 500,
            target: 500,
            current: 0,
            description: 'Spend 500 coins in the store',
            met: false,
          },
        ],
        isLimited: true,
        tags: ['pet', 'accessory', 'crown', 'legendary', 'xp'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Themes
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
        tags: ['theme', 'forest', 'nature', 'calming'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'theme_ocean_depths',
        name: 'Ocean Depths',
        description: 'Deep blue ocean theme with wave animations',
        category: 'themes',
        price: 150,
        currency: 'coins',
        rarity: 'epic',
        imageUrl: '/images/themes/ocean_depths.png',
        unlockRequirements: [
          {
            type: 'study_hours',
            value: 20,
            target: 20,
            current: 0,
            description: 'Study for 20 hours total',
            met: false,
          },
        ],
        isLimited: false,
        tags: ['theme', 'ocean', 'water', 'animated'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Environments
      {
        id: 'env_mountain_peak',
        name: 'Mountain Peak',
        description: 'Study with a breathtaking mountain view',
        category: 'environments',
        price: 100,
        currency: 'coins',
        rarity: 'rare',
        imageUrl: '/images/environments/mountain_peak.png',
        isLimited: false,
        tags: ['environment', 'mountain', 'nature', 'scenic'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Power-ups
      {
        id: 'powerup_double_coins',
        name: 'Double Coins',
        description: 'Doubles coin earnings for 1 hour',
        category: 'power_ups',
        price: 50,
        currency: 'coins',
        rarity: 'rare',
        effects: [
          {
            type: 'coin_multiplier',
            value: 2,
            duration: 60,
            description: 'Doubles coin earnings for 60 minutes',
          },
        ],
        imageUrl: '/images/items/double_coins.png',
        isLimited: false,
        tags: ['power-up', 'coins', 'multiplier'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultItems.forEach(item => {
      this.storeItems.set(item.id, item);
    });
  }

  /**
   * Get all store items with optional filtering
   */
  public getStoreItems(filters?: StoreFilters): StoreItem[] {
    let items = Array.from(this.storeItems.values());

    if (!filters) {
      return items;
    }

    return this.applyFilters(items, filters);
  }

  /**
   * Get items by category
   */
  public getItemsByCategory(category: StoreCategory): StoreItem[] {
    return Array.from(this.storeItems.values()).filter(
      item => item.category === category
    );
  }

  /**
   * Get a specific item by ID
   */
  public getItemById(itemId: string): StoreItem | undefined {
    return this.storeItems.get(itemId);
  }

  /**
   * Get all available categories
   */
  public getCategories(): StoreCategory[] {
    return [...this.categories];
  }

  /**
   * Check if a purchase is eligible
   */
  public checkPurchaseEligibility(
    itemId: string,
    quantity: number,
    userEconomy: UserEconomy,
    userLevel?: number,
    userStats?: Record<string, number>
  ): PurchaseEligibility {
    const item = this.storeItems.get(itemId);

    if (!item) {
      return {
        eligible: false,
        canPurchase: false,
        reason: 'Item not found',
      };
    }

    // Check stock availability
    if (item.stock !== undefined && item.stock < quantity) {
      return {
        eligible: false,
        canPurchase: false,
        reason: 'Insufficient stock',
      };
    }

    // Check user balance
    const totalCost = item.price * quantity;
    const userBalance =
      item.currency === 'coins' ? userEconomy.coins : userEconomy.premiumCoins;

    if (userBalance < totalCost) {
      return {
        eligible: false,
        canPurchase: false,
        reason: 'Insufficient funds',
        missingCoins: totalCost - userBalance,
      };
    }

    // Check unlock requirements
    if (item.unlockRequirements && item.unlockRequirements.length > 0) {
      const unmetRequirements = this.checkUnlockRequirements(
        item.unlockRequirements,
        userLevel,
        userStats,
        userEconomy
      );

      if (unmetRequirements.length > 0) {
        return {
          eligible: false,
          canPurchase: false,
          reason: 'Requirements not met',
          unmetRequirements: unmetRequirements,
        };
      }
    }

    return { eligible: true, canPurchase: true };
  }

  /**
   * Process a purchase transaction
   */
  public async processPurchase(
    itemId: string,
    quantity: number,
    userId: string,
    userEconomy: UserEconomy,
    userLevel?: number,
    userStats?: Record<string, number>
  ): Promise<PurchaseResult> {
    const item = this.storeItems.get(itemId);

    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }

    // Check eligibility
    const eligibility = this.checkPurchaseEligibility(
      itemId,
      quantity,
      userEconomy,
      userLevel,
      userStats
    );

    if (!eligibility.canPurchase) {
      return {
        success: false,
        item,
        quantity,
        totalCost: item.price * quantity,
        newBalance:
          item.currency === 'coins'
            ? userEconomy.coins
            : userEconomy.premiumCoins,
        error: eligibility.reason,
        transaction: this.createFailedTransaction(
          itemId,
          quantity,
          item,
          userId,
          eligibility.reason || 'Unknown error'
        ),
      };
    }

    const totalCost = item.price * quantity;

    try {
      // Create purchase record
      const purchase: Purchase = {
        id: this.generateId('purchase'),
        userId,
        itemId,
        quantity,
        totalCost,
        currency: item.currency,
        purchasedAt: new Date(),
        status: 'completed',
        transactionId: this.generateId('transaction'),
      };

      // Create inventory item
      const inventoryItem: InventoryItem = {
        id: this.generateId('inventory'),
        itemId,
        userId,
        quantity,
        acquiredAt: new Date(),
        usedCount: 0,
      };

      // Create transaction record
      const transaction: CoinTransaction = {
        id: purchase.transactionId!,
        userId,
        amount: -totalCost,
        type: 'spent',
        source: 'store_purchase',
        description: `Purchased ${quantity}x ${item.name}`,
        relatedId: purchase.id,
        timestamp: new Date(),
      };

      // Update item stock if applicable
      if (item.stock !== undefined) {
        const updatedItem = { ...item, stock: item.stock - quantity };
        this.storeItems.set(itemId, updatedItem);
      }

      const newBalance =
        item.currency === 'coins'
          ? userEconomy.coins - totalCost
          : userEconomy.premiumCoins - totalCost;

      return {
        success: true,
        item,
        quantity,
        totalCost,
        newBalance,
        inventoryItem,
        transaction,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Purchase failed';

      return {
        success: false,
        item,
        quantity,
        totalCost,
        newBalance:
          item.currency === 'coins'
            ? userEconomy.coins
            : userEconomy.premiumCoins,
        error: errorMessage,
        transaction: this.createFailedTransaction(
          itemId,
          quantity,
          item,
          userId,
          errorMessage
        ),
      };
    }
  }

  /**
   * Add a new item to the store
   */
  public addStoreItem(item: StoreItem): void {
    this.storeItems.set(item.id, item);
  }

  /**
   * Update an existing store item
   */
  public updateStoreItem(itemId: string, updates: Partial<StoreItem>): boolean {
    const existingItem = this.storeItems.get(itemId);
    if (!existingItem) {
      return false;
    }

    const updatedItem = {
      ...existingItem,
      ...updates,
      updatedAt: new Date(),
    };

    this.storeItems.set(itemId, updatedItem);
    return true;
  }

  /**
   * Remove an item from the store
   */
  public removeStoreItem(itemId: string): boolean {
    return this.storeItems.delete(itemId);
  }

  /**
   * Apply filters to store items
   */
  private applyFilters(items: StoreItem[], filters: StoreFilters): StoreItem[] {
    let filteredItems = [...items];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filteredItems = filteredItems.filter(
        item => item.category === filters.category
      );
    }

    // Filter by rarity
    if (filters.rarity && filters.rarity !== 'all') {
      filteredItems = filteredItems.filter(
        item => item.rarity === filters.rarity
      );
    }

    // Filter by price range
    if (filters.priceRange) {
      filteredItems = filteredItems.filter(
        item =>
          item.price >= (filters.priceRange?.min || 0) &&
          item.price <= (filters.priceRange?.max || Infinity)
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort items
    if (filters.sortBy) {
      filteredItems.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'rarity':
            const rarityOrder = {
              common: 1,
              rare: 2,
              epic: 3,
              legendary: 4,
            };
            aValue = rarityOrder[a.rarity];
            bValue = rarityOrder[b.rarity];
            break;
          case 'newest':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      });
    }

    return filteredItems;
  }

  /**
   * Check unlock requirements
   */
  private checkUnlockRequirements(
    requirements: UnlockRequirement[],
    userLevel?: number,
    userStats?: Record<string, number>,
    userEconomy?: UserEconomy
  ): UnlockRequirement[] {
    const unmetRequirements: UnlockRequirement[] = [];

    for (const requirement of requirements) {
      let currentValue = 0;

      switch (requirement.type) {
        case 'level':
          currentValue = userLevel || 0;
          break;
        case 'coins_spent':
          currentValue = userEconomy?.totalSpent || 0;
          break;
        case 'study_hours':
          currentValue = userStats?.studyHours || 0;
          break;
        case 'quests_completed':
          currentValue = userStats?.questsCompleted || 0;
          break;
        case 'pet_evolution':
          currentValue = userStats?.petEvolutionStage || 0;
          break;
        default:
          currentValue = 0;
      }

      if (currentValue < requirement.target) {
        unmetRequirements.push({
          ...requirement,
          current: currentValue,
        });
      }
    }

    return unmetRequirements;
  }

  /**
   * Generate unique IDs
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create a failed transaction record
   */
  private createFailedTransaction(
    itemId: string,
    quantity: number,
    item: StoreItem,
    userId: string,
    reason: string
  ): CoinTransaction {
    return {
      id: this.generateId('transaction'),
      userId,
      amount: 0,
      type: 'spent',
      source: 'store_purchase',
      description: `Failed purchase: ${quantity}x ${item.name} - ${reason}`,
      relatedId: itemId,
      timestamp: new Date(),
    };
  }

  /**
   * Validate item data
   */
  public validateItem(item: Partial<StoreItem>): boolean {
    if (!item.name || !item.description || !item.category) {
      return false;
    }

    if (!item.price || item.price < 0) {
      return false;
    }

    if (!item.currency || !['coins', 'premium_coins'].includes(item.currency)) {
      return false;
    }

    if (
      !item.rarity ||
      !['common', 'rare', 'epic', 'legendary'].includes(item.rarity)
    ) {
      return false;
    }

    if (!this.categories.includes(item.category as StoreCategory)) {
      return false;
    }

    return true;
  }

  /**
   * Get items that can be purchased with current user economy
   */
  public getAffordableItems(
    userEconomy: UserEconomy,
    currency?: 'coins' | 'premium_coins'
  ): StoreItem[] {
    return Array.from(this.storeItems.values()).filter(item => {
      if (currency && item.currency !== currency) {
        return false;
      }

      const userBalance =
        item.currency === 'coins'
          ? userEconomy.coins
          : userEconomy.premiumCoins;
      return userBalance >= item.price;
    });
  }

  /**
   * Get recommended items based on user preferences and stats
   */
  public getRecommendedItems(
    userEconomy: UserEconomy,
    userLevel?: number,
    userStats?: Record<string, number>,
    limit: number = 5
  ): StoreItem[] {
    const affordableItems = this.getAffordableItems(userEconomy);

    // Simple recommendation logic - prioritize items user can afford and unlock
    const recommendedItems = affordableItems
      .filter(item => {
        if (!item.unlockRequirements) return true;

        const unmetRequirements = this.checkUnlockRequirements(
          item.unlockRequirements,
          userLevel,
          userStats,
          userEconomy
        );

        return unmetRequirements.length === 0;
      })
      .sort((a, b) => {
        // Prioritize by rarity and price
        const rarityScore = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return rarityScore[b.rarity] - rarityScore[a.rarity];
      })
      .slice(0, limit);

    return recommendedItems;
  }
}

export default StoreManager;
