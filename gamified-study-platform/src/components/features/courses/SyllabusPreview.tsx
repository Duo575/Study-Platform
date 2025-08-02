import React from 'react';
import { Button } from '../../ui/Button';
import type { SyllabusItem } from '../../../types';

interface SyllabusPreviewProps {
  items: SyllabusItem[];
  onEdit?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onAddTopic?: () => void;
  isEditable?: boolean;
}

const SyllabusPreview: React.FC<SyllabusPreviewProps> = ({
  items,
  onEdit,
  onDelete,
  onAddTopic,
  isEditable = true,
}) => {
  if (items.length === 0) {
    return (
      <div className="border rounded-md p-4 bg-gray-50 text-center">
        <p className="text-gray-500 mb-2">No syllabus items found.</p>
        {isEditable && onAddTopic && (
          <Button onClick={onAddTopic} variant="secondary" size="sm">
            Add Topic Manually
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Syllabus Preview</h3>
        {isEditable && onAddTopic && (
          <Button onClick={onAddTopic} variant="secondary" size="sm">
            Add Topic
          </Button>
        )}
      </div>

      <ul className="space-y-4">
        {items.map((item, _index) => (
          <li key={item.id} className="border-b pb-3">
            <div className="flex justify-between">
              <div className="font-medium">{item.title}</div>
              {isEditable && (
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {item.description && (
              <div className="text-sm text-gray-600 mt-1">
                {item.description}
              </div>
            )}

            <div className="text-sm mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs ${
                  item.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : item.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {item.priority}
              </span>

              <span className="text-gray-500">{item.estimatedHours} hours</span>

              {item.deadline && (
                <span className="text-gray-500">
                  Due: {new Date(item.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            {item.topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-2 py-0.5 rounded-full text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 text-sm text-gray-500">
        Total: {items.length} topics,{' '}
        {items.reduce((sum, item) => sum + item.estimatedHours, 0)} estimated
        hours
      </div>
    </div>
  );
};

export { SyllabusPreview };
