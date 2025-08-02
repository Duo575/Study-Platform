import React from 'react';

interface PetSelectionProps {
  onSelect: (petId: string) => void;
  onClose: () => void;
}

export const PetSelection: React.FC<PetSelectionProps> = ({
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Choose Your Study Pet</h2>
        <p className="text-gray-600 mb-4">
          Select a pet to accompany you on your study journey!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onSelect('cat')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-4xl mb-2">🐱</div>
            <div className="font-medium">Cat</div>
          </button>

          <button
            onClick={() => onSelect('dog')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-4xl mb-2">🐶</div>
            <div className="font-medium">Dog</div>
          </button>

          <button
            onClick={() => onSelect('rabbit')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-4xl mb-2">🐰</div>
            <div className="font-medium">Rabbit</div>
          </button>

          <button
            onClick={() => onSelect('bird')}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-4xl mb-2">🐦</div>
            <div className="font-medium">Bird</div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetSelection;
