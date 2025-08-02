import React, { useState } from 'react';
import { useQuestStore } from '../../../store/questStore';
import { useCourseStore } from '../../../store/courseStore';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
// import type { Course } from '../../../types';

interface QuestGeneratorProps {
  onClose?: () => void;
}

const QuestGenerator: React.FC<QuestGeneratorProps> = ({ onClose }) => {
  const { courses } = useCourseStore();
  const { generateQuestsForCourse, generateBalancedQuests } = useQuestStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [generationType, setGenerationType] = useState<'single' | 'balanced'>(
    'balanced'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = courses.find(course => course.id === selectedCourseId);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedCount(0);

    try {
      if (generationType === 'single' && selectedCourseId) {
        if (!selectedCourse) {
          throw new Error('Selected course not found');
        }

        const quests = await generateQuestsForCourse(
          selectedCourseId,
          selectedCourse.syllabus
        );
        setGeneratedCount(quests.length);
      } else {
        const quests = await generateBalancedQuests(courses);
        setGeneratedCount(quests.length);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate quests'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Generate Quests</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generation Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="generationType"
                value="balanced"
                checked={generationType === 'balanced'}
                onChange={() => setGenerationType('balanced')}
                className="mr-2"
              />
              <span>Balanced (All Courses)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="generationType"
                value="single"
                checked={generationType === 'single'}
                onChange={() => setGenerationType('single')}
                className="mr-2"
              />
              <span>Single Course</span>
            </label>
          </div>
        </div>

        {generationType === 'single' && (
          <div>
            <label
              htmlFor="course-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Course
            </label>
            <Select
              id="course-select"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              disabled={isGenerating}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {generationType === 'balanced' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p>
              <strong>Balanced Generation:</strong> This will create quests
              across all your courses, prioritizing courses with upcoming
              deadlines, high priority topics, and lower completion rates.
            </p>
          </div>
        )}

        {generationType === 'single' && selectedCourse && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <h3 className="font-medium mb-2">Course Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Topics:</span>{' '}
                {selectedCourse.syllabus.length}
              </div>
              <div>
                <span className="text-gray-600">Completion:</span>{' '}
                {selectedCourse.progress.completionPercentage}%
              </div>
              <div>
                <span className="text-gray-600">Hours Studied:</span>{' '}
                {selectedCourse.progress.hoursStudied}
              </div>
              <div>
                <span className="text-gray-600">Topics Completed:</span>{' '}
                {selectedCourse.progress.topicsCompleted}/
                {selectedCourse.progress.totalTopics}
              </div>
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">
                Quest Types You'll Get:
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">Daily</Badge>
                <Badge className="bg-purple-100 text-purple-800">Weekly</Badge>
                <Badge className="bg-amber-100 text-amber-800">Milestone</Badge>
                <Badge className="bg-emerald-100 text-emerald-800">Bonus</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {generatedCount > 0 && !error && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4 text-sm text-green-800">
          Successfully generated {generatedCount} quests!
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
        )}

        <Button
          onClick={handleGenerate}
          disabled={
            isGenerating || (generationType === 'single' && !selectedCourseId)
          }
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Generating...
            </span>
          ) : (
            'Generate Quests'
          )}
        </Button>
      </div>
    </Card>
  );
};

export default QuestGenerator;
