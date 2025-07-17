# Course Management System

This directory contains all components and functionality related to course management in the Gamified Study Platform.

## Overview

The course management system allows users to:
- Create and manage study courses
- Parse syllabus content from text or files
- Track progress through course topics
- Filter and search courses
- Edit course details and syllabus items

## Components

### Core Components

#### `CourseCard.tsx`
Displays a course overview card with:
- Course name, description, and color
- Progress bar showing completion percentage
- Study statistics (topics completed, hours studied)
- Upcoming deadlines
- Last studied date

#### `CoursesPage.tsx`
Main course listing page featuring:
- Grid layout of course cards
- Filtering and search functionality
- Empty state for new users
- Create new course button

#### `CourseFormPage.tsx`
Course creation and editing form with:
- Basic course information (name, description, color)
- Syllabus editor with multiple input methods
- Real-time syllabus parsing and validation
- Manual topic entry interface

#### `CourseDetailPage.tsx`
Detailed course view showing:
- Complete course information
- Progress tracking
- Interactive syllabus with completion checkboxes
- Edit and delete actions

### Syllabus Management

#### `SyllabusFileUploader.tsx`
File upload component supporting:
- Text files (.txt, .md)
- PDF files (basic text extraction)
- DOCX files (basic text extraction)
- File validation and error handling

#### `SyllabusParseResults.tsx`
Displays parsing results with:
- Success/error messages
- Warnings for incomplete data
- Options to retry or switch to manual entry

#### `SyllabusPreview.tsx`
Visual preview of parsed syllabus showing:
- Topic titles and descriptions
- Estimated hours and priority levels
- Deadlines and completion status
- Edit and delete actions for each topic

#### `ManualTopicEntry.tsx`
Form for manually adding syllabus topics:
- Topic title and description
- Comma-separated subtopics
- Estimated hours and priority
- Optional deadline

#### `TopicEditModal.tsx`
Modal dialog for editing existing topics:
- All topic fields editable
- Form validation
- Save/cancel actions

### Filtering and Search

#### `CourseFilters.tsx`
Comprehensive filtering interface:
- Text search across course names and descriptions
- Completion status filter (all, completed, in progress, not started)
- Sorting options (name, date, progress, last studied)
- Sort order (ascending/descending)

#### `SyllabusItemCard.tsx`
Individual syllabus item display:
- Checkbox for completion tracking
- Priority and deadline indicators
- Topic tags
- Progress visual indicators

## Services

### `courseManagementService.ts`
Main service handling:
- Course CRUD operations
- Syllabus parsing integration
- Progress tracking
- Quest generation for courses
- XP rewards for topic completion
- Course statistics and analytics

### `syllabusParser.ts`
Intelligent syllabus parsing with:
- Multiple format detection (standard, bullet points, numbered)
- Validation and error reporting
- Warning system for incomplete data
- Template generation

## Data Flow

1. **Course Creation**:
   - User fills out course form
   - Syllabus text is parsed and validated
   - Course is saved to database
   - Progress tracking is initialized
   - Optional quests are generated

2. **Progress Tracking**:
   - User marks topics as complete
   - Progress percentage is calculated
   - XP rewards are awarded
   - Study statistics are updated

3. **Filtering and Search**:
   - Filters are applied client-side
   - Results are sorted based on user preferences
   - Empty states are handled gracefully

## Syllabus Format

The system supports multiple syllabus formats:

### Standard Format
```
Topic Title
Topic Description (optional)
Subtopic1, Subtopic2, Subtopic3
Estimated Hours
Priority (low, medium, high)
Deadline (YYYY-MM-DD) (optional)
---
Next Topic Title
...
```

### Bullet Point Format
```
• Topic 1
  Description
  Subtopics
  Hours
  Priority
  Deadline

• Topic 2
  ...
```

### Numbered Format
```
1. Topic 1
   Description
   Subtopics
   Hours
   Priority
   Deadline

2. Topic 2
   ...
```

## Testing

The course management system includes comprehensive tests:

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Component interaction testing
- **Service Tests**: Business logic and data transformation testing

Run tests with:
```bash
npm test
```

## Usage Examples

### Creating a Course
```typescript
const courseData = {
  name: 'JavaScript Fundamentals',
  description: 'Learn the basics of JavaScript',
  color: '#3B82F6',
  syllabus: `Variables and Data Types
Understanding JavaScript variables
var, let, const, strings, numbers
3
high
2024-02-15
---
Functions
JavaScript functions and scope
function declarations, arrow functions, scope
4
medium`
};

await courseManagementService.createCourse(userId, courseData);
```

### Filtering Courses
```typescript
const filters = {
  search: 'javascript',
  completionStatus: 'in_progress',
  sortBy: 'progress',
  sortOrder: 'desc'
};

const filteredCourses = courseManagementService.applyCourseFilters(courses, filters);
```

### Tracking Progress
```typescript
await courseManagementService.toggleSyllabusItemCompletion(
  courseId,
  syllabusItemId,
  true // completed
);
```

## Future Enhancements

- Advanced file parsing (better PDF/DOCX support)
- Collaborative course editing
- Course templates and sharing
- Advanced analytics and insights
- Integration with external learning platforms
- Automated syllabus generation using AI