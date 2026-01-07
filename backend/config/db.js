const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite DB (creates file 'scheduler.db' automatically)
const dbPath = path.resolve(__dirname, 'scheduler.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to SQLite database.');
});

// Initialize Table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName TEXT NOT NULL,
        payload TEXT,  -- Stored as JSON string
        priority TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME
    )`);
});

module.exports = db;