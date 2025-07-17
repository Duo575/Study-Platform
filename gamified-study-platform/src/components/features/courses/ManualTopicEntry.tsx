import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { Alert } from '../../ui/Alert';
import { generateTopicTemplate } from '../../../services/syllabusParser';
import type { SyllabusItem } from '../../../types';

interface ManualTopicEntryProps {
  onAddTopic: (topic: SyllabusItem) => void;
  onCancel: () => void;
}

interface TopicForm {
  title: string;
  description: string;
  topics: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
}

const ManualTopicEntry: React.FC<ManualTopicEntryProps> = ({ onAddTopic, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TopicForm>({
    defaultValues: {
      title: '',
      description: '',
      topics: '',
      estimatedHours: 1,
      priority: 'medium',
      deadline: ''
    }
  });
  
  const handleUseTemplate = () => {
    const template = generateTopicTemplate();
    const lines = template.split('\n');
    
    // Extract template values
    reset({
      title: lines[0] || '',
      description: lines[1] || '',
      topics: lines[2] || '',
      estimatedHours: 1,
      priority: 'medium',
      deadline: ''
    });
  };
  
  const onSubmit = (data: TopicForm) => {
    try {
      setError(null);
      
      // Parse topics from comma-separated string
      const topicsList = data.topics
        .split(',')
        .map(topic => topic.trim())
        .filter(Boolean);
      
      if (topicsList.length === 0) {
        setError('Please enter at least one topic');
        return;
      }
      
      // Parse deadline if provided
      let deadline: Date | undefined;
      if (data.deadline) {
        const parsedDate = new Date(data.deadline);
        if (!isNaN(parsedDate.getTime())) {
          deadline = parsedDate;
        } else {
          setError('Invalid deadline format. Please use YYYY-MM-DD.');
          return;
        }
      }
      
      // Create syllabus item
      const newTopic: SyllabusItem = {
        id: uuidv4(),
        title: data.title,
        description: data.description,
        topics: topicsList,
        estimatedHours: data.estimatedHours,
        priority: data.priority,
        deadline,
        completed: false
      };
      
      onAddTopic(newTopic);
      reset(); // Clear form after successful submission
    } catch (err) {
      console.error('Error adding topic:', err);
      setError('Failed to add topic. Please check your input and try again.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Add Topic Manually</h3>
        <Button 
          type="button" 
          variant="secondary" 
          size="sm"
          onClick={handleUseTemplate}
        >
          Use Template
        </Button>
      </div>
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Topic Title *
          </label>
          <Input
            id="title"
            {...register('title', { required: 'Topic title is required' })}
            error={errors.title?.message}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            {...register('description')}
            rows={2}
          />
        </div>
        
        <div>
          <label htmlFor="topics" className="block text-sm font-medium mb-1">
            Subtopics * (comma-separated)
          </label>
          <Input
            id="topics"
            {...register('topics', { required: 'At least one subtopic is required' })}
            placeholder="e.g., Theory, Practice, Applications"
            error={errors.topics?.message}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="estimatedHours" className="block text-sm font-medium mb-1">
              Estimated Hours *
            </label>
            <Input
              id="estimatedHours"
              type="number"
              min="0.5"
              step="0.5"
              {...register('estimatedHours', { 
                required: 'Required',
                min: { value: 0.5, message: 'Minimum 0.5 hours' },
                valueAsNumber: true
              })}
              error={errors.estimatedHours?.message}
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority *
            </label>
            <Select
              id="priority"
              {...register('priority')}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />
          </div>
          
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium mb-1">
              Deadline (optional)
            </label>
            <Input
              id="deadline"
              type="date"
              {...register('deadline')}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Add Topic
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManualTopicEntry;