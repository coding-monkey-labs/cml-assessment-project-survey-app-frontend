import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LinkService } from '../../services/link.service';
import { Category } from '../../models/link.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="categories-container container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1><i class="bi bi-folder me-2"></i>Categories</h1>
          <p class="text-muted">Organize your links into categories</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="bi bi-plus-lg me-2"></i>New Category
        </button>
      </div>

      <!-- Categories Grid -->
      <div class="categories-grid" *ngIf="categories.length > 0">
        <div class="category-card" *ngFor="let category of categories">
          <div class="category-icon" [style.backgroundColor]="category.color + '20'" [style.color]="category.color">
            <i class="bi" [ngClass]="category.icon"></i>
          </div>

          <div class="category-content">
            <h3>{{ category.name }}</h3>
            <p class="description" *ngIf="category.description">{{ category.description }}</p>
            <div class="category-meta">
              <span class="link-count">
                <i class="bi bi-link-45deg me-1"></i>
                {{ category.linkCount }} links
              </span>
              <span class="date">
                Created {{ category.createdAt | date:'mediumDate' }}
              </span>
            </div>
          </div>

          <div class="category-actions">
            <a [routerLink]="['/links']" [queryParams]="{category: category.id}" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-eye me-1"></i>View Links
            </a>
            <button class="btn btn-sm btn-outline-secondary" (click)="editCategory(category)">
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              (click)="deleteCategory(category)"
              [disabled]="category.linkCount > 0"
              [title]="category.linkCount > 0 ? 'Cannot delete category with links' : 'Delete category'"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="categories.length === 0">
        <i class="bi bi-folder-plus"></i>
        <h3>No categories yet</h3>
        <p>Create categories to organize your links</p>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="bi bi-plus-lg me-2"></i>Create First Category
        </button>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()"></div>
      <div class="modal-container" *ngIf="isModalOpen">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ editingCategory ? 'Edit Category' : 'New Category' }}</h2>
            <button class="btn-close" (click)="closeModal()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCategory()">
            <div class="modal-body">
              <!-- Name -->
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.name"
                  name="name"
                  placeholder="e.g., Tech Articles"
                  required
                >
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="2"
                  placeholder="Brief description of this category"
                ></textarea>
              </div>

              <!-- Color Picker -->
              <div class="form-group">
                <label class="form-label">Color</label>
                <div class="color-picker">
                  <button
                    type="button"
                    *ngFor="let color of colorOptions"
                    class="color-option"
                    [style.backgroundColor]="color"
                    [class.selected]="formData.color === color"
                    (click)="formData.color = color"
                  >
                    <i class="bi bi-check-lg" *ngIf="formData.color === color"></i>
                  </button>
                </div>
              </div>

              <!-- Icon Picker -->
              <div class="form-group">
                <label class="form-label">Icon</label>
                <div class="icon-picker">
                  <button
                    type="button"
                    *ngFor="let icon of iconOptions"
                    class="icon-option"
                    [class.selected]="formData.icon === icon"
                    (click)="formData.icon = icon"
                  >
                    <i class="bi" [ngClass]="icon"></i>
                  </button>
                </div>
              </div>

              <!-- Preview -->
              <div class="form-group">
                <label class="form-label">Preview</label>
                <div class="preview-card">
                  <div class="preview-icon" [style.backgroundColor]="formData.color + '20'" [style.color]="formData.color">
                    <i class="bi" [ngClass]="formData.icon"></i>
                  </div>
                  <span class="preview-name">{{ formData.name || 'Category Name' }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!formData.name || isSaving">
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingCategory ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categories-container {
      padding: 2rem 1rem;
      max-width: 1200px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      margin: 0;
    }

    .page-header p {
      margin: 0.25rem 0 0;
    }

    /* Categories Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .category-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .category-content {
      flex: 1;
      min-width: 0;
    }

    .category-content h3 {
      font-size: 1.1rem;
      margin: 0 0 0.25rem;
    }

    .category-content .description {
      font-size: 0.85rem;
      color: #6b7280;
      margin: 0 0 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .category-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .category-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .empty-state i {
      font-size: 4rem;
      color: #d1d5db;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }

    .modal-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1001;
      width: 90%;
      max-width: 500px;
    }

    .modal-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      font-size: 1.25rem;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
    }

    .btn-close:hover {
      color: #374151;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      display: block;
    }

    /* Color Picker */
    .color-picker {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .color-option {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: transform 0.2s;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: #374151;
    }

    /* Icon Picker */
    .icon-picker {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .icon-option {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      color: #6b7280;
      transition: all 0.2s;
    }

    .icon-option:hover {
      border-color: #d1d5db;
      background: #f9fafb;
    }

    .icon-option.selected {
      border-color: #f59e0b;
      background: #fef3c7;
      color: #d97706;
    }

    /* Preview */
    .preview-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .preview-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .preview-name {
      font-weight: 600;
      color: #374151;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .categories-grid {
        grid-template-columns: 1fr;
      }

      .category-card {
        flex-direction: column;
      }

      .category-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];

  isModalOpen = false;
  editingCategory?: Category;
  isSaving = false;

  formData = {
    name: '',
    description: '',
    color: '#3498db',
    icon: 'bi-folder'
  };

  colorOptions = [
    '#3498db', '#9b59b6', '#27ae60', '#e74c3c',
    '#f39c12', '#1abc9c', '#e67e22', '#2c3e50',
    '#16a085', '#8e44ad', '#d35400', '#c0392b'
  ];

  iconOptions = [
    'bi-folder', 'bi-code-slash', 'bi-robot', 'bi-briefcase',
    'bi-palette', 'bi-book', 'bi-tools', 'bi-lightbulb',
    'bi-globe', 'bi-camera', 'bi-music-note', 'bi-film',
    'bi-graph-up', 'bi-heart', 'bi-star', 'bi-lightning'
  ];

  private destroy$ = new Subject<void>();

  constructor(private linkService: LinkService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.linkService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);
  }

  openModal(): void {
    this.isModalOpen = true;
    this.editingCategory = undefined;
    this.formData = {
      name: '',
      description: '',
      color: '#3498db',
      icon: 'bi-folder'
    };
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingCategory = undefined;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.formData = {
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon
    };
    this.isModalOpen = true;
  }

  saveCategory(): void {
    if (!this.formData.name) return;

    this.isSaving = true;

    if (this.editingCategory) {
      this.linkService.updateCategory(this.editingCategory.id, {
        name: this.formData.name,
        description: this.formData.description || undefined,
        color: this.formData.color,
        icon: this.formData.icon
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadCategories();
        },
        error: () => {
          this.isSaving = false;
          alert('Failed to update category');
        }
      });
    } else {
      this.linkService.createCategory({
        name: this.formData.name,
        description: this.formData.description || undefined,
        color: this.formData.color,
        icon: this.formData.icon
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadCategories();
        },
        error: () => {
          this.isSaving = false;
          alert('Failed to create category');
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    if (category.linkCount > 0) {
      alert('Cannot delete a category that has links. Move or delete the links first.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.linkService.deleteCategory(category.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadCategories());
    }
  }
}
