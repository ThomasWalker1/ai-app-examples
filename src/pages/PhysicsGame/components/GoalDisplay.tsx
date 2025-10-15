import React from 'react';
import { PhysicsGoal } from '../schemas';
import { ModelOutput } from '../../../components/ModelOutput';
import { StepTiles } from './StepTiles';

interface GoalDisplayProps {
  goal: PhysicsGoal;
  completedSteps?: boolean[];
  shownHints?: boolean[];
  revealedAnswers?: boolean[];
  onRevealAnswer?: (stepIndex: number) => void;
  onRevealAllAnswers?: () => void;
}

export const GoalDisplay: React.FC<GoalDisplayProps> = ({ 
  goal, 
  completedSteps = [], 
  shownHints = [], 
  revealedAnswers = [], 
  onRevealAnswer = () => {}, 
  onRevealAllAnswers = () => {} 
}) => {
  return (
    <div className="goal-display">
      <h2>🎯 Your Physics Challenge</h2>
      <div className="goal-content">
        <h3>{goal.goal}</h3>
        
        <div className="goal-details">
          <StepTiles 
            goal={goal} 
            completedSteps={completedSteps} 
            shownHints={shownHints} 
            revealedAnswers={revealedAnswers}
            onRevealAnswer={onRevealAnswer}
            onRevealAllAnswers={onRevealAllAnswers}
          />
        </div>
      </div>
    </div>
  );
};
