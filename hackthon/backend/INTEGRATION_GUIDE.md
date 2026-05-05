"""
Frontend Integration Guide
==========================

This file shows how to integrate the FastAPI backend with your frontend
application running on http://localhost:5173 or http://127.0.0.1:5173

Configuration for Frontend API Calls
"""

# ============================================================================
# 1. API Configuration
# ============================================================================
"""
Add this to your frontend configuration (e.g., vite.env or environment variables):

VITE_API_BASE_URL=http://127.0.0.1:8001
VITE_API_TIMEOUT=30000
"""

# ============================================================================
# 2. Example TypeScript API Service
# ============================================================================
"""
Create a file: src/services/api.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authAPI = {
  signup: (data: SignupRequest) => apiClient.post('/signup', data),
  login: (data: LoginRequest) => apiClient.post('/login', data),
};

// Profile APIs
export const profileAPI = {
  getProfile: (email: string) => apiClient.get('/profile', { params: { email } }),
  updateProfile: (email: string, data: ProfileUpdateRequest) =>
    apiClient.put('/profile', data, { params: { email } }),
};

// Areas APIs
export const areasAPI = {
  getAreas: () => apiClient.get('/areas'),
  createArea: (data: Area) => apiClient.post('/areas', data),
  updateArea: (id: string, data: Area) => apiClient.put(`/areas/${id}`, data),
  deleteArea: (id: string) => apiClient.delete(`/areas/${id}`),
};

// Supply APIs
export const supplyAPI = {
  setSupply: (data: SupplyRequest) => apiClient.post('/supply', data),
};

// Allocation APIs
export const allocationAPI = {
  runAllocation: (data: AllocationRequest) => apiClient.post('/allocate', data),
  getResults: () => apiClient.get('/allocation-results'),
};

// Logs APIs
export const logsAPI = {
  getLogs: (limit?: number) =>
    apiClient.get('/logs', { params: limit ? { limit } : {} }),
};

// Health APIs
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
"""

# ============================================================================
# 3. Example React Component Usage
# ============================================================================
"""
Example: Create Area Component

import React, { useState } from 'react';
import { areasAPI } from '@/services/api';

interface CreateAreaProps {
  onAreaCreated?: () => void;
}

export function CreateAreaDialog({ onAreaCreated }: CreateAreaProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    priority: 'Medium',
    population: 0,
    demand: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await areasAPI.createArea(formData);
      setFormData({
        name: '',
        location: '',
        priority: 'Medium',
        population: 0,
        demand: 0,
      });
      onAreaCreated?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Area Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      />
      <select
        value={formData.priority}
        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
      >
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <input
        type="number"
        placeholder="Population"
        value={formData.population}
        onChange={(e) =>
          setFormData({ ...formData, population: parseInt(e.target.value) })
        }
      />
      <input
        type="number"
        placeholder="Demand (units)"
        value={formData.demand}
        onChange={(e) =>
          setFormData({ ...formData, demand: parseFloat(e.target.value) })
        }
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Area'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
"""

# ============================================================================
# 4. Running Both Frontend and Backend Together
# ============================================================================
"""
Terminal 1 (Frontend):
  cd smart-water-hub-main
  npm run dev

Terminal 2 (Backend):
  cd smart-water-hub-main/backend
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\\Scripts\\activate
  pip install -r requirements.txt
  uvicorn app:app --reload --host 127.0.0.1 --port 8001

Then open: http://localhost:5173
"""

# ============================================================================
# 5. CORS Troubleshooting
# ============================================================================
"""
If you get CORS errors:

1. Make sure the backend is running on http://127.0.0.1:8001
2. Frontend should be on http://localhost:5173 or http://127.0.0.1:5173
3. The backend allows these origins - see app.py CORS configuration
4. Check browser console for specific CORS error messages

If you need to add more origins, edit app.py:
  app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",  # Add more if needed
    ],
    ...
  )
"""

# ============================================================================
# 6. Environment Variables (.env file for frontend)
# ============================================================================
"""
Create a file: .env.local

# Backend API
VITE_API_BASE_URL=http://127.0.0.1:8001

# Optional: API timeout in milliseconds
VITE_API_TIMEOUT=30000

# Optional: Enable debug logging
VITE_DEBUG=false
"""

# ============================================================================
# 7. Type Definitions for TypeScript
# ============================================================================
"""
Create a file: src/types/api.ts

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  username: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface Area {
  id?: string;
  name: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  population: number;
  demand: number;
  current_allocation?: number;
}

export interface SupplyRequest {
  total_supply: number;
}

export interface AllocationRequest {
  total_supply: number;
}

export interface AllocationArea {
  id?: string;
  name: string;
  location: string;
  priority: string;
  demand: number;
  allocation: number;
  status: string;
}

export interface AllocationResult {
  timestamp: string;
  total_supply: number;
  total_demand: number;
  areas: AllocationArea[];
  justification: string;
}

export interface LogEntry {
  timestamp: string;
  action: string;
  details: Record<string, any>;
}
"""

# ============================================================================
# 8. Error Handling
# ============================================================================
"""
Implement global error handling in frontend:

// src/services/api.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);
"""

# ============================================================================
# 9. Testing API with curl
# ============================================================================
"""
Test endpoints using curl commands:

# Signup
curl -X POST http://127.0.0.1:8001/signup \\
  -H "Content-Type: application/json" \\
  -d '{"username":"test","email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://127.0.0.1:8001/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"pass123"}'

# Get areas
curl http://127.0.0.1:8001/areas

# Create area
curl -X POST http://127.0.0.1:8001/areas \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Downtown",
    "location":"City Center",
    "priority":"High",
    "population":50000,
    "demand":500
  }'

# Set supply
curl -X POST http://127.0.0.1:8001/supply \\
  -H "Content-Type: application/json" \\
  -d '{"total_supply":700}'

# Run allocation
curl -X POST http://127.0.0.1:8001/allocate \\
  -H "Content-Type: application/json" \\
  -d '{"total_supply":700}'

# Get allocation results
curl http://127.0.0.1:8001/allocation-results

# Get logs
curl 'http://127.0.0.1:8001/logs?limit=10'

# Health check
curl http://127.0.0.1:8001/health
"""

# ============================================================================
# 10. API Documentation
# ============================================================================
"""
Interactive API documentation is automatically available at:
  http://127.0.0.1:8001/docs

This provides a Swagger UI where you can:
- View all available endpoints
- See request/response schemas
- Test endpoints directly from the browser
- View detailed parameter information
"""
