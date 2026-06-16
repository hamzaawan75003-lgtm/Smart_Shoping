"""
Quick end-to-end smoke test for the updated Leffa adapter.
Calls /ai/tryon with public test images.
"""
import httpx
import json

BASE_URL = "http://localhost:8000"

payload = {
    "user_photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
    "clothing_image_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=512",
    "user_id": "test-smoke-user",
    "product_id": "test-smoke-product",
    "category": "Upper-body",
}

print("Checking health...")
r = httpx.get(f"{BASE_URL}/ai/tryon/health", timeout=10)
print(f"Health: {r.status_code} - {r.json()}")

print("\nCalling /ai/tryon (this may take 1-3 minutes for cold start)...")
try:
    r = httpx.post(f"{BASE_URL}/ai/tryon", json=payload, timeout=300)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"SUCCESS! Result URL: {data['result_image_url']}")
        print(f"Space used: {data.get('space_used', 'unknown')}")
    else:
        print(f"Error body: {r.text[:1000]}")
except Exception as e:
    print(f"Exception: {e}")
