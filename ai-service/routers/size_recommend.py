from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["size-recommend"])


class SizeRequest(BaseModel):
    chest: float
    waist: float
    hips: float
    shoulders: float
    height_cm: float


class SizeResponse(BaseModel):
    shirt_size: str
    pant_size: str
    jacket_size: str


def _shirt_size(chest: float) -> str:
    if chest < 34:
        return "XS"
    elif chest <= 35:
        return "S"
    elif chest <= 37:
        return "M"
    elif chest <= 40:
        return "L"
    elif chest <= 43:
        return "XL"
    else:
        return "XXL"


def _pant_size(waist: float, height_cm: float) -> str:
    """Return W{waist}L{length} — waist clamped to W28-W46."""
    w = max(28, min(46, round(waist)))
    # Inseam estimate: ~47% of height in cm → convert to inches → round to nearest even
    inseam_in = round(height_cm * 0.47 / 2.54)
    inseam_in = max(28, min(36, inseam_in))
    return f"W{w} L{inseam_in}"


@router.post("/size-recommend", response_model=SizeResponse)
async def size_recommend(req: SizeRequest):
    shirt   = _shirt_size(req.chest)
    pant    = _pant_size(req.waist, req.height_cm)
    jacket  = _shirt_size(req.chest)  # same chart as shirt

    return SizeResponse(shirt_size=shirt, pant_size=pant, jacket_size=jacket)
