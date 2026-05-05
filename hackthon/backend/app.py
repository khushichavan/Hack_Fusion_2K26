from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import json
import os
from datetime import datetime
from pathlib import Path
import hashlib
import secrets

# ============================================================================
# Configuration
# ============================================================================
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / "users.json"
AREAS_FILE = DATA_DIR / "areas.json"
ALLOCATIONS_FILE = DATA_DIR / "allocations.json"
LOGS_FILE = DATA_DIR / "logs.json"
FRONTEND_STATE_FILE = DATA_DIR / "frontend_state.json"

# ============================================================================
# Pydantic Models
# ============================================================================
class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"  # user, admin

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    username: str
    email: str
    role: str

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class Area(BaseModel):
    id: Optional[str] = None
    name: str
    location: str
    priority: str  # High, Medium, Low
    population: int
    demand: float
    current_allocation: Optional[float] = 0.0

class SupplyRequest(BaseModel):
    total_supply: float

class AllocationRequest(BaseModel):
    total_supply: float

class AllocationResult(BaseModel):
    timestamp: str
    total_supply: float
    areas: List[dict]
    justification: str

class FrontendStateRequest(BaseModel):
    state: dict

# ============================================================================
# FastAPI App Setup
# ============================================================================
app = FastAPI(title="Urban Water Supply Conflict Resolver", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Utility Functions - File Operations
# ============================================================================
def load_json(file_path: Path) -> dict | list:
    """Load JSON file, return empty dict/list if not exists"""
    if file_path.exists():
        with open(file_path, 'r') as f:
            return json.load(f)
    return {} if "users" in file_path.name or "areas" in file_path.name else []

def save_json(file_path: Path, data: dict | list):
    """Save data to JSON file"""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${pwd_hash.hex()}"

def verify_password(stored_hash: str, password: str) -> bool:
    """Verify password against hash"""
    try:
        salt, pwd_hash = stored_hash.split('$')
        pwd_check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return pwd_check.hex() == pwd_hash
    except:
        return False

def get_user_by_email(email: str) -> dict | None:
    """Get user by email from users.json"""
    users = load_json(USERS_FILE)
    return users.get(email)

def ensure_demo_users():
    """Create demo accounts expected by the frontend when the backend is empty."""
    users = load_json(USERS_FILE)
    changed = False
    demo_users = [
        {"username": "City Admin", "email": "admin@city.gov", "password": "admin123", "role": "admin"},
        {"username": "Maya Citizen", "email": "user@city.gov", "password": "user123", "role": "user"},
    ]
    for user in demo_users:
        if user["email"] not in users:
            users[user["email"]] = {
                "username": user["username"],
                "email": user["email"],
                "password_hash": hash_password(user["password"]),
                "role": user["role"],
                "created_at": datetime.now().isoformat()
            }
            changed = True
    if changed:
        save_json(USERS_FILE, users)

def add_log(action: str, details: dict):
    """Add entry to logs.json"""
    logs = load_json(LOGS_FILE)
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "details": details
    }
    logs.append(log_entry)
    save_json(LOGS_FILE, logs)

def get_current_user(email: str) -> dict:
    """Get current user info"""
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

ensure_demo_users()

# ============================================================================
# Authentication Endpoints
# ============================================================================
@app.post("/signup")
def signup(request: SignupRequest):
    """Register a new user"""
    users = load_json(USERS_FILE)
    
    if request.email in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    users[request.email] = {
        "username": request.username,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "role": request.role,
        "created_at": datetime.now().isoformat()
    }
    
    save_json(USERS_FILE, users)
    add_log("USER_SIGNUP", {"email": request.email, "username": request.username})
    
    return {
        "message": "User registered successfully",
        "user": {
            "email": request.email,
            "username": request.username,
            "role": request.role
        }
    }

