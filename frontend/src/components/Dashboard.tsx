import React, { useState, useEffect } from 'react';

interface Material {
  name: string;
  ordered: number;
  returned: number;
}

interface Entry {
  id: string;
  employeeName: string;
  business: string;
  date: string;
  startTime: string;
  endTime: string;
  materialsList: Material[];
  miscellaneous?: string;
}

interface DashboardProps {
  user: {
    username: string;
    role: string;
  };
  onLogout: () => void;
}

// Ground truth material list from your original UI layouts
const INITIAL_MATERIALS = [
  { name: "Müllbeutel Groß (Large trash bags) 120 L", ordered: 0, returned: 0 },
  { name: "Müllbeutel Medium (Medium trash bags) 60 L", ordered: 0, returned: 0 },
  { name: "Müllbeutel Klein (Small trash bags) 28 L", ordered: 0, returned: 0 },
  { name: "Wischmopp Mikrofaser (Microfiber mop) 50 cm", ordered: 0, returned: 0 },
  { name: "Wischmopp Baumwolle (Cotton mop) 50 cm", ordered: 0, returned: 0 },
  { name: "Mikrofaser Lappen rot (Red microfiber cloths) 40 x 40 cm", ordered: 0, returned: 0 },
  { name: "Mikrofaser Lappen blau (Blue microfiber cloths) 40 x 40 cm", ordered: 0, returned: 0 },
  { name: "Mikrofaser Lappen grün (Green microfiber cloths) 40 x 40 cm", ordered: 0, returned: 0 },
  { name: "Mikrofaser Lappen gelb (Yellow microfiber cloths) 40 x 40 cm", ordered: 0, returned: 0 },
  { name: "Geschirrtücher (Kitchen / Dish towels) 70 x 50 cm", ordered: 0, returned: 0 },
  { name: "Sprühflasche Sanitärreiniger Milizid (Spray bottle Bathroom cleaner)", ordered: 0, returned: 0 },
  { name: "Bodenreiniger Torrun Konzentrat (Floor cleaner concentrate)", ordered: 0, returned: 0 },
  { name: "Oberflächenreiniger (Surface cleaner)", ordered: 0, returned: 0 },
  { name: "Toilettenpapier (Toilet paper)", ordered: 0, returned: 0 },
  { name: "Falthandtücher (Folded hand towels)", ordered: 0, returned: 0 },
  { name: "Handseife (Hand soap) 10 Liter", ordered: 0, returned: 0 }
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const isAdmin = user.role === 'admin';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [business, setBusiness] = useState('Fürst Hauser Gebäudereinigung');
  const [employeeName, setEmployeeName] = useState(user.role === 'employee' ? user.username : '');
  const [date, setDate] = useState('2026-05-31');
  const [startTime, setStartTime] = useState('12:30');
  const [endTime, setEndTime] = useState('12:30');
  const [materials, setMaterials] = useState<Material[]>([...INITIAL_MATERIALS]);
  const [miscellaneous, setMiscellaneous] = useState('');
  const [message, setMessage] = useState('');

  // Admin Panel Form States for Staff Creation
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');

  const fetchEntries = async () => {
    try {
      const res = await fetch('https://time-tracker-app-w8vf.onrender.com/api/entries');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleMaterialChange = (index: number, field: 'ordered' | 'returned', value: number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: Math.max(0, value) };
    setMaterials(updated);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      employeeName,
      business,
      date,
      startTime,
      endTime,
      miscellaneous,
      materialsList: materials.filter(m => m.ordered > 0 || m.returned > 0)
    };

    try {
      const res = await fetch('https://time-tracker-app-w8vf.onrender.com/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMessage('Eintrag erfolgreich gespeichert!');
        setMaterials(INITIAL_MATERIALS.map(m => ({ ...m })));
        setMiscellaneous('');
        fetchEntries();
      } else {
        setMessage('Fehler beim Speichern.');
      }
    } catch (err) {
      setMessage('Serverfehler.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy handler or can link to real user endpoint if present
    alert(`Account für ${newUsername} wurde vorgemerkt!`);
    setNewUsername('');
    setNewPassword('');
  };

  // Helper calculation functions for totals tracking grid view rows
  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60;
    return diff / 60;
  };

  const getStaffTotals = () => {
    const totals: Record<string, number> = {};
    entries.forEach(e => {
      const hours = calculateHours(e.startTime, e.endTime);
      totals[e.employeeName] = (totals[e.employeeName] || 0) + hours;
    });
    return Object.entries(totals);
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER SECTION TOP BLOCK PANELBAR BAR HEADER */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Time Tracker</h1>
          <div style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>Angemeldet als: <span style={{ fontWeight: 'bold', color: '#334155' }}>{user.username}</span> ({user.role})</div>
        </div>
        <button onClick={onLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          Abmelden (Logout)
        </button>
      </div>

      {message && (
        <div style={{ maxWidth: '1440px', margin: '0 auto 20px', padding: '12px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', fontWeight: '500' }}>
          {message}
        </div>
      )}

      {/* CORE COLUMNS SYSTEM FLEX GRID VIEW LAYOUT */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: THE INPUT CARD FORM */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#1e293b' }}>Material & Zeiterfassung (Material & Time Tracking Input)</h2>
          
          <form onSubmit={handleSaveEntry}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>Unternehmen (Business):</label>
                <select value={business} onChange={(e) => setBusiness(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                  <option value="Fürst Hauser Gebäudereinigung">Fürst Hauser Gebäudereinigung</option>
                  <option value="Bullaude Waschsalon">Bullaude Waschsalon</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>Mitarbeiter (Employee):</label>
                <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} disabled={user.role === 'employee'} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: user.role === 'employee' ? '#f1f5f9' : '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>Datum (Date):</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>Arbeitsbeginn (Start Time):</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>Arbeitsende (End Time):</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
              </div>
            </div>

            {/* MATERIALS INVENTORY TABLE LIST SYSTEM */}
            <div style={{ marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ paddingBottom: '8px', fontWeight: '600' }}>Material / Artikelbezeichnung [Specification]</th>
                    <th style={{ paddingBottom: '8px', fontWeight: '600', width: '110px', textAlign: 'center' }}>Bestellung (Ordered Amount)</th>
                    <th style={{ paddingBottom: '8px', fontWeight: '600', width: '110px', textAlign: 'center' }}>Rücknahme (Returned Amount)</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 0', color: '#334155', fontWeight: '500' }}>{m.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" min="0" value={m.ordered} onChange={(e) => handleMaterialChange(idx, 'ordered', parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" min="0" value={m.returned} onChange={(e) => handleMaterialChange(idx, 'returned', parseInt(e.target.value) || 0)} style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MISCELLANEOUS / SONSTIGES TEXT FIELD ROW CONTAINER */}
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#b45309', marginBottom: '6px' }}>Sonstiges (Miscellaneous)</label>
              <input type="text" value={miscellaneous} onChange={(e) => setMiscellaneous(e.target.value)} placeholder="Kurze Beschreibung hier eingeben..." style={{ width: '100%', padding: '8px', border: '1px solid #fcd34d', borderRadius: '4px', fontSize: '13px' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}>
              Eintrag speichern (Save Entry)
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: STAFF STATS PANELS + TIMELINE SYSTEM FEED LOG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ADMIN ACTION 1: CREATE STAFF ACCOUNT BLOCK SHEET */}
          {isAdmin && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>Mitarbeiter anlegen (Create Staff Account)</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Mitarbeiter können eingegebene Stunden im Nachhinein nicht bearbeiten oder löschen.</p>
              
              <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Benutzername (Username)" style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Passwort (Password)" style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                  <option value="employee">Mitarbeiter (Employee)</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Konto erstellen</button>
              </form>
            </div>
          )}

          {/* TOTALS DISPLAY PRESETS SECTION LEDGER */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>
              {isAdmin ? '📅 Mitarbeiter Monatsabrechnung (Staff Monthly Totals)' : '📅 Meine Monatsübersicht (My Monthly Summary)'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Zusammenfassung aller geleisteten Arbeitsstunden sortiert nach Monat und Mitarbeiter.</p>
            
            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '8px 12px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
              <span>Monat: 2026-05</span>
              <span style={{ color: '#94a3b8' }}>Abrechnung</span>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '4px 0' }}>
              {isAdmin ? (
                getStaffTotals().map(([name, hrs]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <span style={{ color: '#334155', fontWeight: '500' }}>👤 {name}</span>
                    <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{hrs.toFixed(1)} Std.</span>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: '14px' }}>
                  <span style={{ color: '#334155', fontWeight: '500' }}>📆 Gesamtstunden</span>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                    {entries.reduce((sum, e) => sum + calculateHours(e.startTime, e.endTime), 0).toFixed(1)} Std.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE TRACK HISTORY LOG PRESETS ROW SYSTEM CARDS */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>
              {isAdmin ? '📝 Eintragungshistorie (Master Tracking Log)' : '📝 Meine Arbeitsstunden (My Shift Log)'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Historie Ihrer eingetragenen Stunden und verwendeten Reinigungsmaterialien.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entries.length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Keine Protokolleinträge vorhanden</div>
              ) : (
                entries.map((entry) => {
                  const shiftHours = calculateHours(entry.startTime, entry.endTime);
                  return (
                    <div key={entry.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>👤 {entry.employeeName}</span>
                        <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>🏢 {entry.business}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                        <span>📅 Datum: <strong>{entry.date}</strong></span>
                        <span>⏰ Zeit: <strong>{entry.startTime} - {entry.endTime}</strong> <span style={{ marginLeft: '4px', color: '#2563eb', fontWeight: 'bold' }}>{shiftHours.toFixed(1)} Std.</span></span>
                      </div>

                      {entry.materialsList && entry.materialsList.length > 0 && (
                        <div style={{ fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '6px', color: '#475569' }}>
                          <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
                            {entry.materialsList.map((m, mIdx) => (
                              <li key={mIdx} style={{ marginBottom: '2px' }}>
                                {m.name} <span style={{ color: '#2563eb', fontWeight: 'bold' }}>B: {m.ordered}</span> | <span style={{ color: '#16a34a', fontWeight: 'bold' }}>R: {m.returned}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.miscellaneous && (
                        <div style={{ fontSize: '12px', marginTop: '6px', color: '#b45309', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '4px' }}>
                          ℹ️ <em>{entry.miscellaneous}</em>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
