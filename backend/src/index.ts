import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import { Client as PGClient } from 'pg';

const app = express();
// Render sets its own PORT dynamically. Fallback to 10000 for local testing.
const PORT = process.env.PORT || 10000;

// ==========================================
// 1. MIDDLEWARE SETUP
// ==========================================
app.use(cors({
  origin: '*', // Allows your frontend application to communicate with this API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ==========================================
// 2. EXTERNAL DATABASE INITIALIZATION
// ==========================================
// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fallback Local Database Configuration (SQLite)
const db = new sqlite3.Database('./zeiterfassung.db', (err) => {
  if (err) {
    console.error('SQLite connection error:', err.message);
  } else {
    console.log('Connected to local SQLite database successfully.');
  }
});

// ==========================================
// 3. API ROUTES & CORRECTION RULES
// ==========================================

// Health Check Endpoint for Render Monitoring
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Example Data Processing Endpoint
app.get('/api/time-records', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If pulling from local database context
    const query = `SELECT * FROM time_records`;
    
    db.all(query, [], (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Explicitly typed parameters (row: any) to resolve TS7006 compile errors
      const structuredData = rows.map((row: any) => {
        return {
          id: row.id,
          employeeName: row.employee_name || 'Unknown',
          hoursWorked: parseFloat(row.hours_worked) || 0,
          date: row.record_date
        };
      });

      return res.status(200).json(structuredData);
    });
  } catch (error) {
    next(error);
  }
});

// Authentication / Login Endpoint example
app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin') {
    return res.status(200).json({ 
      success: true, 
      token: 'mock-jwt-token-xyz',
      user: { name: 'Administrator' } 
    });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// ==========================================
// 4. GLOBAL ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ==========================================
// 5. SERVER BOOT INITIALIZATION
// ==========================================
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Express Time-Tracker Backend Server Running     `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`  Listening Address: http://localhost:${PORT}     `);
  console.log(`==================================================`);
});

export default app;
