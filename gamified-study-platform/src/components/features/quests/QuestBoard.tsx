import React, { useEffect, useState } from 'react';
import { useQuestStore } from '../../../store/questStore';
import { useCourseStore } from '../../../store/courseStore';
import QuestCard from './QuestCard';
import QuestFilters from './QuestFilters';
import EmptyState from '../../ui/EmptyState';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { Button } from '../../ui/Button';
import { Tab } from '../../ui/Tab';
import type { Quest, QuestType, QuestDifficulty, QuestStatus } from '../../../types';

interface QuestBoardProps {
  onQuestClick?: (quest: Quest) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ onQuestClick }) => {
  const { 
    activeQuests, 
    completedQuests, 
    isLoading, 
    error, 
    filters,
    fetchQuests, 
    updateFilters,
    resetFilters,
    handleOverdueQuests,
    generateBalancedQuests
  } = useQuestStore();
  
  const { courses, fetchCourses } = useCourseStore();
  
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    fetchQuests();
    fetchCourses();
    
    // Check for overdue quests on load
    handleOverdueQuests();
    
    // Set up interval to check for overdue quests every hour
    const interval = setInterval(() => {
      handleOverdueQuests();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchQuests, fetchCourses, handleOverdueQuests]);
  
  const handleGenerateQuests = async () => {
    if (courses.length === 0) {
      alert('You need to create at least one course before generating quests.');
      return;
    }
    
    setIsGenerating(true);
    try {
      await generateBalancedQuests(courses);
    } catch (error) {
      console.error('Failed to generate quests:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleFilterChange = (
    type: QuestType | 'all' | undefined,
    difficulty: QuestDifficulty | 'all' | undefined,
    status: QuestStatus | 'all' | undefined,
    courseId: string | undefined,
    search: string | undefined
  ) => {
    updateFilters({
      type: type || filters.type,
      difficulty: difficulty || filters.difficulty,
      status: status || filters.status,
      courseId,
      search: search !== undefined ? search : filters.search
    });
  };
  
  const handleSortChange = (
    sortBy: string | undefined,
    sortOrder: 'asc' | 'desc' | undefined
  ) => {
    updateFilters({
      sortBy: sortBy || filters.sortBy,
      sortOrder: sortOrder || filters.sortOrder
    });
  };
  
  const displayedQuests = activeTab === 'active' ? activeQuests : completedQuests;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quest Board</h1>
        <Button 
          onClick={handleGenerateQuests} 
          disabled={isGenerating || courses.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? 'Generating...' : 'Generate New Quests'}
        </Button>
      </div>
      
      <QuestFilters 
        filters={filters}
        courses={courses}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onReset={resetFilters}
      />
      
      <div className="mb-4">
        <Tab
          tabs={[
            { id: 'active', label: `Active (${activeQuests.length})` },
            { id: 'completed', label: `Completed (${completedQuests.length})` }
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'active' | 'completed')}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : displayedQuests.length === 0 ? (
        <EmptyState
          title={activeTab === 'active' ? 'No active quests' : 'No completed quests'}
          description={
            activeTab === 'active'
              ? 'Generate new quests to start your adventure!'
              : 'Complete quests to see them here.'
          }
          action={
            activeTab === 'active' && (
              <Button onClick={handleGenerateQuests} disabled={isGenerating || courses.length === 0}>
                Generate Quests
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
          {displayedQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onQuestClick={onQuestClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestBoard;