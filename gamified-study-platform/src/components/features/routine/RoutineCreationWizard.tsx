import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Sparkles, Calendar, Palette } from 'lucide-react';
import { useRoutineStore } from '../../../store/routineStore';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { RoutineTemplate, RoutineForm } from '../../../types';

interface RoutineCreationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 'method' | 'template' | 'details' | 'customize';

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export const RoutineCreationWizard: React.FC<RoutineCreationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { 
    templates, 
    createRoutine, 
    createRoutineFromTemplate, 
    fetchTemplates,
    isLoading 
  } = useRoutineStore();

  const [currentStep, setCurrentStep] = useState<WizardStep>('method');
  const [creationMethod, setCreationMethod] = useState<'scratch' | 'template'>('scratch');
  const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
  const [routineData, setRoutineData] = useState<RoutineForm>({
    name: '',
    description: '',
    color: COLOR_OPTIONS[0],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleNext = () => {
    setError(null);
    
    switch (currentStep) {
      case 'method':
        if (creationMethod === 'template') {
          setCurrentStep('template');
        } else {
          setCurrentStep('details');
        }
        break;
      case 'template':
        if (!selectedTemplate) {
          setError('Please select a template');
          return;
        }
        setCurrentStep('details');
        break;
      case 'details':
        if (!routineData.name.trim()) {
          setError('Routine name is required');
          return;
        }
        if (creationMethod === 'template') {
          handleCreateFromTemplate();
        } else {
          setCurrentStep('customize');
        }
        break;
      case 'customize':
        handleCreateFromScratch();
        break;
    }
  };

  const handleBack = () => {
    setError(null);
    
    switch (currentStep) {
      case 'template':
        setCurrentStep('method');
        break;
      case 'details':
        if (creationMethod === 'template') {
          setCurrentStep('template');
        } else {
          setCurrentStep('method');
        }
        break;
      case 'customize':
        setCurrentStep('details');
        break;
    }
  };

  const handleCreateFromScratch = async () => {
    try {
      await createRoutine(routineData);
      onComplete();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create routine');
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await createRoutineFromTemplate(selectedTemplate.id, routineData.name);
      onComplete();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create routine from template');
    }
  };

  const renderMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          How would you like to create your routine?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred method to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all border-2 ${
            creationMethod === 'scratch'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setCreationMethod('scratch')}
        >
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Start from Scratch
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a completely custom routine tailored to your specific needs
            </p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all border-2 ${
            creationMethod === 'template'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setCreationMethod('template')}
        >
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Use a Template
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start with a proven routine template and customize it to fit your schedule
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose a Template
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select a template that matches your study style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {template.name}
              </h4>
              <Badge variant="secondary" size="sm">
                {template.category}
              </Badge>
            </div>
            
            {template.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{template.templateData.length} time slots</span>
              <span>Used {template.usageCount} times</span>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No templates available at the moment</p>
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Routine Details
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Give your routine a name and description
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Routine Name *
          </label>
          <Input
            value={routineData.name}
            onChange={(e) => setRoutineData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Morning Study Routine"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <Textarea
            value={routineData.description}
            onChange={(e) => setRoutineData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this routine is for..."
            rows={3}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Theme
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                onClick={() => setRoutineData(prev => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  routineData.color === color
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Using Template: {selectedTemplate.name}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This will create {selectedTemplate.templateData.length} time slots based on the template structure.
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Routine Created!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your routine has been created. You can now add time slots to build your schedule.
        </p>
      </div>

      <Card className="p-6 text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: routineData.color }}
        >
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {routineData.name}
        </h4>
        {routineData.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {routineData.description}
          </p>
        )}
      </Card>

      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Next Steps:
        </h5>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Add time slots to your routine</li>
          <li>• Set up your weekly schedule</li>
          <li>• Start tracking your consistency</li>
        </ul>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method': return 'Creation Method';
      case 'template': return 'Select Template';
      case 'details': return 'Routine Details';
      case 'customize': return 'All Set!';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'method': return true;
      case 'template': return !!selectedTemplate;
      case 'details': return !!routineData.name.trim();
      case 'customize': return true;
      default: return false;
    }
  };

  const isLastStep = currentStep === 'customize' || 
    (currentStep === 'details' && creationMethod === 'template');

  return (
    <Modal 
      isOpen 
      onClose={onCancel} 
      title="Create New Routine"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2">
          {['method', 'template', 'details', 'customize'].map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = ['method', 'template', 'details', 'customize'].indexOf(currentStep) > index;
            const shouldShow = creationMethod === 'template' || step !== 'template';
            
            if (!shouldShow) return null;
            
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && shouldShow && (
                  <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'method' && renderMethodStep()}
          {currentStep === 'template' && renderTemplateStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'customize' && renderCustomizeStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={currentStep === 'method' ? onCancel : handleBack}
            disabled={isLoading}
          >
            {currentStep === 'method' ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          <Button
            onClick={isLastStep ? onComplete : handleNext}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? (
              'Creating...'
            ) : isLastStep ? (
              'Finish'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};