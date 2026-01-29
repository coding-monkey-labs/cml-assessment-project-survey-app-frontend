import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LinkService } from '../../services/link.service';
import { Link } from '../../models/link.model';
import { LinkCardComponent } from '../link-card/link-card.component';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, RouterLink, LinkCardComponent],
  template: `
    <div class="archive-container container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1><i class="bi bi-archive me-2"></i>Archive</h1>
          <p class="text-muted">Your archived links</p>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner-border text-primary"></div>
        <p>Loading archive...</p>
      </div>

      <!-- Links Grid -->
      <div class="links-grid" *ngIf="!isLoading && links.length > 0">
        <app-link-card
          *ngFor="let link of links"
          [link]="link"
          (onFavorite)="toggleFavorite($event)"
          (onArchive)="toggleArchive($event)"
          (onDelete)="deleteLink($event)"
        ></app-link-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && links.length === 0">
        <i class="bi bi-archive"></i>
        <h3>Archive is empty</h3>
        <p>Links you archive will appear here</p>
        <a routerLink="/links" class="btn btn-primary">Browse Links</a>
      </div>
    </div>
  `,
  styles: [`
    .archive-container {
      padding: 2rem 1rem;
      max-width: 1400px;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      margin: 0;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .loading-state, .empty-state {
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
  `]
})
export class ArchiveComponent implements OnInit, OnDestroy {
  links: Link[] = [];
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(private linkService: LinkService) {}

  ngOnInit(): void {
    this.loadArchive();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadArchive(): void {
    this.isLoading = true;
    this.linkService.getArchived()
      .pipe(takeUntil(this.destroy$))
      .subscribe(links => {
        this.links = links;
        this.isLoading = false;
      });
  }

  toggleFavorite(link: Link): void {
    this.linkService.toggleFavorite(link.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadArchive());
  }

  toggleArchive(link: Link): void {
    this.linkService.toggleArchive(link.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadArchive());
  }

  deleteLink(link: Link): void {
    if (confirm(`Permanently delete "${link.title}"?`)) {
      this.linkService.deleteLink(link.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadArchive());
    }
  }
}
