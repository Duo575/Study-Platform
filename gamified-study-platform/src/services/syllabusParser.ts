import { v4 as uuidv4 } from 'uuid';
import type { SyllabusItem } from '../types';

export interface ParseResult {
  success: boolean;
  items: SyllabusItem[];
  errors: string[];
  warnings: string[];
}

/**
 * Parses a syllabus text into structured SyllabusItem objects
 * 
 * Expected format:
 * Topic Title
 * Topic Description (optional)
 * Subtopic1, Subtopic2, Subtopic3
 * Estimated Hours
 * Priority (low, medium, high)
 * Deadline (YYYY-MM-DD) (optional)
 * ---
 * Next Topic Title
 * ...
 */
export function parseSyllabus(syllabusText: string): SyllabusItem[] {
  const result = parseSyllabusWithValidation(syllabusText);
  if (!result.success) {
    throw new Error(result.errors.join('\n'));
  }
  return result.items;
}

/**
 * Enhanced syllabus parser with validation and error reporting
 */
export function parseSyllabusWithValidation(syllabusText: string): ParseResult {
  const result: ParseResult = {
    success: true,
    items: [],
    errors: [],
    warnings: []
  };

  if (!syllabusText.trim()) {
    result.success = false;
    result.errors.push('Syllabus text is empty');
    return result;
  }

  // Try to detect the format based on content
  const format = detectSyllabusFormat(syllabusText);
  
  // Split the text by the topic separator based on detected format
  let topicBlocks: string[] = [];
  
  if (format === 'standard') {
    topicBlocks = syllabusText.split('---').map(block => block.trim()).filter(Boolean);
  } else if (format === 'bullet') {
    // Handle bullet point format (e.g., "• Topic 1", "* Topic 2")
    topicBlocks = parseBulletFormat(syllabusText);
  } else if (format === 'numbered') {
    // Handle numbered format (e.g., "1. Topic 1", "2. Topic 2")
    topicBlocks = parseNumberedFormat(syllabusText);
  } else {
    // Default to standard format but with a warning
    topicBlocks = syllabusText.split('---').map(block => block.trim()).filter(Boolean);
    result.warnings.push('Could not detect syllabus format. Using default parser.');
  }
  
  if (topicBlocks.length === 0) {
    result.success = false;
    result.errors.push('No topics found in syllabus');
    return result;
  }
  
  // Process each topic block
  topicBlocks.forEach((block, index) => {
    try {
      const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
      
      if (lines.length < 2) {
        result.warnings.push(`Topic #${index + 1} has insufficient information. Skipping.`);
        return; // Skip this block
      }
      
      // First line is always the title
      const title = lines[0].replace(/^[•*\d.]+\s*/, ''); // Remove bullet points or numbers
      
      // Check if second line contains commas - if not, it's a description
      let description = '';
      let currentLineIndex = 1;
      
      if (lines.length > 2 && !lines[1].includes(',') && !isNumeric(lines[1])) {
        description = lines[1];
        currentLineIndex++;
      }
      
      // Next line is comma-separated topics
      let topics: string[] = [];
      if (currentLineIndex < lines.length) {
        topics = lines[currentLineIndex].split(',').map(topic => topic.trim()).filter(Boolean);
        currentLineIndex++;
      } else {
        // If no topics line, use title as the only topic
        topics = [title];
        result.warnings.push(`Topic "${title}" has no subtopics. Using title as the only topic.`);
      }
      
      // Next line is estimated hours
      let estimatedHours = 1; // Default value
      if (currentLineIndex < lines.length) {
        const estimatedHoursStr = lines[currentLineIndex];
        const parsedHours = parseFloat(estimatedHoursStr);
        if (!isNaN(parsedHours)) {
          estimatedHours = parsedHours;
          currentLineIndex++;
        } else {
          result.warnings.push(`Topic "${title}" has invalid estimated hours. Using default (1 hour).`);
        }
      } else {
        result.warnings.push(`Topic "${title}" is missing estimated hours. Using default (1 hour).`);
      }
      
      // Next line is priority
      let priority: 'low' | 'medium' | 'high' = 'medium'; // Default value
      if (currentLineIndex < lines.length) {
        const priorityStr = lines[currentLineIndex].toLowerCase();
        if (['low', 'medium', 'high'].includes(priorityStr)) {
          priority = priorityStr as 'low' | 'medium' | 'high';
          currentLineIndex++;
        } else {
          result.warnings.push(`Topic "${title}" has invalid priority. Using default (medium).`);
        }
      } else {
        result.warnings.push(`Topic "${title}" is missing priority. Using default (medium).`);
      }
      
      // Optional deadline
      let deadline: Date | undefined;
      if (currentLineIndex < lines.length) {
        const dateStr = lines[currentLineIndex];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          deadline = parsedDate;
        } else {
          result.warnings.push(`Topic "${title}" has invalid deadline date format.`);
        }
      }
      
      // Create the syllabus item
      result.items.push({
        id: uuidv4(),
        title,
        description,
        topics,
        estimatedHours,
        priority,
        deadline,
        completed: false
      });
      
    } catch (err) {
      result.warnings.push(`Failed to parse topic #${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  });
  
  // If we couldn't parse any items but had topic blocks, that's an error
  if (result.items.length === 0 && topicBlocks.length > 0) {
    result.success = false;
    result.errors.push('Could not parse any topics from the syllabus');
  }
  
  return result;
}

/**
 * Detects the format of the syllabus text
 */
function detectSyllabusFormat(text: string): 'standard' | 'bullet' | 'numbered' | 'unknown' {
  // Check for standard format with '---' separators
  if (text.includes('---')) {
    return 'standard';
  }
  
  // Check for bullet points
  const bulletRegex = /^[•*-]\s+.+/m;
  if (bulletRegex.test(text)) {
    return 'bullet';
  }
  
  // Check for numbered format
  const numberedRegex = /^\d+\.\s+.+/m;
  if (numberedRegex.test(text)) {
    return 'numbered';
  }
  
  return 'unknown';
}

/**
 * Parses bullet point format syllabus
 */
function parseBulletFormat(text: string): string[] {
  // Split by bullet points and group related lines
  const lines = text.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (/^[•*-]\s+/.test(trimmedLine) && currentBlock.length > 0) {
      // New bullet point, save previous block
      blocks.push(currentBlock.join('\n'));
      currentBlock = [trimmedLine];
    } else {
      currentBlock.push(trimmedLine);
    }
  });
  
  // Add the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  return blocks;
}

/**
 * Parses numbered format syllabus
 */
function parseNumberedFormat(text: string): string[] {
  // Split by numbered points and group related lines
  const lines = text.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (/^\d+\.\s+/.test(trimmedLine) && currentBlock.length > 0) {
      // New numbered point, save previous block
      blocks.push(currentBlock.join('\n'));
      currentBlock = [trimmedLine];
    } else {
      currentBlock.push(trimmedLine);
    }
  });
  
  // Add the last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  return blocks;
}

/**
 * Checks if a string is a numeric value
 */
function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

/**
 * Generates a template syllabus for a new course
 */
export function generateTemplateSyllabus(): string {
  return `Introduction to the Course
Overview of key concepts and learning objectives
Course structure, Expectations, Learning outcomes
2
medium
${getDateInFuture(7)}
---
Fundamental Concepts
Core principles and terminology
Theory, Practice, Applications
5
high
${getDateInFuture(14)}
---
Advanced Topics
Deeper exploration of specialized areas
Research, Analysis, Implementation
8
medium
${getDateInFuture(30)}`;
}

/**
 * Generates a template for manual topic entry
 */
export function generateTopicTemplate(): string {
  return `Topic Title
Topic Description (optional)
Subtopic1, Subtopic2, Subtopic3
Estimated Hours (number)
Priority (low, medium, high)
Deadline (YYYY-MM-DD) (optional)`;
}

/**
 * Returns a date string in YYYY-MM-DD format for a date in the future
 */
function getDateInFuture(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}