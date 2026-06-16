"""
Probe round 3 — more community spaces.
"""
import os
from dotenv import load_dotenv

load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

SPACES = [
    "Xenova/virtual-try-on",
    "abdala9512/virtual-try-on",
    "SmartLifeAI/virtual-try-on",
    "rlawjdghek/StableVITON",
    "hysts/IDM-VTON",
]

from gradio_client import Client  # type: ignore

for space_id in SPACES:
    print("\n" + "=" * 60)
    print(f"SPACE: {space_id}")
    print("=" * 60)
    try:
        client = Client(space_id, token=HF_TOKEN)
        client.view_api()
    except Exception as e:
        print(f"  ERROR: {e}")
