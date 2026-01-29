import os
import requests
from dotenv import load_dotenv
import sys

# Force load from .env file
load_dotenv()

api_key = os.getenv("KUTRIM_API_KEY")
print(f"Checking environment variable KUTRIM_API_KEY...", file=sys.stderr)
print(f"API Key present: {bool(api_key)}", file=sys.stderr)

if api_key:
    # Do not print full key for security
    print(f"Key length: {len(api_key)}", file=sys.stderr)
    print(f"Key prefix: {api_key[:5]}...", file=sys.stderr)
else:
    print("FATAL: KUTRIM_API_KEY is missing!", file=sys.stderr)
    sys.exit(1)

url = "https://cloud.olakrutrim.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json", 
    "Authorization": f"Bearer {api_key}"
}
payload = {
    "model": "Krutrim-spectre-v2",
    "messages": [{"role": "user", "content": "Test connection. Reply with 'OK'."}],
    "max_tokens": 10
}

print(f"Sending request to {url}...", file=sys.stderr)
try:
    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"Status: {resp.status_code}", file=sys.stderr)
    print(f"Response Headers: {resp.headers}", file=sys.stderr)
    print(f"Response Body: {resp.text}", file=sys.stderr)
except Exception as e:
    print(f"Exception during request: {e}", file=sys.stderr)
