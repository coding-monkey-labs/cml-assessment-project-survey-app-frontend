"""
Links API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.models import get_db, Link, Tag, LinkSource, LinkStatus

router = APIRouter()


# Pydantic schemas
class TagResponse(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True


class AISummary(BaseModel):
    summary: str
    keyPoints: List[str]
    topics: List[str]
    suggestedCategories: List[str]
    suggestedTags: List[str]
    processedAt: datetime


class LinkCreate(BaseModel):
    url: Optional[str] = None
    title: str
    description: Optional[str] = None
    source: LinkSource = LinkSource.MANUAL
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None


class LinkResponse(BaseModel):
    id: str
    user_id: str
    url: Optional[str]
    title: str
    description: Optional[str]
    favicon: Optional[str]
    source: LinkSource
    status: LinkStatus
    category_id: Optional[str]
    tags: List[TagResponse]
    ai_summary: Optional[dict]
    is_favorite: bool
    is_archived: bool
    read_count: int
    last_visited_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LinkStats(BaseModel):
    total_links: int
    favorite_links: int
    archived_links: int
    pending_processing: int


@router.get("/", response_model=List[LinkResponse])
async def get_links(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    source: Optional[LinkSource] = None,
    is_favorite: Optional[bool] = None,
    is_archived: Optional[bool] = Query(default=False),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get all links with optional filters"""
    query = select(Link).where(Link.user_id == "user-1")  # TODO: Get from auth

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Link.title.ilike(search_filter)) |
            (Link.description.ilike(search_filter)) |
            (Link.url.ilike(search_filter))
        )

    if category_id:
        query = query.where(Link.category_id == category_id)

    if source:
        query = query.where(Link.source == source)

    if is_favorite is not None:
        query = query.where(Link.is_favorite == is_favorite)

    if is_archived is not None:
        query = query.where(Link.is_archived == is_archived)

    query = query.order_by(Link.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/stats", response_model=LinkStats)
async def get_link_stats(db: AsyncSession = Depends(get_db)):
    """Get link statistics"""
    user_id = "user-1"  # TODO: Get from auth

    total = await db.scalar(
        select(func.count()).where(Link.user_id == user_id)
    )
    favorites = await db.scalar(
        select(func.count()).where(Link.user_id == user_id, Link.is_favorite == True)
    )
    archived = await db.scalar(
        select(func.count()).where(Link.user_id == user_id, Link.is_archived == True)
    )
    pending = await db.scalar(
        select(func.count()).where(Link.user_id == user_id, Link.status == LinkStatus.PENDING)
    )

    return LinkStats(
        total_links=total or 0,
        favorite_links=favorites or 0,
        archived_links=archived or 0,
        pending_processing=pending or 0
    )


@router.get("/{link_id}", response_model=LinkResponse)
async def get_link(link_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific link by ID"""
    result = await db.execute(
        select(Link).where(Link.id == link_id, Link.user_id == "user-1")
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link


@router.post("/", response_model=LinkResponse)
async def create_link(link_data: LinkCreate, db: AsyncSession = Depends(get_db)):
    """Create a new link"""
    link = Link(
        id=str(uuid.uuid4()),
        user_id="user-1",  # TODO: Get from auth
        url=link_data.url,
        title=link_data.title,
        description=link_data.description,
        source=link_data.source,
        category_id=link_data.category_id,
        notes=link_data.notes,
        status=LinkStatus.PENDING
    )

    # Handle tags
    if link_data.tags:
        for tag_name in link_data.tags:
            result = await db.execute(
                select(Tag).where(Tag.name == tag_name.lower())
            )
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name.lower())
                db.add(tag)
            link.tags.append(tag)

    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


@router.patch("/{link_id}", response_model=LinkResponse)
async def update_link(
    link_id: str,
    link_data: LinkUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a link"""
    result = await db.execute(
        select(Link).where(Link.id == link_id, Link.user_id == "user-1")
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    update_data = link_data.model_dump(exclude_unset=True)

    # Handle tags separately
    if "tags" in update_data:
        tag_names = update_data.pop("tags")
        link.tags = []
        for tag_name in tag_names:
            result = await db.execute(
                select(Tag).where(Tag.name == tag_name.lower())
            )
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name.lower())
                db.add(tag)
            link.tags.append(tag)

    for field, value in update_data.items():
        setattr(link, field, value)

    await db.commit()
    await db.refresh(link)
    return link


@router.delete("/{link_id}")
async def delete_link(link_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a link"""
    result = await db.execute(
        select(Link).where(Link.id == link_id, Link.user_id == "user-1")
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    await db.delete(link)
    await db.commit()
    return {"message": "Link deleted successfully"}


@router.post("/{link_id}/favorite")
async def toggle_favorite(link_id: str, db: AsyncSession = Depends(get_db)):
    """Toggle favorite status"""
    result = await db.execute(
        select(Link).where(Link.id == link_id, Link.user_id == "user-1")
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    link.is_favorite = not link.is_favorite
    await db.commit()
    return {"is_favorite": link.is_favorite}


@router.post("/{link_id}/archive")
async def toggle_archive(link_id: str, db: AsyncSession = Depends(get_db)):
    """Toggle archive status"""
    result = await db.execute(
        select(Link).where(Link.id == link_id, Link.user_id == "user-1")
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    link.is_archived = not link.is_archived
    await db.commit()
    return {"is_archived": link.is_archived}
