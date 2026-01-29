# LinkHive - Smart Bookmark & Link Manager

A modern Angular-based bookmark and link management application with AI-powered organization capabilities.

## Features

- **Dashboard**: Overview of all your saved links, statistics, and quick actions
- **Link Management**: Save, organize, and access your bookmarks easily
  - Add URLs with auto-parsing metadata
  - Upload screenshots with OCR support (AI integration ready)
  - Categorize and tag your links
- **Categories**: Organize links into custom categories with colors and icons
- **Tags**: Add multiple tags to links for flexible organization
- **Favorites**: Quick access to your starred links
- **Archive**: Keep old links without cluttering your main view
- **Search**: Full-text search across titles, descriptions, URLs, and tags
- **AI Integration Ready**: Architecture prepared for n8n pipeline integration
  - Link analysis and summarization
  - Screenshot OCR processing
  - Auto-categorization suggestions

## Tech Stack

- **Frontend**: Angular 18 (Standalone Components)
- **UI Framework**: Bootstrap 5 + Bootstrap Icons
- **Language**: TypeScript 5.4
- **State Management**: RxJS with BehaviorSubjects
- **Font**: Inter (Google Fonts)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/        # Home dashboard with stats
│   │   ├── link-list/        # Browse all links with filters
│   │   ├── link-card/        # Reusable link display card
│   │   ├── link-form/        # Add/Edit link form
│   │   ├── categories/       # Category management
│   │   ├── favorites/        # Starred links view
│   │   └── archive/          # Archived links view
│   ├── services/
│   │   ├── link.service.ts           # Link operations & state
│   │   └── in-memory-data.service.ts # Mock database
│   ├── models/
│   │   └── link.model.ts     # Data models and interfaces
│   ├── app.component.ts      # Root component with navigation
│   ├── app.routes.ts         # Application routing
│   └── app.config.ts         # App configuration
├── styles.css                # Global styles
└── index.html                # HTML entry point
```

## Data Models

### Link
- URL, title, description
- Source type (Twitter, LinkedIn, YouTube, GitHub, News, Article, Screenshot)
- Category and tags
- AI-generated summary (when processed)
- Favorite and archive status
- Read count and visit tracking

### Category
- Name, color, icon
- Link count

### Tag
- Name, color
- Usage count

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm start
   ```

3. Navigate to `http://localhost:4200/`

## Usage

- **Add Link**: Click "Add Link" button, paste URL, and auto-parse metadata
- **Upload Screenshot**: Switch to screenshot mode to upload images
- **Organize**: Assign categories and tags to links
- **Search**: Use the search bar to find links by title, URL, or tags
- **Favorite**: Star important links for quick access
- **Archive**: Move old links to archive to keep things tidy

## Future Enhancements

- **Backend Integration**: PostgreSQL database with REST API
- **File Storage**: MinIO S3 for screenshot uploads
- **AI Pipeline**: n8n workflow integration for:
  - Automatic link metadata extraction
  - Screenshot OCR with Ollama
  - Content summarization
  - Smart categorization suggestions
- **Mobile Apps**: iOS and Android versions using Capacitor
- **User Authentication**: Multi-user support with OAuth

## Architecture Notes

This frontend is designed to work standalone with in-memory data for development, and can be easily connected to a backend API by:

1. Updating `LinkService` to make HTTP calls instead of using `InMemoryDataService`
2. Adding authentication interceptors
3. Configuring environment-based API URLs

## License

MIT
