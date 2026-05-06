from __future__ import annotations

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Any, Optional
from datetime import datetime, timedelta, timezone
from pathlib import Path
import asyncio
import base64
import hashlib
import hmac
import json
import os
import secrets

try:
    from pymongo import MongoClient
except Exception:
    MongoClient = None

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_FILE = DATA_DIR / "smart_city_db.json"
JWT_SECRET = os.getenv("JWT_SECRET", "aquaresolve-ai-demo-secret")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "aquaresolve_ai")

COLLECTIONS = [
    "users",
    "water_zones",
    "water_requests",
    "complaints",
    "allocations",
    "emergency_events",
    "tanker_tracking",
    "audit_logs",
    "notifications",
]


class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "citizen"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class FrontendStateRequest(BaseModel):
    state: dict[str, Any]


class AllocationRequest(BaseModel):
    total_supply: float = 1850
    drought_severity: float = 0.35
    emergency_type: Optional[str] = None
    emergency_zone_id: Optional[str] = None


class ComplaintRequest(BaseModel):
    user_email: EmailStr
    zone_id: str
    category: str
    description: str
    media_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class WaterRequestAction(BaseModel):
    request_id: str
    action: str
    reason: Optional[str] = None


class EmergencyRequest(BaseModel):
    event_type: str
    zone_id: str
    severity: str = "high"
    notes: str = ""


class MongoJsonRepository:
    def __init__(self):
        self.mongo = None
        if MongoClient:
            try:
                client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=250)
                client.admin.command("ping")
                self.mongo = client[DB_NAME]
            except Exception:
                self.mongo = None
        self.ensure_seed()

    def _read_all(self) -> dict[str, list[dict[str, Any]]]:
        if not DB_FILE.exists():
            return {name: [] for name in COLLECTIONS}
        with open(DB_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        return {name: data.get(name, []) for name in COLLECTIONS}

    def _write_all(self, data: dict[str, list[dict[str, Any]]]):
        with open(DB_FILE, "w", encoding="utf-8") as handle:
            json.dump(data, handle, indent=2)

    def list(self, collection: str) -> list[dict[str, Any]]:
        if self.mongo is not None:
            return [{k: v for k, v in doc.items() if k != "_id"} for doc in self.mongo[collection].find()]
        return self._read_all().get(collection, [])

    def replace(self, collection: str, docs: list[dict[str, Any]]):
        if self.mongo is not None:
            self.mongo[collection].delete_many({})
            if docs:
                self.mongo[collection].insert_many(docs)
            return
        data = self._read_all()
        data[collection] = docs
        self._write_all(data)

    def insert(self, collection: str, doc: dict[str, Any]):
        docs = self.list(collection)
        docs.append(doc)
        self.replace(collection, docs)

    def upsert(self, collection: str, key: str, value: Any, doc: dict[str, Any]):
        docs = self.list(collection)
        updated = False
        for index, item in enumerate(docs):
            if item.get(key) == value:
                docs[index] = {**item, **doc}
                updated = True
                break
        if not updated:
            docs.append(doc)
        self.replace(collection, docs)

    def ensure_seed(self):
        if DB_FILE.exists() or (self.mongo is not None and self.mongo.users.count_documents({}) > 0):
            return
        now = utc_now()
        users = [
            demo_user("City Admin", "admin@city.gov", "admin123", "admin"),
            demo_user("Authority Operator", "authority@city.gov", "authority123", "authority"),
            demo_user("Maya Citizen", "user@city.gov", "user123", "citizen"),
        ]
        zones = [
            zone("zone-a", "Central Hospital District", 28.6208, 77.2167, 128000, 4, 0.92, 0.08, 0.16, 0.72, 0.95),
            zone("zone-b", "Sector 12 Residential", 28.5984, 77.2011, 212000, 1, 0.74, 0.12, 0.31, 0.66, 0.71),
            zone("zone-c", "Riverside Low Income Belt", 28.6392, 77.1898, 185000, 1, 0.88, 0.21, 0.62, 0.82, 0.54),
            zone("zone-d", "Industrial Park", 28.5801, 77.2415, 76000, 0, 0.69, 0.34, 0.12, 0.48, 0.63),
            zone("zone-e", "Old Town Fire Corridor", 28.6501, 77.2288, 98000, 2, 0.96, 0.17, 0.44, 0.77, 0.38),
        ]
        payload = {
            "users": users,
            "water_zones": zones,
            "water_requests": [
                {
                    "id": "req-101",
                    "zone_id": "zone-a",
                    "user_email": "user@city.gov",
                    "amount": 160,
                    "status": "pending",
                    "priority": "critical",
                    "reason": "Hospital wing demand spike",
                    "created_at": now,
                }
            ],
            "complaints": [],
            "allocations": [],
            "emergency_events": [],
            "tanker_tracking": [
                {"id": "tanker-01", "driver": "R. Kumar", "lat": 28.612, "lng": 77.211, "capacity": 24, "status": "en route", "zone_id": "zone-e"},
                {"id": "tanker-02", "driver": "S. Mehta", "lat": 28.632, "lng": 77.196, "capacity": 18, "status": "loading", "zone_id": "zone-c"},
            ],
            "audit_logs": [{"id": uid("log"), "timestamp": now, "actor": "System", "action": "Seeded AquaResolve AI demo data"}],
            "notifications": [{"id": uid("ntf"), "title": "AquaResolve AI online", "body": "Smart-city command center is ready.", "created_at": now, "read": False}],
        }
        for collection, docs in payload.items():
            self.replace(collection, docs)


frontend_state_file = DATA_DIR / "frontend_state.json"
connections: set[WebSocket] = set()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def uid(prefix: str) -> str:
    return f"{prefix}-{secrets.token_hex(4)}"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
    return f"{salt}${digest}"


def verify_password(stored_hash: str, password: str) -> bool:
    try:
        salt, digest = stored_hash.split("$")
        check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
        return hmac.compare_digest(check, digest)
    except Exception:
        return False


def demo_user(username: str, email: str, password: str, role: str) -> dict[str, Any]:
    return {
        "id": uid("usr"),
        "username": username,
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
        "reward_points": 420 if role == "citizen" else 0,
        "created_at": utc_now(),
    }


def zone(
    zone_id: str,
    name: str,
    lat: float,
    lng: float,
    population: int,
    hospitals: int,
    demand_factor: float,
    wastage: float,
    low_income_index: float,
    past_usage: float,
    tank_level: float,
) -> dict[str, Any]:
    return {
        "id": zone_id,
        "name": name,
        "lat": lat,
        "lng": lng,
        "population": population,
        "hospitals": hospitals,
        "demand_factor": demand_factor,
        "wastage": wastage,
        "low_income_index": low_income_index,
        "past_usage": past_usage,
        "tank_level": tank_level,
        "leakage_alert": tank_level < 0.45 or wastage > 0.3,
        "status": "balanced",
    }


repo = MongoJsonRepository()
app = FastAPI(title="AquaResolve AI - Fair Urban Water Distribution System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_token(user: dict[str, Any]) -> str:
    payload = {
        "sub": user["email"],
        "role": user["role"],
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=8)).timestamp()),
    }
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(JWT_SECRET.encode(), body.encode(), hashlib.sha256).digest()
    sig = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{body}.{sig}"


