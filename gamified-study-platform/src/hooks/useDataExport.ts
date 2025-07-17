import { useState, useCallback } from 'react';
import { exportService } from '../services/exportService';
import type { ExportOptions, BackupRecord, ExportProgress } from '../types';

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (userId: string, options: ExportOptions) => {
    try {
      setIsExporting(true);
      setError(null);
      
      setExportProgress({
        stage: 'gathering',
        progress: 0,
        message: 'Gathering user data...'
      });

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate progress
      
      setExportProgress({
        stage: 'processing',
        progress: 30,
        message: 'Processing data...'
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExportProgress({
        stage: 'generating',
        progress: 70,
        message: `Generating ${options.format.toUpperCase()} file...`
      });

      await exportService.exportUserData(userId, options);
      
      setExportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Export completed successfully!'
      });

      // Clear progress after a delay
      setTimeout(() => {
        setExportProgress(null);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      setExportProgress({
        stage: 'error',
        progress: 0,
        message: 'Export failed',
        error: errorMessage
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const createBackup = useCallback(async (userId: string) => {
    try {
      setIsExporting(true);
      setError(null);
      
      setExportProgress({
        stage: 'gathering',
        progress: 0,
        message: 'Creating backup...'
      });

      const filename = await exportService.createBackup(userId);
      
      setExportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Backup created successfully!'
      });

      // Refresh backups list
      await loadBackups(userId);

      setTimeout(() => {
        setExportProgress(null);
      }, 2000);

      return filename;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Backup creation failed';
      setError(errorMessage);
      setExportProgress({
        stage: 'error',
        progress: 0,
        message: 'Backup creation failed',
        error: errorMessage
      });
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const loadBackups = useCallback(async (userId: string) => {
    try {
      setIsLoadingBackups(true);
      setError(null);
      
      const backupData = await exportService.listUserBackups(userId);
      const formattedBackups: BackupRecord[] = backupData.map(backup => ({
        id: backup.id,
        userId: backup.user_id,
        filename: backup.filename,
        filePath: backup.file_path,
        backupType: backup.backup_type as 'full' | 'partial' | 'scheduled',
        fileSize: backup.file_size,
        createdAt: new Date(backup.created_at),
        expiresAt: backup.expires_at ? new Date(backup.expires_at) : undefined
      }));
      
      setBackups(formattedBackups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load backups';
      setError(errorMessage);
    } finally {
      setIsLoadingBackups(false);
    }
  }, []);

  const deleteBackup = useCallback(async (userId: string, backupId: string) => {
    try {
      setError(null);
      await exportService.deleteBackup(userId, backupId);
      
      // Remove from local state
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete backup';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const restoreFromBackup = useCallback(async (userId: string, backupFilename: string) => {
    try {
      setIsExporting(true);
      setError(null);
      
      setExportProgress({
        stage: 'processing',
        progress: 0,
        message: 'Restoring from backup...'
      });

      await exportService.restoreFromBackup(userId, backupFilename);
      
      setExportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Restore completed successfully!'
      });

      setTimeout(() => {
        setExportProgress(null);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed';
      setError(errorMessage);
      setExportProgress({
        stage: 'error',
        progress: 0,
        message: 'Restore failed',
        error: errorMessage
      });
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearProgress = useCallback(() => {
    setExportProgress(null);
  }, []);

  return {
    // State
    isExporting,
    exportProgress,
    backups,
    isLoadingBackups,
    error,
    
    // Actions
    exportData,
    createBackup,
    loadBackups,
    deleteBackup,
    restoreFromBackup,
    clearError,
    clearProgress
  };
};