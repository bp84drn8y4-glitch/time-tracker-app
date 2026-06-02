import React, { useState, useEffect } from 'react';

interface Material {
  name: string;
  ordered: number;
  returned: number;
  description: string;
}

interface Entry {
  id: string;
  employeeName: string;
  business: string;
  date: string;
  startTime: string;
  endTime: string;
  customer: string;
  tasks: string[];
  materialsList: Material[];
}

interface DashboardProps {
  user: {
    username: string;
    role: string;
  };
  onLogout: () => void;
}

const BUSINESS_MATERIALS: Record<string, string[]> = {
  "Fürst Hauser Gebäudereinigung": [
    "Müllsäcke transparent 60l", "Müllsäcke transparent 120l", "Müllsäcke blau 120l",
    "Blaues Tuch", "Rotes Tuch", "Gelbes Tuch", "Grünes Tuch",
    "Allzweckreiniger Kiehl Tasanet 1l", "Sanitärreiniger Kiehl Sanipur 1l",
    "Aktiv-Geschirrreiniger Prisma 1l", "Spülmaschinentabs (Packung)",
    "Küchenrollen (Rolle)", "Toilettenpapier (Rolle)", "Handtuchpapier (Packung)",
    "Seife Kiehl 500ml", "Seife Kiehl 5l", "Kalklöser Kiehl 1l",
    "Glasreiniger Kiehl 1l", "Wischpflege Kiehl Parketto-clean 1l",
    "Glanztrockner Kiehl 1l", "Scheuermilch Kiehl 500ml",
    "Moppbezüge Baumwolle 50cm", "Moppbezüge Mikrofaser 50cm",
    "Moppbezüge Baumwolle 40cm", "Moppbezüge Mikrofaser 40cm",
    "Schwämme mit weißem Vlies", "Schwämme mit grünem Vlies",
    "Schmutzradierer (Packung)", "Saugerbeutel Kärcher T10/1",
    "Saugerbeutel Kärcher T7/1", "Saugerbeutel Nilfisk",
    "Handspülmittel 1l", "Waschmittel (Packung)"
  ],
  "Bullaude Waschsalon": [
    "Waschmittel flüssig Ariel 5l", "Weichspüler Lenor 5l",
    "Hygienespüler Sagrotan 5l", "Entkalker Tabs (Packung)",
    "Fleckenentferner Vanish 1l", "Flusensiebe (Stück)",
    "Reinigungstücher Waschmaschine", "Desinfektionsspray 500ml"
  ],
  "Allgemein": [
    "Notizblock A5", "Kugelschreiber blau", "Ordner A4 breit",
    "Heftstreifen (Packung)", "Büroklammern (Packung)"
  ]
};

