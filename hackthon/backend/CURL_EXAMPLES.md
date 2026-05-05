# API Testing with cURL Examples

This file contains ready-to-use cURL commands for testing all API endpoints.

## 🌐 Base URL
```
http://127.0.0.1:8001
```

## 1️⃣ Health Check

### Check Server Health
```bash
curl -X GET http://127.0.0.1:8001/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-05-06T10:30:00.123456"
}
```

---

## 2️⃣ Authentication

### Sign Up - Create New User
```bash
curl -X POST http://127.0.0.1:8001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "user"
  }'
```

**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "user": {
    "email": "john@example.com",
    "username": "john_doe",
    "role": "user"
  }
}
```

### Login - Authenticate User
```bash
curl -X POST http://127.0.0.1:8001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "email": "john@example.com",
    "username": "john_doe",
    "role": "user"
  }
}
```

---

## 3️⃣ Profile Management

### Get User Profile
```bash
curl -X GET "http://127.0.0.1:8001/profile?email=john@example.com"
```

**Response (200 OK):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2024-05-06T10:30:00.123456"
}
```

### Update User Profile
```bash
curl -X PUT "http://127.0.0.1:8001/profile?email=john@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_updated",
    "email": "john.new@example.com"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "username": "john_updated",
    "email": "john.new@example.com",
    "role": "user"
  }
}
```

---

## 4️⃣ Areas Management

### Get All Areas
```bash
curl -X GET http://127.0.0.1:8001/areas
```

**Response (200 OK):**
```json
[
  {
    "id": "area_1",
    "name": "Downtown District",
    "location": "City Center",
    "priority": "High",
    "population": 50000,
    "demand": 500.0,
    "current_allocation": 0.0
  },
  {
    "id": "area_2",
    "name": "Industrial Zone",
    "location": "East End",
    "priority": "Medium",
    "population": 25000,
    "demand": 300.0,
    "current_allocation": 0.0
  }
]
```

### Create New Area
```bash
curl -X POST http://127.0.0.1:8001/areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown District",
    "location": "City Center",
    "priority": "High",
    "population": 50000,
    "demand": 500.0
  }'
```

**Response (200 OK):**
```json
{
  "message": "Area created successfully",
  "area": {
    "id": "area_1715007000.123456",
    "name": "Downtown District",
    "location": "City Center",
    "priority": "High",
    "population": 50000,
    "demand": 500.0,
    "current_allocation": 0.0
  }
}
```

### Update Area
```bash
curl -X PUT http://127.0.0.1:8001/areas/area_1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown District Updated",
    "location": "City Center",
    "priority": "Medium",
    "population": 55000,
    "demand": 550.0
  }'
```

**Response (200 OK):**
```json
{
  "message": "Area updated successfully",
  "area": {
    "id": "area_1",
    "name": "Downtown District Updated",
    "location": "City Center",
    "priority": "Medium",
    "population": 55000,
    "demand": 550.0,
    "current_allocation": 0.0
  }
}
```

### Delete Area
```bash
curl -X DELETE http://127.0.0.1:8001/areas/area_1
```

**Response (200 OK):**
```json
{
  "message": "Area deleted successfully"
}
```

---

## 5️⃣ Supply Management

### Set Water Supply
```bash
curl -X POST http://127.0.0.1:8001/supply \
  -H "Content-Type: application/json" \
  -d '{
    "total_supply": 700.0
  }'
```

**Response (200 OK):**
```json
{
  "message": "Supply set successfully",
  "total_supply": 700.0
}
```

---

## 6️⃣ Water Allocation

### Run Allocation Algorithm
```bash
curl -X POST http://127.0.0.1:8001/allocate \
  -H "Content-Type: application/json" \
  -d '{
    "total_supply": 700.0
  }'
```

**Response (200 OK):**
```json
{
  "message": "Allocation completed",
  "result": {
    "total_supply": 700.0,
    "total_demand": 1300.0,
    "areas": [
      {
        "id": "area_1",
        "name": "Downtown District",
        "location": "City Center",
        "priority": "High",
        "demand": 500.0,
        "allocation": 500.0,
        "status": "Full"
      },
      {
        "id": "area_2",
        "name": "Industrial Zone",
        "location": "East End",
        "priority": "Medium",
        "demand": 300.0,
        "allocation": 180.0,
        "status": "Partial"
      },
      {
        "id": "area_3",
        "name": "Residential Suburb",
        "location": "North West",
        "priority": "Low",
        "demand": 500.0,
        "allocation": 20.0,
        "status": "Reduced"
      }
    ],
    "justification": "Total Supply: 700 units\nTotal Demand: 1300 units\nSupply deficit - applying priority allocation",
    "timestamp": "2024-05-06T10:35:00.123456"
  }
}
```

