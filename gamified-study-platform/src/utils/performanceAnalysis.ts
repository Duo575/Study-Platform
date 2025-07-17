/**
 * Utility functions for performance analysis calculations
 */

import type { 
  SubjectPerformance, 
  PerformanceRecommendation, 
  InterventionStrategy,
  SubjectPriority 
} from '../services/performanceAnalysisService';

/**
 * Performance analysis constants
 */
export const PERFORMANCE_CONSTANTS = {
  // Score thresholds
  EXCELLENT_THRESHOLD: 85,
  GOOD_THRESHOLD: 70,
  NEEDS_ATTENTION_THRESHOLD: 50,
  CRITICAL_THRESHOLD: 30,
  
  // Flagging criteria
  MIN_PERFORMANCE_SCORE: 60,
  MAX_DAYS_SINCE_STUDY: 7,
  MIN_QUEST_COMPLETION_RATE: 0.4,
  MIN_CONSISTENCY_SCORE: 50,
  
  // Score weights
  STUDY_TIME_WEIGHT: 0.3,
  QUEST_COMPLETION_WEIGHT: 0.25,
  CONSISTENCY_WEIGHT: 0.25,
  DEADLINE_ADHERENCE_WEIGHT: 0.2,
  
  // Time periods
  CONSISTENCY_PERIOD_DAYS: 30,
  FREQUENCY_PERIOD_WEEKS: 4,
  RECENT_SESSIONS_COUNT: 10,
  
  // Performance grades
  GRADE_POINTS: {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    F: 0
  } as const
} as const;

/**
 * Calculate performance score color based on value
 */
