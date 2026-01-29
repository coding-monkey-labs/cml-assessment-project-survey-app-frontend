import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LinkService } from '../../services/link.service';
import { LinkStats, Link, Category } from '../../models/link.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard container">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>Welcome to LinkHive</h1>
          <p class="text-muted">Your smart bookmark & link manager</p>
        </div>
        <a routerLink="/add" class="btn btn-primary btn-lg">
          <i class="bi bi-plus-lg me-2"></i>Add Link
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon bg-primary-light">
            <i class="bi bi-link-45deg"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalLinks }}</h3>
            <p>Total Links</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-warning-light">
            <i class="bi bi-star-fill"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.favoriteLinks }}</h3>
            <p>Favorites</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-info-light">
            <i class="bi bi-cpu"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.pendingProcessing }}</h3>
            <p>Pending AI Processing</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-secondary-light">
            <i class="bi bi-archive"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.archivedLinks }}</h3>
            <p>Archived</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Links -->
        <div class="content-section recent-links">
          <div class="section-header">
            <h2><i class="bi bi-clock-history me-2"></i>Recent Links</h2>
            <a routerLink="/links" class="btn btn-outline-primary btn-sm">View All</a>
          </div>

          <div class="links-list" *ngIf="stats?.recentLinks?.length; else noLinks">
            <div class="link-item" *ngFor="let link of stats.recentLinks">
              <div class="link-favicon">
                <img *ngIf="link.favicon" [src]="link.favicon" [alt]="link.title" (error)="onFaviconError($event)">
                <i *ngIf="!link.favicon" class="bi" [ngClass]="getSourceIcon(link.source)"></i>
              </div>
              <div class="link-info">
                <h4>
                  <a [href]="link.url" target="_blank" rel="noopener" *ngIf="link.url">{{ link.title }}</a>
                  <span *ngIf="!link.url">{{ link.title }}</span>
                </h4>
                <p class="link-meta">
                  <span class="source-badge" [ngClass]="'source-' + link.source">{{ link.source }}</span>
                  <span class="date">{{ link.createdAt | date:'mediumDate' }}</span>
                </p>
              </div>
              <div class="link-actions">
                <button class="btn-icon" (click)="toggleFavorite(link)" [class.active]="link.isFavorite">
                  <i class="bi" [ngClass]="link.isFavorite ? 'bi-star-fill' : 'bi-star'"></i>
                </button>
              </div>
            </div>
          </div>

          <ng-template #noLinks>
            <div class="empty-state">
              <i class="bi bi-inbox"></i>
              <p>No links yet. Add your first link!</p>
              <a routerLink="/add" class="btn btn-primary">Add Link</a>
            </div>
          </ng-template>
        </div>

        <!-- Categories -->
        <div class="content-section categories">
          <div class="section-header">
            <h2><i class="bi bi-folder me-2"></i>Categories</h2>
            <a routerLink="/categories" class="btn btn-outline-primary btn-sm">Manage</a>
          </div>

          <div class="categories-list" *ngIf="categories?.length">
            <a *ngFor="let cat of categories"
               [routerLink]="['/links']"
               [queryParams]="{category: cat.id}"
               class="category-item">
              <div class="category-icon" [style.backgroundColor]="cat.color + '20'" [style.color]="cat.color">
                <i class="bi" [ngClass]="cat.icon"></i>
              </div>
              <div class="category-info">
                <h4>{{ cat.name }}</h4>
                <span class="count">{{ cat.linkCount }} links</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Top Tags -->
        <div class="content-section tags">
          <div class="section-header">
            <h2><i class="bi bi-tags me-2"></i>Popular Tags</h2>
          </div>

          <div class="tags-cloud" *ngIf="stats?.topTags?.length">
            <a *ngFor="let tag of stats.topTags"
               [routerLink]="['/links']"
               [queryParams]="{tag: tag.id}"
               class="tag-item"
               [style.backgroundColor]="tag.color + '20'"
               [style.color]="tag.color"
               [style.borderColor]="tag.color">
              #{{ tag.name }}
              <span class="tag-count">{{ tag.usageCount }}</span>
            </a>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="content-section quick-actions">
          <div class="section-header">
            <h2><i class="bi bi-lightning me-2"></i>Quick Actions</h2>
          </div>

          <div class="actions-grid">
            <a routerLink="/add" class="action-card">
              <i class="bi bi-link-45deg"></i>
              <span>Add URL</span>
            </a>
            <a routerLink="/add" [queryParams]="{type: 'screenshot'}" class="action-card">
              <i class="bi bi-camera"></i>
              <span>Upload Screenshot</span>
            </a>
            <a routerLink="/favorites" class="action-card">
              <i class="bi bi-star"></i>
              <span>View Favorites</span>
            </a>
            <a routerLink="/archive" class="action-card">
              <i class="bi bi-archive"></i>
              <span>View Archive</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem 1rem;
      max-width: 1400px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .bg-primary-light { background: #e0f2fe; color: #0284c7; }
    .bg-warning-light { background: #fef3c7; color: #d97706; }
    .bg-info-light { background: #e0e7ff; color: #6366f1; }
    .bg-secondary-light { background: #f3f4f6; color: #6b7280; }

    .stat-content h3 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      line-height: 1;
    }

    .stat-content p {
      margin: 0.25rem 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .content-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .recent-links {
      grid-column: 1 / -1;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-header h2 {
      font-size: 1.125rem;
      margin: 0;
      color: #374151;
    }

    /* Links List */
    .links-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .link-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .link-item:hover {
      background: #f9fafb;
    }

    .link-favicon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .link-favicon img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .link-favicon i {
      font-size: 1.25rem;
      color: #6b7280;
    }

    .link-info {
      flex: 1;
      min-width: 0;
    }

    .link-info h4 {
      font-size: 0.95rem;
      margin: 0 0 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-info h4 a {
      color: #1f2937;
      text-decoration: none;
    }

    .link-info h4 a:hover {
      color: #f59e0b;
    }

    .link-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: #6b7280;
      margin: 0;
    }

    .source-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .source-article { background: #dbeafe; color: #1d4ed8; }
    .source-twitter { background: #e0f2fe; color: #0ea5e9; }
    .source-linkedin { background: #dbeafe; color: #2563eb; }
    .source-github { background: #f3f4f6; color: #374151; }
    .source-youtube { background: #fee2e2; color: #dc2626; }
    .source-news { background: #fef3c7; color: #d97706; }
    .source-screenshot { background: #e0e7ff; color: #6366f1; }

    .btn-icon {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #9ca3af;
      transition: color 0.2s;
    }

    .btn-icon:hover, .btn-icon.active {
      color: #f59e0b;
    }

    /* Categories */
    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .category-item:hover {
      background: #f9fafb;
    }

    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .category-info h4 {
      font-size: 0.9rem;
      margin: 0;
      color: #374151;
    }

    .category-info .count {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    /* Tags */
    .tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      text-decoration: none;
      border: 1px solid;
      transition: transform 0.2s;
    }

    .tag-item:hover {
      transform: scale(1.05);
    }

    .tag-count {
      font-size: 0.7rem;
      opacity: 0.7;
    }

    /* Quick Actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      background: #f9fafb;
      text-decoration: none;
      color: #374151;
      transition: all 0.2s;
    }

    .action-card:hover {
      background: #fef3c7;
      color: #d97706;
    }

    .action-card i {
      font-size: 1.5rem;
    }

    .action-card span {
      font-size: 0.8rem;
      font-weight: 500;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state p {
      margin-bottom: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: LinkStats | null = null;
  categories: Category[] = [];

  private destroy$ = new Subject<void>();

  constructor(private linkService: LinkService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.linkService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => this.stats = stats);

    this.linkService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);
  }

  toggleFavorite(link: Link): void {
    this.linkService.toggleFavorite(link.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadData());
  }

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

  onFaviconError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
