# Urban Water Supply Conflict Resolver - Backend API

A FastAPI backend for managing water supply allocation across different areas with priority-based distribution logic.

## Features

- **Authentication**: User signup and login with secure password hashing
- **Profile Management**: Get and update user profiles
- **Areas Management**: Full CRUD operations for water supply areas
- **Supply Management**: Set total water supply
- **Smart Allocation**: Priority-based water allocation algorithm
- **Activity Logging**: Track all operations
- **CORS Support**: Enabled for frontend at localhost:5173 and 127.0.0.1:5173

## Project Structure

```
backend/
├── app.py                 # Main FastAPI application
├── requirements.txt       # Python dependencies
├── data/                  # JSON data storage
│   ├── users.json        # User accounts
│   ├── areas.json        # Water supply areas
│   ├── allocations.json  # Allocation records
│   └── logs.json         # Activity logs
└── README.md             # This file
```

## Installation

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the development server with auto-reload:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8001
```

Or simply run:
```bash
python app.py
```

The API will be available at: **http://127.0.0.1:8001**

Interactive API documentation: **http://127.0.0.1:8001/docs**

## API Endpoints

### Authentication

- **POST** `/signup` - Register a new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password",
    "role": "user"
  }
  ```

- **POST** `/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "secure_password"
  }
  ```

### Profile

- **GET** `/profile?email=user@example.com` - Get user profile
- **PUT** `/profile?email=user@example.com` - Update user profile
  ```json
  {
    "username": "new_name",
    "email": "newemail@example.com"
  }
  ```

### Areas

- **GET** `/areas` - Get all areas
- **POST** `/areas` - Create new area
  ```json
  {
    "name": "Downtown District",
    "location": "City Center",
    "priority": "High",
    "population": 50000,
    "demand": 500.5
  }
  ```

- **PUT** `/areas/{area_id}` - Update area
- **DELETE** `/areas/{area_id}` - Delete area

### Supply & Allocation

- **POST** `/supply` - Set total water supply
  ```json
  {
    "total_supply": 1000
  }
  ```

- **POST** `/allocate` - Run allocation algorithm
  ```json
  {
    "total_supply": 1000
  }
  ```

- **GET** `/allocation-results` - Get latest allocation results

### Logs

- **GET** `/logs?limit=100` - Get activity logs (default: last 100)

### Health

- **GET** `/health` - Check server health
- **GET** `/` - API root info

## Allocation Logic

The allocation algorithm works as follows:

### If Supply >= Demand:
- All areas get their full demand

### If Supply < Demand:
1. **High Priority Areas**: Get 100% of demand (or remaining supply)
2. **Medium Priority Areas**: Get 60% of demand (or remaining supply)
3. **Low Priority Areas**: Get 30% of demand (or remaining supply)

Each area is processed in order, and the remaining supply is reduced accordingly.

## Data Storage

All data is stored as JSON files in the `data/` directory:

- **users.json**: User accounts with hashed passwords
- **areas.json**: Area configuration and demand data
- **allocations.json**: Supply amounts and allocation results
- **logs.json**: Historical activity log entries

## Example Usage

### 1. Register a User
```bash
curl -X POST "http://127.0.0.1:8001/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Create Areas
```bash
curl -X POST "http://127.0.0.1:8001/areas" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown",
    "location": "City Center",
    "priority": "High",
    "population": 50000,
    "demand": 500
  }'
```

### 3. Set Supply
```bash
curl -X POST "http://127.0.0.1:8001/supply" \
  -H "Content-Type: application/json" \
  -d '{"total_supply": 800}'
```

### 4. Run Allocation
```bash
curl -X POST "http://127.0.0.1:8001/allocate" \
  -H "Content-Type: application/json" \
  -d '{"total_supply": 800}'
```

### 5. Get Results
```bash
curl "http://127.0.0.1:8001/allocation-results"
```

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

These are configured for the frontend running on the Vite dev server.

## Security Features

- Password hashing using PBKDF2 with salts
- CORS protection
- Input validation with Pydantic
- HTTPException handling

## Requirements

- Python 3.8+
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Pydantic 2.5.0

## Development

To modify the API:

1. Edit `app.py` to add/modify endpoints
2. The server will auto-reload on save (with `--reload` flag)
3. View changes at http://127.0.0.1:8001/docs

## License

MIT
