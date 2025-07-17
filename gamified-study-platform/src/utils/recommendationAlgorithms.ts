import type { 
  StudySession, 
  SubjectPerformance, 
  StudentLearningProfile,
  StudyAnalytics 
} from '../types';

/**
 * Recommendation algorithm utilities
 */

export interface StudyPattern {
  peakHours: number[];
  averageSessionLength: number;
  preferredBreakLength: number;
  consistencyScore: number;
  productivityTrend: 'improving' | 'stable' | 'declining';
}

export interface LearningEfficiency {
  retentionRate: number;
  comprehensionSpeed: number;
  optimalDifficulty: 'easy' | 'medium' | 'hard';
  preferredPace: 'slow' | 'moderate' | 'fast';
}

/**
 * Analyze user's study patterns from session data
 */
export const analyzeStudyPatterns = (sessions: StudySession[]): StudyPattern => {
  if (sessions.length === 0) {
    return {
      peakHours: [],
      averageSessionLength: 0,
      preferredBreakLength: 15,
      consistencyScore: 0,
      productivityTrend: 'stable',
    };
  }

  // Analyze peak performance hours
  const hourCounts: { [hour: number]: { count: number; totalXP: number } } = {};
  
  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    if (!hourCounts[hour]) {
      hourCounts[hour] = { count: 0, totalXP: 0 };
    }
    hourCounts[hour].count++;
    hourCounts[hour].totalXP += session.xpEarned || 0;
  });

  // Find peak hours based on XP per session
  const peakHours = Object.entries(hourCounts)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgXP: data.totalXP / data.count,
      count: data.count,
    }))
    .filter(item => item.count >= 2) // Only consider hours with multiple sessions
    .sort((a, b) => b.avgXP - a.avgXP)
    .slice(0, 3)
    .map(item => item.hour);

  // Calculate average session length
  const averageSessionLength = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length;

  // Calculate consistency score
  const consistencyScore = calculateConsistencyScore(sessions);

  // Determine productivity trend
  const productivityTrend = calculateProductivityTrend(sessions);

  return {
    peakHours,
    averageSessionLength,
    preferredBreakLength: Math.max(5, Math.min(30, Math.round(averageSessionLength * 0.2))),
    consistencyScore,
    productivityTrend,
  };
};

/**
 * Calculate consistency score based on study frequency and regularity
 */
export const calculateConsistencyScore = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Get sessions from last 30 days
  const recentSessions = sessions.filter(session => 
    new Date(session.startTime) >= thirtyDaysAgo
  );

  if (recentSessions.length === 0) return 0;

  // Calculate study days
  const studyDays = new Set(
    recentSessions.map(session => 
      new Date(session.startTime).toDateString()
    )
  ).size;

  // Base consistency score
  let score = (studyDays / 30) * 100;

  // Bonus for regular intervals
  const intervals = calculateStudyIntervals(recentSessions);
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const idealInterval = 1; // 1 day
  const intervalConsistency = Math.max(0, 1 - Math.abs(avgInterval - idealInterval) / idealInterval);
  
  score *= (0.7 + 0.3 * intervalConsistency);

  return Math.min(100, Math.round(score));
};

/**
 * Calculate productivity trend over time
 */
export const calculateProductivityTrend = (sessions: StudySession[]): 'improving' | 'stable' | 'declining' => {
  if (sessions.length < 6) return 'stable';

  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Split into two halves
  const midPoint = Math.floor(sortedSessions.length / 2);
  const firstHalf = sortedSessions.slice(0, midPoint);
  const secondHalf = sortedSessions.slice(midPoint);

  // Calculate average XP for each half
  const firstHalfAvgXP = firstHalf.reduce((sum, s) => sum + (s.xpEarned || 0), 0) / firstHalf.length;
  const secondHalfAvgXP = secondHalf.reduce((sum, s) => sum + (s.xpEarned || 0), 0) / secondHalf.length;

  const improvement = (secondHalfAvgXP - firstHalfAvgXP) / firstHalfAvgXP;

  if (improvement > 0.1) return 'improving';
  if (improvement < -0.1) return 'declining';
  return 'stable';
};

