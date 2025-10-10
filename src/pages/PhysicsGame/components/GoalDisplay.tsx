import React from 'react';
import { PhysicsGoal } from '../schemas';
import { ModelOutput } from '../../../components/ModelOutput';

interface GoalDisplayProps {
  goal: PhysicsGoal;
}

export const GoalDisplay: React.FC<GoalDisplayProps> = ({ goal }) => {
  return (
    <div className="goal-display">
      <h2>🎯 Your Physics Challenge</h2>
      <div className="goal-content">
        <h3>{goal.goal}</h3>
        
        <div className="goal-details">
          <div className="challenge-instructions">
            <h4>Your Task:</h4>
            <ul>
              <li>Decide what measurements or information you need</li>
              <li>Determine what equipment or methods to use</li>
              <li>Explain your reasoning and calculations</li>
              <li>Provide your final answer with proper units</li>
            </ul>
          </div>
          
          {goal.units && (
            <div className="answer-format">
              <h4>Answer Format:</h4>
              <p>Your final answer should include units: <strong>{goal.units}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
