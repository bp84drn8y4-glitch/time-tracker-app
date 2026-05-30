import sqlite3 from 'sqlite3';
import path from 'path';

// Resolves the database file location in your backend root directory
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to the standard SQLite database.');
    
    // Create the tracker table with your specific material tracking columns
    db.run(`CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeName TEXT NOT NULL,
      orderedAmount TEXT,
      bringBackAmount TEXT,
      date TEXT NOT NULL
    )`, (tableErr) => {
      if (tableErr) {
        console.error('Error creating entries table:', tableErr.message);
      } else {
        console.log('Entries tracking table verified successfully.');
      }
    });
  }
});

export default db;