/**
 * Calculate intervals between study sessions
 */
export const calculateStudyIntervals = (sessions: StudySession[]): number[] => {
  if (sessions.length < 2) return [];

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const intervals: number[] = [];
  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = new Date(sortedSessions[i - 1].startTime);
    const currentDate = new Date(sortedSessions[i].startTime);
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
    intervals.push(daysDiff);
  }

  return intervals;
};

/**
 * Analyze learning efficiency from performance data
 */
export const analyzeLearningEfficiency = (
  performances: SubjectPerformance[],
  sessions: StudySession[]
): LearningEfficiency => {
  if (performances.length === 0) {
    return {
      retentionRate: 0.5,
      comprehensionSpeed: 0.5,
      optimalDifficulty: 'medium',
      preferredPace: 'moderate',
    };
  }

  // Calculate retention rate based on consistency scores
  const avgConsistencyScore = performances.reduce((sum, p) => sum + p.consistencyScore, 0) / performances.length;
  const retentionRate = avgConsistencyScore / 100;

  // Calculate comprehension speed based on XP earned per minute
  const totalXP = sessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const xpPerMinute = totalMinutes > 0 ? totalXP / totalMinutes : 0;
  
  // Normalize comprehension speed (assuming 1 XP per minute is average)
  const comprehensionSpeed = Math.min(1, xpPerMinute);

  // Determine optimal difficulty based on performance scores
  const avgPerformanceScore = performances.reduce((sum, p) => sum + p.performanceScore, 0) / performances.length;
  let optimalDifficulty: 'easy' | 'medium' | 'hard';
  
  if (avgPerformanceScore < 60) {
    optimalDifficulty = 'easy';
  } else if (avgPerformanceScore > 80) {
    optimalDifficulty = 'hard';
  } else {
    optimalDifficulty = 'medium';
  }

  // Determine preferred pace based on session lengths and performance
  const avgSessionLength = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
    : 45;
  
  let preferredPace: 'slow' | 'moderate' | 'fast';
  if (avgSessionLength > 60 && avgPerformanceScore > 70) {
    preferredPace = 'slow'; // Long sessions with good performance = thorough learner
  } else if (avgSessionLength < 30 && avgPerformanceScore > 70) {
    preferredPace = 'fast'; // Short sessions with good performance = quick learner
  } else {
    preferredPace = 'moderate';
  }

  return {
    retentionRate,
    comprehensionSpeed,
    optimalDifficulty,
    preferredPace,
  };
};

/**
 * Generate personalized study schedule recommendations
 */
export const generateScheduleRecommendations = (
  patterns: StudyPattern,
  learningProfile: StudentLearningProfile,
  currentSchedule?: any[]
): string[] => {
  const recommendations: string[] = [];

  // Peak hours recommendations
  if (patterns.peakHours.length > 0) {
    const peakHoursStr = patterns.peakHours.map(h => `${h}:00`).join(', ');
    recommendations.push(
      `Schedule your most challenging subjects during your peak performance hours: ${peakHoursStr}`
    );
  }

  // Session length recommendations
  const optimalLength = learningProfile.attentionSpan || 45;
  if (Math.abs(patterns.averageSessionLength - optimalLength) > 10) {
    if (patterns.averageSessionLength > optimalLength) {
      recommendations.push(
        `Consider shorter study sessions (${optimalLength} minutes) to match your attention span and improve focus`
      );
    } else {
      recommendations.push(
        `Try extending your study sessions to ${optimalLength} minutes for deeper learning`
      );
    }
  }

  // Break recommendations
  if (patterns.averageSessionLength > 30) {
    recommendations.push(
      `Take ${patterns.preferredBreakLength}-minute breaks between study sessions to maintain focus`
    );
  }

  // Consistency recommendations
  if (patterns.consistencyScore < 70) {
    recommendations.push(
      'Establish a regular study routine by studying at the same times each day'
    );
  }

  // Productivity trend recommendations
  if (patterns.productivityTrend === 'declining') {
    recommendations.push(
      'Your productivity has been declining. Consider reviewing your study methods and taking adequate rest'
    );
  } else if (patterns.productivityTrend === 'improving') {
    recommendations.push(
      'Great job! Your productivity is improving. Keep up the current approach'
    );
  }

  return recommendations;
};

