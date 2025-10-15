import * as z from "zod";

const stepWithHintSchema = z.object({
  step: z.string().describe('The required step description'),
  hint: z.string().describe('A helpful hint or prompt for this step that can be shown if the student struggles')
});

const physicsGoalSchema = z.object({
  goal: z.string().describe('The physics problem or goal the student needs to solve'),
  description: z.string().describe('A detailed description of what the student needs to accomplish'),
  requiredSteps: z.array(stepWithHintSchema).min(4).max(6).describe('4-6 clear, specific steps that are required to solve this problem, each with a helpful hint'),
  correctAnswer: z.string().describe('The correct final answer to the problem'),
  units: z.string().optional().describe('The expected units for the answer (e.g., m/s², N, J)')
}).describe('A physics problem goal with required solution steps and hints');

const stepFeedbackSchema = z.object({
  isValid: z.boolean().describe('Whether the described step is valid and on the right track'),
  feedback: z.string().describe('Detailed feedback about the step, including corrections if needed'),
  suggestions: z.array(z.string()).optional().describe('Optional suggestions for improvement or next steps'),
  isComplete: z.boolean().describe('Whether this step is complete and the student can move to the next step'),
  completedRequiredStep: z.number().optional().describe('The index (0-based) of the required step that was completed, if any')
}).describe('Feedback for a student\'s described step');

const finalAnswerFeedbackSchema = z.object({
  isCorrect: z.boolean().describe('Whether the final answer is correct'),
  feedback: z.string().describe('Detailed feedback about the final answer'),
  correctAnswer: z.string().describe('The correct answer if the student was wrong'),
  explanation: z.string().describe('Explanation of why the correct answer is right'),
  gameComplete: z.boolean().describe('Whether the game is now complete')
}).describe('Feedback for the student\'s final answer');

export type StepWithHint = z.infer<typeof stepWithHintSchema>;
export type PhysicsGoal = z.infer<typeof physicsGoalSchema>;
export type StepFeedback = z.infer<typeof stepFeedbackSchema>;
export type FinalAnswerFeedback = z.infer<typeof finalAnswerFeedbackSchema>;

export const physicsGoalJsonSchema = z.toJSONSchema(physicsGoalSchema);
export const stepFeedbackJsonSchema = z.toJSONSchema(stepFeedbackSchema);
export const finalAnswerFeedbackJsonSchema = z.toJSONSchema(finalAnswerFeedbackSchema);
