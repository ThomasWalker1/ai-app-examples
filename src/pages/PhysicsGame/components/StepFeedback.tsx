import React from 'react';
import { StepFeedback as StepFeedbackType } from '../schemas';

interface StepFeedbackProps {
  stepNumber: number;
  description: string;
  feedback: StepFeedbackType;
}

export const StepFeedback: React.FC<StepFeedbackProps> = ({ stepNumber, description, feedback }) => {
  return (
    <div className={`step-feedback ${feedback.isValid ? 'valid' : 'invalid'}`}>
      <div className="step-header">
        <h4>Step {stepNumber}</h4>
        <div className={`status-badge ${feedback.isValid ? 'valid' : 'invalid'}`}>
          {feedback.isValid ? '✓ Valid' : '⚠ Needs Work'}
        </div>
      </div>
      
      <div className="step-description">
        <strong>Your description:</strong>
        <p>"{description}"</p>
      </div>
      
      <div className="feedback-content">
        <strong>Feedback:</strong>
        <p>{feedback.feedback}</p>
      </div>
      
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="suggestions">
          <strong>Suggestions:</strong>
          <ul>
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="step-status">
        {feedback.isComplete ? (
          <div className="status-complete">
            ✅ This step is complete! You can move to the next step.
          </div>
        ) : (
          <div className="status-incomplete">
            🔄 Please revise this step based on the feedback above.
          </div>
        )}
      </div>
    </div>
  );
};
