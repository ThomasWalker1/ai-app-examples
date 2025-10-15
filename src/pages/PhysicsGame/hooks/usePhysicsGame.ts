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
  completedRequiredSteps: boolean[];
  shownHints: boolean[];
  failedAttempts: number[];
  revealedAnswers: boolean[];
}

export const usePhysicsGame = () => {
  const [session, setSession] = useState<PhysicsGameSession>({
    phase: 'GOAL_SELECTION',
    currentGoal: null,
    steps: [],
    currentStepNumber: 1,
    finalAnswer: '',
    finalFeedback: null,
    isGameComplete: false,
    completedRequiredSteps: [],
    shownHints: [],
    failedAttempts: [],
    revealedAnswers: []
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

For each required step, provide both:
1. A clear step description (what needs to be done)
2. A helpful hint (what the student should think about or consider)

Example step structure:
{
  "step": "Measure the period of a simple pendulum",
  "hint": "Consider what factors might affect the pendulum's period and how you could measure time accurately"
}

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
        currentStepNumber: 1,
        completedRequiredSteps: new Array(response.data.requiredSteps.length).fill(false),
        shownHints: new Array(response.data.requiredSteps.length).fill(false),
        failedAttempts: new Array(response.data.requiredSteps.length).fill(0),
        revealedAnswers: new Array(response.data.requiredSteps.length).fill(false)
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

REQUIRED STEPS TO COMPLETE THE PROBLEM:
${session.currentGoal.requiredSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

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
6. Which of the required steps (if any) does this student step accomplish?

CRITICAL: Since the student only sees the goal title "${session.currentGoal.goal}" and has no other context, your feedback should:
- Provide helpful context about what this type of problem typically involves
- Guide them toward understanding the relevant physics concepts
- Help them think about what information they might need
- Do NOT assume they know any setup details or specific conditions
- If the step accomplishes one of the required steps, indicate which one (0-based index)

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

      // Update completed required steps if a step was completed
      let newCompletedSteps = [...session.completedRequiredSteps];
      let newShownHints = [...session.shownHints];
      let newFailedAttempts = [...session.failedAttempts];
      
      if (response.data.isComplete && response.data.completedRequiredStep !== undefined) {
        newCompletedSteps[response.data.completedRequiredStep] = true;
      } else {
        // Track failed attempts and show hints after 2 failed attempts
        const currentStepIndex = session.currentStepNumber - 1;
        if (currentStepIndex < newFailedAttempts.length) {
          newFailedAttempts[currentStepIndex]++;
          if (newFailedAttempts[currentStepIndex] >= 2 && !newShownHints[currentStepIndex]) {
            newShownHints[currentStepIndex] = true;
          }
        }
      }

      setSession(prev => ({
        ...prev,
        steps: [...prev.steps, newStep],
        currentStepNumber: response.data.isComplete ? prev.currentStepNumber + 1 : prev.currentStepNumber,
        completedRequiredSteps: newCompletedSteps,
        shownHints: newShownHints,
        failedAttempts: newFailedAttempts
      }));

      // Check if all required steps are completed
      const allStepsCompleted = newCompletedSteps.every(completed => completed);
      if (allStepsCompleted) {
        setSession(prev => ({ ...prev, phase: 'PROVIDING_FINAL_ANSWER' }));
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
      isGameComplete: false,
      completedRequiredSteps: [],
      shownHints: [],
      failedAttempts: [],
      revealedAnswers: []
    });
    setIsLoading(false);
  }, [cancelPendingRequests]);

  const moveToFinalAnswer = useCallback(() => {
    setSession(prev => ({ ...prev, phase: 'PROVIDING_FINAL_ANSWER' }));
  }, []);

  const revealAnswer = useCallback((stepIndex: number) => {
    setSession(prev => ({
      ...prev,
      revealedAnswers: prev.revealedAnswers.map((revealed, index) => 
        index === stepIndex ? true : revealed
      )
    }));
  }, []);

  const revealAllAnswers = useCallback(() => {
    setSession(prev => ({
      ...prev,
      revealedAnswers: prev.revealedAnswers.map(() => true)
    }));
  }, []);

  return {
    phase: session.phase,
    currentGoal: session.currentGoal,
    steps: session.steps,
    currentStepNumber: session.currentStepNumber,
    finalAnswer: session.finalAnswer,
    finalFeedback: session.finalFeedback,
    isGameComplete: session.isGameComplete,
    completedRequiredSteps: session.completedRequiredSteps,
    shownHints: session.shownHints,
    revealedAnswers: session.revealedAnswers,
    isLoading,
    startGame,
    submitStep,
    submitFinalAnswer,
    resetGame,
    moveToFinalAnswer,
    revealAnswer,
    revealAllAnswers
  };
};
