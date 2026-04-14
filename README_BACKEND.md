# Poll Backend Setup Guide

This backend stores poll responses in a Docker container with persistent SQLite database.

## Quick Start

### Option 1: Using Docker (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed

**Steps:**
1. Navigate to project root directory
2. Run: `docker-compose up -d`
3. The backend starts on `http://localhost:5000`

To stop: `docker-compose down`

To view logs: `docker-compose logs -f poll-backend`

### Option 2: Local Development

**Prerequisites:**
- Node.js 14+ installed

**Steps:**
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create data directory: `mkdir data`
4. Start server: `npm start`
5. Server runs on `http://localhost:5000`

## API Endpoints

### Submit a Vote
**POST** `/api/poll/:pollId/vote`

Request body:
```json
{
  "option": "option1"
}
```

Response:
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "voteId": 1
}
```

### Get Poll Results
**GET** `/api/poll/:pollId`

Response:
```json
{
  "pollId": "main-poll",
  "total": 5,
  "results": [
    {
      "option": "option1",
      "votes": 3,
      "percentage": "60.0"
    },
    {
      "option": "option2",
      "votes": 2,
      "percentage": "40.0"
    }
  ]
}
```

### Health Check
**GET** `/health`

Response:
```json
{
  "status": "OK",
  "message": "Poll backend is running"
}
```

## Frontend Integration

Update your `index.html` to include the poll interaction script. The frontend code is provided in the updated index.html file.

## Database

- **Type:** SQLite
- **Location:** `backend/data/polls.db` (created automatically)
- **Table:** `poll_responses` with fields: id, poll_id, option_value, timestamp

## Troubleshooting

**Port 5000 already in use:**
- Change PORT in docker-compose.yml or `PORT=3000 npm start` for local

**Database locked error:**
- Stop running containers: `docker-compose down`

**Permission denied on data folder:**
- Check Docker volumes: `docker volume ls`
- Remove and recreate: `docker-compose down -v` then `docker-compose up -d`

## Development

To modify the backend:
1. Edit `backend/server.js`
2. Rebuild container: `docker-compose up --build`

To add more poll questions, use different `pollId` values in API calls.
