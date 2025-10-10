import React from 'react';

interface GoalSelectionProps {
  onSelectGoal: (goalType: string) => void;
  isLoading: boolean;
}

const GOAL_OPTIONS = [
  {
    id: 'gravity',
    title: 'Gravitational Acceleration',
    description: 'Determine Earth\'s gravitational acceleration',
    icon: '🌍'
  },
  {
    id: 'motion',
    title: 'Projectile Motion',
    description: 'Predict the horizontal distance traveled by a projectile',
    icon: '🚀'
  },
  {
    id: 'energy',
    title: 'Energy Conservation',
    description: 'Find the final speed of a moving object',
    icon: '⚡'
  },
  {
    id: 'forces',
    title: 'Force Analysis',
    description: 'Calculate the net force on an object',
    icon: '💪'
  },
  {
    id: 'oscillations',
    title: 'Simple Harmonic Motion',
    description: 'Determine the period of an oscillating system',
    icon: '🔄'
  },
  {
    id: 'thermodynamics',
    title: 'Heat Transfer',
    description: 'Calculate the final temperature after heat exchange',
    icon: '🌡️'
  }
];

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onSelectGoal, isLoading }) => {
  return (
    <div className="goal-selection">
      <h2>Choose Your Physics Challenge</h2>
      <p>Select a physics problem to solve step by step. You'll describe your approach and get feedback from an AI tutor.</p>
      
      <div className="goal-grid">
        {GOAL_OPTIONS.map((option) => (
          <button
            key={option.id}
            className="goal-option"
            onClick={() => onSelectGoal(option.title)}
            disabled={isLoading}
          >
            <div className="goal-icon">{option.icon}</div>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </button>
        ))}
      </div>
      
      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Generating your physics challenge...</p>
        </div>
      )}
    </div>
  );
};
