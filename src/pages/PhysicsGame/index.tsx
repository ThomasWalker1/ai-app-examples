import React from 'react';
import { GoalSelection } from './components/GoalSelection';
import { GoalDisplay } from './components/GoalDisplay';
import { StepInput } from './components/StepInput';
import { StepFeedback } from './components/StepFeedback';
import { StepsProgress } from './components/StepsProgress';
import { FinalAnswerInput } from './components/FinalAnswerInput';
import { FinalAnswerFeedback } from './components/FinalAnswerFeedback';
import { usePhysicsGame } from './hooks/usePhysicsGame';
import './style.css';

export const PhysicsGame = () => {
  const {
    phase,
    currentGoal,
    steps,
    currentStepNumber,
    finalAnswer,
    finalFeedback,
    isGameComplete,
    isLoading,
    startGame,
    submitStep,
    submitFinalAnswer,
    resetGame,
    moveToFinalAnswer
  } = usePhysicsGame();

  return (
    <div className="physics-game">
      <div className="game-header">
        <h1>🧪 Physics Problem Solver</h1>
        <p>Work through physics problems step by step with AI guidance</p>
        {(phase !== 'GOAL_SELECTION' && phase !== 'GENERATING_GOAL') && (
          <button className="reset-btn" onClick={resetGame}>
            Start New Problem
          </button>
        )}
      </div>

      {phase === 'GOAL_SELECTION' && (
        <GoalSelection 
          onSelectGoal={startGame} 
          isLoading={isLoading} 
        />
      )}

      {phase === 'GENERATING_GOAL' && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Creating your physics challenge...</p>
        </div>
      )}

      {phase === 'STEP_DESCRIPTION' && currentGoal && (
        <div className="game-content">
          <GoalDisplay goal={currentGoal} />
          
          <div className="game-main">
            <div className="steps-section">
              <StepsProgress 
                steps={steps}
                currentStepNumber={currentStepNumber}
                onMoveToFinalAnswer={moveToFinalAnswer}
              />
              
              {steps.map((step) => (
                <StepFeedback
                  key={step.stepNumber}
                  stepNumber={step.stepNumber}
                  description={step.description}
                  feedback={step.feedback!}
                />
              ))}
              
              <StepInput
                stepNumber={currentStepNumber}
                onSubmit={submitStep}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {phase === 'PROVIDING_FINAL_ANSWER' && currentGoal && (
        <div className="game-content">
          <GoalDisplay goal={currentGoal} />
          
          <div className="game-main">
            <div className="steps-section">
              <StepsProgress 
                steps={steps}
                currentStepNumber={currentStepNumber}
                onMoveToFinalAnswer={moveToFinalAnswer}
              />
              
              {steps.map((step) => (
                <StepFeedback
                  key={step.stepNumber}
                  stepNumber={step.stepNumber}
                  description={step.description}
                  feedback={step.feedback!}
                />
              ))}
            </div>
            
            <div className="final-answer-section">
              <FinalAnswerInput
                onSubmit={submitFinalAnswer}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {phase === 'GAME_COMPLETE' && finalFeedback && (
        <div className="game-content">
          <div className="game-main">
            <div className="steps-section">
              <StepsProgress 
                steps={steps}
                currentStepNumber={currentStepNumber}
                onMoveToFinalAnswer={moveToFinalAnswer}
              />
              
              {steps.map((step) => (
                <StepFeedback
                  key={step.stepNumber}
                  stepNumber={step.stepNumber}
                  description={step.description}
                  feedback={step.feedback!}
                />
              ))}
            </div>
            
            <div className="final-answer-section">
              <FinalAnswerFeedback
                answer={finalAnswer}
                feedback={finalFeedback}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
