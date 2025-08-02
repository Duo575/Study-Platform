import React from 'react';

interface RelaxationGamesProps {
  onGameSelect?: (gameType: string) => void;
}

export const RelaxationGames: React.FC<RelaxationGamesProps> = ({
  onGameSelect,
}) => {
  const games = [
    {
      id: 'breathing',
      name: 'Breathing Exercise',
      description: 'Guided breathing for relaxation',
      icon: '🫁',
    },
    {
      id: 'meditation',
      name: 'Mini Meditation',
      description: 'Short mindfulness session',
      icon: '🧘',
    },
    {
      id: 'visualization',
      name: 'Visualization',
      description: 'Peaceful scene visualization',
      icon: '🌅',
    },
  ];

  return (
    <div className="relaxation-games p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Relaxation Games</h2>
      <div className="grid gap-4 max-w-md mx-auto">
        {games.map(game => (
          <button
            key={game.id}
            className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all"
            onClick={() => onGameSelect?.(game.id)}
          >
            <div className="text-3xl mb-2">{game.icon}</div>
            <h3 className="font-semibold text-lg">{game.name}</h3>
            <p className="text-sm text-gray-600">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
