from gradio_client import Client
import requests
from dotenv import load_dotenv

load_dotenv()

SPACES = [
    "yisol/IDM-VTON",
    "Nymbo/Virtual-Try-On",
    "Kwai-VGI/IDM-VTON",
    "zhengchong/IDM-VTON",
]


def download_image(url, filename):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
    return False


def test_space(space_name):
    print(f"\n--- Testing Space: {space_name} ---")
    try:
        client = Client(space_name)
        print(f"Successfully connected to {space_name}")
        # Just check API
        client.view_api()
        return True
    except Exception as e:
        print(f"Failed to connect/view API for {space_name}: {e}")
        return False


if __name__ == "__main__":
    for space in SPACES:
        test_space(space)
