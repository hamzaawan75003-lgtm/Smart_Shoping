import httpx
import numpy as np
import io

from PIL import Image
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from mediapipe.python.solutions import pose as mp_pose

router = APIRouter(prefix="/ai", tags=["body-detection"])


class BodyDetectionRequest(BaseModel):
    photo_url: str
    height_cm: float


class BodyDetectionResponse(BaseModel):
    chest: float
    waist: float
    hips: float
    shoulders: float
    landmarks_detected: bool


@router.post("/body-detection", response_model=BodyDetectionResponse)
async def body_detection(req: BodyDetectionRequest):
    # 1. Download image
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(req.photo_url)
            resp.raise_for_status()
            image_bytes = resp.content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {e}")

    # 2. Load with PIL → numpy RGB
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(pil_img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load image: {e}")

    h_px, w_px, _ = img_np.shape

    # 3. Run MediaPipe Pose
    with mp_pose.Pose(static_image_mode=True, model_complexity=2) as pose:
        results = pose.process(img_np)

    if not results.pose_landmarks:
        # Return fallback estimates if detection fails
        return BodyDetectionResponse(
            chest=round(req.height_cm * 0.42 / 2.54, 1),
            waist=round(req.height_cm * 0.38 / 2.54, 1),
            hips=round(req.height_cm * 0.52 / 2.54, 1),
            shoulders=round(req.height_cm * 0.26 / 2.54, 1),
            landmarks_detected=False,
        )

    lm = results.pose_landmarks.landmark

    def px(landmark):
        return landmark.x * w_px, landmark.y * h_px

    # Key landmarks
    # 11=left shoulder, 12=right shoulder, 23=left hip, 24=right hip
    # 0=nose (top proxy), 27=left ankle, 28=right ankle (bottom proxy)
    ls_x, ls_y = px(lm[11])
    rs_x, rs_y = px(lm[12])
    lh_x, lh_y = px(lm[23])
    rh_x, rh_y = px(lm[24])
    nose_y      = lm[0].y * h_px
    lankle_y    = lm[27].y * h_px
    rankle_y    = lm[28].y * h_px

    shoulder_width_px = abs(ls_x - rs_x)
    hip_width_px      = abs(lh_x - rh_x)
    total_height_px   = max(lankle_y, rankle_y) - nose_y
    total_height_px   = max(total_height_px, 1)  # prevent div/0

    h = req.height_cm

    chest     = round(shoulder_width_px / total_height_px * h * 0.42 / 2.54, 1)
    waist     = round(hip_width_px      / total_height_px * h * 0.38 / 2.54, 1)
    hips      = round(hip_width_px      / total_height_px * h * 0.52 / 2.54, 1)
    shoulders = round(shoulder_width_px / total_height_px * h * 0.26 / 2.54, 1)

    return BodyDetectionResponse(
        chest=chest,
        waist=waist,
        hips=hips,
        shoulders=shoulders,
        landmarks_detected=True,
    )
