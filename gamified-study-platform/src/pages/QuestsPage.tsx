import React, { useState } from 'react';
import { QuestBoard } from '../components/features/quests';
import QuestGenerator from '../components/features/quests/QuestGenerator';
import QuestDetailsModal from '../components/features/quests/QuestDetailsModal';
import { useQuestStore } from '../store/questStore';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import type { Quest } from '../types';

const QuestsPage: React.FC = () => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  
  const { activeQuests, completedQuests } = useQuestStore();
  
  const handleOpenGenerator = () => {
    setIsGeneratorOpen(true);
  };
  
  const handleCloseGenerator = () => {
    setIsGeneratorOpen(false);
  };
  
  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
  };
  
  const handleCloseQuestDetails = () => {
    setSelectedQuest(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quests</h1>
          <p className="text-gray-600">
            Complete quests to earn XP and level up your study journey
          </p>
        </div>
        <Button 
          onClick={handleOpenGenerator}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Generate New Quests
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Quest Board</h2>
            <p className="text-gray-600 text-sm">
              {activeQuests.length} active quests, {completedQuests.length} completed
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center text-sm">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-1"></span>
              <span className="text-gray-600 mr-3">Daily</span>
              
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block mr-1"></span>
              <span className="text-gray-600 mr-3">Weekly</span>
              
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block mr-1"></span>
              <span className="text-gray-600 mr-3">Milestone</span>
              
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block mr-1"></span>
              <span className="text-gray-600">Bonus</span>
            </div>
          </div>
        </div>
        
        <QuestBoard onQuestClick={handleQuestClick} />
      </div>
      
      {/* Quest Generator Dialog */}
      <Dialog
        isOpen={isGeneratorOpen}
        onClose={handleCloseGenerator}
        title="Generate Quests"
      >
        <QuestGenerator onClose={handleCloseGenerator} />
      </Dialog>
      
      {/* Quest Details Modal */}
      {selectedQuest && (
        <QuestDetailsModal
          quest={selectedQuest}
          isOpen={!!selectedQuest}
          onClose={handleCloseQuestDetails}
        />
      )}
    </div>
  );
};

export default QuestsPage;