def find_user(email: str) -> Optional[dict[str, Any]]:
    return next((user for user in repo.list("users") if user["email"].lower() == email.lower()), None)


def audit(actor: str, action: str, details: Optional[dict[str, Any]] = None):
    repo.insert(
        "audit_logs",
        {"id": uid("log"), "timestamp": utc_now(), "actor": actor, "action": action, "details": details or {}},
    )


def fairness_score(zone_data: dict[str, Any], drought_severity: float, emergency_boost: float = 0) -> float:
    population = zone_data["population"] / 100000
    hospital = zone_data["hospitals"] * 1.8
    demand = zone_data["demand_factor"] * 5
    equity = zone_data["low_income_index"] * 2.7
    drought = drought_severity * 2
    tank_need = (1 - zone_data["tank_level"]) * 3
    hoarding_penalty = max(0, zone_data["past_usage"] - 0.75) * 1.5
    wastage_penalty = zone_data["wastage"] * 2
    return max(0.1, population + hospital + demand + equity + drought + tank_need + emergency_boost - hoarding_penalty - wastage_penalty)


def run_fairness_engine(total_supply: float, drought_severity: float = 0.35, emergency_zone_id: Optional[str] = None, emergency_type: Optional[str] = None) -> dict[str, Any]:
    zones = repo.list("water_zones")
    weighted = []
    for item in zones:
        boost = 4.5 if item["id"] == emergency_zone_id else 0
        score = fairness_score(item, drought_severity, boost)
        weighted.append((item, score))
    total_score = sum(score for _, score in weighted) or 1
    allocations = []
    for item, score in weighted:
        allocation = round(total_supply * (score / total_score), 2)
        demand_ml = round(item["population"] * item["demand_factor"] / 900, 2)
        ratio = allocation / max(demand_ml, 1)
        status_label = "balanced" if ratio >= 0.9 else "warning" if ratio >= 0.65 else "critical"
        reason = explain(item, allocation, demand_ml, emergency_zone_id, emergency_type)
        allocations.append(
            {
                "zone_id": item["id"],
                "zone": item["name"],
                "allocation_ml": allocation,
                "demand_ml": demand_ml,
                "fairness_score": round(min(99, ratio * 82 + score), 1),
                "status": status_label,
                "explanation": reason,
            }
        )
        item["status"] = status_label
    repo.replace("water_zones", zones)
    result = {
        "id": uid("alloc"),
        "timestamp": utc_now(),
        "total_supply": total_supply,
        "drought_severity": drought_severity,
        "emergency_type": emergency_type,
        "allocations": allocations,
        "city_fairness_score": round(sum(a["fairness_score"] for a in allocations) / len(allocations), 1),
    }
    repo.insert("allocations", result)
    audit("AquaResolve AI", "Generated fair allocation", {"total_supply": total_supply, "emergency": emergency_type})
    return result


