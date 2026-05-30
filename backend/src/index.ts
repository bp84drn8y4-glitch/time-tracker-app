import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 🔐 Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  // Hardcoded Admin fallback
  if (username.toLowerCase() === 'admin' && password === 'admin') {
    return res.json({ 
      success: true, 
      user: { id: 1, username: 'Admin', role: 'admin' } 
    });
  }

  const sql = 'SELECT id, username, role, password FROM users WHERE LOWER(username) = LOWER(?)';
  db.get(sql, [username], (err, row: any) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row || row.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }
    res.json({ 
      success: true, 
      user: { id: row.id, username: row.username, role: row.role } 
    });
  });
});

// 👥 NEW ROUTE: Fetch all registered users for the Admin panel
app.get('/api/users', (req, res) => {
  const sql = 'SELECT id, username, role FROM users';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 📝 NEW ROUTE: Register a brand new staff account
app.post('/api/users/register', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  db.run(sql, [username, password, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Username already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User registered successfully!', id: this.lastID });
  });
});

// 📊 UPDATED ROUTE: Fetch log entries (supports filtering for staff vs admin views)
app.get('/api/entries', (req, res) => {
  const { employee, role } = req.query;
  
  let sql = 'SELECT * FROM entries';
  const params: any[] = [];

  // Employees can only view their own logs, admins see everything
  if (role === 'employee' && employee) {
    sql += ' WHERE employeeName = ?';
    params.push(employee);
  }
  
  sql += ' ORDER BY id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 📥 Insert a tracking entry
app.post('/api/entries', (req, res) => {
  const { employeeName, orderedAmount, bringBackAmount, date } = req.body;
  if (!employeeName || !date) {
    return res.status(400).json({ error: 'Employee name and date are required.' });
  }
  const sql = `INSERT INTO entries (employeeName, orderedAmount, bringBackAmount, date) VALUES (?, ?, ?, ?)`;
  db.run(sql, [employeeName, orderedAmount, bringBackAmount, date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Entry saved.', id: this.lastID });
  });
});

app.get('/', (req, res) => {
  res.send('Time Tracker API Server is live.');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
