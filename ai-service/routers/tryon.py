# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false, reportAny=false, reportExplicitAny=false
import asyncio
import io
import logging
import os
import tempfile

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

_ = load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["tryon"])

# ---------------------------------------------------------------------------
# Supabase config
# ---------------------------------------------------------------------------
SUPABASE_URL: str = os.getenv(
    "SUPABASE_URL", "https://wkhcgqbtzkwhuuurhujc.supabase.co"
)
SUPABASE_KEY: str = (
    os.getenv(
        "SUPABASE_SERVICE_ROLE_KEY",
        os.getenv(
            "SUPABASE_ANON_KEY",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndraGNncWJ0emt3aHV1dXJodWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDM5NDEsImV4cCI6MjA5MjQxOTk0MX0.2uYhRMRYdIWXPh0oAW1vB-O2kHATcdBS9NgY2Ueoacw",
        ),
    )
    or ""
)

SUPABASE_HEADERS: dict[str, str] = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
HF_TOKEN: str | None = os.getenv("HF_TOKEN") or None

# Space pool — ordered by reliability (confirmed live spaces first)
# Run scratch/probe_spaces*.py to rediscover working spaces
SPACE_POOL: list[tuple[str, str]] = [
    ("franciszzj/Leffa", "leffa"),              # CONFIRMED LIVE — api: /leffa_predict_vt
    ("WeShopAI/WeShopAI-Virtual-Try-On", "weshop"),  # CONFIRMED LIVE — api: /generate_image
    ("zhengchong/CatVTON", "catvton"),          # Sometimes wakes up
    ("yisol/IDM-VTON", "idmvton"),              # Sometimes wakes up
    ("wild-design-ai/OOTDiffusion", "ootd"),    # Fork — often 404
]

MAX_RETRIES = 2
GPU_WAIT_BASE_SEC = 30
COLD_START_WAIT = 60  # Increased because spaces take time to load on free tier

# Errors that mean the space is down or misconfigured — skip immediately
SKIP_ERRORS = (
    "RUNTIME_ERROR",
    "CONFIG_ERROR",
    "invalid state",
    "Space is paused",
    "Repository Not Found",
    "404 Client Error",
    "503 Service",
    "Cannot find a function",  # Wrong api_name — skip, don't retry
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class TryOnRequest(BaseModel):
    user_photo_url: str
    clothing_image_url: str
    user_id: str
    product_id: str
    category: str = "Upper-body"


class TryOnResponse(BaseModel):
    result_image_url: str
    space_used: str = ""


# ---------------------------------------------------------------------------
# Helper: download URL to local temp file
# ---------------------------------------------------------------------------
async def _download_to_tempfile(url: str, suffix: str = ".jpg") -> str:
    """Downloads a URL to a local temp file. Returns the file path."""
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(resp.content)
    tmp.flush()
    tmp.close()
    logger.info("Downloaded %s -> %s (%d bytes)", url, tmp.name, len(resp.content))
    return tmp.name


# ---------------------------------------------------------------------------
# Helper: read bytes from a local file path
# ---------------------------------------------------------------------------
def _read_file(path: str) -> bytes:
    with open(path, "rb") as f:
        return f.read()


# ---------------------------------------------------------------------------
# Helper: safely flatten any gradio result to a local file path
# ---------------------------------------------------------------------------
def _extract_path(result: object, space: str) -> str:
    logger.info(
        "[%s] raw result: type=%s  value=%r", space, type(result).__name__, result
    )

    if isinstance(result, tuple) and len(result) == 1:
        result = result[0]
    if isinstance(result, (list, tuple)):
        if len(result) == 0:
            raise ValueError(f"[{space}] empty result list — space produced no output")
        result = result[0]
    if isinstance(result, tuple) and len(result) == 1:
        result = result[0]

    if isinstance(result, dict):
        path = (
            result.get("image")
            or result.get("name")
            or result.get("path")
            or result.get("url")
        )
        if not path:
            raise ValueError(f"[{space}] no path key in dict: {result}")
        return str(path)

    if result is None:
        raise ValueError(f"[{space}] result is None")

    return str(result)


# ---------------------------------------------------------------------------
# Helper: upload to Cloudinary
# ---------------------------------------------------------------------------
def _upload_to_cloudinary(file_bytes: bytes, folder: str = "tryon-results") -> str:
    try:
        import cloudinary  # type: ignore
        import cloudinary.uploader  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "cloudinary not installed. Fix: pip install cloudinary"
        ) from exc

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        raise ValueError("Missing Cloudinary credentials.")

    cloudinary.config(
        cloud_name=cloud_name, api_key=api_key, api_secret=api_secret, secure=True
    )
    upload_result = cloudinary.uploader.upload(
        io.BytesIO(file_bytes), folder=folder, resource_type="image"
    )
    return str(upload_result["secure_url"])


# ---------------------------------------------------------------------------
# Space adapters
# ---------------------------------------------------------------------------


