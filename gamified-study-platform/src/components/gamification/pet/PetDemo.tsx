import { useState } from 'react';
import { StudyPet } from './StudyPet';
import { usePet } from '../../../hooks/usePet';

interface PetDemoProps {
  userId: string;
}

export function PetDemo({ userId }: PetDemoProps) {
  const [studyMinutes, setStudyMinutes] = useState(30);
  const { pet, handleStudyActivity } = usePet(userId);
  
  const handleSimulateStudySession = async () => {
    await handleStudyActivity('study_session', studyMinutes);
  };
  
  const handleSimulateQuestComplete = async () => {
    await handleStudyActivity('quest_complete');
  };
  
  const handleSimulateTodoComplete = async () => {
    await handleStudyActivity('todo_complete');
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Virtual Study Pet Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <StudyPet userId={userId} />
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Simulate Study Activities</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use these controls to simulate study activities and see how they affect your pet.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Study Session Duration (minutes)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={studyMinutes}
                    onChange={(e) => setStudyMinutes(parseInt(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-sm font-medium w-12">{studyMinutes}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleSimulateStudySession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Study Session
                </button>
                
                <button
                  onClick={handleSimulateQuestComplete}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Complete Quest
                </button>
                
                <button
                  onClick={handleSimulateTodoComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Complete Todo
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">How It Works</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm">
              <ul className="list-disc list-inside space-y-2">
                <li>Your pet gains happiness and experience when you study</li>
                <li>Feed and play with your pet to keep it happy and healthy</li>
                <li>Your pet will evolve as you level it up through consistent study</li>
                <li>Unlock accessories and environments as you progress</li>
                <li>Your pet will remind you to study if you haven't been active</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}