@app.post("/login")
def login(request: LoginRequest):
    """Authenticate user and return token"""
    user = get_user_by_email(request.email)
    
    if not user or not verify_password(user["password_hash"], request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    add_log("USER_LOGIN", {"email": request.email})
    
    return {
        "message": "Login successful",
        "user": {
            "email": user["email"],
            "username": user["username"],
            "role": user["role"]
        }
    }

# ============================================================================
# Profile Endpoints
# ============================================================================
@app.get("/profile")
def get_profile(email: str):
    """Get user profile"""
    user = get_current_user(email)
    return {
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user.get("created_at")
    }

@app.put("/profile")
def update_profile(email: str, request: ProfileUpdateRequest):
    """Update user profile"""
    users = load_json(USERS_FILE)
    user = get_current_user(email)
    
    if request.username:
        user["username"] = request.username
    if request.email:
        # Check if new email already exists
        if request.email != email and request.email in users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        users[request.email] = users.pop(email)
        user["email"] = request.email
    
    save_json(USERS_FILE, users)
    add_log("PROFILE_UPDATE", {"email": request.email or email})
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }

# ============================================================================
# Areas Endpoints
# ============================================================================
@app.get("/areas")
def get_areas():
    """Get all areas"""
    areas = load_json(AREAS_FILE)
    return list(areas.values()) if isinstance(areas, dict) else areas

@app.post("/areas")
def create_area(area: Area):
    """Create new area"""
    areas = load_json(AREAS_FILE)
    
    area_id = area.id or f"area_{len(areas) + 1}_{datetime.now().timestamp()}"
    area_data = area.dict()
    area_data["id"] = area_id
    
    if isinstance(areas, dict):
        areas[area_id] = area_data
    else:
        areas.append(area_data)
    
    save_json(AREAS_FILE, areas)
    add_log("AREA_CREATED", {"area_id": area_id, "name": area.name})
    
    return {
        "message": "Area created successfully",
        "area": area_data
    }

@app.put("/areas/{area_id}")
def update_area(area_id: str, area: Area):
    """Update area"""
    areas = load_json(AREAS_FILE)
    
    if isinstance(areas, dict):
        if area_id not in areas:
            raise HTTPException(status_code=404, detail="Area not found")
        area_data = area.dict()
        area_data["id"] = area_id
        areas[area_id] = area_data
    else:
        area_index = next((i for i, a in enumerate(areas) if a.get("id") == area_id), None)
        if area_index is None:
            raise HTTPException(status_code=404, detail="Area not found")
        area_data = area.dict()
        area_data["id"] = area_id
        areas[area_index] = area_data
    
    save_json(AREAS_FILE, areas)
    add_log("AREA_UPDATED", {"area_id": area_id, "name": area.name})
    
    return {
        "message": "Area updated successfully",
        "area": area_data
    }

@app.delete("/areas/{area_id}")
def delete_area(area_id: str):
    """Delete area"""
    areas = load_json(AREAS_FILE)
    
    if isinstance(areas, dict):
        if area_id not in areas:
            raise HTTPException(status_code=404, detail="Area not found")
        del areas[area_id]
    else:
        area_index = next((i for i, a in enumerate(areas) if a.get("id") == area_id), None)
        if area_index is None:
            raise HTTPException(status_code=404, detail="Area not found")
        areas.pop(area_index)
    
    save_json(AREAS_FILE, areas)
    add_log("AREA_DELETED", {"area_id": area_id})
    
    return {
        "message": "Area deleted successfully"
    }

# ============================================================================
# Supply Endpoints
# ============================================================================
@app.post("/supply")
def set_supply(request: SupplyRequest):
    """Set total water supply"""
    allocations = load_json(ALLOCATIONS_FILE)
    
    allocations["total_supply"] = request.total_supply
    allocations["last_updated"] = datetime.now().isoformat()
    
    save_json(ALLOCATIONS_FILE, allocations)
    add_log("SUPPLY_SET", {"total_supply": request.total_supply})
    
    return {
        "message": "Supply set successfully",
        "total_supply": request.total_supply
    }

