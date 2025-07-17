# Data Export and Backup System

This module provides comprehensive data export and backup functionality for the Gamified Study Platform. Users can export their study data in multiple formats and create secure backups for data protection.

## Features

### Data Export
- **Multiple Formats**: JSON, CSV, and PDF exports
- **Selective Data**: Choose which data categories to include
- **Date Range Filtering**: Export data from specific time periods
- **Data Sanitization**: Automatic removal of sensitive information based on user preferences
- **Data Validation**: Ensures exported data integrity and consistency

### Backup System
- **Automatic Backups**: Full data backups stored securely
- **Cloud Storage**: Backups stored in Supabase storage
- **Backup Management**: List, view, and delete existing backups
- **Restore Capability**: Framework for data restoration (requires additional safety implementation)

## Usage

### Basic Export

```typescript
import { exportService } from '../services/exportService';

// Export all data as JSON
const options = {
  format: 'json' as const,
  includePersonalData: true,
  includeStudyData: true,
  includeGameData: true,
  includeProgressData: true
};

await exportService.exportUserData(userId, options);
```

### Selective Export

```typescript
// Export only study data as CSV
const studyOnlyOptions = {
  format: 'csv' as const,
  includeStudyData: true,
  includePersonalData: false,
  includeGameData: false,
  includeProgressData: false
};

await exportService.exportUserData(userId, studyOnlyOptions);
```

### Date Range Export

```typescript
// Export data from the last 30 days
const dateRangeOptions = {
  format: 'pdf' as const,
  includeStudyData: true,
  includeProgressData: true,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
};

await exportService.exportUserData(userId, dateRangeOptions);
```

### Creating Backups

```typescript
// Create a full backup
const backupFilename = await exportService.createBackup(userId);
console.log(`Backup created: ${backupFilename}`);
```

### Managing Backups

```typescript
// List user backups
const backups = await exportService.listUserBackups(userId);

// Delete a backup
await exportService.deleteBackup(userId, backupId);
```

## React Hook Usage

The `useDataExport` hook provides a convenient interface for React components:

```typescript
import { useDataExport } from '../hooks/useDataExport';

function ExportComponent() {
  const {
    isExporting,
    exportProgress,
    backups,
    exportData,
    createBackup,
    loadBackups
  } = useDataExport();

  const handleExport = async () => {
    const options = {
      format: 'json' as const,
      includeStudyData: true
    };
    
    await exportData(userId, options);
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export Data'}
      </button>
      
      {exportProgress && (
        <div>
          <p>{exportProgress.message}</p>
          <progress value={exportProgress.progress} max={100} />
        </div>
      )}
    </div>
  );
}
```

## Data Categories

### Personal Data
- User profile information
- Account settings and preferences
- Contact information (if provided)

### Study Data
- Courses and syllabi
- Study sessions and duration
- Todo items and tasks
- Routines and schedules

### Game Data
- XP and level information
- Achievements and badges
- Quest history and status
- Study pet information

### Progress Data
- Analytics and statistics
- Performance metrics
- Streak information
- Time tracking data

## Export Formats

### JSON Format
- Complete data structure preservation
- Ideal for data migration or backup
- Human-readable with proper formatting
- Includes all nested relationships

### CSV Format
- Spreadsheet-compatible format
- Separate files for each data type
- Flattened structure for easy analysis
- Suitable for data analysis tools

### PDF Format
- Summary report format
- User-friendly presentation
- Includes charts and visualizations
- Perfect for sharing or printing

## Security and Privacy

### Data Sanitization
- Automatic removal of sensitive information based on user preferences
- Email addresses and personal identifiers can be excluded
- Configurable privacy levels

### Secure Storage
- Backups encrypted in transit and at rest
- Access controlled by user authentication
- Automatic cleanup of expired backups

### Data Validation
- Integrity checks before export
- Consistency validation across related data
- Error reporting for data issues

## File Naming Convention

Export files follow a consistent naming pattern:
- `user-{userId}-{type}-export-{timestamp}.{format}`
- `backup-{userId}-{timestamp}.json`

Examples:
- `user-abc123-full-export-2024-01-15-1430.json`
- `user-abc123-study-export-2024-01-01-to-2024-01-31-1430.csv`
- `backup-abc123-2024-01-15-1430.json`

## Error Handling

The export system includes comprehensive error handling:

```typescript
try {
  await exportService.exportUserData(userId, options);
} catch (error) {
  if (error.message === 'Unsupported export format') {
    // Handle format error
  } else if (error.message === 'Failed to export user data') {
    // Handle general export error
  }
}
```

## Performance Considerations

### Large Datasets
- Streaming for large exports
- Progress tracking for user feedback
- Memory-efficient processing
- Chunked data processing

### Rate Limiting
- Built-in rate limiting for API calls
- Queued export processing
- User notification system

## Testing

The export system includes comprehensive tests:

```bash
# Run export service tests
npm test src/services/__tests__/exportService.test.ts

# Run hook tests
npm test src/hooks/__tests__/useDataExport.test.ts
```

## Configuration

### Environment Variables
```env
# Supabase storage bucket for backups
VITE_SUPABASE_BACKUP_BUCKET=user-backups

# Maximum backup retention days
VITE_BACKUP_RETENTION_DAYS=90

# Maximum export file size (MB)
VITE_MAX_EXPORT_SIZE_MB=50
```

### Database Tables Required
- `user_backups`: Backup metadata storage
- `user_profiles`: User information
- `courses`: Course data
- `study_sessions`: Session tracking
- `achievements`: Achievement data
- `game_stats`: Gamification data

## Future Enhancements

### Planned Features
- Scheduled automatic backups
- Incremental backup support
- Data compression for large exports
- Email delivery of exports
- Advanced filtering options
- Data anonymization options

### Integration Opportunities
- Google Drive/Dropbox integration
- Calendar export for study schedules
- Social media sharing of achievements
- Third-party analytics tool integration

## Support and Troubleshooting

### Common Issues
1. **Export fails with large datasets**: Use date range filtering
2. **Backup storage full**: Clean up old backups
3. **PDF generation slow**: Consider JSON/CSV for large exports
4. **Missing data in export**: Check data category selections

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('export-debug', 'true');
```

This will provide detailed logging of the export process for troubleshooting.