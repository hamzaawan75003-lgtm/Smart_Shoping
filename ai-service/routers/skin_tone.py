import httpx
import numpy as np
import io

from PIL import Image
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.colour_theory import get_palette
from mediapipe.python.solutions import face_detection as mp_face_detection

router = APIRouter(prefix="/ai", tags=["skin-tone"])


class SkinToneRequest(BaseModel):
    photo_url: str


class SkinToneResponse(BaseModel):
    skin_tone: str  # "warm" | "cool" | "neutral"
    colour_palette: list[dict[str, str]]  # [{name, hex}]


@router.post("/skin-tone", response_model=SkinToneResponse)
async def skin_tone(req: SkinToneRequest):
    # 1. Download image
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(req.photo_url)
            resp.raise_for_status()
            image_bytes = resp.content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {e}")

    # 2. Decode with PIL → convert to RGB numpy
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_rgb = np.array(pil_img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load image: {e}")

    # 3. Detect face with MediaPipe
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.4) as face_det:
        results = face_det.process(img_rgb)

    h, w = img_rgb.shape[:2]

    if results.detections:
        det = results.detections[0]
        bb  = det.location_data.relative_bounding_box
        x1  = max(0, int(bb.xmin * w))
        y1  = max(0, int(bb.ymin * h))
        x2  = min(w, int((bb.xmin + bb.width)  * w))
        y2  = min(h, int((bb.ymin + bb.height) * h))
        face_region = img_rgb[y1:y2, x1:x2]
    else:
        # Fallback: centre 30% crop
        cy, cx = h // 2, w // 2
        pad_y, pad_x = h // 6, w // 6
        face_region = img_rgb[cy - pad_y:cy + pad_y, cx - pad_x:cx + pad_x]

    if face_region.size == 0:
        face_region = img_rgb  # last resort — use whole image

    # 4. Average RGB of the face region
    avg_r = float(np.mean(face_region[:, :, 0]))
    avg_g = float(np.mean(face_region[:, :, 1]))
    avg_b = float(np.mean(face_region[:, :, 2]))

    # 5. Classify skin tone
    if avg_r > 180 and avg_g > 140 and (avg_r - avg_b) > 30:
        tone = "warm"
    elif avg_b > 120 and avg_r < 200 and (avg_b - avg_r) > 10:
        tone = "cool"
    else:
        tone = "neutral"

    palette = get_palette(tone)

    return SkinToneResponse(skin_tone=tone, colour_palette=palette)
