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
      <p>Explain what you would do in this step. Be specific about:</p>
      <ul>
        <li>What measurements you would take</li>
        <li>What equipment you would use</li>
        <li>What calculations you would perform</li>
        <li>Any assumptions you're making</li>
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
