"""
Seed sample data into the backend

This script populates the backend with sample data for testing and demonstration.
Run this script to quickly create sample users, areas, and initial data.

Usage:
    python seed_data.py
"""

import json
import hashlib
import secrets
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / "users.json"
AREAS_FILE = DATA_DIR / "areas.json"
ALLOCATIONS_FILE = DATA_DIR / "allocations.json"
LOGS_FILE = DATA_DIR / "logs.json"

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${pwd_hash.hex()}"

def save_json(file_path: Path, data):
    """Save data to JSON file"""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Created {file_path.name}")

def seed_users():
    """Create sample users"""
    users = {
        "admin@waterhub.com": {
            "username": "Admin User",
            "email": "admin@waterhub.com",
            "password_hash": hash_password("Admin@123"),
            "role": "admin",
            "created_at": datetime.now().isoformat()
        },
        "user@waterhub.com": {
            "username": "Regular User",
            "email": "user@waterhub.com",
            "password_hash": hash_password("User@123"),
            "role": "user",
            "created_at": datetime.now().isoformat()
        },
        "manager@waterhub.com": {
            "username": "Area Manager",
            "email": "manager@waterhub.com",
            "password_hash": hash_password("Manager@123"),
            "role": "admin",
            "created_at": datetime.now().isoformat()
        }
    }
    save_json(USERS_FILE, users)

def seed_areas():
    """Create sample areas"""
    areas = {
        "area_downtown": {
            "id": "area_downtown",
            "name": "Downtown District",
            "location": "City Center",
            "priority": "High",
            "population": 50000,
            "demand": 500.0,
            "current_allocation": 0.0
        },
        "area_industrial": {
            "id": "area_industrial",
            "name": "Industrial Zone",
            "location": "East End",
            "priority": "Medium",
            "population": 25000,
            "demand": 300.0,
            "current_allocation": 0.0
        },
        "area_residential": {
            "id": "area_residential",
            "name": "Residential Suburb",
            "location": "North West",
            "priority": "Low",
            "population": 15000,
            "demand": 150.0,
            "current_allocation": 0.0
        },
        "area_commercial": {
            "id": "area_commercial",
            "name": "Commercial Hub",
            "location": "South Central",
            "priority": "High",
            "population": 35000,
            "demand": 350.0,
            "current_allocation": 0.0
        },
        "area_agricultural": {
            "id": "area_agricultural",
            "name": "Agricultural Region",
            "location": "Outskirts",
            "priority": "Medium",
            "population": 8000,
            "demand": 400.0,
            "current_allocation": 0.0
        }
    }
    save_json(AREAS_FILE, areas)

def seed_allocations():
    """Create sample allocation data"""
    allocations = {
        "total_supply": 1000.0,
        "last_updated": datetime.now().isoformat(),
        "last_result": {
            "timestamp": datetime.now().isoformat(),
            "total_supply": 1000.0,
            "total_demand": 1700.0,
            "areas": [
                {
                    "id": "area_downtown",
                    "name": "Downtown District",
                    "location": "City Center",
                    "priority": "High",
                    "demand": 500.0,
                    "allocation": 500.0,
                    "status": "Full"
                },
                {
                    "id": "area_commercial",
                    "name": "Commercial Hub",
                    "location": "South Central",
                    "priority": "High",
                    "demand": 350.0,
                    "allocation": 350.0,
                    "status": "Full"
                },
                {
                    "id": "area_industrial",
                    "name": "Industrial Zone",
                    "location": "East End",
                    "priority": "Medium",
                    "demand": 300.0,
                    "allocation": 120.0,
                    "status": "Partial"
                },
                {
                    "id": "area_agricultural",
                    "name": "Agricultural Region",
                    "location": "Outskirts",
                    "priority": "Medium",
                    "demand": 400.0,
                    "allocation": 30.0,
                    "status": "Reduced"
                },
                {
                    "id": "area_residential",
                    "name": "Residential Suburb",
                    "location": "North West",
                    "priority": "Low",
                    "demand": 150.0,
                    "allocation": 0.0,
                    "status": "Reduced"
                }
            ],
            "justification": "Total Supply: 1000 units\nTotal Demand: 1700 units\nSupply deficit - applying priority allocation\n- High priority areas received full allocation\n- Medium priority areas received partial allocation\n- Low priority areas had allocations reduced due to deficit"
        }
    }
    save_json(ALLOCATIONS_FILE, allocations)

def seed_logs():
    """Create sample logs"""
    now = datetime.now().isoformat()
    logs = [
        {
            "timestamp": now,
            "action": "SYSTEM_INITIALIZED",
            "details": {
                "message": "System initialized with sample data"
            }
        },
        {
            "timestamp": now,
            "action": "USERS_CREATED",
            "details": {
                "count": 3,
                "users": ["admin@waterhub.com", "user@waterhub.com", "manager@waterhub.com"]
            }
        },
        {
            "timestamp": now,
            "action": "AREAS_CREATED",
            "details": {
                "count": 5,
                "areas": [
                    "Downtown District",
                    "Industrial Zone",
                    "Residential Suburb",
                    "Commercial Hub",
                    "Agricultural Region"
                ]
            }
        },
        {
            "timestamp": now,
            "action": "SUPPLY_SET",
            "details": {
                "total_supply": 1000.0
            }
        },
        {
            "timestamp": now,
            "action": "ALLOCATION_RUN",
            "details": {
                "total_supply": 1000.0,
                "total_demand": 1700.0,
                "areas_count": 5
            }
        }
    ]
    save_json(LOGS_FILE, logs)

def main():
    print("\n" + "="*60)
    print("Urban Water Supply Conflict Resolver".center(60))
    print("Sample Data Seeding".center(60))
    print("="*60 + "\n")
    
    print("Creating sample data...\n")
    
    try:
        seed_users()
        seed_areas()
        seed_allocations()
        seed_logs()
        
        print("\n" + "="*60)
        print("✓ Sample data created successfully!".center(60))
        print("="*60 + "\n")
        
        print("Sample Credentials:")
        print("  Admin User:")
        print("    Email: admin@waterhub.com")
        print("    Password: Admin@123")
        print()
        print("  Regular User:")
        print("    Email: user@waterhub.com")
        print("    Password: User@123")
        print()
        print("  Area Manager:")
        print("    Email: manager@waterhub.com")
        print("    Password: Manager@123")
        print()
        print("5 Sample Areas Created:")
        print("  1. Downtown District (High Priority)")
        print("  2. Commercial Hub (High Priority)")
        print("  3. Industrial Zone (Medium Priority)")
        print("  4. Agricultural Region (Medium Priority)")
        print("  5. Residential Suburb (Low Priority)")
        print()
        print("Total Supply: 1000 units")
        print("Total Demand: 1700 units (supply deficit)")
        print()
        print("="*60)
        print("Ready to test the API!".center(60))
        print("Start server: uvicorn app:app --reload --port 8001".center(60))
        print("API Docs: http://127.0.0.1:8001/docs".center(60))
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"✗ Error creating sample data: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
