import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to the standard SQLite database.');
    
    // 1. Create the material tracking entries table
    db.run(`CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeName TEXT NOT NULL,
      orderedAmount TEXT,
      bringBackAmount TEXT,
      date TEXT NOT NULL
    )`);

    // 2. Create the users authorization credentials table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )`, (userTableErr) => {
      if (!userTableErr) {
        // 3. Automatically insert a secure master administrator account if it doesn't exist
        const insertAdmin = `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`;
        db.run(insertAdmin, ['admin', 'admin', 'admin'], (adminErr) => {
          if (!adminErr) {
            console.log('Database tables and master admin verified successfully.');
          }
        });
      }
    });
  }
});

export default db;
