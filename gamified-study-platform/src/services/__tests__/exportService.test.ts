import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportService } from '../exportService';
import type { ExportOptions } from '../../types';

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ data: { id: 'test-id' }, error: null }))
      })),
      delete: vi.fn(() => ({ error: null }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ data: { path: 'test-path' }, error: null })),
        download: vi.fn(() => ({ data: new Blob(['{"test": "data"}'], { type: 'application/json' }), error: null })),
        remove: vi.fn(() => ({ error: null }))
      }))
    }
  }
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297
      }
    },
    setFontSize: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn()
  }))
}));

vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn(() => 'csv,data\ntest,value')
  }
}));

describe('ExportService', () => {
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportUserData', () => {
    it('should export data in JSON format', async () => {
      const options: ExportOptions = {
        format: 'json',
        includePersonalData: true,
        includeStudyData: true,
        includeGameData: true,
        includeProgressData: true
      };

      await expect(exportService.exportUserData(mockUserId, options)).resolves.not.toThrow();
    });

    it('should export data in CSV format', async () => {
      const options: ExportOptions = {
        format: 'csv',
        includeStudyData: true
      };

      await expect(exportService.exportUserData(mockUserId, options)).resolves.not.toThrow();
    });

    it('should export data in PDF format', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includePersonalData: true,
        includeGameData: true
      };

      await expect(exportService.exportUserData(mockUserId, options)).resolves.not.toThrow();
    });

    it('should handle date range filtering', async () => {
      const options: ExportOptions = {
        format: 'json',
        includeStudyData: true,
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31')
        }
      };

      await expect(exportService.exportUserData(mockUserId, options)).resolves.not.toThrow();
    });

    it('should throw error for unsupported format', async () => {
      const options = {
        format: 'xml' as any,
        includeStudyData: true
      };

      await expect(exportService.exportUserData(mockUserId, options)).rejects.toThrow('Unsupported export format');
    });
  });

  describe('createBackup', () => {
    it('should create a backup successfully', async () => {
      const filename = await exportService.createBackup(mockUserId);
      expect(filename).toMatch(/^backup-test-user-id-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
    });
  });

  describe('listUserBackups', () => {
    it('should list user backups', async () => {
      const backups = await exportService.listUserBackups(mockUserId);
      expect(Array.isArray(backups)).toBe(true);
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup', async () => {
      await expect(exportService.deleteBackup(mockUserId, 'backup-id')).resolves.not.toThrow();
    });
  });

  describe('restoreFromBackup', () => {
    it('should throw error for restore (not implemented)', async () => {
      await expect(exportService.restoreFromBackup(mockUserId, 'backup-file.json'))
        .rejects.toThrow('Restore functionality requires additional implementation for safety');
    });
  });
});