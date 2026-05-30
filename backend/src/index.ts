import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 NEW: API Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Temporary safe login fallback for development/admin setup
  if (username.toLowerCase() === 'admin' && password === 'admin') {
    return res.json({ username: 'Admin', role: 'admin' });
  }

  // Look up user credentials dynamically in the database
  const sql = 'SELECT username, role, password FROM users WHERE LOWER(username) = LOWER(?)';
  db.get(sql, [username], (err, row: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row || row.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password. [Ungültiger Benutzername oder Passwort]' });
    }
    res.json({ username: row.username, role: row.role });
  });
});

// ROUTE 1: Fetch all tracking entries from the database
app.get('/api/entries', (req, res) => {
  const sql = 'SELECT * FROM entries ORDER BY id DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ROUTE 2: Insert a brand new tracking log submitted by staff
app.post('/api/entries', (req, res) => {
  const { employeeName, orderedAmount, bringBackAmount, date } = req.body;
  
  if (!employeeName || !date) {
    return res.status(400).json({ error: 'Employee name and date are required fields.' });
  }

  const sql = `INSERT INTO entries (employeeName, orderedAmount, bringBackAmount, date) VALUES (?, ?, ?, ?)`;
  const params = [employeeName, orderedAmount, bringBackAmount, date];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Tracking entry logged successfully.',
      id: this.lastID
    });
  });
});

// HEALTH CHECK: Verify server status
app.get('/', (req, res) => {
  res.send('Time Tracker API Server is live and running smoothly.');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`);
});
