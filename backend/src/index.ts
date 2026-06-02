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

// 1. GET ALL ENTRIES
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
      tasks: (() => {
        try {
          return JSON.parse(row.task || '[]');
        } catch (e) {
          return row.task ? [row.task] : [];
        }
      })(),
      materialsList: (() => {
        try {
          return JSON.parse(row.materials_list || '[]');
        } catch (e) {
          return [];
        }
      })()
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST NEW ENTRY
app.post('/api/entries', async (req, res) => {
  const { employeeName, business, date, startTime, endTime, customer, tasks, materialsList } = req.body;
  try {
    await pool.query(
      `INSERT INTO entries (employee_name, business, date, start_time, end_time, customer, task, materials_list)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        employeeName,
        business,
        date,
        startTime || '-',
        endTime || '-',
        customer || 'Allgemein',
        JSON.stringify(tasks || []), 
        JSON.stringify(materialsList || [])
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
