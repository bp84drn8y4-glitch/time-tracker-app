import React, { useState, useEffect } from 'react';

interface User {
  username: string;
  role: 'admin' | 'employee';
}

interface Entry {
  id: number;
  employeeName: string;
  orderedAmount: string;
  bringBackAmount: string;
  date: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [orderedAmount, setOrderedAmount] = useState('');
  const [bringBackAmount, setBringBackAmount] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'employee'>('employee');
  const [message, setMessage] = useState('');

  const BACKEND_URL = 'https://time-tracker-app-w8vf.onrender.com';

  useEffect(() => {
    fetchEntries();
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

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
      const uRes = await fetch(`${BACKEND_URL}/api/users`);
      if (uRes.ok) {
        const data = await uRes.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Failed to register user connection.');
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const targetEmployee = user.role === 'admin' ? selectedEmployee : user.username;
    if (!targetEmployee) {
      setMessage('Error: Please select or verify an employee name.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: targetEmployee,
          orderedAmount,
          bringBackAmount,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Tracking entry saved successfully!');
        setOrderedAmount('');
        setBringBackAmount('');
        fetchEntries();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Failed to submit inventory entry to server.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h2>Time Tracker <span style={{ fontSize: '14px', color: '#666' }}>[Bilingual System]</span></h2>
        <div>
          <span style={{ marginRight: '15px' }}><strong>User:</strong> {user.username} ({user.role})</span>
          <button onClick={onLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout [Abmelden]</button>
        </div>
      </header>

      {message && (
        <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#e0f7fa', borderRadius: '4px', border: '1px solid #00acc1' }}>
          {message}
        </div>
      )}

      <main style={{ display: 'flex', gap: '4px', marginTop: '20px', flexDirection: 'column' }}>
        {/* INPUT FORM SECTION */}
        <section style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Add Log Entry <span style={{ fontSize: '14px', color: '#666' }}>[Eintrag hinzufügen]</span></h3>
          <form onSubmit={handleSubmitEntry} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {user.role === 'admin' && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Select Employee [Mitarbeiter auswählen]:</label>
                <select 
                  value={selectedEmployee} 
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                  required
                >
                  <option value="">-- Choose Staff --</option>
                  {users.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Ordered Amount of Material [Bestellte Materialmenge]:</label>
              <textarea
                value={orderedAmount}
                onChange={(e) => setOrderedAmount(e.target.value)}
                placeholder="e.g., 2 Bleach, 5kg Laundry Powder, Gloves"
                style={{ width: '100%', padding: '8px', height: '60px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Bring Back Amount of Materials [Zurückgebrachte Materialmenge]:</label>
              <textarea
                value={bringBackAmount}
                onChange={(e) => setBringBackAmount(e.target.value)}
                placeholder="e.g., 1 Bleach left, 1kg Powder returned"
                style={{ width: '100%', padding: '8px', height: '60px' }}
              />
            </div>

            <button type="submit" style={{ padding: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Save Entry [Eintrag speichern]
            </button>
          </form>
        </section>

        {/* ADMIN USER REGISTRATION CONTROL PANEL */}
        {user.role === 'admin' && (
          <section style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', marginTop: '20px' }}>
            <h3>Register New Staff Account <span style={{ fontSize: '14px', color: '#666' }}>[Mitarbeiter registrieren]</span></h3>
            <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Username [Benutzername]"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="password"
                placeholder="Password [Passwort]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ padding: '8px' }}
                required
              />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin' | 'employee')} style={{ padding: '8px' }}>
                <option value="employee">Employee [Mitarbeiter]</option>
                <option value="admin">Administrator [Admin]</option>
              </select>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Create Account [Konto erstellen]
              </button>
            </form>
          </section>
        )}

        {/* DATA DISPLAY LOGS TABLE */}
        <section style={{ width: '100%', marginTop: '20px' }}>
          <h3>Tracking Logs Records <span style={{ fontSize: '14px', color: '#666' }}>[Protokolleinträge]</span></h3>
          <p style={{ fontSize: '12px', color: '#e53935', fontStyle: 'italic' }}>
            * Note: Employees cannot edit or delete data logs after entry submission. [Mitarbeiter können Einträge nach dem Absenden nicht bearbeiten oder löschen.]
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Employee Name</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ordered Amount of Material</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Bring Back Amount of Materials</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '15px', textAlign: 'center', color: '#999' }}>No data records found.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{entry.date}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}><strong>{entry.employeeName}</strong></td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', whiteSpace: 'pre-wrap' }}>{entry.orderedAmount || '-'}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', whiteSpace: 'pre-wrap' }}>{entry.bringBackAmount || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