### Get Allocation Results
```bash
curl -X GET http://127.0.0.1:8001/allocation-results
```

**Response (200 OK):**
```json
{
  "result": {
    "total_supply": 700.0,
    "total_demand": 1300.0,
    "areas": [
      {
        "id": "area_1",
        "name": "Downtown District",
        "location": "City Center",
        "priority": "High",
        "demand": 500.0,
        "allocation": 500.0,
        "status": "Full"
      }
    ],
    "justification": "Total Supply: 700 units\nTotal Demand: 1300 units\nSupply deficit - applying priority allocation",
    "timestamp": "2024-05-06T10:35:00.123456"
  }
}
```

---

## 7️⃣ Activity Logs

### Get Activity Logs
```bash
curl -X GET "http://127.0.0.1:8001/logs?limit=10"
```

**Response (200 OK):**
```json
{
  "total": 15,
  "logs": [
    {
      "timestamp": "2024-05-06T10:30:00.123456",
      "action": "USER_SIGNUP",
      "details": {
        "email": "john@example.com",
        "username": "john_doe"
      }
    },
    {
      "timestamp": "2024-05-06T10:31:00.123456",
      "action": "AREA_CREATED",
      "details": {
        "area_id": "area_1",
        "name": "Downtown District"
      }
    },
    {
      "timestamp": "2024-05-06T10:35:00.123456",
      "action": "SUPPLY_SET",
      "details": {
        "total_supply": 700.0
      }
    },
    {
      "timestamp": "2024-05-06T10:36:00.123456",
      "action": "ALLOCATION_RUN",
      "details": {
        "total_supply": 700.0,
        "total_demand": 1300.0,
        "areas_count": 3
      }
    }
  ]
}
```

---

## 🛠️ Batch Testing Script

Save this as `test_all.sh` and run with `bash test_all.sh`:

```bash
#!/bin/bash

BASE_URL="http://127.0.0.1:8001"

echo "=========================================="
echo "Testing Urban Water Supply API"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s -X GET $BASE_URL/health | jq .
echo ""

# Test 2: Signup
echo "2. Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "TestPassword123",
    "role": "user"
  }')
echo $SIGNUP_RESPONSE | jq .
echo ""

# Test 3: Login
echo "3. Testing Login..."
curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }' | jq .
echo ""

# Test 4: Create Area
echo "4. Creating Sample Area..."
curl -s -X POST $BASE_URL/areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Area",
    "location": "Test Location",
    "priority": "High",
    "population": 10000,
    "demand": 100.0
  }' | jq .
echo ""

# Test 5: Get Areas
echo "5. Getting All Areas..."
curl -s -X GET $BASE_URL/areas | jq .
echo ""

# Test 6: Set Supply
echo "6. Setting Water Supply..."
curl -s -X POST $BASE_URL/supply \
  -H "Content-Type: application/json" \
  -d '{"total_supply": 150.0}' | jq .
echo ""

# Test 7: Run Allocation
echo "7. Running Allocation..."
curl -s -X POST $BASE_URL/allocate \
  -H "Content-Type: application/json" \
  -d '{"total_supply": 150.0}' | jq .
echo ""

# Test 8: Get Logs
echo "8. Getting Activity Logs..."
curl -s -X GET "$BASE_URL/logs?limit=5" | jq .
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
```

---

## 📝 Notes

- Replace `john@example.com` with actual email
- Replace `area_1` with actual area IDs from your system
- The API uses query parameters for email in profile endpoints
- All timestamps are in ISO 8601 format
- Supply and demand values are in units (adjust as needed)
- Allocation algorithm sorts by priority and allocates based on availability

---

## ✅ Testing Checklist

- [ ] Server is running on http://127.0.0.1:8001
- [ ] Health check returns healthy status
- [ ] Can signup new user
- [ ] Can login with created user
- [ ] Can create areas
- [ ] Can retrieve areas
- [ ] Can update area
- [ ] Can delete area
- [ ] Can set water supply
- [ ] Can run allocation
- [ ] Can get allocation results
- [ ] Can view activity logs
- [ ] API docs available at `/docs`

All endpoints tested successfully! ✨