const ALL_TASKS = [
  "Unterhaltsreinigung (Maintenance cleaning)",
  "Glasreinigung (Glass cleaning)",
  "Grundreinigung (Deep cleaning)",
  "Sonderreinigung (Special cleaning)",
  "Fahrtzeit (Travel time)",
  "Reinigung"
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const isAdmin = user.role === 'admin';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState("Fürst Hauser Gebäudereinigung");
  const [employeeName, setEmployeeName] = useState(user.role === 'employee' ? user.username : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [customer, setCustomer] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const list = BUSINESS_MATERIALS[selectedBusiness] || [];
    setMaterials(list.map(name => ({ name, ordered: 0, returned: 0, description: '' })));
  }, [selectedBusiness]);

  const fetchEntries = async () => {
    try {
      const res = await fetch('https://time-tracker-app-w8vf.onrender.com/api/entries');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleTaskToggle = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter(t => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleMaterialChange = (index: number, field: keyof Material, value: any) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      employeeName,
      business: selectedBusiness,
      date,
      startTime,
      endTime,
      customer,
      tasks: selectedTasks,
      materialsList: materials.filter(m => m.ordered > 0 || m.returned > 0 || m.description)
    };

    try {
      const url = editingId 
        ? `https://time-tracker-app-w8vf.onrender.com/api/entries/${editingId}`
        : 'https://time-tracker-app-w8vf.onrender.com/api/entries';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage(editingId ? 'Eintrag erfolgreich aktualisiert!' : 'Eintrag erfolgreich gespeichert!');
        setStartTime('');
        setEndTime('');
        setCustomer('');
        setSelectedTasks([]);
        setEditingId(null);
        const list = BUSINESS_MATERIALS[selectedBusiness] || [];
        setMaterials(list.map(name => ({ name, ordered: 0, returned: 0, description: '' })));
        fetchEntries();
      } else {
        setMessage('Fehler beim Speichern der Spieldaten.');
      }
    } catch (err) {
      setMessage('Verbindungsfehler zum Cloud-Server.');
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingId(entry.id);
    setEmployeeName(entry.employeeName);
    setSelectedBusiness(entry.business);
    setDate(entry.date);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setCustomer(entry.customer);
    setSelectedTasks(entry.tasks || []);

    const businessList = BUSINESS_MATERIALS[entry.business] || [];
    const baseMaterials = businessList.map(name => {
      const existing = entry.materialsList?.find(m => m.name === name);
      return existing ? existing : { name, ordered: 0, returned: 0, description: '' };
    });
    setMaterials(baseMaterials);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
    try {
      const res = await fetch(`https://time-tracker-app-w8vf.onrender.com/api/entries/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessage('Eintrag erfolgreich gelöscht!');
        fetchEntries();
      } else {
        setMessage('Fehler beim Löschen des Eintrags.');
      }
    } catch (err) {
      setMessage('Verbindungsfehler beim Löschen.');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1550px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Upper Navigation Row bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a' }}>Time Tracker</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Angemeldet als: <strong style={{ color: '#1e293b' }}>{user.username}</strong> ({user.role})</p>
        </div>
        <button onClick={onLogout} style={{ padding: '10px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          Abmelden (Logout)
        </button>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '25px', fontSize: '14px', fontWeight: '500' }}>
          {message}
        </div>
      )}

      {/* Main Column Grid Splits layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1.25fr 1fr' : '1fr 1fr', gap: '35px', alignItems: 'start' }}>
        
        {/* LEFT COMPONENT COLUMN: ENTRY SHEET FORM PANEL */}
        <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '19px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            Material & Zeiterfassung (Material & Time Tracking Input)
          </h2>

          <form onSubmit={handleSaveEntry}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Unternehmen (Business):</label>
                <select value={selectedBusiness} onChange={(e) => setSelectedBusiness(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                  <option value="Fürst Hauser Gebäudereinigung">Fürst Hauser Gebäudereinigung</option>
                  <option value="Bullaude Waschsalon">Bullaude Waschsalon</option>
                  <option value="Allgemein">Allgemein</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Mitarbeiter (Employee):</label>
                <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} disabled={user.role === 'employee'} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: user.role === 'employee' ? '#f8fafc' : '#ffffff' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Datum (Date):</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Startzeit (Start Time):</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Endzeit (End Time):</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Kunde (Customer Name):</label>
                <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Z.B. Dr. Müller / Raum 102" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} required />
              </div>
            </div>

            {/* Tasks selection Checklist Box */}
            <div style={{ marginBottom: '25px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>Ausgewählte Aufgaben (Select Tasks Worked):</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {ALL_TASKS.map((task) => (
                  <label key={task} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedTasks.includes(task)} onChange={() => handleTaskToggle(task)} style={{ width: '16px', height: '16px' }} />
                    {task}
                  </label>
                ))}
              </div>
            </div>

            {/* Material Inventory Increments List Sheet Box */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>Materialverwaltung (Material Management Row Counter):</label>
              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#ffffff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Materialbezeichnung</th>
                      <th style={{ padding: '8px', width: '90px', textAlign: 'center' }}>Entnommen</th>
                      <th style={{ padding: '8px', width: '90px', textAlign: 'center' }}>Retoure</th>
                      <th style={{ padding: '8px' }}>Notiz / Bemerkung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat, mIdx) => (
                      <tr key={mat.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: '500', color: '#334155' }}>{mat.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button type="button" onClick={() => handleMaterialChange(mIdx, 'ordered', Math.max(0, mat.ordered - 1))} style={{ padding: '2px 6px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                            <span style={{ minWidth: '20px', fontWeight: 'bold' }}>{mat.ordered}</span>
                            <button type="button" onClick={() => handleMaterialChange(mIdx, 'ordered', mat.ordered + 1)} style={{ padding: '2px 6px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                          </div>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button type="button" onClick={() => handleMaterialChange(mIdx, 'returned', Math.max(0, mat.returned - 1))} style={{ padding: '2px 6px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                            <span style={{ minWidth: '20px', fontWeight: 'bold' }}>{mat.returned}</span>
                            <button type="button" onClick={() => handleMaterialChange(mIdx, 'returned', mat.returned + 1)} style={{ padding: '2px 6px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                          </div>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="text" value={mat.description} onChange={(e) => handleMaterialChange(mIdx, 'description', e.target.value)} placeholder="Z.B. Defekt / Rest" style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: editingId ? '#d97706' : '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editingId ? 'Eintrag aktualisieren (Update Entry)' : 'Eintrag speichern (Save Card Sheet)'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setStartTime(''); setEndTime(''); setCustomer(''); setSelectedTasks([]); }} style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: '#64748b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                Abbrechen (Cancel)
              </button>
            )}
          </form>
        </div>

        {/* RIGHT COMPONENT COLUMN: LIVE REGISTERED FEED HISTORY CARDS LOGS LIST */}
        <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '24px', maxHeight: '900px', overflowY: 'auto' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '19px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            Erfasste Zeiteinträge Logs (Time Sheets Registered Ledger)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {entries.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', marginTop: '20px' }}>Keine Einträge vorhanden [No history entries filed yet]</p>
            ) : (
              entries.map((entry, eIdx) => {
                const totalHours = (() => {
                  if (!entry.startTime || !entry.endTime) return '0.0';
                  const [sH, sM] = entry.startTime.split(':').map(Number);
                  const [eH, eM] = entry.endTime.split(':').map(Number);
                  let diffMins = (eH * 60 + eM) - (sH * 60 + sM);
                  if (diffMins < 0) diffMins += 24 * 60;
                  return (diffMins / 60).toFixed(2);
                })();

                const readableStart = entry.startTime && !entry.startTime.includes('Not') ? entry.startTime : '-';
                const readableEnd = entry.endTime && !entry.endTime.includes('Not') ? entry.endTime : '-';

                return (
                  <div key={eIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>👤 {entry.employeeName}</span>
                        <span style={{ color: '#475569', fontWeight: '600' }}>🏢 {entry.business}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                        <span>📅 Datum: <strong>{entry.date}</strong></span>
                        <span>⏱️ Zeit: <strong>{readableStart}</strong> – <strong>{readableEnd}</strong> <span style={{ marginLeft: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>{totalHours} Std.</span></span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                        📍 Kunde: <strong>{entry.customer}</strong>
                      </div>
                    </div>

                    {/* Task display block */}
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                      <strong>Aufgaben (Tasks):</strong>{' '}
                      {entry.tasks && entry.tasks.length > 0 ? (
                        <ul style={{ margin: '4px 0 0 15px', padding: 0, listStyleType: 'disc' }}>
                          {entry.tasks.filter((t: string) => t && (t !== "Reinigung" || entry.tasks.length === 1)).map((t: string, tIdx: number) => (
                            <li key={tIdx} style={{ color: '#1e293b', marginBottom: '2px' }}>
                              {t}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ fontStyle: 'italic' }}>Keine Aufgaben angegeben [No tasks specified]</span>
                      )}
                    </div>

                    {/* Materials Display Block */}
                    {entry.materialsList && entry.materialsList.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                        <strong>Materialien:</strong>
                        <ul style={{ margin: '4px 0 0 15px', padding: 0, listStyleType: 'circle' }}>
                          {entry.materialsList.map((m, mIdx) => (
                            <li key={mIdx} style={{ marginBottom: '2px' }}>
                              {m.name} — Entnommen: <strong>{m.ordered}</strong> | Retoure: <strong>{m.returned}</strong> {m.description ? `(${m.description})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Admin Actions Panel */}
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEditEntry(entry)} style={{ padding: '5px 12px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Bearbeiten</button>
                        <button onClick={() => handleDeleteEntry(entry.id)} style={{ padding: '5px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Löschen</button>
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
  );
}
