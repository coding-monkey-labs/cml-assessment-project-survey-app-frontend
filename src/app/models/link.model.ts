/**
 * LinkHive Data Models
 * Core interfaces for the application
 */

// Link source types
export enum LinkSource {
  MANUAL = 'manual',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  GITHUB = 'github',
  NEWS = 'news',
  ARTICLE = 'article',
  SCREENSHOT = 'screenshot',
  OTHER = 'other'
}

// Link status
export enum LinkStatus {
  PENDING = 'pending',      // Awaiting AI processing
  PROCESSED = 'processed',  // AI has analyzed
  ARCHIVED = 'archived',    // User archived
  FAVORITE = 'favorite'     // User favorited
}

// Category interface
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  linkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  color?: string;
  usageCount: number;
}

// AI-generated summary
export interface AISummary {
  summary: string;
  keyPoints: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  topics: string[];
  suggestedCategories: string[];
  suggestedTags: string[];
  processedAt: Date;
}

// Screenshot metadata
export interface ScreenshotData {
  fileUrl: string;
  thumbnailUrl?: string;
  extractedText?: string;
  ocrProcessed: boolean;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

// Main Link interface
export interface Link {
  id: string;
  userId: string;

  // Core link data
  url: string;
  title: string;
  description?: string;
  favicon?: string;

  // Source and type
  source: LinkSource;
  status: LinkStatus;

  // Organization
  categoryId?: string;
  category?: Category;
  tags: Tag[];

  // AI-powered features
  aiSummary?: AISummary;

  // Screenshot support
  screenshot?: ScreenshotData;

  // Metadata from URL
  metadata?: {
    siteName?: string;
    author?: string;
    publishedDate?: Date;
    image?: string;
    contentType?: string;
  };

  // User interaction
  isFavorite: boolean;
  isArchived: boolean;
  readCount: number;
  lastVisitedAt?: Date;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new link
export interface CreateLinkDto {
  url?: string;
  title?: string;
  description?: string;
  source: LinkSource;
  categoryId?: string;
  tags?: string[];
  notes?: string;
  screenshot?: File;
}

// DTO for updating a link
export interface UpdateLinkDto {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  notes?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
}

// Filter options for link queries
export interface LinkFilter {
  search?: string;
  categoryId?: string;
  tags?: string[];
  source?: LinkSource;
  status?: LinkStatus;
  isFavorite?: boolean;
  isArchived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// Stats for dashboard
export interface LinkStats {
  totalLinks: number;
  favoriteLinks: number;
  archivedLinks: number;
  pendingProcessing: number;
  categoryCounts: { categoryId: string; categoryName: string; count: number }[];
  sourceCounts: { source: LinkSource; count: number }[];
  recentLinks: Link[];
  topTags: Tag[];
}

// User preferences
export interface UserPreferences {
  defaultView: 'grid' | 'list' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  autoProcessLinks: boolean;
  defaultCategory?: string;
  notificationsEnabled: boolean;
}
