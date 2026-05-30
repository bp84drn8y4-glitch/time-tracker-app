import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();

// Enable security configurations and JSON body reading
app.use(cors());
app.use(express.json());

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

  // Using standard function style here to access 'this.lastID' safely
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

// ROUTE 3: Server health check point for Render monitoring
app.get('/', (req, res) => {
  res.send('Time Tracker API Server is live and running smoothly.');
});

// Automatically listen on the cloud port designated by Render, or fall back to local development port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`);
});
