# Quick Start: Running the Poll Backend with Docker

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop
   - This includes both Docker and Docker Compose
   - After installation, restart your computer

2. **Verify Installation**
   - Open PowerShell or Command Prompt
   - Run: `docker --version` and `docker-compose --version`
   - You should see version numbers

## Getting Started

### Step 1: Start the Backend

1. Open PowerShell and navigate to your project root:
   ```powershell
   cd "C:\Users\25917714\OneDrive - Edge Hill University\Documents\GitHub\Research-Development-Project"
   ```

2. Start the Docker container:
   ```powershell
   docker-compose up -d
   ```

3. Verify it's running:
   ```powershell
   docker-compose ps
   ```
   You should see `poll-backend` with status `Up`

4. Check the logs:
   ```powershell
   docker-compose logs -f poll-backend
   ```
   Wait until you see: `Poll backend server running on port 5000`

### Step 2: Test the Backend

Open your browser and visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "OK",
  "message": "Poll backend is running"
}
```

### Step 3: Open Your Website

Open `Student_News_Website/index.html` in your browser (or start a local web server)

The poll should now:
- Show "Submit Vote" button
- Display live poll results below
- Automatically refresh every 5 seconds

## Common Commands

### View Backend Logs
```powershell
docker-compose logs -f poll-backend
```

### Stop the Backend
```powershell
docker-compose down
```

### Stop and Remove Everything (including data)
```powershell
docker-compose down -v
```

### Restart the Backend
```powershell
docker-compose restart poll-backend
```

### View Database
The SQLite database is stored in: `backend/data/polls.db`
To view it, use an SQLite viewer tool or within Docker container.

## Troubleshooting

### Port 5000 Already in Use
If you get a "port already in use" error:
1. Option A: Stop the service using that port
2. Option B: Change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "5001:5000"  # Use 5001 instead
   ```
   Then update `BACKEND_URL` in `index.html`:
   ```javascript
   const BACKEND_URL = 'http://localhost:5001';
   ```

### CORS Error in Browser Console
If polls don't work, the backend might not be accessible:
1. Make sure Docker Desktop is running
2. Check backend is up: `http://localhost:5000/health` in browser
3. Check your browser's console for error messages (F12 → Console)

### Database Issues
If you get "database locked" errors:
```powershell
# Remove the old container and volume
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Production Notes

When deploying to production:
1. Change `BACKEND_URL` in `index.html` to your actual server address
2. Update environment variables in `docker-compose.yml`
3. Use environment variables instead of hardcoded URLs
4. Consider adding authentication to the API

## File Structure Created

```
Research-Development-Project/
├── backend/
│   ├── server.js          # Express.js backend
│   ├── package.json       # Dependencies
│   ├── Dockerfile         # Docker configuration
│   ├── data/              # SQLite database (created at runtime)
│   └── .gitignore
├── docker-compose.yml     # Docker Compose configuration
├── README_BACKEND.md      # Detailed documentation
└── Student_News_Website/
    └── index.html         # Updated with poll functionality
```

## Next Steps

1. ✅ Backend is running on Docker
2. ✅ Frontend is connected to backend
3. Next: You can add more poll questions by duplicating the radio buttons in the HTML
4. Consider: Add a poll question text (update the HTML to include "What do you think about...")

Enjoy your poll system! 🎉
