import React from 'react';
import { PhysicsGoal } from '../schemas';

interface GoalDisplayProps {
  goal: PhysicsGoal;
}

export const GoalDisplay: React.FC<GoalDisplayProps> = ({ goal }) => {
  return (
    <div className="goal-display">
      <h2>🎯 Your Physics Challenge</h2>
      <div className="goal-content">
        <h3>{goal.goal}</h3>
        <p className="goal-description">{goal.description}</p>
        
        <div className="goal-details">
          <div className="expected-steps">
            <h4>Expected Approach:</h4>
            <ul>
              {goal.expectedSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
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
