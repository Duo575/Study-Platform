import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { Modal } from '../../ui/Modal';
import type { SyllabusItem } from '../../../types';

interface TopicEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topic: SyllabusItem) => void;
  topic: SyllabusItem;
}

interface TopicForm {
  title: string;
  description: string;
  topics: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
}

const TopicEditModal: React.FC<TopicEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  topic 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TopicForm>({
    defaultValues: {
      title: topic.title,
      description: topic.description || '',
      topics: topic.topics.join(', '),
      estimatedHours: topic.estimatedHours,
      priority: topic.priority,
      deadline: topic.deadline ? new Date(topic.deadline).toISOString().split('T')[0] : ''
    }
  });
  
  const onSubmit = (data: TopicForm) => {
    // Parse topics from comma-separated string
    const topicsList = data.topics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    
    // Parse deadline if provided
    let deadline: Date | undefined;
    if (data.deadline) {
      deadline = new Date(data.deadline);
    }
    
    // Create updated syllabus item
    const updatedTopic: SyllabusItem = {
      ...topic,
      title: data.title,
      description: data.description,
      topics: topicsList,
      estimatedHours: data.estimatedHours,
      priority: data.priority,
      deadline
    };
    
    onSave(updatedTopic);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Topic"
    >
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
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TopicEditModal;