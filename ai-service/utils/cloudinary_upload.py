# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false, reportAny=false, reportExplicitAny=false
"""
utils/cloudinary_upload.py
~~~~~~~~~~~~~~~~~~~~~~~~~~
Thin wrapper around the Cloudinary SDK.

- Config is read from environment variables at call time (NOT at import time).
  This prevents crashes on startup if env vars aren't loaded yet.
- Credentials are NEVER hard-coded — use .env or your deployment secrets manager.

Required .env variables:
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
"""

import io
import os

from dotenv import load_dotenv

_ = load_dotenv()


def _configure_cloudinary() -> None:
    """
    Read credentials from env and apply them to the cloudinary SDK.
    Called lazily before every upload to ensure env vars are always current.

    Raises:
        ImportError: if the 'cloudinary' package is not installed.
        ValueError:  if any required env variable is missing.
    """
    try:
        import cloudinary  # type: ignore
    except ImportError as exc:
        raise ImportError(
            "The 'cloudinary' package is not installed. Fix: pip install cloudinary"
        ) from exc

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    missing = [
        name
        for name, val in {
            "CLOUDINARY_CLOUD_NAME": cloud_name,
            "CLOUDINARY_API_KEY": api_key,
            "CLOUDINARY_API_SECRET": api_secret,
        }.items()
        if not val
    ]

    if missing:
        raise ValueError(
            f"Missing Cloudinary environment variable(s): {', '.join(missing)}. "
            "Add them to your .env file."
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def upload_image(file_bytes: bytes, folder: str = "styleai") -> str:
    """
    Upload raw image bytes to Cloudinary and return the secure CDN URL.

    Args:
        file_bytes: Raw bytes of the image to upload.
        folder:     Cloudinary folder path (default: "styleai").

    Returns:
        Secure HTTPS URL of the uploaded image.

    Raises:
        ImportError: if cloudinary is not installed.
        ValueError:  if required env vars are missing.
        Exception:   propagated as-is if the upload fails.

    Example:
        with open("photo.jpg", "rb") as f:
            url = upload_image(f.read(), folder="tryon-results")
        print(url)  # https://res.cloudinary.com/...
    """
    _configure_cloudinary()

    import cloudinary.uploader  # type: ignore

    result = cloudinary.uploader.upload(
        io.BytesIO(file_bytes),
        folder=folder,
        resource_type="image",
    )
    return str(result["secure_url"])


def upload_image_from_path(file_path: str, folder: str = "styleai") -> str:
    """
    Convenience wrapper: reads a file from disk and uploads it.

    Args:
        file_path: Absolute or relative path to the image file.
        folder:    Cloudinary folder path (default: "styleai").

    Returns:
        Secure HTTPS URL of the uploaded image.
    """
    with open(file_path, "rb") as f:
        return upload_image(f.read(), folder=folder)
