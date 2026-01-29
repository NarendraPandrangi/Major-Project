import requests
import sys

BASE_URL = "http://localhost:8000/api/auth"

def test_flow():
    email = "debug_test@example.com"
    password = "debugpassword123"
    
    # 1. Register
    print("1. Registering...")
    reg_payload = {
        "email": email,
        "username": "debug_test",
        "full_name": "Debug Test",
        "password": password
    }
    
    try:
        # Check if user exists first or just ignore 400
        resp = requests.post(f"{BASE_URL}/register", json=reg_payload)
        if resp.status_code == 201:
            print("   Registration successful")
        elif resp.status_code == 400 and "already" in resp.text:
            print("   User already exists, proceeding to login")
        else:
            print(f"   Registration FAILED: {resp.status_code} {resp.text}")
            return
            
        # 2. Login
        print("2. Logging in...")
        login_payload = {
            "email": email,
            "password": password
        }
        resp = requests.post(f"{BASE_URL}/login/email", json=login_payload, timeout=5)
        
        print(f"   Login Status Code: {resp.status_code}")
        print(f"   Login Response: {resp.text}")
        
        if resp.status_code == 200:
            print("   Login SUCCESS!")
            print(f"   Token: {resp.json().get('access_token')[:20]}...")
        else:
            print(f"   Login FAILED: {resp.status_code} {resp.text}")
            
    except Exception as e:
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_flow()
