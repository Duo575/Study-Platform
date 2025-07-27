// Tests for offline service functionality
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock IndexedDB
const mockIDBDatabase = {
  transaction: vi.fn(),
  objectStoreNames: { contains: vi.fn() },
  createObjectStore: vi.fn(),
  close: vi.fn(),
};

const mockIDBTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null,
};

const mockIDBObjectStore = {
  add: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  createIndex: vi.fn(),
};

const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
};

// Mock global IndexedDB before any imports
vi.stubGlobal('indexedDB', {
  open: vi.fn(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = mockIDBDatabase;
      if (request.onsuccess) request.onsuccess();
    }, 0);
    return request;
  }),
});

// Mock navigator.onLine
vi.stubGlobal('navigator', {
  onLine: true,
});

// Mock window events
const mockEventListeners: { [key: string]: Function[] } = {};
vi.stubGlobal('window', {
  addEventListener: (event: string, callback: Function) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(callback);
  },
  dispatchEvent: (event: CustomEvent) => {
    const listeners = mockEventListeners[event.type] || [];
    listeners.forEach(listener => listener(event));
  },
});

// Import the service after mocking globals
import { offlineService } from '@/services/offlineService';

describe('OfflineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations
    mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
    mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);

    // Mock successful operations
    mockIDBObjectStore.add.mockReturnValue({
      ...mockIDBRequest,
      onsuccess: null,
    });
    mockIDBObjectStore.put.mockReturnValue({
      ...mockIDBRequest,
      onsuccess: null,
    });
    mockIDBObjectStore.get.mockReturnValue({
      ...mockIDBRequest,
      onsuccess: null,
    });
    mockIDBObjectStore.getAll.mockReturnValue({
      ...mockIDBRequest,
      onsuccess: null,
    });
    mockIDBObjectStore.delete.mockReturnValue({
      ...mockIDBRequest,
      onsuccess: null,
    });
    mockIDBObjectStore.clear.mockReturnValue({
      ...mockIDBRequest,
      onsuccess: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Connection Status', () => {
    it('should detect online status', () => {
      (global.navigator as any).onLine = true;
      expect(offlineService.isOnline()).toBe(true);
    });

    it('should detect offline status', () => {
      (global.navigator as any).onLine = false;
      expect(offlineService.isOnline()).toBe(false);
    });
  });

  describe('Offline Actions Queue', () => {
    it('should queue offline action', async () => {
      const mockRequest = { ...mockIDBRequest };
      const mockAdd = vi.fn().mockReturnValue(mockRequest);
      mockIDBObjectStore.add.mockImplementation(mockAdd);

      // Simulate successful operation
      setTimeout(() => {
        if (mockRequest.onsuccess) mockRequest.onsuccess();
      }, 0);

      await expect(
        offlineService.queueOfflineAction('test', { data: 'test' }, '/api/test')
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.add).toHaveBeenCalled();
    });

    it('should get offline actions', async () => {
      const mockActions = [
        {
          id: '1',
          type: 'test',
          data: {},
          endpoint: '/api/test',
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      const mockGetAll = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockActions;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.getAll.mockReturnValue(mockGetAll());

      const actions = await offlineService.getOfflineActions();
      expect(actions).toEqual(mockActions);
    });

    it('should remove offline action', async () => {
      const mockDelete = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.delete.mockReturnValue(mockDelete());

      await expect(
        offlineService.removeOfflineAction('test-id')
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('Data Caching', () => {
    it('should cache data', async () => {
      const mockPut = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.put.mockReturnValue(mockPut());

      await expect(
        offlineService.cacheData('test-key', { test: 'data' })
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.put).toHaveBeenCalled();
    });

    it('should get cached data', async () => {
      const mockData = {
        key: 'test-key',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      const mockGet = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockData;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.get.mockReturnValue(mockGet());

      const data = await offlineService.getCachedData('test-key');
      expect(data).toEqual(mockData.data);
    });

    it('should return null for non-existent cached data', async () => {
      const mockGet = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = undefined;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.get.mockReturnValue(mockGet());

      const data = await offlineService.getCachedData('non-existent');
      expect(data).toBeNull();
    });
  });

  describe('Study Sessions', () => {
    it('should save study session offline', async () => {
      const mockPut = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.put.mockReturnValue(mockPut());

      const session = { subject: 'Math', duration: 1800 };

      await expect(
        offlineService.saveStudySessionOffline(session)
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.put).toHaveBeenCalled();
    });

    it('should get offline study sessions', async () => {
      const mockSessions = [
        {
          id: '1',
          subject: 'Math',
          duration: 1800,
          synced: false,
          timestamp: Date.now(),
        },
      ];

      const mockGetAll = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockSessions;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.getAll.mockReturnValue(mockGetAll());

      const sessions = await offlineService.getOfflineStudySessions();
      expect(sessions).toEqual(mockSessions);
    });
  });

  describe('Notes', () => {
    it('should save note offline', async () => {
      const mockPut = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.put.mockReturnValue(mockPut());

      const note = { title: 'Test Note', content: 'Test content' };

      await expect(
        offlineService.saveNoteOffline(note)
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.put).toHaveBeenCalled();
    });

    it('should get offline notes', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'Test Note',
          content: 'Test content',
          synced: false,
          timestamp: Date.now(),
        },
      ];

      const mockGetAll = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockNotes;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.getAll.mockReturnValue(mockGetAll());

      const notes = await offlineService.getOfflineNotes();
      expect(notes).toEqual(mockNotes);
    });
  });

  describe('User Progress', () => {
    it('should save user progress offline', async () => {
      const mockPut = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.put.mockReturnValue(mockPut());

      const progress = { level: 5, xp: 1250, achievements: ['first_session'] };

      await expect(
        offlineService.saveUserProgressOffline(progress)
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.put).toHaveBeenCalled();
    });

    it('should get offline user progress', async () => {
      const mockProgress = {
        id: 'userProgress',
        level: 5,
        xp: 1250,
        achievements: ['first_session'],
        synced: false,
        timestamp: Date.now(),
      };

      const mockGet = vi.fn().mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockProgress;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.get.mockReturnValue(mockGet());

      const progress = await offlineService.getOfflineUserProgress();
      expect(progress).toEqual(mockProgress);
    });
  });

  describe('Data Clearing', () => {
    it('should clear all offline data', async () => {
      const mockRequest = { ...mockIDBRequest };
      const mockClear = vi.fn().mockReturnValue(mockRequest);
      mockIDBObjectStore.clear.mockImplementation(mockClear);

      // Simulate successful operation
      setTimeout(() => {
        if (mockRequest.onsuccess) mockRequest.onsuccess();
      }, 0);

      await expect(offlineService.clearOfflineData()).resolves.toBeUndefined();

      // Should clear all stores
      expect(mockIDBObjectStore.clear).toHaveBeenCalledTimes(5);
    });
  });

  describe('Sync Status', () => {
    it('should get sync status', async () => {
      // Mock empty arrays for all data types
      const mockRequest = { ...mockIDBRequest };
      const mockGetAll = vi.fn().mockReturnValue(mockRequest);
      mockIDBObjectStore.getAll.mockImplementation(mockGetAll);

      // Simulate successful operation
      setTimeout(() => {
        mockRequest.result = [];
        if (mockRequest.onsuccess) mockRequest.onsuccess();
      }, 0);

      const status = await offlineService.getSyncStatus();

      expect(status).toEqual({
        pendingActions: 0,
        unsyncedSessions: 0,
        unsyncedNotes: 0,
        lastSync: expect.any(Number),
      });
    });
  });

  describe('Sync Process', () => {
    beforeEach(() => {
      // Mock fetch for sync operations
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    it('should not sync when offline', async () => {
      (global.navigator as any).onLine = false;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await offlineService.syncOfflineData();

      expect(consoleSpy).toHaveBeenCalledWith('Cannot sync - still offline');

      consoleSpy.mockRestore();
    });

    it('should sync offline data when online', async () => {
      (global.navigator as any).onLine = true;

      // Mock empty arrays for all data types
      const mockRequest = { ...mockIDBRequest };
      const mockGetAll = vi.fn().mockReturnValue(mockRequest);
      mockIDBObjectStore.getAll.mockImplementation(mockGetAll);

      // Simulate successful operation
      setTimeout(() => {
        mockRequest.result = [];
        if (mockRequest.onsuccess) mockRequest.onsuccess();
      }, 0);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(offlineService.syncOfflineData()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('Starting offline data sync...');
      expect(consoleSpy).toHaveBeenCalledWith('Offline data sync completed');

      consoleSpy.mockRestore();
    });
  });
});
