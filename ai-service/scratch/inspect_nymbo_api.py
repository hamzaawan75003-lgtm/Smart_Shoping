from gradio_client import Client
from dotenv import load_dotenv

load_dotenv()

HF_SPACE = "Nymbo/Virtual-Try-On"

try:
    print(f"Connecting to {HF_SPACE}...")
    client = Client(HF_SPACE)
    print("\nAPI Info:")
    client.view_api()
except Exception as e:
    print(f"Error connecting to {HF_SPACE}: {e}")
