import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LinkService } from '../../services/link.service';
import { Link, Category, Tag, LinkSource, LinkFilter } from '../../models/link.model';
import { LinkCardComponent } from '../link-card/link-card.component';

@Component({
  selector: 'app-link-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LinkCardComponent],
  template: `
    <div class="link-list-container container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="bi bi-collection me-2"></i>
            {{ pageTitle }}
          </h1>
          <p class="text-muted">{{ links.length }} links found</p>
        </div>
        <a routerLink="/add" class="btn btn-primary">
          <i class="bi bi-plus-lg me-2"></i>Add Link
        </a>
      </div>

      <!-- Search and Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search links..."
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            class="form-control"
          >
          <button *ngIf="searchQuery" class="btn-clear" (click)="clearSearch()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="filter-buttons">
          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              <i class="bi bi-folder me-1"></i>
              {{ selectedCategory ? getCategoryName(selectedCategory) : 'All Categories' }}
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" (click)="filterByCategory(undefined)">All Categories</a></li>
              <li><hr class="dropdown-divider"></li>
              <li *ngFor="let cat of categories">
                <a class="dropdown-item" (click)="filterByCategory(cat.id)">
                  <i class="bi me-2" [ngClass]="cat.icon" [style.color]="cat.color"></i>
                  {{ cat.name }}
                  <span class="badge bg-secondary ms-2">{{ cat.linkCount }}</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              <i class="bi bi-funnel me-1"></i>
              {{ selectedSource ? selectedSource : 'All Sources' }}
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" (click)="filterBySource(undefined)">All Sources</a></li>
              <li><hr class="dropdown-divider"></li>
              <li *ngFor="let source of sources">
                <a class="dropdown-item" (click)="filterBySource(source)">
                  <i class="bi me-2" [ngClass]="getSourceIcon(source)"></i>
                  {{ source }}
                </a>
              </li>
            </ul>
          </div>

          <div class="btn-group view-toggle">
            <button
              class="btn btn-outline-secondary"
              [class.active]="viewMode === 'grid'"
              (click)="viewMode = 'grid'"
            >
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
            <button
              class="btn btn-outline-secondary"
              [class.active]="viewMode === 'list'"
              (click)="viewMode = 'list'"
            >
              <i class="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Active Filters -->
      <div class="active-filters" *ngIf="hasActiveFilters()">
        <span class="filter-label">Active filters:</span>
        <span class="filter-tag" *ngIf="selectedCategory">
          {{ getCategoryName(selectedCategory) }}
          <button (click)="filterByCategory(undefined)"><i class="bi bi-x"></i></button>
        </span>
        <span class="filter-tag" *ngIf="selectedSource">
          {{ selectedSource }}
          <button (click)="filterBySource(undefined)"><i class="bi bi-x"></i></button>
        </span>
        <span class="filter-tag" *ngIf="searchQuery">
          "{{ searchQuery }}"
          <button (click)="clearSearch()"><i class="bi bi-x"></i></button>
        </span>
        <button class="btn btn-link btn-sm" (click)="clearAllFilters()">Clear all</button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading links...</p>
      </div>

      <!-- Links Grid/List -->
      <div [ngClass]="viewMode === 'grid' ? 'links-grid' : 'links-list'" *ngIf="!isLoading && links.length > 0">
        <app-link-card
          *ngFor="let link of links"
          [link]="link"
          [viewMode]="viewMode"
          (onFavorite)="toggleFavorite($event)"
          (onArchive)="toggleArchive($event)"
          (onDelete)="deleteLink($event)"
        ></app-link-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && links.length === 0">
        <i class="bi bi-inbox"></i>
        <h3>No links found</h3>
        <p *ngIf="hasActiveFilters()">Try adjusting your filters or search query</p>
        <p *ngIf="!hasActiveFilters()">Start by adding your first link!</p>
        <a routerLink="/add" class="btn btn-primary">
          <i class="bi bi-plus-lg me-2"></i>Add Link
        </a>
      </div>
    </div>
  `,
  styles: [`
    .link-list-container {
      padding: 2rem 1rem;
      max-width: 1400px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
      margin: 0;
      color: #1f2937;
    }

    .header-content p {
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
    }

    /* Filters Bar */
    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
      position: relative;
    }

    .search-box i.bi-search {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .search-box input {
      padding-left: 40px;
      padding-right: 40px;
      border-radius: 8px;
    }

    .btn-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px 8px;
    }

    .btn-clear:hover {
      color: #374151;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .dropdown-toggle {
      border-radius: 8px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .view-toggle .btn {
      padding: 0.5rem 0.75rem;
    }

    .view-toggle .btn.active {
      background: #f59e0b;
      border-color: #f59e0b;
      color: white;
    }

    /* Active Filters */
    .active-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: #fef3c7;
      color: #92400e;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .filter-tag button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #92400e;
      line-height: 1;
    }

    .filter-tag button:hover {
      color: #78350f;
    }

    /* Links Grid */
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .links-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .loading-state .spinner-border {
      margin-bottom: 1rem;
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
      color: #374151;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .filters-bar {
        flex-direction: column;
      }

      .filter-buttons {
        flex-wrap: wrap;
      }

      .links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LinkListComponent implements OnInit, OnDestroy {
  links: Link[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];

  searchQuery = '';
  selectedCategory?: string;
  selectedSource?: LinkSource;
  selectedTag?: string;
  viewMode: 'grid' | 'list' = 'grid';
  pageTitle = 'All Links';

  isLoading = true;

  sources = Object.values(LinkSource);

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private linkService: LinkService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());

    // Load categories
    this.linkService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);

    // Load tags
    this.linkService.getAllTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tags => this.tags = tags);

    // Handle route params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['tag']) {
        this.selectedTag = params['tag'];
      }
      if (params['source']) {
        this.selectedSource = params['source'] as LinkSource;
      }
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  filterByCategory(categoryId?: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  filterBySource(source?: LinkSource): void {
    this.selectedSource = source;
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = undefined;
    this.selectedSource = undefined;
    this.selectedTag = undefined;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory || this.selectedSource || this.selectedTag);
  }

  private applyFilters(): void {
    this.isLoading = true;

    const filter: LinkFilter = {
      search: this.searchQuery || undefined,
      categoryId: this.selectedCategory,
      source: this.selectedSource,
      tags: this.selectedTag ? [this.selectedTag] : undefined,
      isArchived: false
    };

    this.linkService.filterLinks(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(links => {
        this.links = links;
        this.isLoading = false;
        this.updatePageTitle();
      });
  }

  private updatePageTitle(): void {
    if (this.selectedCategory) {
      const cat = this.categories.find(c => c.id === this.selectedCategory);
      this.pageTitle = cat ? cat.name : 'Links';
    } else if (this.selectedSource) {
      this.pageTitle = `${this.selectedSource} Links`;
    } else {
      this.pageTitle = 'All Links';
    }
  }

  getCategoryName(categoryId: string): string {
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
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

  toggleFavorite(link: Link): void {
    this.linkService.toggleFavorite(link.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  toggleArchive(link: Link): void {
    this.linkService.toggleArchive(link.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  deleteLink(link: Link): void {
    if (confirm(`Are you sure you want to delete "${link.title}"?`)) {
      this.linkService.deleteLink(link.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.applyFilters());
    }
  }
}