def explain(item: dict[str, Any], allocation: float, demand_ml: float, emergency_zone_id: Optional[str], emergency_type: Optional[str]) -> str:
    if item["id"] == emergency_zone_id:
        return f"{item['name']} received emergency water because {emergency_type} increased critical demand."
    if item["hospitals"] > 0:
        return f"{item['name']} received priority allocation because hospital demand increased."
    if item["low_income_index"] > 0.5:
        return f"{item['name']} received equity-weighted water because low-income vulnerability is high."
    if item["wastage"] > 0.28:
        return f"{item['name']} was capped to prevent hoarding and abnormal usage."
    if allocation >= demand_ml:
        return f"{item['name']} received full demand coverage because supply and fairness score are stable."
    return f"{item['name']} received proportional supply based on population, demand, and tank level."


def snapshot() -> dict[str, Any]:
    allocations = repo.list("allocations")
    latest = allocations[-1] if allocations else run_fairness_engine(1850)
    zones = repo.list("water_zones")
    complaints = repo.list("complaints")
    requests = repo.list("water_requests")
    emergency_events = repo.list("emergency_events")
    tankers = repo.list("tanker_tracking")
    return {
        "platform": "AquaResolve AI",
        "database": "mongodb" if repo.mongo is not None else "local-json-fallback",
        "zones": zones,
        "latest_allocation": latest,
        "analytics": {
            "total_supply": latest["total_supply"],
            "city_fairness_score": latest["city_fairness_score"],
            "critical_zones": len([z for z in zones if z.get("status") == "critical"]),
            "open_complaints": len([c for c in complaints if c.get("status") != "resolved"]),
            "active_requests": len([r for r in requests if r.get("status") in ["pending", "approved"]]),
            "tankers_active": len([t for t in tankers if t.get("status") != "idle"]),
        },
        "predictions": [
            {"day": "Mon", "demand": 1240, "predicted": 1310},
            {"day": "Tue", "demand": 1380, "predicted": 1435},
            {"day": "Wed", "demand": 1515, "predicted": 1580},
            {"day": "Thu", "demand": 1480, "predicted": 1620},
            {"day": "Fri", "demand": 1660, "predicted": 1725},
            {"day": "Sat", "demand": 1585, "predicted": 1680},
        ],
        "tankers": tankers,
        "complaints": complaints[-12:],
        "notifications": repo.list("notifications")[-20:],
        "audit_logs": repo.list("audit_logs")[-40:],
        "emergency_events": emergency_events[-10:],
    }


async def broadcast(event: str, payload: dict[str, Any]):
    message = {"event": event, "payload": payload}
    stale = []
    for connection in connections:
        try:
            await connection.send_json(message)
        except Exception:
            stale.append(connection)
    for connection in stale:
        connections.discard(connection)


@app.post("/auth/signup")
def signup_v2(request: SignupRequest):
    return signup(request)


