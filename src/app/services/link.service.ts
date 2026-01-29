import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { InMemoryDataService } from './in-memory-data.service';
import {
  Link,
  Category,
  Tag,
  LinkSource,
  LinkStatus,
  LinkStats,
  CreateLinkDto,
  UpdateLinkDto,
  LinkFilter
} from '../models/link.model';

/**
 * Link Service
 * Handles all link-related operations
 * Simulates API delays for realistic behavior
 */
@Injectable({
  providedIn: 'root'
})
export class LinkService {

  // Observable streams for reactive updates
  private linksSubject = new BehaviorSubject<Link[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private tagsSubject = new BehaviorSubject<Tag[]>([]);
  private statsSubject = new BehaviorSubject<LinkStats | null>(null);

  public links$ = this.linksSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public tags$ = this.tagsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  // Simulated API delay
  private readonly API_DELAY = 300;

  constructor(private dataService: InMemoryDataService) {
    this.refreshAll();
  }

  // ============ REFRESH METHODS ============

  refreshAll(): void {
    this.refreshLinks();
    this.refreshCategories();
    this.refreshTags();
    this.refreshStats();
  }

  refreshLinks(): void {
    this.linksSubject.next(this.dataService.getLinks());
  }

  refreshCategories(): void {
    this.categoriesSubject.next(this.dataService.getCategories());
  }

  refreshTags(): void {
    this.tagsSubject.next(this.dataService.getTags());
  }

  refreshStats(): void {
    this.statsSubject.next(this.dataService.getStats());
  }

  // ============ LINK OPERATIONS ============

  getAllLinks(): Observable<Link[]> {
    return of(this.dataService.getLinks()).pipe(
      delay(this.API_DELAY),
      tap(links => this.linksSubject.next(links))
    );
  }

  getLinkById(id: string): Observable<Link | undefined> {
    return of(this.dataService.getLinkById(id)).pipe(
      delay(this.API_DELAY / 2)
    );
  }

  createLink(dto: CreateLinkDto): Observable<Link> {
    const newLink: Omit<Link, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'user-1', // TODO: Get from auth service
      url: dto.url || '',
      title: dto.title || this.extractTitleFromUrl(dto.url || ''),
      description: dto.description,
      source: dto.source,
      status: LinkStatus.PENDING,
      categoryId: dto.categoryId,
      tags: dto.tags?.map(tagName => {
        const existingTag = this.dataService.getTagByName(tagName);
        return existingTag || this.dataService.addTag(tagName);
      }) || [],
      isFavorite: false,
      isArchived: false,
      readCount: 0,
      notes: dto.notes
    };

    // Handle screenshot
    if (dto.screenshot) {
      (newLink as any).screenshot = {
        fileUrl: URL.createObjectURL(dto.screenshot),
        ocrProcessed: false,
        fileSize: dto.screenshot.size
      };
    }

    return of(this.dataService.addLink(newLink)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshAll())
    );
  }

  updateLink(id: string, dto: UpdateLinkDto): Observable<Link | undefined> {
    const updates: Partial<Link> = { ...dto };

    if (dto.tags) {
      updates.tags = dto.tags.map(tagName => {
        const existingTag = this.dataService.getTagByName(tagName);
        return existingTag || this.dataService.addTag(tagName);
      });
    }

    return of(this.dataService.updateLink(id, updates)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshAll())
    );
  }

  deleteLink(id: string): Observable<boolean> {
    return of(this.dataService.deleteLink(id)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshAll())
    );
  }

  toggleFavorite(id: string): Observable<Link | undefined> {
    const link = this.dataService.getLinkById(id);
    if (!link) return of(undefined);

    return of(this.dataService.updateLink(id, { isFavorite: !link.isFavorite })).pipe(
      delay(this.API_DELAY / 2),
      tap(() => this.refreshAll())
    );
  }

  toggleArchive(id: string): Observable<Link | undefined> {
    const link = this.dataService.getLinkById(id);
    if (!link) return of(undefined);

    return of(this.dataService.updateLink(id, { isArchived: !link.isArchived })).pipe(
      delay(this.API_DELAY / 2),
      tap(() => this.refreshAll())
    );
  }

  incrementReadCount(id: string): Observable<Link | undefined> {
    const link = this.dataService.getLinkById(id);
    if (!link) return of(undefined);

    return of(this.dataService.updateLink(id, {
      readCount: link.readCount + 1,
      lastVisitedAt: new Date()
    })).pipe(
      delay(100)
    );
  }

  // ============ SEARCH & FILTER ============

  searchLinks(query: string): Observable<Link[]> {
    return of(this.dataService.searchLinks(query)).pipe(
      delay(this.API_DELAY / 2)
    );
  }

  filterLinks(filter: LinkFilter): Observable<Link[]> {
    let results = this.dataService.getLinks();

    if (filter.search) {
      results = this.dataService.searchLinks(filter.search);
    }

    if (filter.categoryId) {
      results = results.filter(l => l.categoryId === filter.categoryId);
    }

    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(l =>
        filter.tags!.some(tagId => l.tags.some(t => t.id === tagId))
      );
    }

    if (filter.source) {
      results = results.filter(l => l.source === filter.source);
    }

    if (filter.status) {
      results = results.filter(l => l.status === filter.status);
    }

    if (filter.isFavorite !== undefined) {
      results = results.filter(l => l.isFavorite === filter.isFavorite);
    }

    if (filter.isArchived !== undefined) {
      results = results.filter(l => l.isArchived === filter.isArchived);
    }

    if (filter.dateFrom) {
      results = results.filter(l => new Date(l.createdAt) >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      results = results.filter(l => new Date(l.createdAt) <= filter.dateTo!);
    }

    return of(results).pipe(delay(this.API_DELAY / 2));
  }

  getFavorites(): Observable<Link[]> {
    return this.filterLinks({ isFavorite: true, isArchived: false });
  }

  getArchived(): Observable<Link[]> {
    return this.filterLinks({ isArchived: true });
  }

  getByCategory(categoryId: string): Observable<Link[]> {
    return this.filterLinks({ categoryId, isArchived: false });
  }

  getBySource(source: LinkSource): Observable<Link[]> {
    return this.filterLinks({ source, isArchived: false });
  }

  // ============ CATEGORY OPERATIONS ============

  getAllCategories(): Observable<Category[]> {
    return of(this.dataService.getCategories()).pipe(
      delay(this.API_DELAY),
      tap(categories => this.categoriesSubject.next(categories))
    );
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return of(this.dataService.getCategoryById(id)).pipe(
      delay(this.API_DELAY / 2)
    );
  }

  createCategory(category: Omit<Category, 'id' | 'linkCount' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    return of(this.dataService.addCategory(category)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshCategories())
    );
  }

  updateCategory(id: string, updates: Partial<Category>): Observable<Category | undefined> {
    return of(this.dataService.updateCategory(id, updates)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshCategories())
    );
  }

  deleteCategory(id: string): Observable<boolean> {
    return of(this.dataService.deleteCategory(id)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshAll())
    );
  }

  // ============ TAG OPERATIONS ============

  getAllTags(): Observable<Tag[]> {
    return of(this.dataService.getTags()).pipe(
      delay(this.API_DELAY),
      tap(tags => this.tagsSubject.next(tags))
    );
  }

  createTag(name: string, color?: string): Observable<Tag> {
    return of(this.dataService.addTag(name, color)).pipe(
      delay(this.API_DELAY / 2),
      tap(() => this.refreshTags())
    );
  }

  deleteTag(id: string): Observable<boolean> {
    return of(this.dataService.deleteTag(id)).pipe(
      delay(this.API_DELAY),
      tap(() => this.refreshAll())
    );
  }

  // ============ STATS ============

  getStats(): Observable<LinkStats> {
    return of(this.dataService.getStats()).pipe(
      delay(this.API_DELAY),
      tap(stats => this.statsSubject.next(stats))
    );
  }

  // ============ HELPERS ============

  private extractTitleFromUrl(url: string): string {
    if (!url) return 'Untitled Link';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Untitled Link';
    }
  }

  // Parse URL metadata (simulated - would use actual API in production)
  parseUrl(url: string): Observable<Partial<Link>> {
    // In production, this would call a backend service to fetch OG tags, etc.
    const metadata: Partial<Link> = {
      url,
      title: this.extractTitleFromUrl(url),
      source: this.detectSource(url)
    };

    return of(metadata).pipe(delay(this.API_DELAY));
  }

  private detectSource(url: string): LinkSource {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return LinkSource.TWITTER;
    }
    if (urlLower.includes('linkedin.com')) {
      return LinkSource.LINKEDIN;
    }
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return LinkSource.YOUTUBE;
    }
    if (urlLower.includes('github.com')) {
      return LinkSource.GITHUB;
    }

    return LinkSource.ARTICLE;
  }
}
