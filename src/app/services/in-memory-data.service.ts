import { Injectable } from '@angular/core';
import {
  Link,
  Category,
  Tag,
  LinkSource,
  LinkStatus,
  LinkStats
} from '../models/link.model';

/**
 * In-Memory Data Service
 * Simulates backend storage for development
 * Will be replaced with actual API calls in production
 */
@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService {

  private links: Link[] = [];
  private categories: Category[] = [];
  private tags: Tag[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Initialize default categories
    this.categories = [
      {
        id: 'cat-1',
        name: 'Tech & Development',
        color: '#3498db',
        icon: 'bi-code-slash',
        description: 'Programming, software development, tech news',
        linkCount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-2',
        name: 'AI & Machine Learning',
        color: '#9b59b6',
        icon: 'bi-robot',
        description: 'Artificial intelligence, ML models, AI tools',
        linkCount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-3',
        name: 'Business & Startups',
        color: '#27ae60',
        icon: 'bi-briefcase',
        description: 'Entrepreneurship, business news, startups',
        linkCount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-4',
        name: 'Design & UX',
        color: '#e74c3c',
        icon: 'bi-palette',
        description: 'UI/UX design, graphics, design inspiration',
        linkCount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-5',
        name: 'Learning & Courses',
        color: '#f39c12',
        icon: 'bi-book',
        description: 'Tutorials, courses, educational content',
        linkCount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-6',
        name: 'Tools & Resources',
        color: '#1abc9c',
        icon: 'bi-tools',
        description: 'Useful tools, software, productivity resources',
        linkCount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Initialize default tags
    this.tags = [
      { id: 'tag-1', name: 'javascript', color: '#f7df1e', usageCount: 0 },
      { id: 'tag-2', name: 'python', color: '#3776ab', usageCount: 0 },
      { id: 'tag-3', name: 'angular', color: '#dd0031', usageCount: 0 },
      { id: 'tag-4', name: 'react', color: '#61dafb', usageCount: 0 },
      { id: 'tag-5', name: 'ai', color: '#9b59b6', usageCount: 0 },
      { id: 'tag-6', name: 'startup', color: '#27ae60', usageCount: 0 },
      { id: 'tag-7', name: 'tutorial', color: '#f39c12', usageCount: 0 },
      { id: 'tag-8', name: 'must-read', color: '#e74c3c', usageCount: 0 },
    ];

    // Initialize sample links
    this.links = [
      {
        id: 'link-1',
        userId: 'user-1',
        url: 'https://angular.io/guide/standalone-components',
        title: 'Angular Standalone Components Guide',
        description: 'Official guide for building applications using standalone components in Angular',
        favicon: 'https://angular.io/assets/images/favicons/favicon.ico',
        source: LinkSource.ARTICLE,
        status: LinkStatus.PROCESSED,
        categoryId: 'cat-1',
        tags: [this.tags[2]],
        aiSummary: {
          summary: 'Comprehensive guide explaining how to build Angular applications using standalone components, eliminating the need for NgModules.',
          keyPoints: [
            'Standalone components simplify Angular architecture',
            'No NgModule required for bootstrapping',
            'Easier lazy loading and code splitting'
          ],
          topics: ['Angular', 'Web Development', 'Frontend'],
          suggestedCategories: ['Tech & Development'],
          suggestedTags: ['angular', 'tutorial'],
          processedAt: new Date()
        },
        isFavorite: true,
        isArchived: false,
        readCount: 5,
        lastVisitedAt: new Date(),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'link-2',
        userId: 'user-1',
        url: 'https://openai.com/blog/chatgpt',
        title: 'Introducing ChatGPT - OpenAI',
        description: 'OpenAI announces ChatGPT, a conversational AI model',
        favicon: 'https://openai.com/favicon.ico',
        source: LinkSource.NEWS,
        status: LinkStatus.PROCESSED,
        categoryId: 'cat-2',
        tags: [this.tags[4]],
        aiSummary: {
          summary: 'OpenAI introduces ChatGPT, a large language model fine-tuned for conversational interactions.',
          keyPoints: [
            'Built on GPT-3.5 architecture',
            'Trained using RLHF',
            'Free research preview available'
          ],
          topics: ['AI', 'ChatGPT', 'LLM'],
          suggestedCategories: ['AI & Machine Learning'],
          suggestedTags: ['ai', 'must-read'],
          processedAt: new Date()
        },
        isFavorite: true,
        isArchived: false,
        readCount: 12,
        lastVisitedAt: new Date(),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'link-3',
        userId: 'user-1',
        url: 'https://github.com/features/copilot',
        title: 'GitHub Copilot - Your AI pair programmer',
        description: 'GitHub Copilot uses AI to help you write code faster',
        favicon: 'https://github.com/favicon.ico',
        source: LinkSource.GITHUB,
        status: LinkStatus.PROCESSED,
        categoryId: 'cat-6',
        tags: [this.tags[4], this.tags[7]],
        isFavorite: false,
        isArchived: false,
        readCount: 3,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'link-4',
        userId: 'user-1',
        url: 'https://www.linkedin.com/posts/satyanadella',
        title: 'Satya Nadella on AI Future',
        description: 'LinkedIn post about the future of AI in enterprise',
        source: LinkSource.LINKEDIN,
        status: LinkStatus.PENDING,
        categoryId: 'cat-3',
        tags: [this.tags[4], this.tags[5]],
        isFavorite: false,
        isArchived: false,
        readCount: 1,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: 'link-5',
        userId: 'user-1',
        url: '',
        title: 'Mobile App Architecture Screenshot',
        description: 'Screenshot of a mobile app architecture diagram',
        source: LinkSource.SCREENSHOT,
        status: LinkStatus.PENDING,
        categoryId: 'cat-1',
        tags: [],
        screenshot: {
          fileUrl: '/assets/screenshots/architecture.png',
          ocrProcessed: false,
          fileSize: 245000
        },
        isFavorite: false,
        isArchived: false,
        readCount: 0,
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28')
      }
    ];

    // Update category link counts
    this.updateCategoryCounts();
    this.updateTagCounts();
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(cat => {
      cat.linkCount = this.links.filter(l => l.categoryId === cat.id && !l.isArchived).length;
    });
  }

  private updateTagCounts(): void {
    this.tags.forEach(tag => {
      tag.usageCount = this.links.filter(l =>
        l.tags.some(t => t.id === tag.id)
      ).length;
    });
  }

  // Generate unique ID
  generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============ LINKS ============

  getLinks(): Link[] {
    return [...this.links].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getLinkById(id: string): Link | undefined {
    return this.links.find(l => l.id === id);
  }

  addLink(link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>): Link {
    const newLink: Link = {
      ...link,
      id: this.generateId('link'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.links.unshift(newLink);
    this.updateCategoryCounts();
    this.updateTagCounts();
    return newLink;
  }

  updateLink(id: string, updates: Partial<Link>): Link | undefined {
    const index = this.links.findIndex(l => l.id === id);
    if (index === -1) return undefined;

    this.links[index] = {
      ...this.links[index],
      ...updates,
      updatedAt: new Date()
    };
    this.updateCategoryCounts();
    this.updateTagCounts();
    return this.links[index];
  }

  deleteLink(id: string): boolean {
    const index = this.links.findIndex(l => l.id === id);
    if (index === -1) return false;

    this.links.splice(index, 1);
    this.updateCategoryCounts();
    this.updateTagCounts();
    return true;
  }

  searchLinks(query: string): Link[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getLinks();

    return this.links.filter(link =>
      link.title.toLowerCase().includes(searchTerm) ||
      link.description?.toLowerCase().includes(searchTerm) ||
      link.url.toLowerCase().includes(searchTerm) ||
      link.tags.some(t => t.name.toLowerCase().includes(searchTerm)) ||
      link.aiSummary?.summary.toLowerCase().includes(searchTerm)
    );
  }

  // ============ CATEGORIES ============

  getCategories(): Category[] {
    return [...this.categories];
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  addCategory(category: Omit<Category, 'id' | 'linkCount' | 'createdAt' | 'updatedAt'>): Category {
    const newCategory: Category = {
      ...category,
      id: this.generateId('cat'),
      linkCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    this.categories[index] = {
      ...this.categories[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.categories[index];
  }

  deleteCategory(id: string): boolean {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    // Remove category from links
    this.links.forEach(link => {
      if (link.categoryId === id) {
        link.categoryId = undefined;
        link.category = undefined;
      }
    });

    this.categories.splice(index, 1);
    return true;
  }

  // ============ TAGS ============

  getTags(): Tag[] {
    return [...this.tags].sort((a, b) => b.usageCount - a.usageCount);
  }

  getTagById(id: string): Tag | undefined {
    return this.tags.find(t => t.id === id);
  }

  getTagByName(name: string): Tag | undefined {
    return this.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
  }

  addTag(name: string, color?: string): Tag {
    const existing = this.getTagByName(name);
    if (existing) return existing;

    const newTag: Tag = {
      id: this.generateId('tag'),
      name: name.toLowerCase().trim(),
      color: color || this.getRandomColor(),
      usageCount: 0
    };
    this.tags.push(newTag);
    return newTag;
  }

  deleteTag(id: string): boolean {
    const index = this.tags.findIndex(t => t.id === id);
    if (index === -1) return false;

    // Remove tag from links
    this.links.forEach(link => {
      link.tags = link.tags.filter(t => t.id !== id);
    });

    this.tags.splice(index, 1);
    return true;
  }

  // ============ STATS ============

  getStats(): LinkStats {
    const activeLinks = this.links.filter(l => !l.isArchived);

    return {
      totalLinks: this.links.length,
      favoriteLinks: this.links.filter(l => l.isFavorite).length,
      archivedLinks: this.links.filter(l => l.isArchived).length,
      pendingProcessing: this.links.filter(l => l.status === LinkStatus.PENDING).length,
      categoryCounts: this.categories.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        count: cat.linkCount
      })),
      sourceCounts: Object.values(LinkSource).map(source => ({
        source,
        count: activeLinks.filter(l => l.source === source).length
      })).filter(s => s.count > 0),
      recentLinks: this.getLinks().slice(0, 5),
      topTags: this.getTags().slice(0, 10)
    };
  }

  // Helper to get random color for new tags
  private getRandomColor(): string {
    const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#2c3e50'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
