const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization
const dbPath = path.join(__dirname, 'data', 'polls.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  initializeDatabase();
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS poll_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id TEXT NOT NULL,
      option_value TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Poll responses table initialized');
    }
  });
}

// Routes

// GET: Fetch poll results
app.get('/api/poll/:pollId', (req, res) => {
  const { pollId } = req.params;
  
  db.all(
    `SELECT option_value, COUNT(*) as count FROM poll_responses 
     WHERE poll_id = ? 
     GROUP BY option_value`,
    [pollId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      // Get total votes
      db.get(
        `SELECT COUNT(*) as total FROM poll_responses WHERE poll_id = ?`,
        [pollId],
        (err, totalRow) => {
          if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
          
          const total = totalRow?.total || 0;
          const results = rows.map(row => ({
            option: row.option_value,
            votes: row.count,
            percentage: total > 0 ? ((row.count / total) * 100).toFixed(1) : 0
          }));
          
          res.json({ pollId, total, results });
        }
      );
    }
  );
});

// POST: Submit a vote
app.post('/api/poll/:pollId/vote', (req, res) => {
  const { pollId } = req.params;
  const { option } = req.body;
  
  if (!option) {
    return res.status(400).json({ error: 'Option is required' });
  }
  
  db.run(
    `INSERT INTO poll_responses (poll_id, option_value) VALUES (?, ?)`,
    [pollId, option],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Vote recorded successfully',
        voteId: this.lastID 
      });
    }
  );
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Poll backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Poll backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
