import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Survey } from '../../models/survey.model';
import { SurveyService } from '../../services/survey.service';

/**
 * Survey List Component
 * Displays all surveys with options to view, edit, delete, and toggle status
 * Self-sufficient component with its own state management
 */
@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit, OnDestroy {
  surveys: Survey[] = [];
  filteredSurveys: Survey[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';

  stats = {
    total: 0,
    active: 0,
    inactive: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private surveyService: SurveyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSurveys();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all surveys from the service
   */
  loadSurveys(): void {
    this.loading = true;
    this.error = null;

    this.surveyService.getAllSurveys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (surveys) => {
          this.surveys = surveys;
          this.filteredSurveys = surveys;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load surveys. Please try again.';
          this.loading = false;
          console.error('Error loading surveys:', err);
        }
      });
  }

  /**
   * Load survey statistics
   */
  loadStats(): void {
    this.surveyService.getSurveyStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (err) => {
          console.error('Error loading stats:', err);
        }
      });
  }

  /**
   * Search surveys by title or description
   */
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;

    if (!query.trim()) {
      this.filteredSurveys = this.surveys;
      return;
    }

    this.surveyService.searchSurveys(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (surveys) => {
          this.filteredSurveys = surveys;
        },
        error: (err) => {
          console.error('Error searching surveys:', err);
        }
      });
  }

  /**
   * Navigate to create a new survey
   */
  createNewSurvey(): void {
    this.router.navigate(['/survey-builder']);
  }

  /**
   * Navigate to edit an existing survey
   */
  editSurvey(surveyId: string): void {
    this.router.navigate(['/survey-builder', surveyId]);
  }

  /**
   * Delete a survey with confirmation
   */
  deleteSurvey(survey: Survey): void {
    if (confirm(`Are you sure you want to delete "${survey.title}"?`)) {
      this.surveyService.deleteSurvey(survey.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.loadSurveys();
              this.loadStats();
            }
          },
          error: (err) => {
            this.error = 'Failed to delete survey. Please try again.';
            console.error('Error deleting survey:', err);
          }
        });
    }
  }

  /**
   * Toggle survey active/inactive status
   */
  toggleStatus(survey: Survey): void {
    this.surveyService.toggleSurveyStatus(survey.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadSurveys();
          this.loadStats();
        },
        error: (err) => {
          this.error = 'Failed to update survey status. Please try again.';
          console.error('Error toggling status:', err);
        }
      });
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get badge class based on survey status
   */
  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-secondary';
  }

  /**
   * Get status text
   */
  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
