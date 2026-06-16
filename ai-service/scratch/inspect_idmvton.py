"""
scratch/inspect_idmvton.py
~~~~~~~~~~~~~~~~~~~~~~~~~~
Run this LOCALLY to inspect the exact IDM-VTON API signature and test a call.

Usage:
    python inspect_idmvton.py

Paste the output here so the predict() call in tryon.py can be fixed.
"""

import os
import tempfile

import httpx
from dotenv import load_dotenv
from gradio_client import Client, handle_file  # type: ignore

_ = load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

# ── Step 1: Print the full API ───────────────────────────────────────────────
print("\n" + "=" * 60)
print("IDM-VTON API SIGNATURE")
print("=" * 60)
client = Client("yisol/IDM-VTON", token=HF_TOKEN)
client.view_api()


# ── Helper: download image to temp file ─────────────────────────────────────
def download(url: str, suffix: str = ".jpg") -> str:
    resp = httpx.get(url, follow_redirects=True, timeout=30)
    resp.raise_for_status()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(resp.content)
    tmp.flush()
    tmp.close()
    print(f"Downloaded {url} -> {tmp.name} ({len(resp.content)} bytes)")
    return tmp.name


# ── Step 2: Download public test images ─────────────────────────────────────
print("\n" + "=" * 60)
print("DOWNLOADING TEST IMAGES")
print("=" * 60)

TEST_PERSON_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512"
TEST_GARMENT_URL = "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=512"

person_path = download(TEST_PERSON_URL)
garment_path = download(TEST_GARMENT_URL)

# ── Step 3: Try predict call ─────────────────────────────────────────────────
print("\n" + "=" * 60)
print("CALLING /tryon  (person=ImageEditor dict, garment=file)")
print("=" * 60)

try:
    result = client.predict(
        {
            "background": handle_file(person_path),
            "layers": [],
            "composite": None,  # MUST be None — auto-mask handles this
        },
        handle_file(garment_path),
        "shirt",
        True,
        False,
        30,
        42,
        api_name="/tryon",
    )
    print("SUCCESS:", result)

except Exception as exc:
    print("FAILED with current format:", exc)

    print("\nTrying swapped order (garment first, person second)...")
    try:
        result2 = client.predict(
            handle_file(garment_path),
            {
                "background": handle_file(person_path),
                "layers": [],
                "composite": handle_file(person_path),
            },
            "shirt",
            True,
            False,
            30,
            42,
            api_name="/tryon",
        )
        print("SUCCESS with swapped order:", result2)
    except Exception as exc2:
        print("FAILED with swapped order too:", exc2)

# ── Cleanup ──────────────────────────────────────────────────────────────────
for p in (person_path, garment_path):
    try:
        os.unlink(p)
    except OSError:
        pass

print("\nDone. Paste the full output above back to Claude.")
