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
  task?: string;
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

// Fürst Hauser Inventory List
const FUERST_HAUSER_MATERIALS = [
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

// Bullaude Waschsalon Inventory List
const BULLAUDE_WASCHSALON_MATERIALS = [
  { name: "Handfolien (Plastic stretch wrap / gloves)", ordered: 0, returned: 0 },
  { name: "Bügelstärke (Ironing starch / spray starch)", ordered: 0, returned: 0 },
  { name: "Chlor (Chlorine / Bleach)", ordered: 0, returned: 0 },
  { name: "Waschpulver (Washing powder) 20 kg", ordered: 0, returned: 0 },
  { name: "Weichspüler (Fabric softener) 20 L", ordered: 0, returned: 0 }
];

// Fürst Hauser Specific Task List
const FUERST_HAUSER_TASKS = [
  "Außenreinigung Schaufenster und Eingangstüren (Exterior cleaning of shop windows and entrance doors)",
  "Innenreinigung Schaufenster und Eingangstüren (Interior cleaning of shop windows and entrance doors)",
  "Beidseitige Reinigung von Glasflächen im Verkaufsbereich (Two-sided cleaning of glass surfaces in the sales area)",
  "Beidseitige Reinigung von Glasflächen im Mitarbeiterbereich (Two-sided cleaning of glass surfaces in the employee area)",
  "Zusätzliche Innenreinigung von Schaufenstern zu Dekorationsterminen mit zusätzlicher Anfahrt (Additional interior cleaning of shop windows for decoration appointments with an additional journey)",
  "Zusätzliche Innenreinigung von Schaufenstern zu Dekorationsterminen in Verbindung mit regelmäßiger Glasreinigung ohne zusätzliche Anfahrt (Additional interior cleaning of shop windows for decoration appointments in connection with regular glass cleaning without an additional journey)",
  "Reinigung von Spiegeln (Cleaning of mirrors)",
  "Sonderleistungen",
  "Sonstiges (Other / Miscellaneous)"
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const isAdmin = user.role === 'admin';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [business, setBusiness] = useState('Fürst Hauser Gebäudereinigung');
  const [employeeName, setEmployeeName] = useState(user.role === 'employee' ? user.username : '');
  const [date, setDate] = useState('2026-06-02');
  const [startTime, setStartTime] = useState('12:30');
  const [endTime, setEndTime] = useState('12:30');
  const [selectedTask, setSelectedTask] = useState('');
  
  const [materials, setMaterials] = useState<Material[]>(() => 
    FUERST_HAUSER_MATERIALS.map(m => ({ ...m }))
  );
  
  const [miscellaneous, setMiscellaneous] = useState('');
  const [message, setMessage] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');

  // Handle automatic switches when the business selection changes
  useEffect(() => {
    if (business === 'Bullaude Waschsalon') {
      setMaterials(BULLAUDE_WASCHSALON_MATERIALS.map(m => ({ ...m })));
      setSelectedTask(''); // Clear task since Waschsalon doesn't use this task list
    } else {
      setMaterials(FUERST_HAUSER_MATERIALS.map(m => ({ ...m })));
      setSelectedTask(FUERST_HAUSER_TASKS[0]); // Default to first task
    }
  }, [business]);

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
      task: business === 'Fürst Hauser Gebäudereinigung' ? selectedTask : undefined,
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
        if (business === 'Bullaude Waschsalon') {
          setMaterials(BULLAUDE_WASCHSALON_MATERIALS.map(m => ({ ...m })));
        } else {
          setMaterials(FUERST_HAUSER_MATERIALS.map(m => ({ ...m })));
        }
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
    if (!newUsername || !newPassword) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }

    try {
      const res = await fetch('https://time-tracker-app-w8vf.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });

      if (res.ok) {
        alert(`Mitarbeiter-Konto für "${newUsername}" wurde erfolgreich angelegt!`);
        setNewUsername('');
        setNewPassword('');
        setNewRole('employee');
      } else {
        const errData = await res.json();
        alert('Fehler beim Erstellen des Kontos: ' + (errData.error || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert('Verbindung zum Server fehlgeschlagen.');
    }
  };

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
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Top Navbar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Time Tracker</h1>
            <div style={{ color: '#64748b', marginTop: '6px', fontSize: '15px' }}>Angemeldet als: <span style={{ fontWeight: '700', color: '#334155' }}>{user.username}</span> ({user.role})</div>
          </div>
          <button onClick={onLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }}>
            Abmelden (Logout)
          </button>
        </div>

        {message && (
          <div style={{ padding: '14px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', marginBottom: '24px', fontWeight: '500', fontSize: '15px' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT INPUT FORM MODULE */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0', color: '#0f172a' }}>Material & Zeiterfassung (Material & Time Tracking Input)</h2>
            
            <form onSubmit={handleSaveEntry}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Unternehmen (Business):</label>
                  <select value={business} onChange={(e) => setBusiness(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff' }}>
                    <option value="Fürst Hauser Gebäudereinigung">Fürst Hauser Gebäudereinigung</option>
                    <option value="Bullaude Waschsalon">Bullaude Waschsalon</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Mitarbeiter (Employee):</label>
                  <select value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} disabled={user.role === 'employee'} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: user.role === 'employee' ? '#f1f5f9' : '#ffffff' }}>
                    {user.role === 'employee' ? (
                      <option value={user.username}>{user.username}</option>
                    ) : (
                      <>
                        <option value="">-- Employee List --</option>
                        <option value="Adam">Adam</option>
                        <option value="Susan">Susan</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Datum (Date):</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Arbeitsbeginn (Start Time):</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Arbeitsende (End Time):</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} />
                </div>
              </div>

              {/* DYNAMIC TASK SELECTION - Only appears for Fürst Hauser */}
              {business === 'Fürst Hauser Gebäudereinigung' && (
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Aufgabe / Tätigkeit (Task Selection):</label>
                  <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#0f172a' }}>
                    {FUERST_HAUSER_TASKS.map((task, tIdx) => (
                      <option key={tIdx} value={task}>{task}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Sub-Table Content Row Counters */}
              <div style={{ marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ paddingBottom: '12px', fontWeight: '700' }}>Material / Artikelbezeichnung [Specification]</th>
                      <th style={{ paddingBottom: '12px', fontWeight: '700', width: '140px', textAlign: 'center' }}>Bestellung (Ordered Amount)</th>
                      <th style={{ paddingBottom: '12px', fontWeight: '700', width: '140px', textAlign: 'center' }}>Rücknahme (Returned Amount)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m, idx) => (
                      <tr key={m.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 0', color: '#334155', fontWeight: '500' }}>{m.name}</td>
                        
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button type="button" onClick={() => handleMaterialChange(idx, 'ordered', m.ordered - 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>{m.ordered}</span>
                            <button type="button" onClick={() => handleMaterialChange(idx, 'ordered', m.ordered + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+</button>
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button type="button" onClick={() => handleMaterialChange(idx, 'returned', m.returned - 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', color: '#16a34a' }}>{m.returned}</span>
                            <button type="button" onClick={() => handleMaterialChange(idx, 'returned', m.returned + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sonstiges Textfield Module */}
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#b45309', marginBottom: '8px' }}>Sonstiges (Miscellaneous)</label>
                <input type="text" value={miscellaneous} onChange={(e) => setMiscellaneous(e.target.value)} placeholder="Kurze Beschreibung hier eingeben..." style={{ width: '100%', padding: '10px', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '14px', backgroundColor: '#ffffff' }} />
              </div>

              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#22c55e', color: 'white', fontWeight: '800', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px -1px rgba(34,197,94,0.2)' }}>
                Eintrag speichern (Save Entry)
              </button>
            </form>
          </div>

          {/* RIGHT SIDE DASHBOARD PANELS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Create Staff Panel */}
            {isAdmin && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>Mitarbeiter anlegen (Create Staff Account)</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Mitarbeiter können eingegebene Stunden im Nachhinein nicht bearbeiten oder löschen.</p>
                
                <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Benutzername (Username)" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} required />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Passwort (Password)" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} required />
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff' }}>
                    <option value="employee">Mitarbeiter (Employee)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                  <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>Konto erstellen</button>
                </form>
              </div>
            )}

            {/* Monthly Summary Statistics Frame */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>
                {isAdmin ? '📅 Mitarbeiter Monatsabrechnung (Staff Monthly Totals)' : '📅 Meine Monatsübersicht (My Monthly Summary)'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Zusammenfassung aller geleisteten Arbeitsstunden sortiert nach Monat und Mitarbeiter.</p>
              
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 16px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700' }}>
                <span>Monat: 2026-06</span>
                <span style={{ color: '#94a3b8' }}>Abrechnung</span>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', backgroundColor: '#ffffff' }}>
                {isAdmin ? (
                  getStaffTotals().length === 0 ? (
                    <div style={{ padding: '16px', color: '#64748b', fontSize: '14px', textAlign: 'center', fontStyle: 'italic' }}>Keine Daten für diesen Monat</div>
                  ) : (
                    getStaffTotals().map(([name, hrs]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', alignItems: 'center' }}>
                        <span style={{ color: '#334155', fontWeight: '600' }}>👤 {name}</span>
                        <span style={{ fontWeight: '800', color: '#2563eb' }}>{hrs.toFixed(1)} Std.</span>
                      </div>
                    ))
                  )
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', fontSize: '14px', alignItems: 'center' }}>
                    <span style={{ color: '#334155', fontWeight: '600' }}>📆 Arbeitsstunden Gesamt</span>
                    <span style={{ fontWeight: '800', color: '#16a34a' }}>
                      {entries.reduce((sum, e) => sum + calculateHours(e.startTime, e.endTime), 0).toFixed(1)} Std.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* History Logs Feed Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>
                {isAdmin ? '📝 Eintragungshistorie (Master Tracking Log)' : '📝 Meine Arbeitsstunden (My Shift Log)'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Historie Ihrer eingetragenen Stunden und verwendeten Reinigungsmaterialien.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entries.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', padding: '32px' }}>Keine Protokolleinträge vorhanden</div>
                ) : (
                  entries.map((entry) => {
                    const shiftHours = calculateHours(entry.startTime, entry.endTime);
                    return (
                      <div key={entry.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>👤 {entry.employeeName}</span>
                          <span style={{ color: '#475569', fontSize: '13px', fontWeight: '600', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '6px' }}>🏢 {entry.business}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                          <span>📅 Datum: <strong>{entry.date}</strong></span>
                          <span>⏰ Zeit: <strong>{entry.startTime} - {entry.endTime}</strong> <span style={{ marginLeft: '6px', color: '#2563eb', fontWeight: '800' }}>{shiftHours.toFixed(1)} Std.</span></span>
                        </div>

                        {/* DISPLAY SAVED TASK LOGS */}
                        {entry.task && (
                          <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginBottom: '12px', backgroundColor: '#e0f2fe', padding: '6px 12px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                            🛠️ Aufgabe: <em>{entry.task}</em>
                          </div>
                        )}

                        {entry.materialsList && entry.materialsList.length > 0 && (
                          <div style={{ fontSize: '13px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', color: '#334155' }}>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                              {entry.materialsList.map((m, mIdx) => (
                                <li key={mIdx} style={{ marginBottom: '4px' }}>
                                  {m.name} — <span style={{ color: '#2563eb', fontWeight: '700' }}>B: {m.ordered}</span> | <span style={{ color: '#16a34a', fontWeight: '700' }}>R: {m.returned}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {entry.miscellaneous && (
                          <div style={{ fontSize: '13px', marginTop: '10px', color: '#b45309', backgroundColor: '#fffbeb', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fef3c7' }}>
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
    </div>
  );
}
