import React, { useState, useCallback, useRef } from 'react';
import { generateJson, generateChat } from '@/utils/ai';
import { MODELS } from '@/config';
import { mathWithMarkdown } from '@/utils/snippets';
import {
  PhysicsGoal,
  StepFeedback,
  FinalAnswerFeedback,
  physicsGoalJsonSchema,
  stepFeedbackJsonSchema,
  finalAnswerFeedbackJsonSchema
} from '../schemas';

type GamePhase = 
  | 'GOAL_SELECTION'
  | 'GENERATING_GOAL'
  | 'STEP_DESCRIPTION'
  | 'PROVIDING_FINAL_ANSWER'
  | 'GAME_COMPLETE';

export interface GameStep {
  stepNumber: number;
  description: string;
  feedback: StepFeedback | null;
  isComplete: boolean;
}

interface PhysicsGameSession {
  phase: GamePhase;
  currentGoal: PhysicsGoal | null;
  steps: GameStep[];
  currentStepNumber: number;
  finalAnswer: string;
  finalFeedback: FinalAnswerFeedback | null;
  isGameComplete: boolean;
}

export const usePhysicsGame = () => {
  const [session, setSession] = useState<PhysicsGameSession>({
    phase: 'GOAL_SELECTION',
    currentGoal: null,
    steps: [],
    currentStepNumber: 1,
    finalAnswer: '',
    finalFeedback: null,
    isGameComplete: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const startGame = useCallback(async (goalType: string) => {
    cancelPendingRequests();
    setIsLoading(true);
    setSession(prev => ({
      ...prev,
      phase: 'GENERATING_GOAL',
      currentGoal: null,
      steps: [],
      currentStepNumber: 1,
      finalAnswer: '',
      finalFeedback: null,
      isGameComplete: false
    }));

    try {
      abortControllerRef.current = new AbortController();
      const modelId = Object.values(MODELS)[0];

      const prompt = `Create a physics problem for students to solve. The problem should be about: ${goalType}

The problem should:
- Be open-ended and require the student to determine their own approach
- Have a clear, specific goal (what they need to find/calculate)
- Include rich context and description of the scenario
- Be solvable through multiple possible methods
- Require the student to describe their methodology and reasoning
- Have a clear numerical answer
- Be appropriate for high school or early college level
- Involve real physics concepts and calculations

IMPORTANT: 
- Do NOT provide expected steps or methodology
- Do NOT give hints about how to solve the problem
- DO provide interesting context, scenario details, and background information
- The student should determine their own approach completely

Examples of good descriptive problems:
- "A physics student wants to determine Earth's gravitational acceleration using experimental methods. They have access to various equipment and can design their own experiment. What value do they find?"
- "An engineer needs to predict how far a projectile will travel horizontally when launched from a specific height. The projectile has known properties and the launch conditions can be measured. What is the horizontal distance?"
- "A scientist is studying the motion of an object and needs to determine its final speed after undergoing certain changes. The object's initial conditions and the forces acting on it can be observed. What is the final speed?"

${mathWithMarkdown}`;

      const response = await generateJson<PhysicsGoal>(
        modelId,
        { prompt },
        physicsGoalJsonSchema
      );

      setSession(prev => ({
        ...prev,
        phase: 'STEP_DESCRIPTION',
        currentGoal: response.data,
        steps: [],
        currentStepNumber: 1
      }));
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error generating physics goal:', error);
        setSession(prev => ({ ...prev, phase: 'GOAL_SELECTION' }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [cancelPendingRequests]);

  const submitStep = useCallback(async (stepDescription: string) => {
    if (!session.currentGoal) return;

    setIsLoading(true);

    try {
      const modelId = Object.values(MODELS)[0];
      
      // Create context about the current goal and previous steps
      const previousStepsContext = session.steps
        .filter(step => step.feedback?.isComplete)
        .map(step => `Step ${step.stepNumber}: ${step.description}`)
        .join('\n');

      const prompt = `You are a physics tutor helping a student solve this problem.

IMPORTANT CONTEXT: The student only sees this goal title: "${session.currentGoal.goal}"
The student does NOT see any description, setup details, or additional context about the problem.

Full problem context (for your reference only):
DESCRIPTION: ${session.currentGoal.description}

Previous completed steps:
${previousStepsContext || 'None yet'}

The student has described their next step as:
"${stepDescription}"

Evaluate this step and provide feedback. Consider:
1. Is this step logically sound and on the right track toward solving the goal?
2. Are there any errors in the student's approach or reasoning?
3. Is the step complete enough to move forward?
4. What suggestions do you have for improvement?
5. Does the student's approach make physical sense?

CRITICAL: Since the student only sees the goal title "${session.currentGoal.goal}" and has no other context, your feedback should:
- Provide helpful context about what this type of problem typically involves
- Guide them toward understanding the relevant physics concepts
- Help them think about what information they might need
- Do NOT assume they know any setup details or specific conditions

${mathWithMarkdown}`;

      const response = await generateJson<StepFeedback>(
        modelId,
        { prompt },
        stepFeedbackJsonSchema
      );

      const newStep: GameStep = {
        stepNumber: session.currentStepNumber,
        description: stepDescription,
        feedback: response.data,
        isComplete: response.data.isComplete
      };

      setSession(prev => ({
        ...prev,
        steps: [...prev.steps, newStep],
        currentStepNumber: response.data.isComplete ? prev.currentStepNumber + 1 : prev.currentStepNumber
      }));

      // If the step is complete and we have enough steps, suggest moving to final answer
      if (response.data.isComplete && session.steps.length >= 2) {
        // Check if we should move to final answer phase
        const completedSteps = session.steps.filter(step => step.feedback?.isComplete).length;
        if (completedSteps >= 3) { // Require at least 3 completed steps
          setSession(prev => ({ ...prev, phase: 'PROVIDING_FINAL_ANSWER' }));
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error evaluating step:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session.currentGoal, session.steps, session.currentStepNumber]);

  const submitFinalAnswer = useCallback(async (finalAnswer: string) => {
    if (!session.currentGoal) return;

    setIsLoading(true);

    try {
      const modelId = Object.values(MODELS)[0];
      
      // Create context about all the steps taken
      const stepsContext = session.steps
        .map(step => `Step ${step.stepNumber}: ${step.description}`)
        .join('\n');

      const prompt = `You are a physics tutor evaluating a student's final answer.

PROBLEM: ${session.currentGoal.goal}
DESCRIPTION: ${session.currentGoal.description}
CORRECT ANSWER: ${session.currentGoal.correctAnswer}
EXPECTED UNITS: ${session.currentGoal.units || 'N/A'}

The student's solution steps were:
${stepsContext}

The student's final answer is: "${finalAnswer}"

Evaluate this final answer. Consider:
1. Is the numerical value correct (within reasonable tolerance)?
2. Are the units correct?
3. Does the answer make physical sense?
4. Provide constructive feedback

${mathWithMarkdown}`;

      const response = await generateJson<FinalAnswerFeedback>(
        modelId,
        { prompt },
        finalAnswerFeedbackJsonSchema
      );

      setSession(prev => ({
        ...prev,
        finalAnswer,
        finalFeedback: response.data,
        isGameComplete: response.data.gameComplete,
        phase: response.data.gameComplete ? 'GAME_COMPLETE' : 'PROVIDING_FINAL_ANSWER'
      }));
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error evaluating final answer:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session.currentGoal, session.steps]);

  const resetGame = useCallback(() => {
    cancelPendingRequests();
    setSession({
      phase: 'GOAL_SELECTION',
      currentGoal: null,
      steps: [],
      currentStepNumber: 1,
      finalAnswer: '',
      finalFeedback: null,
      isGameComplete: false
    });
    setIsLoading(false);
  }, [cancelPendingRequests]);

  const moveToFinalAnswer = useCallback(() => {
    setSession(prev => ({ ...prev, phase: 'PROVIDING_FINAL_ANSWER' }));
  }, []);

  return {
    phase: session.phase,
    currentGoal: session.currentGoal,
    steps: session.steps,
    currentStepNumber: session.currentStepNumber,
    finalAnswer: session.finalAnswer,
    finalFeedback: session.finalFeedback,
    isGameComplete: session.isGameComplete,
    isLoading,
    startGame,
    submitStep,
    submitFinalAnswer,
    resetGame,
    moveToFinalAnswer
  };
};
