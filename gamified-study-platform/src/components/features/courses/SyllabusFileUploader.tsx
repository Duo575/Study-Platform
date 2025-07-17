import React, { useRef, useState } from 'react';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

interface SyllabusFileUploaderProps {
  onSyllabusContent: (content: string) => void;
}

const SyllabusFileUploader: React.FC<SyllabusFileUploaderProps> = ({ onSyllabusContent }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['text/plain', 'text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a .txt, .md, .pdf, or .docx file.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For text files, we can read directly
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        const content = await readTextFile(file);
        onSyllabusContent(content);
      } else {
        // For PDF and DOCX, we would normally use a server-side service
        // For this implementation, we'll just extract text client-side
        // In a real app, you might want to use a service like pdf.js or docx.js
        // or send the file to a server for processing
        setError('PDF and DOCX parsing is not fully implemented in this demo. Please use plain text files.');
        
        // Simplified extraction (just for demo)
        const content = await readTextFile(file);
        onSyllabusContent(content);
      }
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read file. Please try again or use manual entry.');
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md,.pdf,.docx"
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        onClick={handleButtonClick}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Upload Syllabus File'}
      </Button>
      {error && (
        <Alert variant="error" className="mt-2">
          {error}
        </Alert>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Supported formats: .txt, .md, .pdf, .docx (max 5MB)
      </p>
    </div>
  );
};

export default SyllabusFileUploader;