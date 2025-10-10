import React, { useState } from 'react';

interface StepInputProps {
  stepNumber: number;
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

export const StepInput: React.FC<StepInputProps> = ({ stepNumber, onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description.trim());
      setDescription('');
    }
  };

  return (
    <div className="step-input">
      <h3>Step {stepNumber}: Describe Your Approach</h3>
      <p>Think about what you need to do next to solve this problem. Be specific about:</p>
      <ul>
        <li>What measurements or information you need to gather</li>
        <li>What equipment or methods you would use</li>
        <li>What calculations or analysis you would perform</li>
        <li>Any assumptions or simplifications you're making</li>
        <li>How this step helps you reach your goal</li>
      </ul>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your step in detail..."
          rows={6}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !description.trim()}>
          {isLoading ? 'Evaluating...' : 'Submit Step'}
        </button>
      </form>
    </div>
  );
};
