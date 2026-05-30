import sqlite3 from 'sqlite3';
import path from 'path';

// Locate or create the standard database file
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the standard SQLite database.');
  }
});

db.serialize(() => {
  // 1. Create Users Table with all required columns
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err.message);
  });

  // 2. Create Entries Table matching your material layout
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeName TEXT NOT NULL,
      orderedAmount TEXT,
      bringBackAmount TEXT,
      date TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating entries table:', err.message);
  });

  // 3. Ensure master admin is verified/inserted fallback
  const checkAdmin = "SELECT * FROM users WHERE username = 'admin'";
  db.get(checkAdmin, [], (err, row) => {
    if (!row) {
      const insertAdmin = "INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin')";
      db.run(insertAdmin);
      console.log('Master admin account initialized successfully.');
    } else {
      console.log('Database tables and master admin verified successfully.');
    }
  });
});

export default db;
