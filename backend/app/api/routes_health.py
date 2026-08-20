"""
Health-check endpoint.
Used by deployment platforms (Render/Railway) to verify the service is alive.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service health check")
async def health_check():
    """Returns 200 OK if the API server is running."""
    return {
        "status": "healthy",
        "service": "Smart Mandi Selection API",
    }
