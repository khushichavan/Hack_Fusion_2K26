# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Step 1: Install Dependencies (1 min)
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start the Server (1 min)
```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8001
```

Or run the startup script:
- **Windows**: Double-click `run.bat`
- **Linux/Mac**: Run `bash run.sh`

You should see:
```
Uvicorn running on http://127.0.0.1:8001
```

### Step 3: Test the API (1 min)
Open in your browser: **http://127.0.0.1:8001/docs**

This gives you an interactive API explorer where you can test all endpoints.

### Step 4: Run the Full Test Suite (2 min)
```bash
python test_api.py
```

This will test all API endpoints with sample data.

### Step 5: Connect Your Frontend
Your frontend is running on `http://localhost:5173`

API Base URL: `http://127.0.0.1:8001`

CORS is already configured to allow frontend requests.

---

## 📋 API Endpoints Quick Reference

### Authentication
- `POST /signup` - Register new user
- `POST /login` - Login user

### Profile
- `GET /profile?email=user@example.com` - Get profile
- `PUT /profile?email=user@example.com` - Update profile

### Areas
- `GET /areas` - Get all areas
- `POST /areas` - Create area
- `PUT /areas/{id}` - Update area
- `DELETE /areas/{id}` - Delete area

### Supply & Allocation
- `POST /supply` - Set total water supply
- `POST /allocate` - Run allocation algorithm
- `GET /allocation-results` - Get results

### Logs
- `GET /logs?limit=100` - Get activity logs

### Other
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

---

## 💾 Data Storage

All data is stored as JSON in the `backend/data/` directory:
- `users.json` - User accounts
- `areas.json` - Water supply areas
- `allocations.json` - Allocation results
- `logs.json` - Activity logs

---

## 🔗 Frontend Integration

Update your frontend API service to point to: `http://127.0.0.1:8001`

Example (React with axios):
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8001'
});

// Use api.get(), api.post(), etc.
api.get('/areas').then(res => console.log(res.data));
```

---

## 🧪 Example API Call

### Create a Water Supply Area
```bash
curl -X POST http://127.0.0.1:8001/areas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown District",
    "location": "City Center",
    "priority": "High",
    "population": 50000,
    "demand": 500
  }'
```

### Set Water Supply
```bash
curl -X POST http://127.0.0.1:8001/supply \
  -H "Content-Type: application/json" \
  -d '{"total_supply": 700}'
```

### Run Allocation Algorithm
```bash
curl -X POST http://127.0.0.1:8001/allocate \
  -H "Content-Type: application/json" \
  -d '{"total_supply": 700}'
```

### Get Results
```bash
curl http://127.0.0.1:8001/allocation-results
```

---

## ⚡ Allocation Algorithm

The system automatically allocates water based on area priority:

**If Supply ≥ Demand:**
- All areas get their full demand

**If Supply < Demand:**
1. **High Priority**: 100% of demand
2. **Medium Priority**: 60% of demand  
3. **Low Priority**: 30% of demand

Each area is processed in order of priority, and remaining supply is reduced accordingly.

---

## 🐛 Troubleshooting

### Server won't start
- Make sure port 8001 is not in use
- Check Python version: `python --version`
- Verify dependencies: `pip list`

### CORS errors
- Frontend must be on `http://localhost:5173` or `http://127.0.0.1:5173`
- Check that backend is running on `http://127.0.0.1:8001`
- See INTEGRATION_GUIDE.md for more details

### API not responding
- Check if server is running: `http://127.0.0.1:8001/health`
- Check firewall settings
- Try `http://127.0.0.1:8001/docs` for API documentation

---

## 📚 Full Documentation

- `README.md` - Complete API documentation
- `INTEGRATION_GUIDE.md` - Frontend integration guide
- `test_api.py` - Example test script with all endpoints

---

## 🎯 Next Steps

1. ✅ Start the backend server
2. ✅ Test endpoints using the interactive docs at `/docs`
3. ✅ Run `test_api.py` to see full functionality
4. ✅ Integrate with your frontend
5. ✅ Deploy to production

Enjoy! 🎉
