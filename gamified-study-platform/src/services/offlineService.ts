// Offline Service for managing offline functionality
import { v4 as uuidv4 } from 'uuid';

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  endpoint: string;
  timestamp: number;
  retryCount: number;
}

export interface OfflineData {
  studySessions: any[];
  notes: any[];
  achievements: any[];
  petData: any;
  userProgress: any;
  lastSync: number;
}

class OfflineService {
  private dbName = 'GameStudyPlatformDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize DB immediately in constructor to allow for testing
    this.setupConnectionListeners();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    if (this.db) return;

    // Check if IndexedDB is available (not available in some test environments)
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available in this environment');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline actions (sync queue)
        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', {
            keyPath: 'id',
          });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('type', 'type', { unique: false });
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for offline study sessions
        if (!db.objectStoreNames.contains('studySessions')) {
          const sessionsStore = db.createObjectStore('studySessions', {
            keyPath: 'id',
          });
          sessionsStore.createIndex('timestamp', 'timestamp', {
            unique: false,
          });
          sessionsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store for offline notes
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
          notesStore.createIndex('timestamp', 'timestamp', { unique: false });
          notesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store for user progress
        if (!db.objectStoreNames.contains('userProgress')) {
          db.createObjectStore('userProgress', { keyPath: 'id' });
        }
      };
    });
  }

  // Ensure database is initialized before operations
  private async ensureDB(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    if (!this.db) {
      await this.initDB();
    }
  }

  // Setup connection event listeners
  private setupConnectionListeners(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored - syncing offline data');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost - switching to offline mode');
    });
  }

  // Check if online
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Queue action for offline sync
  public async queueOfflineAction(
    type: string,
    data: any,
    endpoint: string
  ): Promise<void> {
    await this.ensureDB();

    const action: OfflineAction = {
      id: uuidv4(),
      type,
      data,
      endpoint,
      timestamp: Date.now(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.add(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all queued offline actions
  public async getOfflineActions(): Promise<OfflineAction[]> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove synced action
  public async removeOfflineAction(id: string): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data for offline use
  public async cacheData(key: string, data: any): Promise<void> {
    await this.ensureDB();

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  public async getCachedData(key: string): Promise<any> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Save study session offline
  public async saveStudySessionOffline(session: any): Promise<void> {
    await this.ensureDB();

    const offlineSession = {
      ...session,
      id: session.id || uuidv4(),
      synced: false,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studySessions'], 'readwrite');
      const store = transaction.objectStore('studySessions');
      const request = store.put(offlineSession);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline study sessions
  public async getOfflineStudySessions(): Promise<any[]> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studySessions'], 'readonly');
      const store = transaction.objectStore('studySessions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save note offline
  public async saveNoteOffline(note: any): Promise<void> {
    await this.ensureDB();

    const offlineNote = {
      ...note,
      id: note.id || uuidv4(),
      synced: false,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.put(offlineNote);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline notes
  public async getOfflineNotes(): Promise<any[]> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save user progress offline
  public async saveUserProgressOffline(progress: any): Promise<void> {
    await this.ensureDB();

    const progressData = {
      id: 'userProgress',
      ...progress,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userProgress'], 'readwrite');
      const store = transaction.objectStore('userProgress');
      const request = store.put(progressData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline user progress
  public async getOfflineUserProgress(): Promise<any> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userProgress'], 'readonly');
      const store = transaction.objectStore('userProgress');
      const request = store.get('userProgress');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync all offline data when connection is restored
  public async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Cannot sync - still offline');
      return;
    }

    try {
      console.log('Starting offline data sync...');

      // Sync queued actions
      const actions = await this.getOfflineActions();
      for (const action of actions) {
        try {
          await this.processOfflineAction(action);
          await this.removeOfflineAction(action.id);
          console.log(`Synced action: ${action.type}`);
        } catch (error) {
          console.error(`Failed to sync action ${action.type}:`, error);
          // Increment retry count
          action.retryCount++;
          if (action.retryCount < 3) {
            await this.updateOfflineAction(action);
          } else {
            console.error(
              `Max retries reached for action ${action.type}, removing`
            );
            await this.removeOfflineAction(action.id);
          }
        }
      }

      // Sync study sessions
      await this.syncStudySessions();

      // Sync notes
      await this.syncNotes();

      // Sync user progress
      await this.syncUserProgress();

      console.log('Offline data sync completed');

      // Notify components about sync completion
      window.dispatchEvent(new CustomEvent('offlineSyncComplete'));
    } catch (error) {
      console.error('Offline sync failed:', error);
    }
  }

  // Process individual offline action
  private async processOfflineAction(action: OfflineAction): Promise<void> {
    const response = await fetch(action.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Update offline action (for retry logic)
  private async updateOfflineAction(action: OfflineAction): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.put(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync study sessions
  private async syncStudySessions(): Promise<void> {
    const sessions = await this.getOfflineStudySessions();
    const unsyncedSessions = sessions.filter(session => !session.synced);

    for (const session of unsyncedSessions) {
      try {
        // Send to server (implement actual API call)
        await this.syncStudySession(session);

        // Mark as synced
        session.synced = true;
        await this.updateStudySession(session);

        console.log(`Synced study session: ${session.id}`);
      } catch (error) {
        console.error(`Failed to sync study session ${session.id}:`, error);
      }
    }
  }

  // Sync notes
  private async syncNotes(): Promise<void> {
    const notes = await this.getOfflineNotes();
    const unsyncedNotes = notes.filter(note => !note.synced);

    for (const note of unsyncedNotes) {
      try {
        // Send to server (implement actual API call)
        await this.syncNote(note);

        // Mark as synced
        note.synced = true;
        await this.updateNote(note);

        console.log(`Synced note: ${note.id}`);
      } catch (error) {
        console.error(`Failed to sync note ${note.id}:`, error);
      }
    }
  }

  // Sync user progress
  private async syncUserProgress(): Promise<void> {
    const progress = await this.getOfflineUserProgress();

    if (progress && !progress.synced) {
      try {
        // Send to server (implement actual API call)
        await this.syncProgress(progress);

        // Mark as synced
        progress.synced = true;
        await this.saveUserProgressOffline(progress);

        console.log('Synced user progress');
      } catch (error) {
        console.error('Failed to sync user progress:', error);
      }
    }
  }

  // Placeholder methods for actual API calls (to be implemented)
  private async syncStudySession(session: any): Promise<void> {
    // Implement actual API call to sync study session
    console.log('Syncing study session:', session);
  }

  private async syncNote(note: any): Promise<void> {
    // Implement actual API call to sync note
    console.log('Syncing note:', note);
  }

  private async syncProgress(progress: any): Promise<void> {
    // Implement actual API call to sync progress
    console.log('Syncing progress:', progress);
  }

  // Update methods for marking items as synced
  private async updateStudySession(session: any): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['studySessions'], 'readwrite');
      const store = transaction.objectStore('studySessions');
      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateNote(note: any): Promise<void> {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.put(note);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all offline data (for testing/reset)
  public async clearOfflineData(): Promise<void> {
    await this.ensureDB();

    const stores = [
      'actions',
      'cache',
      'studySessions',
      'notes',
      'userProgress',
    ];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');

      let completed = 0;
      const total = stores.length;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  // Get sync status
  public async getSyncStatus(): Promise<{
    pendingActions: number;
    unsyncedSessions: number;
    unsyncedNotes: number;
    lastSync: number;
  }> {
    const [actions, sessions, notes] = await Promise.all([
      this.getOfflineActions(),
      this.getOfflineStudySessions(),
      this.getOfflineNotes(),
    ]);

    return {
      pendingActions: actions.length,
      unsyncedSessions: sessions.filter(s => !s.synced).length,
      unsyncedNotes: notes.filter(n => !n.synced).length,
      lastSync: Date.now(), // This should be stored and retrieved from cache
    };
  }
}

export const offlineService = new OfflineService();
