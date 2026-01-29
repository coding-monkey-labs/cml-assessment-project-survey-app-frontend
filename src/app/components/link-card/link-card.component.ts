import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Link, LinkStatus } from '../../models/link.model';

@Component({
  selector: 'app-link-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="link-card" [class.list-view]="viewMode === 'list'" [class.has-summary]="link.aiSummary">
      <!-- Screenshot Preview -->
      <div class="card-image" *ngIf="link.screenshot?.fileUrl">
        <img [src]="link.screenshot.fileUrl" [alt]="link.title">
        <div class="image-overlay">
          <span class="badge bg-info">Screenshot</span>
        </div>
      </div>

      <!-- Card Header -->
      <div class="card-header">
        <div class="source-icon" [ngClass]="'source-' + link.source">
          <i class="bi" [ngClass]="getSourceIcon(link.source)"></i>
        </div>
        <div class="card-meta">
          <span class="source-label">{{ link.source }}</span>
          <span class="date">{{ link.createdAt | date:'mediumDate' }}</span>
        </div>
        <div class="card-actions">
          <button
            class="btn-icon"
            [class.active]="link.isFavorite"
            (click)="onFavoriteClick($event)"
            title="Toggle favorite"
          >
            <i class="bi" [ngClass]="link.isFavorite ? 'bi-star-fill' : 'bi-star'"></i>
          </button>
          <div class="dropdown">
            <button class="btn-icon" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" [routerLink]="['/edit', link.id]">
                  <i class="bi bi-pencil me-2"></i>Edit
                </a>
              </li>
              <li>
                <a class="dropdown-item" (click)="onArchiveClick($event)">
                  <i class="bi bi-archive me-2"></i>
                  {{ link.isArchived ? 'Unarchive' : 'Archive' }}
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" (click)="onDeleteClick($event)">
                  <i class="bi bi-trash me-2"></i>Delete
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <h3 class="card-title">
          <a
            *ngIf="link.url"
            [href]="link.url"
            target="_blank"
            rel="noopener"
            (click)="onLinkClick($event)"
          >
            {{ link.title }}
            <i class="bi bi-box-arrow-up-right"></i>
          </a>
          <span *ngIf="!link.url">{{ link.title }}</span>
        </h3>

        <p class="card-description" *ngIf="link.description">
          {{ link.description }}
        </p>

        <!-- AI Summary -->
        <div class="ai-summary" *ngIf="link.aiSummary">
          <div class="summary-header">
            <i class="bi bi-robot"></i>
            <span>AI Summary</span>
          </div>
          <p class="summary-text">{{ link.aiSummary.summary }}</p>
          <div class="key-points" *ngIf="link.aiSummary.keyPoints?.length">
            <span class="key-point" *ngFor="let point of link.aiSummary.keyPoints.slice(0, 3)">
              {{ point }}
            </span>
          </div>
        </div>

        <!-- Tags -->
        <div class="card-tags" *ngIf="link.tags?.length">
          <span
            *ngFor="let tag of link.tags"
            class="tag"
            [style.backgroundColor]="tag.color + '20'"
            [style.color]="tag.color"
          >
            #{{ tag.name }}
          </span>
        </div>

        <!-- Status Badges -->
        <div class="card-badges">
          <span class="badge bg-warning" *ngIf="link.status === 'pending'">
            <i class="bi bi-hourglass-split me-1"></i>Pending AI
          </span>
          <span class="badge bg-success" *ngIf="link.status === 'processed'">
            <i class="bi bi-check-circle me-1"></i>Processed
          </span>
          <span class="badge bg-secondary" *ngIf="link.isArchived">
            <i class="bi bi-archive me-1"></i>Archived
          </span>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <span class="read-count" *ngIf="link.readCount > 0">
          <i class="bi bi-eye me-1"></i>{{ link.readCount }} visits
        </span>
        <span class="last-visited" *ngIf="link.lastVisitedAt">
          Last: {{ link.lastVisitedAt | date:'shortDate' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .link-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }

    .link-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    /* List View */
    .link-card.list-view {
      flex-direction: row;
      align-items: center;
    }

    .link-card.list-view .card-image {
      width: 120px;
      height: 80px;
      flex-shrink: 0;
    }

    .link-card.list-view .card-body {
      flex: 1;
      padding: 1rem;
    }

    .link-card.list-view .card-header {
      padding: 0.5rem;
    }

    .link-card.list-view .ai-summary {
      display: none;
    }

    /* Card Image */
    .card-image {
      position: relative;
      height: 160px;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      gap: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      background: transparent;
    }

    .source-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .source-twitter { background: #e0f2fe; color: #0ea5e9; }
    .source-linkedin { background: #dbeafe; color: #2563eb; }
    .source-youtube { background: #fee2e2; color: #dc2626; }
    .source-github { background: #f3f4f6; color: #374151; }
    .source-article { background: #dbeafe; color: #1d4ed8; }
    .source-news { background: #fef3c7; color: #d97706; }
    .source-screenshot { background: #e0e7ff; color: #6366f1; }
    .source-manual { background: #f3f4f6; color: #6b7280; }
    .source-other { background: #f3f4f6; color: #6b7280; }

    .card-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .source-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
    }

    .date {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .card-actions {
      display: flex;
      gap: 0.25rem;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #9ca3af;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-icon.active {
      color: #f59e0b;
    }

    /* Card Body */
    .card-body {
      padding: 1rem;
      flex: 1;
    }

    .card-title {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      line-height: 1.4;
    }

    .card-title a {
      color: #1f2937;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .card-title a:hover {
      color: #f59e0b;
    }

    .card-title a i {
      font-size: 0.75rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .card-title a:hover i {
      opacity: 1;
    }

    .card-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 0.75rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* AI Summary */
    .ai-summary {
      background: #f0fdf4;
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #16a34a;
      margin-bottom: 0.5rem;
    }

    .summary-text {
      font-size: 0.8rem;
      color: #374151;
      margin: 0 0 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .key-points {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .key-point {
      font-size: 0.7rem;
      padding: 0.125rem 0.5rem;
      background: white;
      border-radius: 4px;
      color: #15803d;
    }

    /* Tags */
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-bottom: 0.75rem;
    }

    .tag {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
    }

    /* Badges */
    .card-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .card-badges .badge {
      font-size: 0.7rem;
      font-weight: 500;
    }

    /* Card Footer */
    .card-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #9ca3af;
      background: transparent;
    }

    .dropdown-item {
      cursor: pointer;
    }
  `]
})
export class LinkCardComponent {
  @Input() link!: Link;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  @Output() onFavorite = new EventEmitter<Link>();
  @Output() onArchive = new EventEmitter<Link>();
  @Output() onDelete = new EventEmitter<Link>();

  getSourceIcon(source: string): string {
    const icons: Record<string, string> = {
      'twitter': 'bi-twitter-x',
      'linkedin': 'bi-linkedin',
      'youtube': 'bi-youtube',
      'github': 'bi-github',
      'article': 'bi-file-text',
      'news': 'bi-newspaper',
      'screenshot': 'bi-image',
      'manual': 'bi-link-45deg',
      'other': 'bi-globe'
    };
    return icons[source] || 'bi-link-45deg';
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.onFavorite.emit(this.link);
  }

  onArchiveClick(event: Event): void {
    event.stopPropagation();
    this.onArchive.emit(this.link);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.onDelete.emit(this.link);
  }

  onLinkClick(event: Event): void {
    // Allow the link to open normally, just for tracking purposes
  }
}
