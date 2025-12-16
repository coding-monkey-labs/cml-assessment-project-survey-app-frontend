import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Survey, Question, QuestionType, QuestionOption } from '../../models/survey.model';
import { SurveyService } from '../../services/survey.service';

/**
 * Survey Builder Component
 * Allows users to create and edit surveys with various question types
 * Self-sufficient component with comprehensive survey building capabilities
 */
@Component({
  selector: 'app-survey-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey-builder.component.html',
  styleUrls: ['./survey-builder.component.css']
})
export class SurveyBuilderComponent implements OnInit, OnDestroy {
  survey: Partial<Survey> = {
    title: '',
    description: '',
    questions: []
  };

  editMode = false;
  surveyId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  successMessage: string | null = null;

  QuestionType = QuestionType;
  questionTypes = [
    { value: QuestionType.TEXT, label: 'Text Input', icon: 'bi-input-cursor-text' },
    { value: QuestionType.RADIO, label: 'Radio Buttons', icon: 'bi-ui-radios' },
    { value: QuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice', icon: 'bi-ui-checks' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private surveyService: SurveyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.surveyId = params.get('id');
        if (this.surveyId) {
          this.editMode = true;
          this.loadSurvey(this.surveyId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load existing survey for editing
   */
  loadSurvey(id: string): void {
    this.loading = true;
    this.error = null;

    this.surveyService.getSurveyById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (survey) => {
          if (survey) {
            this.survey = { ...survey };
          } else {
            this.error = 'Survey not found';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load survey';
          this.loading = false;
          console.error('Error loading survey:', err);
        }
      });
  }

  /**
   * Add a new question to the survey
   */
  addQuestion(type: QuestionType): void {
    const newQuestion: Question = {
      id: this.generateQuestionId(),
      text: '',
      type: type,
      required: false,
      placeholder: type === QuestionType.TEXT ? 'Enter your answer...' : undefined,
      options: this.needsOptions(type) ? this.getDefaultOptions() : undefined
    };

    this.survey.questions = [...(this.survey.questions || []), newQuestion];
  }

  /**
   * Remove a question from the survey
   */
  removeQuestion(questionId: string): void {
    if (confirm('Are you sure you want to remove this question?')) {
      this.survey.questions = this.survey.questions?.filter(q => q.id !== questionId) || [];
    }
  }

  /**
   * Move question up in the list
   */
  moveQuestionUp(index: number): void {
    if (index > 0 && this.survey.questions) {
      const questions = [...this.survey.questions];
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
      this.survey.questions = questions;
    }
  }

  /**
   * Move question down in the list
   */
  moveQuestionDown(index: number): void {
    if (this.survey.questions && index < this.survey.questions.length - 1) {
      const questions = [...this.survey.questions];
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
      this.survey.questions = questions;
    }
  }

  /**
   * Add a new option to a question
   */
  addOption(question: Question): void {
    if (!question.options) {
      question.options = [];
    }

    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      label: '',
      value: ''
    };

    question.options = [...question.options, newOption];
  }

  /**
   * Remove an option from a question
   */
  removeOption(question: Question, optionId: string): void {
    if (question.options && question.options.length > 1) {
      question.options = question.options.filter(opt => opt.id !== optionId);
    }
  }

  /**
   * Track options by ID for *ngFor
   */
  trackByOptionId(index: number, option: QuestionOption): string {
    return option.id;
  }

  /**
   * Track questions by ID for *ngFor
   */
  trackByQuestionId(index: number, question: Question): string {
    return question.id;
  }

  /**
   * Save the survey
   */
  saveSurvey(): void {
    if (!this.validateSurvey()) {
      return;
    }

    this.saving = true;
    this.error = null;
    this.successMessage = null;

    const saveOperation = this.editMode && this.surveyId
      ? this.surveyService.updateSurvey(this.surveyId, {
          title: this.survey.title,
          description: this.survey.description,
          questions: this.survey.questions
        })
      : this.surveyService.createSurvey({
          title: this.survey.title!,
          description: this.survey.description!,
          questions: this.survey.questions!
        });

    saveOperation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = `Survey ${this.editMode ? 'updated' : 'created'} successfully!`;
          this.saving = false;

          setTimeout(() => {
            this.router.navigate(['/surveys']);
          }, 1500);
        },
        error: (err) => {
          this.error = `Failed to ${this.editMode ? 'update' : 'create'} survey`;
          this.saving = false;
          console.error('Error saving survey:', err);
        }
      });
  }

  /**
   * Validate survey before saving
   *
   * AssessmentToDo #2: COMPONENT VALIDATION BUG
   * 
   * Issue: Users can save surveys without filling required fields.
   * Empty surveys, questions without text, and options without labels are being saved.
   * 
   * Fix: Implement proper validation to prevent saving invalid surveys.
   * Hint: The validation logic exists but is not being executed properly.
   * Expected behavior: Should validate title, description, questions, and options.
   */
  validateSurvey(): boolean {
    // BUG: Always returning true - bypassing all validation!
    return true;

    // The actual validation code below is unreachable!
    if (!this.survey.title?.trim()) {
      this.error = 'Survey title is required';
      return false;
    }

    if (!this.survey.description?.trim()) {
      this.error = 'Survey description is required';
      return false;
    }

    if (!this.survey.questions || this.survey.questions.length === 0) {
      this.error = 'At least one question is required';
      return false;
    }

    for (const question of this.survey.questions) {
      if (!question.text?.trim()) {
        this.error = 'All questions must have text';
        return false;
      }

      if (this.needsOptions(question.type)) {
        if (!question.options || question.options.length === 0) {
          this.error = `Question "${question.text}" must have at least one option`;
          return false;
        }

        for (const option of question.options) {
          if (!option.label?.trim() || !option.value?.trim()) {
            this.error = `All options for question "${question.text}" must have label and value`;
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Cancel editing and go back
   */
  cancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/surveys']);
    }
  }

  /**
   * Check if question type needs options
   */
  needsOptions(type: QuestionType): boolean {
    return type === QuestionType.RADIO || type === QuestionType.MULTIPLE_CHOICE;
  }

  /**
   * Get default options for new questions
   */
  getDefaultOptions(): QuestionOption[] {
    return [
      { id: 'opt-1', label: 'Option 1', value: 'option1' },
      { id: 'opt-2', label: 'Option 2', value: 'option2' }
    ];
  }

  /**
   * Generate unique question ID
   */
  generateQuestionId(): string {
    return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get icon for question type
   */
  getQuestionTypeIcon(type: QuestionType): string {
    const questionType = this.questionTypes.find(qt => qt.value === type);
    return questionType?.icon || 'bi-question-circle';
  }

  /**
   * Get label for question type
   */
  getQuestionTypeLabel(type: QuestionType): string {
    const questionType = this.questionTypes.find(qt => qt.value === type);
    return questionType?.label || 'Unknown';
  }
}