# ============================================================================
# Allocation Logic & Endpoints
# ============================================================================
def calculate_allocation(total_supply: float) -> dict:
    """
    Calculate water allocation based on priority and demand.
    
    Logic:
    1. Sort areas by priority (High → Medium → Low)
    2. If demand > supply:
       - High priority gets full demand
       - Medium gets partial
       - Low gets remaining or zero
    3. If demand <= supply:
       - All get full demand
    """
    areas_data = load_json(AREAS_FILE)
    areas_list = list(areas_data.values()) if isinstance(areas_data, dict) else areas_data
    
    if not areas_list:
        return {
            "total_supply": total_supply,
            "areas": [],
            "justification": "No areas configured",
            "timestamp": datetime.now().isoformat()
        }
    
    # Priority order
    priority_order = {"High": 1, "Medium": 2, "Low": 3}
    
    # Sort by priority
    sorted_areas = sorted(
        areas_list,
        key=lambda x: priority_order.get(x.get("priority", "Low"), 999)
    )
    
    total_demand = sum(area.get("demand", 0) for area in sorted_areas)
    allocated_areas = []
    remaining_supply = total_supply
    
    justification_lines = [
        f"Total Supply: {total_supply} units",
        f"Total Demand: {total_demand} units"
    ]
    
    if total_demand <= total_supply:
        # Sufficient supply for all
        justification_lines.append("Supply meets all demands")
        for area in sorted_areas:
            allocation = area.get("demand", 0)
            allocated_areas.append({
                "id": area.get("id"),
                "name": area.get("name"),
                "location": area.get("location"),
                "priority": area.get("priority"),
                "demand": area.get("demand", 0),
                "allocation": allocation,
                "status": "Full"
            })
    else:
        # Insufficient supply - apply priority-based rationing
        justification_lines.append("Supply deficit - applying priority allocation")
        
        for area in sorted_areas:
            demand = area.get("demand", 0)
            priority = area.get("priority", "Low")
            
            if priority == "High":
                # High priority gets full demand or remaining supply
                allocation = min(demand, remaining_supply)
                status = "Full" if allocation == demand else "Reduced"
            elif priority == "Medium":
                # Medium gets 60% or remaining supply
                allocation = min(demand * 0.6, remaining_supply)
                status = "Partial"
            else:  # Low priority
                # Low gets 30% or remaining supply
                allocation = min(demand * 0.3, remaining_supply)
                status = "Reduced"
            
            allocated_areas.append({
                "id": area.get("id"),
                "name": area.get("name"),
                "location": area.get("location"),
                "priority": priority,
                "demand": demand,
                "allocation": allocation,
                "status": status
            })
            
            remaining_supply -= allocation
    
    return {
        "total_supply": total_supply,
        "total_demand": total_demand,
        "areas": allocated_areas,
        "justification": "\n".join(justification_lines),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/allocate")
def run_allocation(request: AllocationRequest):
    """Run allocation algorithm"""
    result = calculate_allocation(request.total_supply)
    
    # Save allocation result
    allocations = load_json(ALLOCATIONS_FILE)
    allocations["last_result"] = result
    save_json(ALLOCATIONS_FILE, allocations)
    
    add_log("ALLOCATION_RUN", {
        "total_supply": request.total_supply,
        "total_demand": result.get("total_demand"),
        "areas_count": len(result.get("areas", []))
    })
    
    return {
        "message": "Allocation completed",
        "result": result
    }

@app.get("/allocation-results")
def get_allocation_results():
    """Get latest allocation results"""
    allocations = load_json(ALLOCATIONS_FILE)
    
    if "last_result" not in allocations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No allocation results available"
        )
    
    return {
        "result": allocations["last_result"]
    }

# ============================================================================
# Logs Endpoints
# ============================================================================
@app.get("/logs")
def get_logs(limit: Optional[int] = 100):
    """Get activity logs"""
    logs = load_json(LOGS_FILE)
    
    if limit:
        logs = logs[-limit:]
    
    return {
        "total": len(logs),
        "logs": logs
    }

# ============================================================================
# Frontend State Sync
# ============================================================================
@app.get("/frontend-state")
def get_frontend_state():
    """Get the persisted frontend application state."""
    if not FRONTEND_STATE_FILE.exists():
        return {"state": None}
    return {"state": load_json(FRONTEND_STATE_FILE)}

@app.put("/frontend-state")
def save_frontend_state(request: FrontendStateRequest):
    """Persist the frontend application state."""
    save_json(FRONTEND_STATE_FILE, request.state)
    return {"message": "Frontend state saved successfully"}

# ============================================================================
# Health Check
# ============================================================================
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# Root
# ============================================================================
@app.get("/")
def root():
    """API root"""
    return {
        "name": "Urban Water Supply Conflict Resolver API",
        "version": "1.0.0",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
