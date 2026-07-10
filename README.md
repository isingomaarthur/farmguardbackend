# FarmGuard Backend API

A comprehensive IoT monitoring backend for farm sensor data, alerts, and reporting.

## Features

- 🌱 Real-time sensor data monitoring
- 🚨 Alert management system
- 📊 Historical data and reporting
- 🗺️ Sensor node mapping
- 👤 User authentication
- 📈 Analytics and trends

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Mongoose** - ODM

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmguard
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Sensors
- `GET /api/sensors` - Get all sensors
- `GET /api/sensors/:nodeId` - Get sensor by ID
- `POST /api/sensors` - Create sensor
- `GET /api/sensors/readings` - Get latest readings
- `GET /api/sensors/readings/:type` - Get readings by type
- `POST /api/sensors/reading` - Record new reading

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/:id/read` - Mark as read
- `PATCH /api/alerts/:id/resolve` - Resolve alert
- `DELETE /api/alerts/:id` - Delete alert

### Nodes (System Map)
- `GET /api/nodes` - Get all nodes
- `GET /api/nodes/:nodeId` - Get node details
- `POST /api/nodes` - Create node
- `PATCH /api/nodes/:nodeId/position` - Update position
- `PATCH /api/nodes/:nodeId/status` - Update status

### Reports
- `GET /api/reports/weekly-summary` - Weekly summary
- `GET /api/reports/data/:period` - Report data
- `GET /api/reports/alerts/distribution` - Alert distribution
- `GET /api/reports/trends/daily` - Daily trends

## Database Models

### User
- name, email, password
- role (admin, farmer, technician, agronomist)
- farmName, farmLocation
- preferences (alerts, notifications)

### Sensor
- nodeId, zone, type
- position (x, y)
- status, lastReading
- thresholds (critical, warning)

### SensorReading
- nodeId, value, unit
- sensorType, status
- timestamp

### Alert
- title, message
- status (CRITICAL, WARNING, INFO)
- nodeId, type
- isRead, resolvedAt

## Health Check

```bash
curl http://localhost:5000/api/health
```

## Sample Data

To seed sample data, add sensor nodes and readings through the API or MongoDB directly.

## Error Handling

All endpoints return JSON with status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Development

### Project Structure
```
backend/
├── models/        # Mongoose schemas
├── routes/        # API endpoints
├── .env          # Environment variables
├── server.js     # Main server file
└── package.json
```

## Next Steps

1. Start MongoDB: `mongod`
2. Install dependencies: `npm install`
3. Run server: `npm run dev`
4. Frontend connects to `http://localhost:5000/api/*`
# farmguardbackend
