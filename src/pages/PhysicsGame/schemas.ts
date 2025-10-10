import * as z from "zod";

const physicsGoalSchema = z.object({
  goal: z.string().describe('The physics problem or goal the student needs to solve'),
  description: z.string().describe('A detailed description of what the student needs to accomplish'),
  expectedSteps: z.array(z.string()).optional().describe('The key steps that should be involved in solving this problem (for AI evaluation only)'),
  correctAnswer: z.string().describe('The correct final answer to the problem'),
  units: z.string().optional().describe('The expected units for the answer (e.g., m/s², N, J)')
}).describe('A physics problem goal with expected solution steps');

const stepFeedbackSchema = z.object({
  isValid: z.boolean().describe('Whether the described step is valid and on the right track'),
  feedback: z.string().describe('Detailed feedback about the step, including corrections if needed'),
  suggestions: z.array(z.string()).optional().describe('Optional suggestions for improvement or next steps'),
  isComplete: z.boolean().describe('Whether this step is complete and the student can move to the next step')
}).describe('Feedback for a student\'s described step');

const finalAnswerFeedbackSchema = z.object({
  isCorrect: z.boolean().describe('Whether the final answer is correct'),
  feedback: z.string().describe('Detailed feedback about the final answer'),
  correctAnswer: z.string().describe('The correct answer if the student was wrong'),
  explanation: z.string().describe('Explanation of why the correct answer is right'),
  gameComplete: z.boolean().describe('Whether the game is now complete')
}).describe('Feedback for the student\'s final answer');

export type PhysicsGoal = z.infer<typeof physicsGoalSchema>;
export type StepFeedback = z.infer<typeof stepFeedbackSchema>;
export type FinalAnswerFeedback = z.infer<typeof finalAnswerFeedbackSchema>;

export const physicsGoalJsonSchema = z.toJSONSchema(physicsGoalSchema);
export const stepFeedbackJsonSchema = z.toJSONSchema(stepFeedbackSchema);
export const finalAnswerFeedbackJsonSchema = z.toJSONSchema(finalAnswerFeedbackSchema);
