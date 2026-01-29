"""
Memora Backend API
FastAPI application for managing bookmarks and links
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import links, categories, tags, auth

app = FastAPI(
    title="Memora API",
    description="Smart Bookmark & Link Management API with AI-powered organization",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(links.router, prefix="/api/links", tags=["Links"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "memora-api"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Memora API",
        "docs": "/api/docs",
        "version": "1.0.0"
    }
