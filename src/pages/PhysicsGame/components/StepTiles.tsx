import React from 'react';
import { PhysicsGoal } from '../schemas';

interface StepTilesProps {
  goal: PhysicsGoal;
  completedSteps: boolean[];
  shownHints: boolean[];
  revealedAnswers: boolean[];
  onRevealAnswer: (stepIndex: number) => void;
  onRevealAllAnswers: () => void;
}

export const StepTiles: React.FC<StepTilesProps> = ({ 
  goal, 
  completedSteps, 
  shownHints, 
  revealedAnswers, 
  onRevealAnswer, 
  onRevealAllAnswers 
}) => {
  return (
    <div className="step-tiles">
      <h4>Required Steps:</h4>
      <div className="tiles-grid">
        {goal.requiredSteps.map((stepWithHint, index) => {
          const isCompleted = completedSteps[index];
          const showHint = shownHints[index];
          const isRevealed = revealedAnswers[index];
          
          let displayText = '';
          let tileClass = 'blank';
          
          if (isCompleted) {
            displayText = stepWithHint.step;
            tileClass = 'completed';
          } else if (isRevealed) {
            displayText = stepWithHint.step;
            tileClass = 'revealed';
          } else if (showHint) {
            displayText = stepWithHint.hint;
            tileClass = 'hint-shown';
          }
          
          return (
            <div 
              key={index} 
              className={`step-tile ${tileClass}`}
            >
              <div className="step-tile-number">
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="step-tile-content">
                {displayText ? (
                  <p>{displayText}</p>
                ) : (
                  <p className="blank-step">Step {index + 1}</p>
                )}
              </div>
              {!isCompleted && !isRevealed && (
                <button 
                  className="reveal-btn"
                  onClick={() => onRevealAnswer(index)}
                  title="Reveal answer for this step"
                >
                  👁️
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="step-actions">
        <button 
          className="reveal-all-btn"
          onClick={onRevealAllAnswers}
          title="Reveal all step answers"
        >
          👁️ Reveal All Answers
        </button>
      </div>
      
      {goal.units && (
        <div className="answer-format">
          <h4>Answer Format:</h4>
          <p>Your final answer should include units: <strong>{goal.units}</strong></p>
        </div>
      )}
    </div>
  );
};
