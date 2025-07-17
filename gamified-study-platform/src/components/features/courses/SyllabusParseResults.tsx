import React from 'react';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import type { ParseResult } from '../../../services/syllabusParser';

interface SyllabusParseResultsProps {
  parseResult: ParseResult;
  onRetry: () => void;
  onManualEntry: () => void;
}

const SyllabusParseResults: React.FC<SyllabusParseResultsProps> = ({ 
  parseResult, 
  onRetry, 
  onManualEntry 
}) => {
  const { success, errors, warnings, items } = parseResult;
  
  if (success && items.length > 0 && warnings.length === 0) {
    return null; // No need to show anything if parsing was successful with no warnings
  }
  
  return (
    <div className="mb-6">
      {!success && errors.length > 0 && (
        <Alert variant="error" className="mb-4">
          <h4 className="font-medium mb-2">Syllabus Parsing Failed</h4>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <div className="flex space-x-3 mt-3">
            <Button onClick={onRetry} variant="secondary" size="sm">
              Edit Syllabus
            </Button>
            <Button onClick={onManualEntry} variant="primary" size="sm">
              Add Topics Manually
            </Button>
          </div>
        </Alert>
      )}
      
      {warnings.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <h4 className="font-medium mb-2">Syllabus Parsing Warnings</h4>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
          <p className="mt-2">
            {success 
              ? "The syllabus was parsed with some warnings. You can proceed or edit the syllabus to fix these issues."
              : "The syllabus was partially parsed. Some topics may be missing or incomplete."}
          </p>
        </Alert>
      )}
    </div>
  );
};

export default SyllabusParseResults;