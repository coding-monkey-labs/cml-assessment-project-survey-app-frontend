# Memora - Smart Bookmark & Link Manager

A modern bookmark and link management application with AI-powered organization capabilities.

## Tech Stack

### Frontend (Web)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Utils**: date-fns

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy (async)
- **File Storage**: MinIO S3-compatible
- **Auth**: JWT with python-jose

### Mobile (Planned)
- **Framework**: React Native
- **Navigation**: React Navigation
- **State**: Same Zustand store (shared logic)

## Features

- **Dashboard**: Overview with stats, recent links, categories, and quick actions
- **Link Management**: Save URLs and screenshots with metadata
- **Categories**: Organize links with custom colors and icons
- **Tags**: Flexible tagging system
- **Favorites**: Quick access to starred links
- **Archive**: Keep old links without clutter
- **Search**: Full-text search across all fields
- **AI Ready**: Architecture prepared for n8n pipeline integration

## Project Structure

```
memora/
├── src/                    # React Frontend
│   ├── components/         # UI Components
│   │   ├── Layout.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LinkList.tsx
│   │   ├── LinkCard.tsx
│   │   ├── LinkForm.tsx
│   │   ├── Categories.tsx
│   │   ├── Favorites.tsx
│   │   └── Archive.tsx
│   ├── store/              # Zustand state management
│   │   └── linkStore.ts
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
│
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth.py
│   │   │   ├── links.py
│   │   │   ├── categories.py
│   │   │   └── tags.py
│   │   ├── models/         # SQLAlchemy models
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── services/       # Business logic
│   │   └── main.py
│   └── requirements.txt
│
├── package.json            # Frontend dependencies
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Getting Started

### Frontend Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload

# API docs at http://localhost:8000/api/docs
```

### Database Setup

```bash
# Start PostgreSQL (via Docker)
docker run -d \
  --name memora-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=memora \
  -p 5432:5432 \
  postgres:15

# Or use your local PostgreSQL and create database
createdb memora
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT token |
| GET | /api/links | List links (with filters) |
| POST | /api/links | Create new link |
| GET | /api/links/:id | Get single link |
| PATCH | /api/links/:id | Update link |
| DELETE | /api/links/:id | Delete link |
| POST | /api/links/:id/favorite | Toggle favorite |
| POST | /api/links/:id/archive | Toggle archive |
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| PATCH | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| GET | /api/tags | List tags |
| POST | /api/tags | Create tag |
| DELETE | /api/tags/:id | Delete tag |

## React Native Migration Guide

The codebase is structured for easy React Native migration:

1. **Shared Types**: `src/types/index.ts` - use directly
2. **Shared Store**: `src/store/linkStore.ts` - works with React Native
3. **Components**: Replace web-specific components:
   - `<Link>` → `<TouchableOpacity>` + navigation
   - Tailwind classes → StyleSheet or NativeWind
   - `lucide-react` → `lucide-react-native`

### React Native Setup

```bash
# Create React Native app
npx react-native init MemoraApp --template react-native-template-typescript

# Install shared dependencies
npm install zustand react-native-mmkv date-fns lucide-react-native

# Copy types and store
cp src/types/* MemoraApp/src/types/
cp src/store/* MemoraApp/src/store/
```

## AI Integration (n8n Pipeline)

The app is designed for AI processing via n8n workflows:

1. **Link Metadata Extraction**: Fetch OG tags, favicon, title
2. **Screenshot OCR**: Process images with Ollama/Tesseract
3. **Content Summarization**: Generate AI summaries
4. **Auto-categorization**: Suggest categories and tags

### n8n Webhook Integration

```json
{
  "webhook_url": "http://your-n8n/webhook/memora-process",
  "payload": {
    "link_id": "uuid",
    "url": "https://example.com",
    "type": "url|screenshot"
  }
}
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/memora
SECRET_KEY=your-secret-key
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## License

MIT
