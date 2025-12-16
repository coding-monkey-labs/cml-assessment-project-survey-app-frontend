/**
 * Survey Data Models and Interfaces
 * Defines the structure for surveys and their components
 */

export enum QuestionType {
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  RADIO = 'radio'
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

/**
 * AssessmentToDo #5: DATA MODEL BUG
 * 
 * Issue: Questions can be created without text, causing display issues.
 * TypeScript is not catching cases where question text is missing.
 * 
 * Fix: Ensure the Question interface enforces required properties.
 * 
 * Hint: Check if all required properties are properly marked as non-optional.
 * 
 * Expected: Question text should always be required, not optional.
 */
export interface Question {
  id: string;
  text?: string;  // BUG: Should be required (string), not optional (string?)
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];  // For multiple choice and radio buttons
  placeholder?: string;         // For text inputs
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  responses: { [questionId: string]: any };
  submittedAt: Date;
}

/**
 * DTO for creating a new survey
 */
export interface CreateSurveyDto {
  title: string;
  description: string;
  questions: Question[];
}

/**
 * DTO for updating an existing survey
 */
export interface UpdateSurveyDto {
  title?: string;
  description?: string;
  questions?: Question[];
  isActive?: boolean;
}
