import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Paste your Supabase connection string link right here
const connectionString = "postgresql://postgres:[YOUR-PASSWORD]@db.wehebqlraxwisowqogtl.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString: connectionString,
});

async function initializeTables() {
  try {
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);

    // Create Admin User if missing
    await pool.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', 'admin', 'admin') 
      ON CONFLICT (username) DO NOTHING;
    `);

    // Create Entries Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        employee_name TEXT NOT NULL,
        business TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        customer TEXT,
        task TEXT,
        materials_list TEXT
      );
    `);
    
    console.log('Connected safely to Supabase Cloud Database and verified tables.');
  } catch (err: any) {
    console.error('Database initialization error:', err.message);
  }
}

initializeTables();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND password = $2',
      [username.trim(), password]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid Credentials' });
    const row = result.rows[0];
    res.json({ id: row.id, username: row.username, role: row.role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
      [username.trim(), password, role || 'employee']
    );
    res.json({ id: result.rows[0].id, success: true });
  } catch (err: any) {
    if (err.message.includes('unique')) return res.status(400).json({ message: 'Benutzername existiert bereits.' });
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM users');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entries ORDER BY date DESC, id DESC');
    const formatted = result.rows.map((row: any) => ({
      id: row.id,
      employeeName: row.employee_name,
      business: row.business,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      customer: row.customer,
      task: row.task,
      materialsList: JSON.parse(row.materials_list || '[]')
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/entries', async (req, res) => {
  const { employeeName, business, date, startTime, endTime, customer, task, materialsList } = req.body;
  try {
    await pool.query(
      `INSERT INTO entries (employee_name, business, date, start_time, end_time, customer, task, materials_list) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        employeeName,
        business,
        date,
        startTime || '—',
        endTime || '—',
        customer || 'Allgemein',
        task || 'Reinigung',
        JSON.stringify(materialsList || [])
      ]
    );
    res.json({ message: 'Entry logged successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