export function getPerformanceScoreColor(score: number): string {
  if (score >= PERFORMANCE_CONSTANTS.EXCELLENT_THRESHOLD) return 'text-green-600';
  if (score >= PERFORMANCE_CONSTANTS.GOOD_THRESHOLD) return 'text-blue-600';
  if (score >= PERFORMANCE_CONSTANTS.NEEDS_ATTENTION_THRESHOLD) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get performance status badge color
 */
export function getPerformanceStatusColor(status: SubjectPerformance['status']): string {
  switch (status) {
    case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
    case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'needs_attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get grade color styling
 */
export function getGradeColor(grade: SubjectPerformance['overallGrade']): string {
  switch (grade) {
    case 'A': return 'text-green-600 font-bold';
    case 'B': return 'text-blue-600 font-semibold';
    case 'C': return 'text-yellow-600 font-medium';
    case 'D': return 'text-orange-600 font-medium';
    case 'F': return 'text-red-600 font-bold';
    default: return 'text-gray-600';
  }
}

/**
 * Get recommendation priority color
 */
export function getRecommendationPriorityColor(priority: PerformanceRecommendation['priority']): string {
  switch (priority) {
    case 'high': return 'bg-red-50 border-red-200 text-red-800';
    case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'low': return 'bg-green-50 border-green-200 text-green-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
}

/**
 * Get intervention urgency color
 */
export function getInterventionUrgencyColor(urgency: InterventionStrategy['urgency']): string {
  switch (urgency) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Get subject priority urgency color
 */
export function getSubjectPriorityColor(urgency: SubjectPriority['urgencyLevel']): string {
  switch (urgency) {
    case 'critical': return 'bg-red-500 text-white';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

/**
 * Format performance score with appropriate styling
 */
export function formatPerformanceScore(score: number): {
  value: string;
  color: string;
  description: string;
} {
  const value = `${Math.round(score)}/100`;
  const color = getPerformanceScoreColor(score);
  
  let description: string;
  if (score >= PERFORMANCE_CONSTANTS.EXCELLENT_THRESHOLD) {
    description = 'Excellent performance';
  } else if (score >= PERFORMANCE_CONSTANTS.GOOD_THRESHOLD) {
    description = 'Good performance';
  } else if (score >= PERFORMANCE_CONSTANTS.NEEDS_ATTENTION_THRESHOLD) {
    description = 'Needs attention';
  } else {
    description = 'Critical - immediate action needed';
  }
  
  return { value, color, description };
}

/**
 * Calculate study efficiency score
 */
export function calculateStudyEfficiency(
  totalStudyTime: number,
  completedTopics: number,
  totalTopics: number
): number {
  if (totalTopics === 0 || totalStudyTime === 0) return 0;
  
  const completionRate = completedTopics / totalTopics;
  const timePerTopic = totalStudyTime / Math.max(1, completedTopics);
  
  // Efficiency is based on completion rate and reasonable time per topic
  // Assume 60 minutes per topic is optimal
  const optimalTimePerTopic = 60;
  const timeEfficiency = Math.min(1, optimalTimePerTopic / timePerTopic);
  
  return Math.round((completionRate * 0.7 + timeEfficiency * 0.3) * 100);
}

/**
 * Generate performance insights based on scores
 */
export function generatePerformanceInsights(performance: SubjectPerformance): string[] {
  const insights: string[] = [];
  
  // Study time insights
  if (performance.studyTimeScore < 50) {
    insights.push(`Study time is significantly below recommended levels for ${performance.courseName}`);
  } else if (performance.studyTimeScore > 90) {
    insights.push(`Excellent study time allocation for ${performance.courseName}`);
  }
  
  // Consistency insights
  if (performance.consistencyScore < 40) {
    insights.push('Study sessions are irregular - consistency is key for retention');
  } else if (performance.consistencyScore > 80) {
    insights.push('Great study consistency - this builds strong learning habits');
  }
  
  // Quest completion insights
  if (performance.questCompletionScore < 50) {
    insights.push('Quest completion rate is low - quests help structure your learning');
  } else if (performance.questCompletionScore > 85) {
    insights.push('Excellent quest completion rate - you\'re staying on track with goals');
  }
  
  // Deadline insights
  if (performance.deadlineAdherenceScore < 60) {
    insights.push('Deadline management needs improvement to reduce stress');
  } else if (performance.deadlineAdherenceScore > 90) {
    insights.push('Outstanding deadline management - you\'re well-prepared');
  }
  
  // Overall performance insights
  if (performance.performanceScore > 85) {
    insights.push('Overall performance is excellent - keep up the great work!');
  } else if (performance.performanceScore < 50) {
    insights.push('Performance needs immediate attention - consider following the recommended interventions');
  }
  
  return insights;
}

/**
 * Calculate time allocation recommendations
 */
export function calculateTimeAllocation(priorities: SubjectPriority[]): {
  courseId: string;
  courseName: string;
  recommendedHours: number;
  percentage: number;
}[] {
  const totalWeeklyHours = 20; // Assume 20 hours of study per week
  
  return priorities.map(priority => {
    const percentage = priority.timeAllocation;
    const recommendedHours = Math.round((percentage / 100) * totalWeeklyHours * 10) / 10;
    
    return {
      courseId: priority.courseId,
      courseName: priority.courseName,
      recommendedHours,
      percentage
    };
  });
}

/**
 * Generate study schedule suggestions based on performance
 */
export function generateStudyScheduleSuggestions(
  performances: SubjectPerformance[]
): {
  timeSlot: string;
  subject: string;
  activity: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
}[] {
  const suggestions: {
    timeSlot: string;
    subject: string;
    activity: string;
    duration: number;
    priority: 'high' | 'medium' | 'low';
  }[] = [];
  
  // Sort by priority (flagged and low performance first)
  const sortedPerformances = [...performances].sort((a, b) => {
    if (a.flagged && !b.flagged) return -1;
    if (!a.flagged && b.flagged) return 1;
    return a.performanceScore - b.performanceScore;
  });
  
  const timeSlots = [
    '9:00 AM - 10:30 AM',
    '10:45 AM - 12:15 PM',
    '2:00 PM - 3:30 PM',
    '4:00 PM - 5:30 PM',
    '7:00 PM - 8:30 PM'
  ];
  
  sortedPerformances.slice(0, 5).forEach((performance, index) => {
    let activity: string;
    let priority: 'high' | 'medium' | 'low';
    
    if (performance.flagged || performance.status === 'critical') {
      activity = 'Intensive review and practice';
      priority = 'high';
    } else if (performance.status === 'needs_attention') {
      activity = 'Focused study session';
      priority = 'medium';
    } else {
      activity = 'Regular study and reinforcement';
      priority = 'low';
    }
    
    suggestions.push({
      timeSlot: timeSlots[index] || '8:00 PM - 9:30 PM',
      subject: performance.courseName,
      activity,
      duration: 90,
      priority
    });
  });
  
  return suggestions;
}

/**
 * Calculate improvement potential for each subject
 */
export function calculateImprovementPotential(performance: SubjectPerformance): {
  potential: number;
  quickWins: string[];
  longTermGoals: string[];
} {
  const currentScore = performance.performanceScore;
  const maxPossibleImprovement = 100 - currentScore;
  
  // Calculate realistic improvement potential based on current status
  let potential: number;
  if (currentScore < 30) {
    potential = Math.min(40, maxPossibleImprovement); // Can improve significantly
  } else if (currentScore < 60) {
    potential = Math.min(25, maxPossibleImprovement); // Moderate improvement
  } else if (currentScore < 80) {
    potential = Math.min(15, maxPossibleImprovement); // Steady improvement
  } else {
    potential = Math.min(10, maxPossibleImprovement); // Fine-tuning
  }
  
  const quickWins: string[] = [];
  const longTermGoals: string[] = [];
  
  // Identify quick wins based on low-hanging fruit
  if (performance.questCompletionScore < 70) {
    quickWins.push('Complete pending quests for immediate score boost');
  }
  
  if (performance.studyTimeScore < 60) {
    quickWins.push('Increase daily study time by 15-30 minutes');
  }
  
  if (performance.consistencyScore < 50) {
    longTermGoals.push('Build consistent daily study habits over 2-3 weeks');
  }
  
  if (performance.deadlineAdherenceScore < 70) {
    longTermGoals.push('Implement better deadline management system');
  }
  
  // Add general improvements
  if (currentScore < 50) {
    longTermGoals.push('Achieve overall performance score above 70');
  } else if (currentScore < 80) {
    longTermGoals.push('Reach excellent performance level (85+)');
  }
  
  return {
    potential: Math.round(potential),
    quickWins,
    longTermGoals
  };
}

/**
 * Format study frequency for display
 */
export function formatStudyFrequency(frequency: number): string {
  if (frequency === 0) return 'No recent activity';
  if (frequency < 1) return `${Math.round(frequency * 10) / 10} times per week`;
  if (frequency === 1) return '1 time per week';
  return `${Math.round(frequency * 10) / 10} times per week`;
}

/**
 * Format time duration in a human-readable way
 */
export function formatStudyTime(minutes: number): string {
  if (minutes === 0) return '0 minutes';
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get performance trend indicator
 */
export function getPerformanceTrend(
  currentScore: number,
  previousScore?: number
): {
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
} {
  if (!previousScore) {
    return {
      trend: 'stable',
      change: 0,
      description: 'No previous data'
    };
  }
  
  const change = currentScore - previousScore;
  const absChange = Math.abs(change);
  
  let trend: 'up' | 'down' | 'stable';
  let description: string;
  
  if (absChange < 3) {
    trend = 'stable';
    description = 'Performance is stable';
  } else if (change > 0) {
    trend = 'up';
    description = `Improved by ${Math.round(change)} points`;
  } else {
    trend = 'down';
    description = `Decreased by ${Math.round(absChange)} points`;
  }
  
  return { trend, change: Math.round(change), description };
}

/**
 * Calculate study streak from sessions
 */
export function calculateStudyStreak(studySessions: Date[]): number {
  if (studySessions.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = studySessions
    .map(date => new Date(date).toDateString())
    .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Check if studied today or yesterday to start counting
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    streak = 1;
    
    // Count consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i - 1]);
      const previousDate = new Date(sortedDates[i]);
      const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  return streak;
}

export default {
  PERFORMANCE_CONSTANTS,
  getPerformanceScoreColor,
  getPerformanceStatusColor,
  getGradeColor,
  getRecommendationPriorityColor,
  getInterventionUrgencyColor,
  getSubjectPriorityColor,
  formatPerformanceScore,
  calculateStudyEfficiency,
  generatePerformanceInsights,
  calculateTimeAllocation,
  generateStudyScheduleSuggestions,
  calculateImprovementPotential,
  formatStudyFrequency,
  formatStudyTime,
  getPerformanceTrend,
  calculateStudyStreak
};