/**
 * Generate study method recommendations based on learning profile
 */
export const generateMethodRecommendations = (
  learningProfile: StudentLearningProfile,
  efficiency: LearningEfficiency
): string[] => {
  const recommendations: string[] = [];

  // Learning style recommendations
  if (learningProfile.learningStyle.includes('visual')) {
    recommendations.push('Use mind maps, diagrams, and color-coding to enhance visual learning');
  }
  
  if (learningProfile.learningStyle.includes('auditory')) {
    recommendations.push('Try explaining concepts aloud or using audio resources');
  }
  
  if (learningProfile.learningStyle.includes('kinesthetic')) {
    recommendations.push('Incorporate hands-on activities and movement into your study sessions');
  }

  // Difficulty recommendations
  if (efficiency.optimalDifficulty === 'easy') {
    recommendations.push('Start with easier topics to build confidence before tackling challenging material');
  } else if (efficiency.optimalDifficulty === 'hard') {
    recommendations.push('Challenge yourself with advanced topics to maintain engagement');
  }

  // Pace recommendations
  if (efficiency.preferredPace === 'fast') {
    recommendations.push('Use active recall and spaced repetition for efficient learning');
  } else if (efficiency.preferredPace === 'slow') {
    recommendations.push('Take time for deep understanding and thorough note-taking');
  }

  // Retention recommendations
  if (efficiency.retentionRate < 0.7) {
    recommendations.push('Implement spaced repetition and regular review sessions to improve retention');
  }

  return recommendations;
};

/**
 * Calculate recommendation confidence score
 */
export const calculateRecommendationConfidence = (
  dataPoints: number,
  consistencyScore: number,
  timeSpan: number // in days
): number => {
  // Base confidence on amount of data
  let confidence = Math.min(0.9, dataPoints / 20);
  
  // Adjust for consistency
  confidence *= (0.5 + 0.5 * (consistencyScore / 100));
  
  // Adjust for time span (more recent data is more reliable)
  const timeSpanFactor = Math.min(1, timeSpan / 30); // 30 days for full confidence
  confidence *= (0.7 + 0.3 * timeSpanFactor);
  
  return Math.max(0.1, Math.min(0.95, confidence));
};

/**
 * Prioritize recommendations based on impact and feasibility
 */
export const prioritizeRecommendations = (
  recommendations: Array<{
    impact: 'high' | 'medium' | 'low';
    feasibility: 'high' | 'medium' | 'low';
    urgency: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
  }>
): Array<{ priority: number; index: number }> => {
  const impactScores = { high: 3, medium: 2, low: 1 };
  const feasibilityScores = { high: 3, medium: 2, low: 1 };
  const urgencyScores = { critical: 4, high: 3, medium: 2, low: 1 };

  return recommendations
    .map((rec, index) => ({
      index,
      priority: 
        impactScores[rec.impact] * 0.4 +
        feasibilityScores[rec.feasibility] * 0.3 +
        urgencyScores[rec.urgency] * 0.2 +
        rec.confidence * 0.1
    }))
    .sort((a, b) => b.priority - a.priority);
};

export default {
  analyzeStudyPatterns,
  calculateConsistencyScore,
  calculateProductivityTrend,
  analyzeLearningEfficiency,
  generateScheduleRecommendations,
  generateMethodRecommendations,
  calculateRecommendationConfidence,
  prioritizeRecommendations,
};