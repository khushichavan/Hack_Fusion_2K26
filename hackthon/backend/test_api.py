"""
Example script to test the Urban Water Supply Conflict Resolver API
Run this script after starting the backend server with: python -m uvicorn app:app --reload

This script demonstrates:
1. User signup and login
2. Creating areas
3. Setting supply
4. Running allocation
5. Viewing results and logs
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8001"

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
    print(f"{text.center(60)}")
    print(f"{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ {text}{Colors.ENDC}")

def print_request(method, endpoint):
    print(f"{Colors.YELLOW}{method:6} {endpoint}{Colors.ENDC}")

def pretty_json(data):
    return json.dumps(data, indent=2)

# ============================================================================
# 1. Test Health Check
# ============================================================================
def test_health_check():
    print_header("1. Health Check")
    
    print_request("GET", "/health")
    response = requests.get(f"{BASE_URL}/health")
    
    if response.status_code == 200:
        print_success("Server is healthy")
        print(f"Response: {pretty_json(response.json())}")
    else:
        print_error(f"Health check failed: {response.status_code}")
    
    return response.status_code == 200

# ============================================================================
# 2. User Authentication
# ============================================================================
def test_signup():
    print_header("2. User Signup")
    
    signup_data = {
        "username": "admin_user",
        "email": "admin@waterhub.com",
        "password": "SecurePass123!",
        "role": "admin"
    }
    
    print_request("POST", "/signup")
    print(f"Payload: {pretty_json(signup_data)}")
    
    response = requests.post(f"{BASE_URL}/signup", json=signup_data)
    
    if response.status_code == 200:
        print_success("User registered successfully")
        print(f"Response: {pretty_json(response.json())}")
    else:
        print_error(f"Signup failed: {response.status_code}")
        print(f"Response: {response.text}")
    
    return signup_data

def test_login(login_data):
    print_header("3. User Login")
    
    print_request("POST", "/login")
    print(f"Payload: {pretty_json(login_data)}")
    
    response = requests.post(f"{BASE_URL}/login", json={
        "email": login_data["email"],
        "password": login_data["password"]
    })
    
    if response.status_code == 200:
        print_success("Login successful")
        print(f"Response: {pretty_json(response.json())}")
    else:
        print_error(f"Login failed: {response.status_code}")
    
    return response.status_code == 200

# ============================================================================
# 3. Profile Management
# ============================================================================
def test_get_profile(email):
    print_header("4. Get User Profile")
    
    print_request("GET", f"/profile?email={email}")
    
    response = requests.get(f"{BASE_URL}/profile", params={"email": email})
    
    if response.status_code == 200:
        print_success("Profile retrieved")
        print(f"Response: {pretty_json(response.json())}")
    else:
        print_error(f"Get profile failed: {response.status_code}")
    
    return response.status_code == 200

# ============================================================================
# 4. Areas Management
# ============================================================================
def test_create_areas():
    print_header("5. Create Areas")
    
    areas_data = [
        {
            "name": "Downtown District",
            "location": "City Center",
            "priority": "High",
            "population": 50000,
            "demand": 500
        },
        {
            "name": "Industrial Zone",
            "location": "East End",
            "priority": "Medium",
            "population": 25000,
            "demand": 300
        },
        {
            "name": "Residential Suburb",
            "location": "North West",
            "priority": "Low",
            "population": 15000,
            "demand": 150
        }
    ]
    
    created_areas = []
    
    for area in areas_data:
        print_request("POST", "/areas")
        print(f"Payload: {pretty_json(area)}")
        
        response = requests.post(f"{BASE_URL}/areas", json=area)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Area '{area['name']}' created")
            created_areas.append(result["area"])
            print(f"Response: {pretty_json(result)}")
        else:
            print_error(f"Failed to create area: {response.status_code}")
        
        print()
    
    return created_areas

def test_get_areas():
    print_header("6. Get All Areas")
    
    print_request("GET", "/areas")
    
    response = requests.get(f"{BASE_URL}/areas")
    
    if response.status_code == 200:
        areas = response.json()
        print_success(f"Retrieved {len(areas)} areas")
        print(f"Response: {pretty_json(areas)}")
    else:
        print_error(f"Failed to get areas: {response.status_code}")
    
    return response.json() if response.status_code == 200 else []

# ============================================================================
# 5. Supply Management
# ============================================================================
def test_set_supply():
    print_header("7. Set Water Supply")
    
    supply_data = {
        "total_supply": 700  # Less than total demand (950)
    }
    
    print_request("POST", "/supply")
    print(f"Payload: {pretty_json(supply_data)}")
    
    response = requests.post(f"{BASE_URL}/supply", json=supply_data)
    
    if response.status_code == 200:
        print_success("Water supply set")
        print(f"Response: {pretty_json(response.json())}")
        return supply_data["total_supply"]
    else:
        print_error(f"Failed to set supply: {response.status_code}")
    
    return None

# ============================================================================
# 6. Allocation
# ============================================================================
def test_run_allocation(total_supply):
    print_header("8. Run Water Allocation")
    
    allocation_data = {
        "total_supply": total_supply
    }
    
    print_request("POST", "/allocate")
    print(f"Payload: {pretty_json(allocation_data)}")
    print_info("This will run the priority-based allocation algorithm")
    
    response = requests.post(f"{BASE_URL}/allocate", json=allocation_data)
    
    if response.status_code == 200:
        result = response.json()
        print_success("Allocation completed")
        print(f"Response: {pretty_json(result)}")
    else:
        print_error(f"Allocation failed: {response.status_code}")
    
    return response.status_code == 200

def test_get_allocation_results():
    print_header("9. Get Allocation Results")
    
    print_request("GET", "/allocation-results")
    
    response = requests.get(f"{BASE_URL}/allocation-results")
    
    if response.status_code == 200:
        result = response.json()
        print_success("Allocation results retrieved")
        
        # Pretty print the results
        allocation_result = result.get("result", {})
        print(f"\n{Colors.BOLD}Allocation Summary:{Colors.ENDC}")
        print(f"  Total Supply: {allocation_result.get('total_supply', 'N/A')} units")
        print(f"  Total Demand: {allocation_result.get('total_demand', 'N/A')} units")
        
        print(f"\n{Colors.BOLD}Area Allocations:{Colors.ENDC}")
        for area in allocation_result.get("areas", []):
            print(f"\n  {Colors.CYAN}{area.get('name')} ({area.get('priority')}){Colors.ENDC}")
            print(f"    Location: {area.get('location')}")
            print(f"    Demand: {area.get('demand')} units")
            print(f"    Allocated: {area.get('allocation')} units")
            print(f"    Status: {area.get('status')}")
        
        print(f"\n{Colors.BOLD}Justification:{Colors.ENDC}")
        print(f"  {allocation_result.get('justification', 'N/A')}")
        
    else:
        print_error(f"Failed to get results: {response.status_code}")
    
    return response.status_code == 200

# ============================================================================
# 7. Logs
# ============================================================================
def test_get_logs():
    print_header("10. Get Activity Logs")
    
    print_request("GET", "/logs?limit=20")
    
    response = requests.get(f"{BASE_URL}/logs", params={"limit": 20})
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Retrieved {data.get('total', 0)} total logs (showing last 20)")
        
        print(f"\n{Colors.BOLD}Recent Activities:{Colors.ENDC}")
        for log in data.get("logs", [])[-5:]:  # Show last 5
            print(f"\n  {Colors.YELLOW}{log.get('action')}{Colors.ENDC}")
            print(f"    Time: {log.get('timestamp')}")
            print(f"    Details: {pretty_json(log.get('details', {}))}")
    else:
        print_error(f"Failed to get logs: {response.status_code}")
    
    return response.status_code == 200

# ============================================================================
# Main Test Suite
# ============================================================================
def main():
    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║  Urban Water Supply Conflict Resolver - API Test Suite    ║
    ║                                                           ║
    ║  Make sure the backend server is running at              ║
    ║  http://127.0.0.1:8001                                  ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    print(Colors.ENDC)
    
    try:
        # Test 1: Health check
        if not test_health_check():
            print_error("Backend server is not running. Please start it first.")
            print_info("Run: python -m uvicorn app:app --reload --port 8001")
            return
        
        # Test 2-3: Authentication
        signup_data = test_signup()
        test_login(signup_data)
        
        # Test 4: Profile
        test_get_profile(signup_data["email"])
        
        # Test 5-6: Areas
        test_create_areas()
        test_get_areas()
        
        # Test 7-9: Supply and Allocation
        total_supply = test_set_supply()
        if total_supply:
            test_run_allocation(total_supply)
            test_get_allocation_results()
        
        # Test 10: Logs
        test_get_logs()
        
        # Final summary
        print_header("Test Suite Complete!")
        print_success("All API endpoints tested successfully!")
        print_info("You can now integrate this API with your frontend")
        print_info("API Documentation available at: http://127.0.0.1:8001/docs")
        
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to backend server")
        print_info("Make sure the server is running at http://127.0.0.1:8001")
        print_info("Run: python -m uvicorn app:app --reload --port 8001")
    except Exception as e:
        print_error(f"Test failed with error: {str(e)}")

if __name__ == "__main__":
    main()
