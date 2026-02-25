import requests
import uuid
import sys

API_BASE = "http://localhost:8001/api/auth"

def register():
    # Use a short UUID to avoid long usernames if there's a limit, though Firestore is flexible
    uid = str(uuid.uuid4())[:8]
    email = f"testuser_{uid}@example.com"
    username = f"testuser_{uid}"
    password = "password123"
    
    print(f"Registering {email}...", file=sys.stderr)
    
    try:
        res = requests.post(f"{API_BASE}/register", json={
            "email": email,
            "username": username,
            "password": password,
            "full_name": "Test User"
        })
        
        if res.status_code == 201:
            print("Registration successful", file=sys.stderr)
            # print(res.json())
            return email, password
        else:
            print("Registration failed", file=sys.stderr)
            print(f"Status: {res.status_code}", file=sys.stderr)
            print(f"Response: {res.text}", file=sys.stderr)
            return None, None
    except Exception as e:
        print(f"Registration exception: {e}", file=sys.stderr)
        return None, None

def login(email, password):
    print(f"Logging in {email}...", file=sys.stderr)
    try:
        res = requests.post(f"{API_BASE}/login/email", json={
            "email": email,
            "password": password
        })
        
        if res.status_code == 200:
            print("Login successful", file=sys.stderr)
            # print(res.json())
        else:
            print("Login failed", file=sys.stderr)
            print(f"Status: {res.status_code}", file=sys.stderr)
            print(f"Response: {res.text}", file=sys.stderr)
    except Exception as e:
        print(f"Login exception: {e}", file=sys.stderr)

if __name__ == "__main__":
    email, password = register()
    if email:
        login(email, password)
