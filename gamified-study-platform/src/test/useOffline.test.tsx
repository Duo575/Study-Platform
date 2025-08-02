// Tests for offline hooks
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useOffline,
  usePWAInstall,
  useServiceWorker,
} from '@/hooks/useOffline';

// Mock the offline service
vi.mock('@/services/offlineService', () => ({
  offlineService: {
    getSyncStatus: vi.fn().mockResolvedValue({
      pendingActions: 0,
      unsyncedSessions: 0,
      unsyncedNotes: 0,
      lastSync: Date.now(),
    }),
    syncOfflineData: vi.fn().mockResolvedValue(undefined),
    cacheData: vi.fn().mockResolvedValue(undefined),
    getCachedData: vi.fn().mockResolvedValue(null),
    queueOfflineAction: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock navigator
Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true,
});

Object.defineProperty(global.navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
      waiting: null,
      installing: null,
      unregister: vi.fn().mockResolvedValue(true),
    }),
    controller: null,
  },
  writable: true,
});

// Mock window events
const mockEventListeners: { [key: string]: Function[] } = {};
Object.defineProperty(global.window, 'addEventListener', {
  value: (event: string, callback: Function) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(callback);
  },
});

Object.defineProperty(global.window, 'removeEventListener', {
  value: (event: string, callback: Function) => {
    if (mockEventListeners[event]) {
      const index = mockEventListeners[event].indexOf(callback);
      if (index > -1) {
        mockEventListeners[event].splice(index, 1);
      }
    }
  },
});

Object.defineProperty(global.window, 'dispatchEvent', {
  value: (event: Event) => {
    const listeners = mockEventListeners[event.type] || [];
    listeners.forEach(listener => listener(event));
  },
});

// Mock matchMedia for PWA detection
Object.defineProperty(global.window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(display-mode: standalone)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useOffline Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.navigator as any).onLine = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with online status', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.isSyncing).toBe(false);
  });

  it('should update status when going offline', async () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      (global.navigator as any).onLine = false;
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should update status when coming online', async () => {
    (global.navigator as any).onLine = false;
    const { result } = renderHook(() => useOffline());

    act(() => {
      (global.navigator as any).onLine = true;
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should trigger manual sync', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it('should not sync when offline', async () => {
    (global.navigator as any).onLine = false;
    const { result } = renderHook(() => useOffline());

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Cannot sync while offline');
    consoleSpy.mockRestore();
  });

  it('should save with offline support when online', async () => {
    const { result } = renderHook(() => useOffline());

    const mockSaveFunction = vi.fn().mockResolvedValue({ id: 'test' });
    const mockOfflineSaveFunction = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      const savedData = await result.current.saveWithOfflineSupport(
        { test: 'data' },
        mockSaveFunction,
        mockOfflineSaveFunction
      );
      expect(savedData).toEqual({ id: 'test' });
    });

    expect(mockSaveFunction).toHaveBeenCalled();
    expect(mockOfflineSaveFunction).not.toHaveBeenCalled();
  });

  it('should save offline when offline', async () => {
    (global.navigator as any).onLine = false;
    const { result } = renderHook(() => useOffline());

    const mockSaveFunction = vi.fn().mockResolvedValue({ id: 'test' });
    const mockOfflineSaveFunction = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      const savedData = await result.current.saveWithOfflineSupport(
        { test: 'data' },
        mockSaveFunction,
        mockOfflineSaveFunction,
        '/api/sync'
      );
      expect(savedData).toEqual({ test: 'data' });
    });

    expect(mockSaveFunction).not.toHaveBeenCalled();
    expect(mockOfflineSaveFunction).toHaveBeenCalled();
  });

  it('should load with offline support when online', async () => {
    const { result } = renderHook(() => useOffline());

    const mockLoadFunction = vi.fn().mockResolvedValue({ data: 'online' });
    const mockOfflineLoadFunction = vi
      .fn()
      .mockResolvedValue({ data: 'offline' });

    await act(async () => {
      const loadedData = await result.current.loadWithOfflineSupport(
        mockLoadFunction,
        mockOfflineLoadFunction,
        'test-cache-key'
      );
      expect(loadedData).toEqual({ data: 'online' });
    });

    expect(mockLoadFunction).toHaveBeenCalled();
    expect(mockOfflineLoadFunction).not.toHaveBeenCalled();
  });

  it('should load offline when offline', async () => {
    (global.navigator as any).onLine = false;
    const { result } = renderHook(() => useOffline());

    const mockLoadFunction = vi.fn().mockResolvedValue({ data: 'online' });
    const mockOfflineLoadFunction = vi
      .fn()
      .mockResolvedValue({ data: 'offline' });

    await act(async () => {
      const loadedData = await result.current.loadWithOfflineSupport(
        mockLoadFunction,
        mockOfflineLoadFunction
      );
      expect(loadedData).toEqual({ data: 'offline' });
    });

    expect(mockLoadFunction).not.toHaveBeenCalled();
    expect(mockOfflineLoadFunction).toHaveBeenCalled();
  });
});

describe('usePWAInstall Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('should detect standalone mode as installed', () => {
    (global.window.matchMedia as any).mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
  });

  it('should handle beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        type: 'beforeinstallprompt',
      };

      const listeners = mockEventListeners['beforeinstallprompt'] || [];
      listeners.forEach(listener => listener(mockEvent));
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('should handle app installed event', () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const mockEvent = new Event('appinstalled');
      const listeners = mockEventListeners['appinstalled'] || [];
      listeners.forEach(listener => listener(mockEvent));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });
});

describe('useServiceWorker Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.updateAvailable).toBe(false);
  });

  it('should detect service worker support', () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.isSupported).toBe(true);
  });

  it('should handle service worker not supported', () => {
    const originalServiceWorker = global.navigator.serviceWorker;

    // Mock navigator without serviceWorker
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.isSupported).toBe(false);

    // Restore
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true,
    });
  });

  it('should unregister service worker', async () => {
    const mockRegistration = {
      addEventListener: vi.fn(),
      waiting: null,
      installing: null,
      unregister: vi.fn().mockResolvedValue(true),
    };

    (global.navigator.serviceWorker.register as any).mockResolvedValue(
      mockRegistration
    );

    const { result } = renderHook(() => useServiceWorker());

    // Wait for registration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.unregisterServiceWorker();
    });

    expect(mockRegistration.unregister).toHaveBeenCalled();
    expect(result.current.isRegistered).toBe(false);
  });
});
