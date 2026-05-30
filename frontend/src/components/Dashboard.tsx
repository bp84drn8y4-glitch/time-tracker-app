import React, { useState, useEffect } from 'react';

interface DashboardProps {
  user: { username: string; role: string };
  onLogout: () => void;
}

interface Entry {
  id: number;
  employeeName: string;
  orderedAmount: string;
  bringBackAmount: string;
  date: string;
}

interface UserList {
  id: number;
  username: string;
  role: string;
}

// 🌐 CLEANED: Correct backend cloud URL with no errors attached
const BACKEND_URL = 'https://time-tracker-app.onrender.com';

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [users, setUsers] = useState<UserList[]>([]);
  
  // Log Entry Form State
  const [employeeName, setEmployeeName] = useState('');
  const [orderedAmount, setOrderedAmount] = useState('');
  const [bringBackAmount, setBringBackAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Account Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('employee');

  // Status Banners
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/entries?employee=${encodeURIComponent(user.username)}&role=${user.role}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Action 1: Handle Log Entry Submission
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // If logged in as an employee, force their own name automatically
    const submittedName = user.role === 'admin' ? employeeName : user.username;

    if (!submittedName) {
      setError('Please select or provide an employee name. [Bitte Mitarbeiter auswählen]');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: submittedName,
          orderedAmount,
          bringBackAmount,
          date
        })
      });

      if (res.ok) {
        setMessage('Entry saved successfully! [Eintrag erfolgreich gespeichert]');
        setOrderedAmount('');
        setBringBackAmount('');
        if (user.role === 'admin') setEmployeeName('');
        fetchEntries(); // Refresh list instantly
      } else {
        setError('Failed to save tracking data. [Eintrag konnte nicht gespeichert werden]');
      }
    } catch (err) {
      setError('Server network connection failed. [Verbindung zum Server fehlgeschlagen]');
    }
  };

  // Action 2: Handle New Staff Account Registration
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword, role: regRole })
      });

      if (res.ok) {
        setMessage(`Account for "${regUsername}" successfully created!`);
        setRegUsername('');
        setRegPassword('');
        fetchUsers(); // Refresh list instantly
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to register account.');
      }
    } catch (err) {
      setError('Failed to process registration connection.');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <h2>Time Tracker <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>[Bilingual System]</span></h2>
        <div>
          <span style={{ marginRight: '12px' }}>User: <strong>{user.username} ({user.role})</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>Logout [Abmelden]</button>
        </div>
      </div>

      {/* Alert Banners */}
      {message && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #a7f3d0' }}>{message}</div>}
      {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #fca5a5' }}>{error}</div>}

      {/* FORM: Add Material Entry */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <h3>Add Log Entry <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>[Eintrag hinzufügen]</span></h3>
        <form onSubmit={handleSaveEntry}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Select Employee [Mitarbeiter auswählen]:</label>
            {user.role === 'admin' ? (
              <select value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="">-- Choose Staff --</option>
                {users.map(u => <option key={u.id} value={u.username}>{u.username} ({u.role})</option>)}
              </select>
            ) : (
              <input type="text" value={user.username} disabled style={{ width: '100%', padding: '8px', background: '#f3f4f6' }} />
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Ordered Amount of Material [Bestellte Materialmenge]:</label>
            <textarea value={orderedAmount} onChange={(e) => setOrderedAmount(e.target.value)} placeholder="e.g., 2 Bleach, 5kg Laundry Powder, Gloves" style={{ width: '100%', padding: '8px', height: '60px' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Bring Back Amount of Materials [Zurückgebrachte Materialmenge]:</label>
            <textarea value={bringBackAmount} onChange={(e) => setBringBackAmount(e.target.value)} placeholder="e.g., 1 Bleach left, 1kg Powder returned" style={{ width: '100%', padding: '8px', height: '60px' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Date [Datum]:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Save Entry [Eintrag speichern]
          </button>
        </form>
      </div>

      {/* ADMIN PANEL: Register Staff Accounts */}
      {user.role === 'admin' && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3>Register New Staff Account <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>[Mitarbeiter registrieren]</span></h3>
          <form onSubmit={handleRegisterUser}>
            <div style={{ marginBottom: '12px' }}>
              <input type="text" placeholder="Username" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <select value={regRole} onChange={(e) => setRegRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="employee">Employee [Mitarbeiter]</option>
                <option value="admin">Administrator [Admin]</option>
              </select>
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Create Account [Konto erstellen]
            </button>
          </form>
        </div>
      )}

      {/* LOG DATA VIEWER TABLE */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
        <h3>Logged Data Entries <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>[Gespeicherte Einträge]</span></h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Date</th>
              <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Employee</th>
              <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Ordered Material</th>
              <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Bring Back Material</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>No logging records found.</td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{entry.date}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{entry.employeeName}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap' }}>{entry.orderedAmount}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap' }}>{entry.bringBackAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
