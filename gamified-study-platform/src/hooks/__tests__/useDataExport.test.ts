import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataExport } from '../useDataExport';
import type { ExportOptions } from '../../types';

// Mock the export service
vi.mock('../../services/exportService', () => ({
  exportService: {
    exportUserData: vi.fn(),
    createBackup: vi.fn(() => Promise.resolve('backup-filename.json')),
    listUserBackups: vi.fn(() => Promise.resolve([])),
    deleteBackup: vi.fn(),
    restoreFromBackup: vi.fn()
  }
}));

describe('useDataExport', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDataExport());

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportProgress).toBe(null);
    expect(result.current.backups).toEqual([]);
    expect(result.current.isLoadingBackups).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle export data flow', async () => {
    const { result } = renderHook(() => useDataExport());

    const options: ExportOptions = {
      format: 'json',
      includeStudyData: true
    };

    await act(async () => {
      await result.current.exportData(mockUserId, options);
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportProgress?.stage).toBe('complete');
  });

  it('should handle create backup', async () => {
    const { result } = renderHook(() => useDataExport());

    let filename: string;
    await act(async () => {
      filename = await result.current.createBackup(mockUserId);
    });

    expect(filename!).toBe('backup-filename.json');
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle load backups', async () => {
    const { result } = renderHook(() => useDataExport());

    await act(async () => {
      await result.current.loadBackups(mockUserId);
    });

    expect(result.current.isLoadingBackups).toBe(false);
    expect(Array.isArray(result.current.backups)).toBe(true);
  });

  it('should handle delete backup', async () => {
    const { result } = renderHook(() => useDataExport());

    await act(async () => {
      await result.current.deleteBackup(mockUserId, 'backup-id');
    });

    expect(result.current.error).toBe(null);
  });

  it('should handle errors gracefully', async () => {
    const { exportService } = await import('../../services/exportService');
    vi.mocked(exportService.exportUserData).mockRejectedValueOnce(new Error('Export failed'));

    const { result } = renderHook(() => useDataExport());

    const options: ExportOptions = {
      format: 'json',
      includeStudyData: true
    };

    await act(async () => {
      await result.current.exportData(mockUserId, options);
    });

    expect(result.current.error).toBe('Export failed');
    expect(result.current.exportProgress?.stage).toBe('error');
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useDataExport());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should clear progress', () => {
    const { result } = renderHook(() => useDataExport());

    act(() => {
      result.current.clearProgress();
    });

    expect(result.current.exportProgress).toBe(null);
  });
});