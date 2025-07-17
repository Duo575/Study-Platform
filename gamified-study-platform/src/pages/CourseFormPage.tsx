import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCourseStore } from '../store/courseStore';
import { parseSyllabus, parseSyllabusWithValidation, generateTemplateSyllabus } from '../services/syllabusParser';
import type { CourseForm, SyllabusItem } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { ColorPicker } from '../components/ui/ColorPicker';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import SyllabusFileUploader from '../components/features/courses/SyllabusFileUploader';
import SyllabusParseResults from '../components/features/courses/SyllabusParseResults';
import SyllabusPreview from '../components/features/courses/SyllabusPreview';
import ManualTopicEntry from '../components/features/courses/ManualTopicEntry';
import TopicEditModal from '../components/features/courses/TopicEditModal';

const CourseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>([]);
  const [parseResult, setParseResult] = useState<any>(null);
  const [showSyllabusEditor, setShowSyllabusEditor] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingTopic, setEditingTopic] = useState<SyllabusItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CourseForm>();
  
  const syllabusText = watch('syllabus', '');
  const selectedColor = watch('color', '#3B82F6'); // Default blue color
  
  const { fetchCourseById, createCourse, updateCourse } = useCourseStore();

  useEffect(() => {
    const fetchCourse = async () => {
      if (!isEditing) {
        // For new courses, set a template syllabus
        setValue('syllabus', generateTemplateSyllabus());
        setValue('color', '#3B82F6'); // Default blue color
        return;
      }
      
      try {
        setIsLoading(true);
        const courseData = await fetchCourseById(id!);
        
        if (courseData) {
          setValue('name', courseData.name);
          setValue('description', courseData.description || '');
          setValue('color', courseData.color);
          
          // Convert syllabus JSON to string representation for editing
          const syllabusText = Array.isArray(courseData.syllabus) 
            ? courseData.syllabus.map(item => 
                `${item.title}\n${item.description || ''}\n${item.topics.join(', ')}\n${item.estimatedHours}\n${item.priority}\n${item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : ''}\n---`
              ).join('\n')
            : '';
          
          setValue('syllabus', syllabusText);
          setSyllabusItems(courseData.syllabus);
          setShowSyllabusEditor(false); // Hide editor initially for editing
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, isEditing, setValue, fetchCourseById]);
  
  const handleSyllabusUpload = (content: string) => {
    setValue('syllabus', content);
    handleParseSyllabus();
  };
  
  const handleParseSyllabus = () => {
    try {
      setError(null);
      const result = parseSyllabusWithValidation(syllabusText);
      setParseResult(result);
      
      if (result.success) {
        setSyllabusItems(result.items);
        if (result.warnings.length === 0) {
          setShowSyllabusEditor(false);
        }
      }
    } catch (err) {
      console.error('Error parsing syllabus:', err);
      setError('Failed to parse syllabus. Please check the format and try again.');
    }
  };
  
  const handleAddTopic = (topic: SyllabusItem) => {
    setSyllabusItems(prev => [...prev, topic]);
    setShowManualEntry(false);
  };
  
  const handleEditTopic = (topicId: string) => {
    const topic = syllabusItems.find(item => item.id === topicId);
    if (topic) {
      setEditingTopic(topic);
    }
  };
  
  const handleSaveTopic = (updatedTopic: SyllabusItem) => {
    setSyllabusItems(prev => 
      prev.map(item => item.id === updatedTopic.id ? updatedTopic : item)
    );
    setEditingTopic(null);
  };
  
  const handleDeleteTopic = (topicId: string) => {
    setShowDeleteConfirm(topicId);
  };
  
  const confirmDeleteTopic = () => {
    if (showDeleteConfirm) {
      setSyllabusItems(prev => prev.filter(item => item.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };
  
  const handleShowSyllabusEditor = () => {
    // Convert current syllabus items back to text format
    if (syllabusItems.length > 0) {
      const text = syllabusItems.map(item => 
        `${item.title}\n${item.description || ''}\n${item.topics.join(', ')}\n${item.estimatedHours}\n${item.priority}\n${item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : ''}\n---`
      ).join('\n');
      setValue('syllabus', text);
    }
    setShowSyllabusEditor(true);
    setShowManualEntry(false);
  };
  
  const onSubmit = async (data: CourseForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Use the manually created syllabus items if available
      const finalSyllabus = syllabusItems.length > 0 
        ? syllabusItems 
        : parseSyllabus(data.syllabus);
      
      if (finalSyllabus.length === 0) {
        setError('Your syllabus is empty. Please add at least one topic.');
        setIsSubmitting(false);
        return;
      }
      
      if (isEditing && id) {
        await updateCourse(id, {
          name: data.name,
          description: data.description,
          color: data.color,
          syllabus: finalSyllabus
        });
      } else {
        await createCourse({
          name: data.name,
          description: data.description,
          color: data.color,
          syllabus: finalSyllabus
        });
      }
      
      navigate('/courses');
    } catch (err) {
      console.error('Error saving course:', err);
      setError('Failed to save course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Course' : 'Create New Course'}
      </h1>
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Course Name *
          </label>
          <Input
            id="name"
            {...register('name', { required: 'Course name is required' })}
            placeholder="e.g., Introduction to Computer Science"
            error={errors.name?.message}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the course"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Course Color
          </label>
          <ColorPicker
            value={selectedColor}
            onChange={(color) => setValue('color', color)}
          />
        </div>
        
        <div className="border-t pt-4">
          <h2 className="text-lg font-medium mb-3">Syllabus</h2>
          
          {/* Syllabus Editor Section */}
          {showSyllabusEditor ? (
            <>
              <SyllabusFileUploader onSyllabusContent={handleSyllabusUpload} />
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="syllabus" className="block text-sm font-medium">
                    Syllabus Text *
                  </label>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    onClick={handleParseSyllabus}
                    disabled={!syllabusText.trim()}
                  >
                    Parse Syllabus
                  </Button>
                </div>
                <Textarea
                  id="syllabus"
                  {...register('syllabus', { required: 'Syllabus is required' })}
                  placeholder={`Enter your syllabus in the following format:

Topic Title
Topic Description (optional)
Subtopic1, Subtopic2, Subtopic3
Estimated Hours
Priority (low, medium, high)
Deadline (YYYY-MM-DD) (optional)
---
Next Topic Title
...`}
                  rows={10}
                  error={errors.syllabus?.message}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate topics with "---" on a new line
                </p>
              </div>
              
              {parseResult && (
                <SyllabusParseResults 
                  parseResult={parseResult}
                  onRetry={() => setParseResult(null)}
                  onManualEntry={() => {
                    setShowSyllabusEditor(false);
                    setShowManualEntry(true);
                  }}
                />
              )}
            </>
          ) : showManualEntry ? (
            <ManualTopicEntry 
              onAddTopic={handleAddTopic}
              onCancel={() => {
                setShowManualEntry(false);
                if (syllabusItems.length === 0) {
                  setShowSyllabusEditor(true);
                }
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  onClick={handleShowSyllabusEditor}
                >
                  Edit as Text
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowManualEntry(true)}
                >
                  Add Topic
                </Button>
              </div>
              
              <SyllabusPreview 
                items={syllabusItems}
                onEdit={handleEditTopic}
                onDelete={handleDeleteTopic}
                onAddTopic={() => setShowManualEntry(true)}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/courses')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Course' : 'Create Course'
            )}
          </Button>
        </div>
      </form>
      
      {/* Topic Edit Modal */}
      {editingTopic && (
        <TopicEditModal
          isOpen={Boolean(editingTopic)}
          onClose={() => setEditingTopic(null)}
          onSave={handleSaveTopic}
          topic={editingTopic}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(showDeleteConfirm)}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteTopic}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  );
};

export default CourseFormPage;