def _get_api_fn_index(hf_client: object, target_api_name: str) -> int | None:
    """Dynamically find the fn_index for a given api_name."""
    try:
        api_name_map = hf_client.api_name_map  # type: ignore
        if api_name_map and target_api_name in api_name_map:
            return api_name_map[target_api_name]
    except Exception:
        pass
    return None


def _call_ootd(
    hf_client: object,
    person_path: str,
    garment_path: str,
    category: str,
) -> bytes:
    from gradio_client import handle_file  # type: ignore

    try:
        result = hf_client.predict(  # type: ignore[attr-defined]
            handle_file(person_path),
            handle_file(garment_path),
            category,
            1,
            20,
            2.0,
            42,
            fn_index=0,
        )
        return _read_file(_extract_path(result, "OOTDiffusion"))
    except Exception as e:
        logger.warning("[OOTDiffusion] fn_index=0 failed: %s", e)
        raise


def _call_weshop(
    hf_client: object,
    person_path: str,
    garment_path: str,
    _category: str,
) -> bytes:
    """
    Calls WeShopAI/WeShopAI-Virtual-Try-On via confirmed API `/generate_image`.

    Signature (probed 2026-05-16):
      predict(main_image, background_image, api_name="/generate_image") -> result
      main_image = garment photo
      background_image = person photo
    """
    from gradio_client import handle_file  # type: ignore

    result = hf_client.predict(  # type: ignore[attr-defined]
        handle_file(garment_path),  # main_image = garment
        handle_file(person_path),   # background_image = person
        api_name="/generate_image",
    )
    return _read_file(_extract_path(result, "WeShopAI"))


def _call_catvton(
    hf_client: object,
    person_path: str,
    garment_path: str,
    _category: str,
) -> bytes:
    from gradio_client import handle_file  # type: ignore

    try:
        result = hf_client.predict(  # type: ignore[attr-defined]
            handle_file(person_path),
            handle_file(garment_path),
            api_name="/tryon",
        )
        return _read_file(_extract_path(result, "CatVTON"))
    except Exception as e:
        logger.warning("[CatVTON] /tryon failed: %s — trying auto-detect", e)
        fn_idx = _get_api_fn_index(hf_client, "/tryon")
        if fn_idx is not None:
            result = hf_client.predict(
                handle_file(person_path), handle_file(garment_path), fn_index=fn_idx
            )  # type: ignore
            return _read_file(_extract_path(result, "CatVTON"))
        raise


def _call_leffa(
    hf_client: object,
    person_path: str,
    garment_path: str,
    category: str,
) -> bytes:
    """
    Calls franciszzj/Leffa via its confirmed API endpoint `/leffa_predict_vt`.

    Signature (probed 2026-05-16):
      predict(src_image_path, ref_image_path, ref_acceleration='False',
              step=30, scale=2.5, seed=42,
              vt_model_type='viton_hd', vt_garment_type='upper_body',
              vt_repaint='False',
              api_name="/leffa_predict_vt")
      -> (generated_image, generated_mask, generated_densepose)
    """
    from gradio_client import handle_file  # type: ignore

    # Map our generic category to Leffa's enum
    _garment_map = {
        "upper": "upper_body",
        "upper-body": "upper_body",
        "upper_body": "upper_body",
        "lower": "lower_body",
        "lower-body": "lower_body",
        "lower_body": "lower_body",
        "dress": "dresses",
        "dresses": "dresses",
        "full": "dresses",
    }
    garment_type = _garment_map.get(category.lower(), "upper_body")

    result = hf_client.predict(  # type: ignore[attr-defined]
        handle_file(person_path),   # src_image_path
        handle_file(garment_path),  # ref_image_path
        "False",                    # ref_acceleration
        30,                         # step
        2.5,                        # scale
        42,                         # seed
        "viton_hd",                 # vt_model_type
        garment_type,               # vt_garment_type
        "False",                    # vt_repaint
        api_name="/leffa_predict_vt",
    )
    # Returns (generated_image, generated_mask, generated_densepose) — take first
    if isinstance(result, (list, tuple)) and len(result) >= 1:
        img = result[0]
    else:
        img = result
    return _read_file(_extract_path(img, "Leffa"))


def _call_idmvton(
    hf_client: object,
    person_path: str,
    garment_path: str,
    _category: str,
) -> bytes:
    from gradio_client import handle_file  # type: ignore

    try:
        result = hf_client.predict(  # type: ignore[attr-defined]
            {
                "background": handle_file(person_path),
                "layers": [],
                "composite": None,
            },
            handle_file(garment_path),
            "Virtual try on garment",
            True,
            False,
            30,
            42,
            api_name="/tryon",
        )
        return _read_file(_extract_path(result, "IDM-VTON"))
    except Exception as e:
        logger.warning("[IDM-VTON] /tryon failed: %s — trying auto-detect", e)
        fn_idx = _get_api_fn_index(hf_client, "/tryon")
        if fn_idx is not None:
            result = hf_client.predict(
                handle_file(person_path), handle_file(garment_path), fn_index=fn_idx
            )  # type: ignore
            return _read_file(_extract_path(result, "IDM-VTON"))
        raise


