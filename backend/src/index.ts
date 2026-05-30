import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Initialize Local Database Connection
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the standard SQLite database.');
    initializeTables();
  }
});

function initializeTables() {
  // Setup Users profiles table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`, () => {
    // Inject default seed admin profile safely
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin', 'admin')`, () => {
      console.log('Master admin account initialized successfully.');
    });
  });

  // Setup Timesheets logging entries table
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeName TEXT NOT NULL,
    business TEXT NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT,
    endTime TEXT,
    materialsList TEXT
  )`);
}

// ROUTE 1: Authentication verification gateway
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get(`SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?`, [username.trim(), password], (err, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Anmeldedaten ungültig (Invalid Credentials)' });
    
    res.json({ id: row.id, username: row.username, role: row.role });
  });
});

// ROUTE 2: Admin Registration endpoint
app.post('/api/users/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing registration credentials.' });
  }

  db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username.trim(), password, role || 'employee'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ message: 'Benutzername existiert bereits.' });
      }
      return res.status(500).json({ message: err.message });
    }
    res.json({ id: this.lastID, success: true });
  });
});

// ROUTE 3: Dropdown selection compilation loader
app.get('/api/users', (req, res) => {
  db.all(`SELECT id, username, role FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ROUTE 4: Fetch logged entries list
app.get('/api/entries', (req, res) => {
  db.all(`SELECT * FROM entries ORDER BY date DESC, id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Parse the materials string back to an array safely for frontend
    const formatted = rows.map((row: any) => ({
      ...row,
      materialsList: JSON.parse(row.materialsList || '[]')
    }));
    res.json(formatted);
  });
});

// ROUTE 5: Core endpoint handler that securely captures and stores entries
app.post('/api/entries', (req, res) => {
  const { employeeName, business, date, startTime, endTime, start, end, materialsList } = req.body;

  // Fallbacks guarantee no missing string variables
  const finalStart = startTime || start || 'Not logged';
  const finalEnd = endTime || end || 'Not logged';

  const query = `INSERT INTO entries (employeeName, business, date, startTime, endTime, materialsList) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [
    employeeName,
    business,
    date,
    finalStart,
    finalEnd,
    JSON.stringify(materialsList || [])
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Entry logged successfully!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
