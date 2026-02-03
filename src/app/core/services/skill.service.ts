import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import {
  Skill,
  SkillDefinition,
  SkillDraft,
  SkillExecution,
  SkillCategory,
} from '../models/skill.model';
import { environment } from '../../../environments/environment';

/**
 * Service for managing skills
 * Handles skill listing, loading, creation, and management
 */
@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Cache of loaded skills
  private skills$ = new BehaviorSubject<Skill[]>([]);
  private skillDefinitions = new Map<string, SkillDefinition>();

  /**
   * Observable of all available skills
   */
  get allSkills$(): Observable<Skill[]> {
    return this.skills$.asObservable();
  }

  /**
   * Load all available skills from the server
   */
  loadSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/api/v1/skills`).pipe(
      tap((skills) => {
        this.skills$.next(skills);
      })
    );
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: SkillCategory): Observable<Skill[]> {
    return this.skills$.pipe(
      map((skills) => skills.filter((s) => s.category === category))
    );
  }

  /**
   * Get active skills only
   */
  getActiveSkills(): Observable<Skill[]> {
    return this.skills$.pipe(map((skills) => skills.filter((s) => s.isActive)));
  }

  /**
   * Get system skills (built-in)
   */
  getSystemSkills(): Observable<Skill[]> {
    return this.skills$.pipe(map((skills) => skills.filter((s) => s.isSystem)));
  }

  /**
   * Get user-created skills
   */
  getUserSkills(): Observable<Skill[]> {
    return this.skills$.pipe(map((skills) => skills.filter((s) => !s.isSystem)));
  }

  /**
   * Get full skill definition by ID
   * This includes workflow steps, prompts, UI config, etc.
   */
  getSkillDefinition(skillId: string): Observable<SkillDefinition> {
    // Check cache first
    const cached = this.skillDefinitions.get(skillId);
    if (cached) {
      return new Observable((subscriber) => {
        subscriber.next(cached);
        subscriber.complete();
      });
    }

    return this.http
      .get<SkillDefinition>(`${this.apiUrl}/api/v1/skills/${skillId}`)
      .pipe(
        tap((definition) => {
          this.skillDefinitions.set(skillId, definition);
        })
      );
  }

  /**
   * Get skill by ID (basic info only)
   */
  getSkill(skillId: string): Observable<Skill | undefined> {
    return this.skills$.pipe(
      map((skills) => skills.find((s) => s.id === skillId))
    );
  }

  /**
   * Create a new skill from a draft
   * This generates the MD file on the server
   */
  createSkill(draft: SkillDraft): Observable<Skill> {
    return this.http.post<Skill>(`${this.apiUrl}/api/v1/skills`, draft).pipe(
      tap((skill) => {
        const current = this.skills$.value;
        this.skills$.next([...current, skill]);
      })
    );
  }

  /**
   * Update an existing skill
   */
  updateSkill(skillId: string, draft: Partial<SkillDraft>): Observable<Skill> {
    return this.http
      .put<Skill>(`${this.apiUrl}/api/v1/skills/${skillId}`, draft)
      .pipe(
        tap((skill) => {
          const current = this.skills$.value;
          const index = current.findIndex((s) => s.id === skillId);
          if (index >= 0) {
            current[index] = skill;
            this.skills$.next([...current]);
          }
          // Clear cached definition
          this.skillDefinitions.delete(skillId);
        })
      );
  }

  /**
   * Delete a skill
   */
  deleteSkill(skillId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/v1/skills/${skillId}`).pipe(
      tap(() => {
        const current = this.skills$.value;
        this.skills$.next(current.filter((s) => s.id !== skillId));
        this.skillDefinitions.delete(skillId);
      })
    );
  }

  /**
   * Toggle skill active status
   */
  toggleSkillStatus(skillId: string): Observable<Skill> {
    return this.http
      .post<Skill>(`${this.apiUrl}/api/v1/skills/${skillId}/toggle`, {})
      .pipe(
        tap((skill) => {
          const current = this.skills$.value;
          const index = current.findIndex((s) => s.id === skillId);
          if (index >= 0) {
            current[index] = skill;
            this.skills$.next([...current]);
          }
        })
      );
  }

  /**
   * Get skill execution history
   */
  getSkillExecutions(
    skillId: string,
    limit = 20
  ): Observable<SkillExecution[]> {
    return this.http.get<SkillExecution[]>(
      `${this.apiUrl}/api/v1/skills/${skillId}/executions`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * Test a skill with sample input
   */
  testSkill(
    skillId: string,
    testInput: Record<string, unknown>
  ): Observable<SkillExecution> {
    return this.http.post<SkillExecution>(
      `${this.apiUrl}/api/v1/skills/${skillId}/test`,
      { input: testInput }
    );
  }

  /**
   * Validate a skill draft before saving
   */
  validateSkillDraft(draft: SkillDraft): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(
      `${this.apiUrl}/api/v1/skills/validate`,
      draft
    );
  }

  /**
   * Get skill template for a category
   */
  getSkillTemplate(category: SkillCategory): Observable<SkillDraft> {
    return this.http.get<SkillDraft>(
      `${this.apiUrl}/api/v1/skills/templates/${category}`
    );
  }

  /**
   * Search skills by name or description
   */
  searchSkills(query: string): Observable<Skill[]> {
    const lowerQuery = query.toLowerCase();
    return this.skills$.pipe(
      map((skills) =>
        skills.filter(
          (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.description.toLowerCase().includes(lowerQuery) ||
            s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
        )
      )
    );
  }

  /**
   * Get skill categories with counts
   */
  getCategoriesWithCounts(): Observable<CategoryCount[]> {
    return this.skills$.pipe(
      map((skills) => {
        const counts = new Map<SkillCategory, number>();
        skills.forEach((skill) => {
          const current = counts.get(skill.category) || 0;
          counts.set(skill.category, current + 1);
        });
        return Array.from(counts.entries()).map(([category, count]) => ({
          category,
          count,
        }));
      })
    );
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationWarning {
  field: string;
  message: string;
}

interface CategoryCount {
  category: SkillCategory;
  count: number;
}