ADAPTERS = {
    "ootd": _call_ootd,
    "weshop": _call_weshop,
    "catvton": _call_catvton,
    "leffa": _call_leffa,
    "idmvton": _call_idmvton,
}


# ---------------------------------------------------------------------------
# Main try-on runner
# ---------------------------------------------------------------------------
async def _run_tryon(
    user_photo_url: str,
    clothing_image_url: str,
    category: str = "Upper-body",
) -> tuple[bytes, str]:
    from gradio_client import Client  # type: ignore

    try:
        person_path = await _download_to_tempfile(user_photo_url, suffix=".jpg")
        garment_path = await _download_to_tempfile(clothing_image_url, suffix=".jpg")
    except Exception as exc:
        logger.error("Failed to download input images: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=f"Could not download input images. Error: {exc}",
        )

    all_errors: list[str] = []

    try:
        for space_id, adapter_name in SPACE_POOL:
            adapter_fn = ADAPTERS[adapter_name]

            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    logger.info("[%s] Attempt %d/%d", space_id, attempt, MAX_RETRIES)
                    hf_client = Client(space_id, token=HF_TOKEN)
                    result_bytes = adapter_fn(
                        hf_client, person_path, garment_path, category
                    )
                    logger.info("[%s] SUCCESS on attempt %d", space_id, attempt)
                    return result_bytes, space_id

                except Exception as exc:
                    error_msg = str(exc)
                    logger.warning(
                        "[%s] Attempt %d failed: %s", space_id, attempt, error_msg
                    )

                    if any(skip in error_msg for skip in SKIP_ERRORS):
                        logger.warning(
                            "[%s] Space is down — skipping to next", space_id
                        )
                        all_errors.append(f"{space_id}: DOWN ({error_msg[:80]})")
                        break

                    is_cold_start = (
                        "upstream Gradio app has raised an exception" in error_msg
                        or "loading" in error_msg.lower()
                        or "list index out of range"
                        in error_msg  # App is up but API mismatch
                    )
                    has_more = attempt < MAX_RETRIES

                    if is_cold_start and has_more:
                        logger.info(
                            "[%s] Cold start/Loading — retrying in %ds",
                            space_id,
                            COLD_START_WAIT,
                        )
                        await asyncio.sleep(COLD_START_WAIT)
                        continue

                    all_errors.append(f"{space_id}: {error_msg[:120]}")
                    break

    finally:
        for path in (person_path, garment_path):
            try:
                os.unlink(path)
            except OSError:
                pass

    logger.error("All spaces failed: %s", all_errors)
    raise HTTPException(
        status_code=503,
        detail="Virtual try-on is temporarily unavailable — all AI spaces are down. Details: "
        + " | ".join(all_errors),
    )


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------
@router.post("/tryon", response_model=TryOnResponse)
async def virtual_tryon(req: TryOnRequest) -> TryOnResponse:
    # Step 1 — Cache check
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            cache_resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/tryon_cache",
                headers=SUPABASE_HEADERS,
                params={
                    "select": "result_image_url",
                    "user_id": f"eq.{req.user_id}",
                    "product_id": f"eq.{req.product_id}",
                },
            )
            if cache_resp.status_code == 200:
                rows = cache_resp.json()
                if rows and rows[0].get("result_image_url"):
                    return TryOnResponse(result_image_url=rows[0]["result_image_url"])
    except Exception as exc:
        logger.warning("Cache check failed (proceeding): %s", exc)

    # Step 2+3 — Download + try-on
    result_bytes, space_used = await _run_tryon(
        req.user_photo_url,
        req.clothing_image_url,
        req.category,
    )
    logger.info("Try-on completed using: %s", space_used)

    # Step 4 — Upload to Cloudinary
    try:
        result_url = _upload_to_cloudinary(result_bytes, folder="tryon-results")
    except Exception as exc:
        logger.error("Cloudinary upload failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Failed to upload result: {exc}")

    # Step 5 — Cache in Supabase (non-fatal)
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            _insert_resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/tryon_cache",
                headers=SUPABASE_HEADERS,
                json={
                    "user_id": req.user_id,
                    "product_id": req.product_id,
                    "result_image_url": result_url,
                },
            )
    except Exception as exc:
        logger.warning("Cache insert failed (non-fatal): %s", exc)

    # Step 6 — Return
    return TryOnResponse(result_image_url=result_url, space_used=space_used)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@router.get("/tryon/health")
async def tryon_health() -> dict[str, object]:
    cloudinary_ok = all(
        os.getenv(k)
        for k in (
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
        )
    )
    return {
        "status": "tryon router ready",
        "space_pool": [s for s, _ in SPACE_POOL],
        "hf_token_configured": HF_TOKEN is not None,
        "cloudinary_configured": cloudinary_ok,
        "supabase_configured": bool(SUPABASE_KEY and SUPABASE_URL),
    }