@app.post("/signup")
def signup(request: SignupRequest):
    if request.role == "user":
        request.role = "citizen"
    if request.role not in {"admin", "authority", "citizen"}:
        raise HTTPException(status_code=400, detail="Role must be admin, authority, or citizen")
    if find_user(str(request.email)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    user = demo_user(request.username, str(request.email), request.password, request.role)
    repo.insert("users", user)
    audit(request.username, "Created account", {"role": request.role})
    return {"message": "User registered successfully", "token": create_token(user), "user": public_user(user)}


@app.post("/auth/login")
def login_v2(request: LoginRequest):
    return login(request)


@app.post("/login")
def login(request: LoginRequest):
    user = find_user(str(request.email))
    if not user or not verify_password(user["password_hash"], request.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    audit(user["username"], "Logged in", {"role": user["role"]})
    return {"message": "Login successful", "token": create_token(user), "user": public_user(user)}


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "role": user["role"],
        "reward_points": user.get("reward_points", 0),
    }


@app.get("/platform/snapshot")
def get_snapshot():
    return snapshot()


@app.get("/water-zones")
def get_water_zones():
    return {"zones": repo.list("water_zones")}


@app.post("/ai/fairness/allocate")
async def allocate(request: AllocationRequest):
    result = run_fairness_engine(request.total_supply, request.drought_severity, request.emergency_zone_id, request.emergency_type)
    await broadcast("allocation.updated", result)
    return {"message": "AI fairness allocation completed", "result": result}


@app.get("/ai/predictions")
def predictions():
    return {"predictions": snapshot()["predictions"]}


@app.post("/complaints")
async def create_complaint(request: ComplaintRequest):
    complaint = {
        "id": uid("cmp"),
        "user_email": str(request.user_email),
        "zone_id": request.zone_id,
        "category": request.category,
        "description": request.description,
        "media_url": request.media_url,
        "lat": request.lat,
        "lng": request.lng,
        "status": "submitted",
        "created_at": utc_now(),
    }
    repo.insert("complaints", complaint)
    audit(request.user_email, "Submitted complaint", {"zone_id": request.zone_id, "category": request.category})
    await broadcast("complaint.created", complaint)
    return {"message": "Complaint submitted", "complaint": complaint}


@app.post("/water-requests/action")
async def update_request(request: WaterRequestAction):
    docs = repo.list("water_requests")
    for item in docs:
        if item["id"] == request.request_id:
            item["status"] = request.action
            item["decision_reason"] = request.reason
            item["updated_at"] = utc_now()
            repo.replace("water_requests", docs)
            audit("Authority", f"{request.action.title()} water request", {"request_id": request.request_id})
            await broadcast("request.updated", item)
            return {"message": "Request updated", "request": item}
    raise HTTPException(status_code=404, detail="Request not found")


@app.post("/emergency/trigger")
async def trigger_emergency(request: EmergencyRequest):
    event = {
        "id": uid("emg"),
        "event_type": request.event_type,
        "zone_id": request.zone_id,
        "severity": request.severity,
        "notes": request.notes,
        "status": "active",
        "created_at": utc_now(),
    }
    repo.insert("emergency_events", event)
    result = run_fairness_engine(1850, 0.55 if request.event_type == "drought" else 0.35, request.zone_id, request.event_type)
    audit("AquaResolve AI", "Triggered emergency redistribution", event)
    await broadcast("emergency.redistributed", {"event": event, "allocation": result})
    return {"message": "Emergency redistribution completed", "event": event, "allocation": result}


@app.get("/tanker-tracking")
def tanker_tracking():
    return {"tankers": repo.list("tanker_tracking")}


@app.get("/audit-logs")
def audit_logs(limit: int = 100):
    logs = repo.list("audit_logs")
    return {"total": len(logs), "logs": logs[-limit:]}


@app.get("/frontend-state")
def get_frontend_state():
    if not frontend_state_file.exists():
        return {"state": None}
    with open(frontend_state_file, "r", encoding="utf-8") as handle:
        return {"state": json.load(handle)}


@app.put("/frontend-state")
def save_frontend_state(request: FrontendStateRequest):
    with open(frontend_state_file, "w", encoding="utf-8") as handle:
        json.dump(request.state, handle, indent=2)
    return {"message": "Frontend state saved successfully"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.add(websocket)
    try:
        await websocket.send_json({"event": "snapshot", "payload": snapshot()})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connections.discard(websocket)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AquaResolve AI", "database": "mongodb" if repo.mongo is not None else "local-json-fallback", "timestamp": utc_now()}


@app.get("/")
def root():
    return {
        "name": "AquaResolve AI - Fair Urban Water Distribution System",
        "version": "2.0.0",
        "docs": "/docs",
        "websocket": "/ws",
        "collections": COLLECTIONS,
    }


async def demo_realtime_pulse():
    while True:
        await asyncio.sleep(20)
        await broadcast("city.pulse", snapshot()["analytics"])


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(demo_realtime_pulse())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
