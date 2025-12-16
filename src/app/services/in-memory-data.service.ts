import { Injectable } from '@angular/core';
import { Survey, QuestionType } from '../models/survey.model';

/**
 * In-Memory Database Service
 * Simulates a backend database for development and testing
 */
@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService {
  private surveys: Survey[] = [
    {
      id: '1',
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our services by sharing your feedback',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      questions: [
        {
          id: 'q1',
          text: 'What is your name?',
          type: QuestionType.TEXT,
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'q2',
          text: 'How satisfied are you with our service?',
          type: QuestionType.RADIO,
          required: true,
          options: [
            { id: 'opt1', label: 'Very Satisfied', value: '5' },
            { id: 'opt2', label: 'Satisfied', value: '4' },
            { id: 'opt3', label: 'Neutral', value: '3' },
            { id: 'opt4', label: 'Dissatisfied', value: '2' },
            { id: 'opt5', label: 'Very Dissatisfied', value: '1' }
          ]
        },
        {
          id: 'q3',
          text: 'Which features do you use most? (Select all that apply)',
          type: QuestionType.MULTIPLE_CHOICE,
          required: false,
          options: [
            { id: 'opt1', label: 'Mobile App', value: 'mobile' },
            { id: 'opt2', label: 'Web Portal', value: 'web' },
            { id: 'opt3', label: 'Customer Support', value: 'support' },
            { id: 'opt4', label: 'Analytics Dashboard', value: 'analytics' }
          ]
        },
        {
          id: 'q4',
          text: 'Any additional comments?',
          type: QuestionType.TEXT,
          required: false,
          placeholder: 'Share your thoughts...'
        }
      ]
    },
    {
      id: '2',
      title: 'Employee Engagement Survey',
      description: 'Annual employee engagement and satisfaction survey',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      questions: [
        {
          id: 'q1',
          text: 'Department',
          type: QuestionType.TEXT,
          required: true,
          placeholder: 'Enter your department'
        },
        {
          id: 'q2',
          text: 'How would you rate work-life balance?',
          type: QuestionType.RADIO,
          required: true,
          options: [
            { id: 'opt1', label: 'Excellent', value: '5' },
            { id: 'opt2', label: 'Good', value: '4' },
            { id: 'opt3', label: 'Average', value: '3' },
            { id: 'opt4', label: 'Poor', value: '2' },
            { id: 'opt5', label: 'Very Poor', value: '1' }
          ]
        },
        {
          id: 'q3',
          text: 'What benefits are most important to you?',
          type: QuestionType.MULTIPLE_CHOICE,
          required: true,
          options: [
            { id: 'opt1', label: 'Health Insurance', value: 'health' },
            { id: 'opt2', label: 'Retirement Plan', value: 'retirement' },
            { id: 'opt3', label: 'Flexible Hours', value: 'flexible' },
            { id: 'opt4', label: 'Remote Work', value: 'remote' },
            { id: 'opt5', label: 'Professional Development', value: 'development' }
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'Product Feedback Survey',
      description: 'Share your experience with our new product features',
      isActive: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25'),
      questions: [
        {
          id: 'q1',
          text: 'Email Address',
          type: QuestionType.TEXT,
          required: true,
          placeholder: 'your.email@example.com'
        },
        {
          id: 'q2',
          text: 'How easy was it to use the new features?',
          type: QuestionType.RADIO,
          required: true,
          options: [
            { id: 'opt1', label: 'Very Easy', value: '5' },
            { id: 'opt2', label: 'Easy', value: '4' },
            { id: 'opt3', label: 'Moderate', value: '3' },
            { id: 'opt4', label: 'Difficult', value: '2' },
            { id: 'opt5', label: 'Very Difficult', value: '1' }
          ]
        }
      ]
    }
  ];

  /**
   * Get all surveys from the in-memory database
   */
  getSurveys(): Survey[] {
    return [...this.surveys];
  }

  /**
   * Get a specific survey by ID
   */
  getSurveyById(id: string): Survey | undefined {
    return this.surveys.find(survey => survey.id === id);
  }

  /**
   * Add a new survey to the database
   */
  addSurvey(survey: Survey): Survey {
    this.surveys.push(survey);
    return survey;
  }

  /**
   * Update an existing survey
   */
  updateSurvey(id: string, updates: Partial<Survey>): Survey | undefined {
    const index = this.surveys.findIndex(survey => survey.id === id);
    if (index !== -1) {
      this.surveys[index] = {
        ...this.surveys[index],
        ...updates,
        updatedAt: new Date()
      };
      return this.surveys[index];
    }
    return undefined;
  }

  /**
   * Delete a survey from the database
   */
  deleteSurvey(id: string): boolean {
    const index = this.surveys.findIndex(survey => survey.id === id);
    if (index !== -1) {
      this.surveys.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Generate a unique ID for new surveys
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
