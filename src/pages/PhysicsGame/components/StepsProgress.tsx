import React from 'react';
import { GameStep } from '../hooks/usePhysicsGame';

interface StepsProgressProps {
  steps: GameStep[];
  currentStepNumber: number;
  onMoveToFinalAnswer: () => void;
}

export const StepsProgress: React.FC<StepsProgressProps> = ({ 
  steps, 
  currentStepNumber, 
  onMoveToFinalAnswer 
}) => {
  const completedSteps = steps.filter(step => step.feedback?.isComplete).length;
  const canMoveToFinal = completedSteps >= 3;

  return (
    <div className="steps-progress">
      <h3>Progress Overview</h3>
      
      <div className="steps-list">
        {steps.map((step) => (
          <div key={step.stepNumber} className={`step-item ${step.feedback?.isComplete ? 'completed' : 'pending'}`}>
            <div className="step-number">
              {step.feedback?.isComplete ? '✓' : step.stepNumber}
            </div>
            <div className="step-content">
              <div className="step-description">
                {step.description.length > 100 
                  ? `${step.description.substring(0, 100)}...` 
                  : step.description
                }
              </div>
              {step.feedback && (
                <div className={`step-status ${step.feedback.isValid ? 'valid' : 'invalid'}`}>
                  {step.feedback.isValid ? 'Valid' : 'Needs revision'}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {steps.length > 0 && (
          <div className={`step-item current ${currentStepNumber > steps.length ? 'ready' : ''}`}>
            <div className="step-number">
              {currentStepNumber > steps.length ? '→' : currentStepNumber}
            </div>
            <div className="step-content">
              <div className="step-description">
                {currentStepNumber > steps.length 
                  ? 'Ready for final answer' 
                  : 'Next step'
                }
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="progress-summary">
        <p>Completed steps: {completedSteps}</p>
        {canMoveToFinal && (
          <button 
            className="move-to-final-btn"
            onClick={onMoveToFinalAnswer}
          >
            Move to Final Answer
          </button>
        )}
      </div>
    </div>
  );
};
