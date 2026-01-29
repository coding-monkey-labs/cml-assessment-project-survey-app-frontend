import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LinkService } from '../../services/link.service';
import { Link, Category, Tag, LinkSource, CreateLinkDto, UpdateLinkDto } from '../../models/link.model';

@Component({
  selector: 'app-link-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="link-form-container container">
      <div class="form-card">
        <!-- Header -->
        <div class="form-header">
          <a routerLink="/links" class="btn-back">
            <i class="bi bi-arrow-left"></i>
          </a>
          <div>
            <h1>{{ isEditMode ? 'Edit Link' : 'Add New Link' }}</h1>
            <p class="text-muted">{{ isEditMode ? 'Update link details' : 'Save a link, screenshot, or bookmark' }}</p>
          </div>
        </div>

        <!-- Link Type Tabs -->
        <div class="type-tabs" *ngIf="!isEditMode">
          <button
            class="type-tab"
            [class.active]="linkType === 'url'"
            (click)="linkType = 'url'"
          >
            <i class="bi bi-link-45deg"></i>
            <span>URL</span>
          </button>
          <button
            class="type-tab"
            [class.active]="linkType === 'screenshot'"
            (click)="linkType = 'screenshot'"
          >
            <i class="bi bi-image"></i>
            <span>Screenshot</span>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #linkForm="ngForm">
          <!-- URL Input Section -->
          <div class="form-section" *ngIf="linkType === 'url'">
            <label class="form-label">URL *</label>
            <div class="url-input-group">
              <input
                type="url"
                class="form-control"
                [(ngModel)]="formData.url"
                name="url"
                placeholder="https://example.com/article"
                [required]="linkType === 'url'"
                (blur)="onUrlBlur()"
              >
              <button
                type="button"
                class="btn btn-outline-primary"
                (click)="parseUrl()"
                [disabled]="!formData.url || isParsingUrl"
              >
                <i class="bi" [ngClass]="isParsingUrl ? 'bi-hourglass-split' : 'bi-magic'"></i>
                {{ isParsingUrl ? 'Parsing...' : 'Parse' }}
              </button>
            </div>
            <small class="form-text text-muted">Paste a URL and click Parse to auto-fill details</small>
          </div>

          <!-- Screenshot Upload Section -->
          <div class="form-section" *ngIf="linkType === 'screenshot'">
            <label class="form-label">Screenshot *</label>
            <div
              class="upload-zone"
              [class.dragover]="isDragging"
              [class.has-file]="screenshotFile"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              <div *ngIf="!screenshotPreview" class="upload-placeholder">
                <i class="bi bi-cloud-upload"></i>
                <p>Drag & drop a screenshot here</p>
                <span>or</span>
                <label class="btn btn-outline-primary">
                  Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    (change)="onFileSelect($event)"
                    hidden
                  >
                </label>
              </div>
              <div *ngIf="screenshotPreview" class="upload-preview">
                <img [src]="screenshotPreview" alt="Screenshot preview">
                <button type="button" class="btn-remove" (click)="removeScreenshot()">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div class="form-section">
            <label class="form-label">Title *</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="formData.title"
              name="title"
              placeholder="Enter a descriptive title"
              required
            >
          </div>

          <!-- Description -->
          <div class="form-section">
            <label class="form-label">Description</label>
            <textarea
              class="form-control"
              [(ngModel)]="formData.description"
              name="description"
              rows="3"
              placeholder="Add a description or notes..."
            ></textarea>
          </div>

          <!-- Category -->
          <div class="form-section">
            <label class="form-label">Category</label>
            <select class="form-select" [(ngModel)]="formData.categoryId" name="categoryId">
              <option [ngValue]="undefined">-- Select Category --</option>
              <option *ngFor="let cat of categories" [value]="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Tags -->
          <div class="form-section">
            <label class="form-label">Tags</label>
            <div class="tags-input">
              <div class="selected-tags">
                <span
                  *ngFor="let tag of selectedTags; let i = index"
                  class="selected-tag"
                  [style.backgroundColor]="getTagColor(tag) + '20'"
                  [style.color]="getTagColor(tag)"
                >
                  #{{ tag }}
                  <button type="button" (click)="removeTag(i)">
                    <i class="bi bi-x"></i>
                  </button>
                </span>
              </div>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="newTag"
                name="newTag"
                placeholder="Type and press Enter to add tags"
                (keydown.enter)="addTag($event)"
              >
            </div>
            <div class="suggested-tags" *ngIf="availableTags.length > 0">
              <span class="suggestion-label">Suggestions:</span>
              <button
                type="button"
                *ngFor="let tag of availableTags.slice(0, 5)"
                class="suggestion-tag"
                (click)="addSuggestedTag(tag)"
                [disabled]="selectedTags.includes(tag.name)"
              >
                #{{ tag.name }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-section">
            <label class="form-label">Personal Notes</label>
            <textarea
              class="form-control"
              [(ngModel)]="formData.notes"
              name="notes"
              rows="2"
              placeholder="Add private notes (only visible to you)..."
            ></textarea>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <a routerLink="/links" class="btn btn-outline-secondary">Cancel</a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!isFormValid() || isSaving"
            >
              <span *ngIf="isSaving">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </span>
              <span *ngIf="!isSaving">
                <i class="bi bi-check-lg me-2"></i>
                {{ isEditMode ? 'Update Link' : 'Save Link' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .link-form-container {
      padding: 2rem 1rem;
      max-width: 800px;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      padding: 2rem;
    }

    .form-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn-back {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: #f3f4f6;
      color: #374151;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #e5e7eb;
    }

    .form-header h1 {
      font-size: 1.5rem;
      margin: 0;
    }

    .form-header p {
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
    }

    /* Type Tabs */
    .type-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      padding: 0.25rem;
      background: #f3f4f6;
      border-radius: 10px;
    }

    .type-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: #6b7280;
      font-weight: 500;
      transition: all 0.2s;
    }

    .type-tab:hover {
      color: #374151;
    }

    .type-tab.active {
      background: white;
      color: #f59e0b;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }

    .type-tab i {
      font-size: 1.25rem;
    }

    /* Form Sections */
    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      display: block;
    }

    /* URL Input */
    .url-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .url-input-group input {
      flex: 1;
    }

    /* Upload Zone */
    .upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      transition: all 0.2s;
      background: #fafafa;
    }

    .upload-zone.dragover {
      border-color: #f59e0b;
      background: #fef3c7;
    }

    .upload-zone.has-file {
      padding: 0;
      border-style: solid;
    }

    .upload-placeholder i {
      font-size: 3rem;
      color: #d1d5db;
      margin-bottom: 1rem;
    }

    .upload-placeholder p {
      margin: 0 0 0.5rem;
      color: #6b7280;
    }

    .upload-placeholder span {
      display: block;
      color: #9ca3af;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .upload-preview {
      position: relative;
    }

    .upload-preview img {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 10px;
    }

    .btn-remove {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(0,0,0,0.6);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove:hover {
      background: #dc2626;
    }

    /* Tags Input */
    .tags-input {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
    }

    .tags-input input {
      flex: 1;
      min-width: 150px;
      border: none;
      outline: none;
      padding: 0.25rem;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .selected-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .selected-tag button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
    }

    .selected-tag button:hover {
      opacity: 1;
    }

    .suggested-tags {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .suggestion-label {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .suggestion-tag {
      background: #f3f4f6;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion-tag:hover:not(:disabled) {
      background: #fef3c7;
      color: #d97706;
    }

    .suggestion-tag:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .form-card {
        padding: 1.5rem;
      }

      .url-input-group {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class LinkFormComponent implements OnInit, OnDestroy {
  isEditMode = false;
  linkId?: string;
  linkType: 'url' | 'screenshot' = 'url';

  formData: {
    url: string;
    title: string;
    description: string;
    categoryId?: string;
    notes: string;
  } = {
    url: '',
    title: '',
    description: '',
    categoryId: undefined,
    notes: ''
  };

  selectedTags: string[] = [];
  newTag = '';

  categories: Category[] = [];
  availableTags: Tag[] = [];

  screenshotFile?: File;
  screenshotPreview?: string;
  isDragging = false;

  isParsingUrl = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private linkService: LinkService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load categories and tags
    this.linkService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);

    this.linkService.getAllTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tags => this.availableTags = tags);

    // Check if edit mode
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.linkId = params['id'];
        this.loadLink(params['id']);
      }
    });

    // Check for screenshot type from query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['type'] === 'screenshot') {
        this.linkType = 'screenshot';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLink(id: string): void {
    this.linkService.getLinkById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(link => {
        if (link) {
          this.formData = {
            url: link.url,
            title: link.title,
            description: link.description || '',
            categoryId: link.categoryId,
            notes: link.notes || ''
          };
          this.selectedTags = link.tags.map(t => t.name);
          if (link.screenshot) {
            this.linkType = 'screenshot';
            this.screenshotPreview = link.screenshot.fileUrl;
          }
        }
      });
  }

  onUrlBlur(): void {
    if (this.formData.url && !this.formData.title) {
      this.parseUrl();
    }
  }

  parseUrl(): void {
    if (!this.formData.url) return;

    this.isParsingUrl = true;
    this.linkService.parseUrl(this.formData.url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metadata) => {
          if (!this.formData.title && metadata.title) {
            this.formData.title = metadata.title;
          }
          this.isParsingUrl = false;
        },
        error: () => {
          this.isParsingUrl = false;
        }
      });
  }

  // File handling
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    this.screenshotFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.screenshotPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Auto-fill title from filename if empty
    if (!this.formData.title) {
      this.formData.title = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  removeScreenshot(): void {
    this.screenshotFile = undefined;
    this.screenshotPreview = undefined;
  }

  // Tags handling
  addTag(event: Event): void {
    event.preventDefault();
    const tag = this.newTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
    }
    this.newTag = '';
  }

  addSuggestedTag(tag: Tag): void {
    if (!this.selectedTags.includes(tag.name)) {
      this.selectedTags.push(tag.name);
    }
  }

  removeTag(index: number): void {
    this.selectedTags.splice(index, 1);
  }

  getTagColor(tagName: string): string {
    const tag = this.availableTags.find(t => t.name === tagName);
    return tag?.color || '#6b7280';
  }

  isFormValid(): boolean {
    if (this.linkType === 'url') {
      return !!(this.formData.url && this.formData.title);
    } else {
      return !!(this.screenshotFile || this.screenshotPreview) && !!this.formData.title;
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.isSaving = true;

    if (this.isEditMode && this.linkId) {
      const updateDto: UpdateLinkDto = {
        title: this.formData.title,
        description: this.formData.description || undefined,
        categoryId: this.formData.categoryId,
        tags: this.selectedTags,
        notes: this.formData.notes || undefined
      };

      this.linkService.updateLink(this.linkId, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(['/links']);
          },
          error: () => {
            this.isSaving = false;
            alert('Failed to update link');
          }
        });
    } else {
      const createDto: CreateLinkDto = {
        url: this.linkType === 'url' ? this.formData.url : undefined,
        title: this.formData.title,
        description: this.formData.description || undefined,
        source: this.linkType === 'screenshot' ? LinkSource.SCREENSHOT : LinkSource.ARTICLE,
        categoryId: this.formData.categoryId,
        tags: this.selectedTags,
        notes: this.formData.notes || undefined,
        screenshot: this.screenshotFile
      };

      this.linkService.createLink(createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(['/links']);
          },
          error: () => {
            this.isSaving = false;
            alert('Failed to create link');
          }
        });
    }
  }
}
