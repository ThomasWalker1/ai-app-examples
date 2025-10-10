import React from 'react';
import { FinalAnswerFeedback as FinalAnswerFeedbackType } from '../schemas';
import { ModelOutput } from '../../../components/ModelOutput';

interface FinalAnswerFeedbackProps {
  answer: string;
  feedback: FinalAnswerFeedbackType;
}

export const FinalAnswerFeedback: React.FC<FinalAnswerFeedbackProps> = ({ answer, feedback }) => {
  return (
    <div className={`final-answer-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="feedback-header">
        <h3>Final Answer Results</h3>
        <div className={`result-badge ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          {feedback.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
        </div>
      </div>
      
      <div className="answer-display">
        <strong>Your answer:</strong>
        <p>"{answer}"</p>
      </div>
      
      {!feedback.isCorrect && (
        <div className="correct-answer">
          <strong>Correct answer:</strong>
          <p>"{feedback.correctAnswer}"</p>
        </div>
      )}
      
      <div className="feedback-content">
        <strong>Feedback:</strong>
        <ModelOutput value={feedback.feedback} />
      </div>
      
      <div className="explanation">
        <strong>Explanation:</strong>
        <ModelOutput value={feedback.explanation} />
      </div>
      
      {feedback.gameComplete ? (
        <div className="game-complete">
          <h4>🎊 Congratulations!</h4>
          <p>You've successfully completed the physics challenge! You demonstrated good problem-solving skills and understanding of the concepts.</p>
        </div>
      ) : (
        <div className="try-again">
          <p>Don't worry! Physics problems can be tricky. Review the feedback and try again.</p>
        </div>
      )}
    </div>
  );
};
