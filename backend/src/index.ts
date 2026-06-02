import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Schema Alter Patch for PostgreSQL
pool.query(`
  ALTER TABLE entries ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
`)
  .then(() => console.log("Database schema check complete: customer_name column ready."))
  .catch((err) => console.error("Database schema update failed:", err));

// LOGIN ENDPOINT (Connected to Supabase Database)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Search the database for the matching username
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültiger Benutzername oder Passwort' });
    }

    const user = result.rows[0];

    // 2. Validate password (works for plain text and future encrypted accounts)
    let isPasswordValid = (password === user.password);

    if (!isPasswordValid && user.password.startsWith('$2')) {
      try {
        const bcrypt = require('bcrypt');
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (err) {
        console.error("Bcrypt failure:", err);
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Ungültiger Benutzername oder Passwort' });
    }

    // 3. Success! Return user identity details to frontend
    res.json({ 
      username: user.username, 
      role: user.role 
    });

  } catch (error) {
    console.error("Login Server Error:", error);
    res.status(500).json({ error: 'Interner Serverfehler beim Login' });
  }
});

// 1. GET ENTRIES (Filtered by Role)
app.get('/api/entries', async (req, res) => {
  // Get the username and role sent from the frontend headers
  const username = req.headers['x-user-username'] as string;
  const role = req.headers['x-user-role'] as string;

  try {
    let result;
    
    if (role === 'admin') {
      // Admins see everything
      result = await pool.query('SELECT * FROM entries ORDER BY date DESC, id DESC');
    } else {
      // Employees ONLY see rows matching their username
      result = await pool.query(
        'SELECT * FROM entries WHERE LOWER(employee_name) = LOWER($1) ORDER BY date DESC, id DESC',
        [username]
      );
    }

const formattedEntries = result.rows.map(row => ({
  id: row.id,
  employeeName: row.employee_name,
  business: row.business,
  date: row.date,
  startTime: row.start_time,
  endTime: row.end_time,
  tasks: typeof row.task === 'string' ? JSON.parse(row.task) : row.task,
  materialsList: typeof row.materials_list === 'string' ? JSON.parse(row.materials_list) : row.materials_list,
  miscellaneous: row.miscellaneous,
  customerName: row.customer_name // <-- Maps the lowercase db column to your UI badge code
}));
res.json(formattedEntries);

  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST NEW ENTRY
app.post('/api/entries', async (req, res) => {
  const { employeeName, business, date, startTime, endTime, tasks, miscellaneous, materialsList, customerName } = req.body;
  try {
    await pool.query(
      `INSERT INTO entries (employee_name, business, date, start_time, end_time, customer, task, materials_list, customer_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        employeeName,
        business,
        date,
        startTime || '-',
        endTime || '-',
        customerName || 'Allgemein',
        JSON.stringify(tasks || []),
        JSON.stringify(materialsList || []),
        customerName || ''
      ]
    );
    res.json({ message: 'Entry logged successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}); 

// 3. DELETE ENTRY (Registered safely BEFORE app.listen)
app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM entries WHERE id = $1', [id]);
    res.json({ message: 'Entry deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. START SERVER LISTENER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
