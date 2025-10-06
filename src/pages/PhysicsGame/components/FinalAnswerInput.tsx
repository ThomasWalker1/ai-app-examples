import React, { useState } from 'react';

interface FinalAnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export const FinalAnswerInput: React.FC<FinalAnswerInputProps> = ({ onSubmit, isLoading }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  return (
    <div className="final-answer-input">
      <h3>🎯 Final Answer</h3>
      <p>Based on all your steps, what is your final answer to the physics problem?</p>
      <p><strong>Remember to include units in your answer!</strong></p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your final answer with units (e.g., 9.8 m/s²)"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !answer.trim()}>
          {isLoading ? 'Checking Answer...' : 'Submit Final Answer'}
        </button>
      </form>
    </div>
  );
};
