import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Survey, CreateSurveyDto, UpdateSurveyDto } from '../models/survey.model';
import { InMemoryDataService } from './in-memory-data.service';

/**
 * Survey Service
 * Manages all survey-related operations with reactive data streams
 * Simulates async API calls with delays for realistic UX
 */
@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  public surveys$ = this.surveysSubject.asObservable();

  constructor(private inMemoryDb: InMemoryDataService) {
    this.loadSurveys();
  }

  /**
   * Load all surveys from the database
   */
  private loadSurveys(): void {
    const surveys = this.inMemoryDb.getSurveys();
    this.surveysSubject.next(surveys);
  }

  /**
   * Get all surveys as an observable
   */
  getAllSurveys(): Observable<Survey[]> {
    return of(this.inMemoryDb.getSurveys()).pipe(
      delay(300) // Simulate network delay
    );
  }

  /**
   * Get active surveys only
   */
  getActiveSurveys(): Observable<Survey[]> {
    return this.getAllSurveys().pipe(
      map(surveys => surveys.filter(survey => survey.isActive))
    );
  }

  /**
   * Get a specific survey by ID
   */
  getSurveyById(id: string): Observable<Survey | undefined> {
    return of(this.inMemoryDb.getSurveyById(id)).pipe(
      delay(200)
    );
  }

  /**
   * Create a new survey
   */
  createSurvey(surveyDto: CreateSurveyDto): Observable<Survey> {
    const newSurvey: Survey = {
      id: this.inMemoryDb.generateId(),
      title: surveyDto.title,
      description: surveyDto.description,
      questions: surveyDto.questions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = this.inMemoryDb.addSurvey(newSurvey);
    this.loadSurveys(); // Refresh the surveys list

    return of(created).pipe(
      delay(300)
    );
  }

  /**
   * Update an existing survey
   */
  updateSurvey(id: string, updates: UpdateSurveyDto): Observable<Survey> {
    const updated = this.inMemoryDb.updateSurvey(id, updates);

    if (!updated) {
      return throwError(() => new Error(`Survey with id ${id} not found`));
    }

    this.loadSurveys(); // Refresh the surveys list

    return of(updated).pipe(
      delay(300)
    );
  }

  /**
   * Delete a survey
   *
   * AssessmentToDo #1: SERVICE LAYER BUG
   * 
   * Issue: After deleting a survey, the list doesn't refresh properly.
   * The survey appears deleted but reappears when navigating away and back.
   * 
   * Fix: Ensure the surveys list is properly refreshed after deletion.
   * 
   * Hint: Check what happens after a successful deletion.
   */
  deleteSurvey(id: string): Observable<boolean> {
    const deleted = this.inMemoryDb.deleteSurvey(id);

    // BUG: Commented out the refresh - surveys list won't update!
    
    return of(deleted).pipe(
      delay(200)
    );
  }

  /**
   * Toggle survey active status
   */
  toggleSurveyStatus(id: string): Observable<Survey> {
    const survey = this.inMemoryDb.getSurveyById(id);

    if (!survey) {
      return throwError(() => new Error(`Survey with id ${id} not found`));
    }

    return this.updateSurvey(id, { isActive: !survey.isActive });
  }

  /**
   * Search surveys by title or description
   */
  searchSurveys(query: string): Observable<Survey[]> {
    return this.getAllSurveys().pipe(
      map(surveys =>
        surveys.filter(survey =>
          survey.title.toLowerCase().includes(query.toLowerCase()) ||
          survey.description.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * Get survey statistics
   */
  getSurveyStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
  }> {
    return this.getAllSurveys().pipe(
      map(surveys => ({
        total: surveys.length,
        active: surveys.filter(s => s.isActive).length,
        inactive: surveys.filter(s => !s.isActive).length
      }))
    );
  }
}
