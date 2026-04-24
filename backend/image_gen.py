"""
Image generation disabled - emergentintegrations not available.
"""
import logging
from typing import Optional

logger = logging.getLogger("torciblox.images")


async def generate_product_image(product: dict) -> Optional[str]:
    logger.warning("Image generation disabled")
    return None


async def generate_missing_images(db) -> dict:
    return {"generated": 0, "failed": 0, "total": 0}
