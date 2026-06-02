import React, { useState, useEffect } from 'react';

interface DashboardProps {
  user: { username: string; role: string };
  onLogout: () => void;
}

interface MaterialItem {
  nameDe: string;
  nameEn: string;
  specification?: string;
  ordered: number;
  returned: number;
  description?: string;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const isAdmin = user.role.toLowerCase() === 'admin';
  const API_URL = 'https://time-tracker-app-w8vf.onrender.com/api';
  const handleDeleteEntry = async (entryId: string | number) => {
  if (!window.confirm("Möchten Sie diesen Eintrag wirklich löschen? [Delete this entry?]")) return;
  try {
    const res = await fetch(`${API_URL}/entries/${entryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      // Force both types to strings so comparison never mismatches
      setEntries(prev => prev.filter(e => String(e.id) !== String(entryId)));
    } else {
      alert("Fehler beim Löschen [Error deleting entry]");
    }
  } catch (err) {
    console.error("Error deleting entry:", err);
  }
};
};

const handleEditEntry = (entry: any) => {
    setSelectedBusiness(entry.business);
    setEntryDate(entry.date);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setSelectedTasks(entry.tasks || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🏢 Dropdown Context State Fields
  const [selectedBusiness, setSelectedBusiness] = useState('Fürst Hauser Gebäudereinigung');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  
  // ⏰ Time State Fields
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // 👤 Admin Account Creation State Fields
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');

  // 📊 Core App Lists Saved From Database
  const [employees, setEmployees] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [adminSectionMessage, setAdminSectionMessage] = useState('');

  // 📋 Task Lists Configurations
  const TASKS_BY_BUSINESS: Record<string, string[]> = {
  "Fürst Hauser Gebäudereinigung": [
    "Außenreinigung Schaufenster und Eingangstüren (Exterior cleaning of shop windows and entrance doors)",
    "Innenreinigung Schaufenster und Eingangstüren (Interior cleaning of shop windows and entrance doors)",
    "Beidseitige Reinigung von Glasflächen im Verkaufsbereich (Two-sided cleaning of glass surfaces in the sales area)",
    "Beidseitige Reinigung von Glasflächen im Mitarbeiterbereich (Two-sided cleaning of glass surfaces in the employee area)",
    "Zusätzliche Innenreinigung von Schaufenstern zu Dekorationsterminen mit zusätzlicher Anfahrt (Additional interior cleaning of shop windows for decoration appointments with an additional journey)",
    "Zusätzliche Innenreinigung von Schaufenstern zu Dekorationsterminen in Verbindung mit regelmäßiger Glasreinigung ohne zusätzliche Anfahrt (Additional interior cleaning of shop windows for decoration appointments in connection with regular glass cleaning without an additional journey)",
    "Reinigung von Spiegeln (Cleaning of mirrors)",
    "Sonderleistungen 1 (Special services 1)",
    "Sonderleistungen 2 (Special services 2)",
    "Sonderleistungen 3 (Special services 3)",
    "Sonstiges (Other / Miscellaneous)"
  ]
};

  // 📦 Material Lists Configurations
  const initialFurstHauser: MaterialItem[] = [
    { nameDe: 'Müllbeutel Groß', nameEn: 'Large trash bags', specification: '120 L', ordered: 0, returned: 0 },
    { nameDe: 'Müllbeutel Medium', nameEn: 'Medium trash bags', specification: '60 L', ordered: 0, returned: 0 },
    { nameDe: 'Müllbeutel Klein', nameEn: 'Small trash bags', specification: '28 L', ordered: 0, returned: 0 },
    { nameDe: 'Wischmopp Mikrofaser', nameEn: 'Microfiber mop', specification: '50 cm', ordered: 0, returned: 0 },
    { nameDe: 'Wischmopp Baumwolle', nameEn: 'Cotton mop', specification: '50 cm', ordered: 0, returned: 0 },
    { nameDe: 'Mikrofaser Lappen rot', nameEn: 'Red microfiber cloths', specification: '40 x 40 cm', ordered: 0, returned: 0 },
    { nameDe: 'Mikrofaser Lappen blau', nameEn: 'Blue microfiber cloths', specification: '40 x 40 cm', ordered: 0, returned: 0 },
    { nameDe: 'Mikrofaser Lappen grün', nameEn: 'Green microfiber cloths', specification: '40 x 40 cm', ordered: 0, returned: 0 },
    { nameDe: 'Mikrofaser Lappen gelb', nameEn: 'Yellow microfiber cloths', specification: '40 x 40 cm', ordered: 0, returned: 0 },
    { nameDe: 'Geschirrtücher', nameEn: 'Kitchen / Dish towels', specification: '70 x 50 cm', ordered: 0, returned: 0 },
    { nameDe: 'Sprühflasche Sanitärreiniger Milizid', nameEn: 'Spray bottle Bathroom cleaner', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Bodenreiniger Torrun Konzentrat', nameEn: 'Floor cleaner concentrate', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Oberflächenreiniger', nameEn: 'Surface cleaner', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Toilettenpapier', nameEn: 'Toilet paper', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Falthandtücher', nameEn: 'Folded hand towels', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Handseife', nameEn: 'Hand soap', specification: '10 Liter', ordered: 0, returned: 0 },
    { nameDe: 'Sonstiges', nameEn: 'Miscellaneous', specification: '', ordered: 0, returned: 0, description: '' }
  ];

  const initialWaschsalon: MaterialItem[] = [
    { nameDe: 'Handfolien', nameEn: 'Plastic gloves / Hand films', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Bügelstärke', nameEn: 'Ironing starch / Spray starch', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Chlor', nameEn: 'Chlorine / Bleach', specification: '', ordered: 0, returned: 0 },
    { nameDe: 'Waschpulver', nameEn: 'Laundry powder', specification: '20 kg', ordered: 0, returned: 0 },
    { nameDe: 'Weichspüler', nameEn: 'Fabric softener', specification: '20 lit', ordered: 0, returned: 0 },
    { nameDe: 'Sonstiges', nameEn: 'Miscellaneous', specification: '', ordered: 0, returned: 0, description: '' }
  ];

  const [materials, setMaterials] = useState<MaterialItem[]>(initialFurstHauser);

  useEffect(() => {
    if (selectedBusiness === 'Fürst Hauser Gebäudereinigung') {
      setMaterials(initialFurstHauser);
    } else {
      setMaterials(initialWaschsalon);
    }
  }, [selectedBusiness]);

  useEffect(() => {
    fetchEmployees();
    fetchEntries();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.filter((u: any) => u.role !== 'admin'));
      }
    } catch (err) { console.error('Error loading employees:', err); }
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_URL}/entries`);
      if (res.ok) setEntries(await res.json());
    } catch (err) { console.error('Error loading entries history:', err); }
  };

  // 🧮 Fixed Helper Function: Correctly handles blank values or text status flags sent by database
  const calculateHoursDuration = (start: string, end: string): number => {
  if (!start || !end || start.includes('Not') || end.includes('Not') || start === '-' || end === '-') return 0;
  
  try {
    const parseTimeTo24h = (timeStr: string) => {
      const [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      return { hours, minutes };
    };

    const startTimeObj = parseTimeTo24h(start);
    const endTimeObj = parseTimeTo24h(end);

    if (isNaN(startTimeObj.hours) || isNaN(endTimeObj.hours)) return 0;

    let diffMinutes = (endTimeObj.hours * 60 + endTimeObj.minutes) - (startTimeObj.hours * 60 + startTimeObj.minutes);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handles overnight shifts

    return parseFloat((diffMinutes / 60).toFixed(2));
  } catch (e) {
    return 0;
  }
};

  // 🗓️ Helper Function: Dynamic case-insensitive rolling accumulator
  const getMonthlyRollup = (userEntries: any[]) => {
    const monthlyTotals: { [key: string]: number } = {};
    userEntries.forEach(entry => {
      if (!entry.date) return;
      const monthKey = entry.date.substring(0, 7); // Layout key format: 'YYYY-MM'
      const shiftHours = calculateHoursDuration(entry.startTime, entry.endTime);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + shiftHours;
    });
    return monthlyTotals;
  };

  // 🔒 Fixed Data Filtration: Converts names to lowercase to bypass capitalization matching bugs
  const displayedEntries = isAdmin
  ? entries
  : entries.filter(e => {
      const empName = e.employee_name || e.employeeName || e.employeename;
      return empName && user.username && empName.toLowerCase().trim() === user.username.toLowerCase().trim();
    });
  const employeeMonthlySummary = getMonthlyRollup(displayedEntries);

  // Admin global accounting rollover compiler tool
  const getAdminPayrollRollup = () => {
    const payrollMap: { [key: string]: { [employee: string]: number } } = {};
    
    // Seed initial structure with all registered employees to ensure 0 hour profiles display perfectly
    const currentMonthStr = new Date().toISOString().substring(0, 7);
    payrollMap[currentMonthStr] = {};
    employees.forEach(emp => {
      if(emp.username) payrollMap[currentMonthStr][emp.username] = 0;
    });

    entries.forEach(entry => {
      if (!entry.date || !entry.employeeName) return;
      const monthKey = entry.date.substring(0, 7);
      const shiftHours = calculateHoursDuration(entry.startTime, entry.endTime);
      
      if (!payrollMap[monthKey]) payrollMap[monthKey] = {};
      
      // Look up existing keys using a flexible, case-insensitive match
      const matchedKey = Object.keys(payrollMap[monthKey]).find(k => k.toLowerCase() === entry.employeeName.toLowerCase()) || entry.employeeName;
      payrollMap[monthKey][matchedKey] = (payrollMap[monthKey][matchedKey] || 0) + shiftHours;
    });
    return payrollMap;
  };

  const adminPayrollData = getAdminPayrollRollup();

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSectionMessage('');
    if (!newUsername || !newPassword) {
      setAdminSectionMessage('Fehler: Bitte füllen Sie alle Felder aus.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword, role: newRole })
      });
      if (res.ok) {
        setAdminSectionMessage(`Konto für "${newUsername}" erfolgreich erstellt!`);
        setNewUsername('');
        setNewPassword('');
        setNewRole('employee');
        fetchEmployees();
      } else {
        const errData = await res.json().catch(() => ({}));
        setAdminSectionMessage(`Fehler: ${errData.message || 'Konto konnte nicht erstellt werden.'}`);
      }
    } catch (err) { setAdminSectionMessage('Verbindungsfehler bei der Registrierung.'); }
  };

  const handleCountChange = (index: number, field: 'ordered' | 'returned', operation: 'up' | 'down') => {
    setMaterials(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const currentVal = item[field];
      const newVal = operation === 'up' ? currentVal + 1 : Math.max(0, currentVal - 1);
      return { ...item, [field]: newVal };
    }));
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setMaterials(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, description: value };
    }));
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const targetEmployee = isAdmin ? selectedEmployee : user.username;
    if (!targetEmployee) {
      setMessage('Fehler: Bitte wählen Sie einen Mitarbeiter aus. (Select an Employee)');
      return;
    }

    const activeChanges = materials.filter(m => m.ordered > 0 || m.returned > 0 || (m.nameDe === 'Sonstiges' && m.description));
    
    // Explicitly check for valid timestamps to prevent dead blank submission payloads
    const hasTimeInput = startTime.trim() !== '' && endTime.trim() !== '';
    if (activeChanges.length === 0 && !hasTimeInput) {
      setMessage('Fehler: Bitte tragen Sie Arbeitszeiten ein oder verändern Sie Materialzähler.');
      return;
    }

    try {
      const payload = {
        employeeName: targetEmployee,
        business: selectedBusiness,
	tasks: selectedTasks,
        date: entryDate,
        startTime: startTime || 'Not logged',
        endTime: endTime || 'Not logged',
        materialsList: activeChanges
      };

      const res = await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage('Eintrag erfolgreich gespeichert! (Saved successfully)');
        setMaterials(prev => prev.map(m => ({ ...m, ordered: 0, returned: 0, description: '' })));
        setStartTime('');
        setEndTime('');
	setSelectedTasks([]);
        fetchEntries();
      } else {
        setMessage('Fehler beim Speichern der Modelldaten.');
      }
    } catch (err) { setMessage('Verbindungsfehler zum Cloud-Server.'); }
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
        
        {/* LEFT COMPONENT COLUMN: ENTRY ENTRY SHEET FORM PANEL */}
        <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '19px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            Material & Zeiterfassung (Material & Time Tracking Input)
          </h2>

          <form onSubmit={handleSaveEntry}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Unternehmen (Business):</label>
                <select value={selectedBusiness} onChange={(e) => setSelectedBusiness(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', backgroundColor: '#fff', fontWeight: '500' }}>
                  <option value="Fürst Hauser Gebäudereinigung">Fürst Hauser Gebäudereinigung</option>
                  <option value="Bullauge Waschsalon">Bullauge Waschsalon</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Mitarbeiter (Employee):</label>
                {isAdmin ? (
                  <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', backgroundColor: '#fff' }}>
                    <option value="">-- Employee List --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.username}>{emp.username}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={user.username} disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '500' }} />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>Datum (Date):</label>
                <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }} />
              </div>
            </div>

            {/* Shift hours selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Arbeitsbeginn (Start Time):</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>Arbeitsende (End Time):</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }} />
              </div>
            </div>
	    
{/* --- Dynamic Task Selection Section via Checkboxes --- */}
{selectedBusiness === "Fürst Hauser Gebäudereinigung" && (
  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#475569' }}>
      Aufgaben wählen (Select Tasks):
    </label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {TASKS_BY_BUSINESS["Fürst Hauser Gebäudereinigung"].map((taskItem, idx) => {
        const isChecked = selectedTasks.includes(taskItem);
        return (
          <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#1e293b', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                if (isChecked) {
                  setSelectedTasks(selectedTasks.filter(t => t !== taskItem));
                } else {
                  setSelectedTasks([...selectedTasks, taskItem]);
                }
              }}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <span>{taskItem}</span>
          </label>
        );
      })}
    </div>
  </div>
)}
            {/* Material Counter Table List Component */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr', background: '#f8fafc', padding: '12px', borderBottom: '2px solid #e2e8f0', fontWeight: '700', fontSize: '13px', color: '#475569' }}>
                <div>Material / Artikelbezeichnung [Specification]</div>
                <div style={{ textAlign: 'center' }}>Bestellung (Ordered Amount)</div>
                <div style={{ textAlign: 'center' }}>Rücknahme (Returned Amount)</div>
              </div>

              {materials.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr', padding: '12px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', backgroundColor: item.nameDe === 'Sonstiges' ? '#fffbeb' : '#fff' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      {item.nameDe} <span style={{ fontWeight: '400', color: '#64748b', fontSize: '13px' }}>({item.nameEn})</span>
                    </div>
                    {item.specification && (
                      <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: '600' }}>
                        {item.specification}
                      </span>
                    )}
                    {item.nameDe === 'Sonstiges' && (
                      <input 
                        type="text" 
                        placeholder="Kurze Beschreibung hier eingeben..." 
                        value={item.description || ''} 
                        onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                        style={{ width: '90%', marginTop: '8px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #f59e0b', fontSize: '12.5px', background: '#fff' }}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb', minWidth: '25px', textAlign: 'center' }}>{item.ordered}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button type="button" onClick={() => handleCountChange(idx, 'ordered', 'up')} style={{ padding: '2px 6px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>▲</button>
                      <button type="button" onClick={() => handleCountChange(idx, 'ordered', 'down')} style={{ padding: '2px 6px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>▼</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a', minWidth: '25px', textAlign: 'center' }}>{item.returned}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button type="button" onClick={() => handleCountChange(idx, 'returned', 'up')} style={{ padding: '2px 6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>▲</button>
                      <button type="button" onClick={() => handleCountChange(idx, 'returned', 'down')} style={{ padding: '2px 6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>▼</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              Eintrag speichern (Save Entry)
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: DYNAMIC WORKSPACE ROUTED BY USER ACCESS ROLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* ==================== ROLE BLOCK A: ADMIN DASHBOARDS ==================== */}
          {isAdmin && (
            <>
              {/* Account Provisioning form */}
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginTop: 0, marginBottom: '4px', fontSize: '18px', color: '#1e293b' }}>Mitarbeiter anlegen (Create Staff Account)</h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: 0, marginBottom: '15px' }}>Mitarbeiter können eingegebene Stunden im Nachhinein nicht bearbeiten oder löschen.</p>
                {adminSectionMessage && <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '12.5px' }}>{adminSectionMessage}</div>}
                <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Benutzername (Username)" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Passwort (Password)" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}>
                    <option value="employee">Mitarbeiter (Employee)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                  <button type="submit" style={{ padding: '9px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Konto erstellen</button>
                </form>
              </div>

              {/* 📊 ADMIN MASTER MONTHLY ROLLS UP PAYROLL TABLE */}
              <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginTop: 0, marginBottom: '5px', fontSize: '18px', color: '#1e293b' }}>🗓️ Mitarbeiter Monatsabrechnung (Staff Monthly Totals)</h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: 0, marginBottom: '15px' }}>Zusammenfassung aller geleisteten Arbeitsstunden sortiert nach Monat und Mitarbeiter.</p>
                
                {Object.keys(adminPayrollData).length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>Keine Monatsdaten berechnet.</div>
                ) : (
                  Object.keys(adminPayrollData).sort().reverse().map(month => (
                    <div key={month} style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ background: '#0f172a', color: '#fff', padding: '8px 12px', fontSize: '13.5px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Monat: {month}</span>
                        <span style={{ fontSize: '11px', background: '#334155', padding: '2px 6px', borderRadius: '4px' }}>Abrechnung</span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>Mitarbeiter (Staff)</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Gesamtstunden (Total Hours)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(adminPayrollData[month]).map(emp => (
                            <tr key={emp} style={{ borderBottom: '1px solid #edf2f7' }}>
                              <td style={{ padding: '8px', fontWeight: '600' }}>👤 {emp}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>
                                {adminPayrollData[month][emp]} Std.
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ==================== ROLE BLOCK B: EMPLOYEE PRIVACY DASHBOARDS ==================== */}
          {!isAdmin && (
            <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h2 style={{ marginTop: 0, marginBottom: '5px', fontSize: '18px', color: '#1e293b' }}>🗓️ Meine Monatsübersicht (My Monthly Summary)</h2>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: 0, marginBottom: '15px' }}>Ihre gesamten geleisteten Arbeitsstunden zusammengefasst für jeden Monat.</p>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px' }}>Jahr / Monat</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Arbeitsstunden Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(employeeMonthlySummary).length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>Noch keine Stunden erfasst.</td>
                    </tr>
                  ) : (
                    Object.keys(employeeMonthlySummary).sort().reverse().map(month => (
                      <tr key={month} style={{ borderBottom: '1px solid #edf2f7', backgroundColor: '#fdfdfd' }}>
                        <td style={{ padding: '10px', fontWeight: '600', color: '#1e293b' }}>📅 {month}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>{employeeMonthlySummary[month]} Std.</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* DAILY TIMELINE RECORD TRACKING COMPONENT BLOCK */}
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', maxHeight: isAdmin ? '55vh' : '85vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '5px', fontSize: '18px', color: '#1e293b' }}>
              {isAdmin ? 'Eintragungshistorie (Master Tracking Log)' : 'Meine Arbeitsstunden (My Shift Log)'}
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>
              {isAdmin ? 'Verwaltungsübersicht aller täglichen Arbeitszeiten und Materialbestellungen.' : 'Historie Ihrer eingetragenen Stunden und verwendeten Reinigungsmaterialien.'}
            </p>
            
            {displayedEntries.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>Keine Schichteinträge erfasst.</div>
            ) : (
              displayedEntries.map((entry: any, eIdx: number) => {
                const totalHours = calculateHoursDuration(entry.startTime, entry.endTime);
                
                // Friendly print layout cleanup for raw API text flags
                const readableStart = (entry.startTime && !entry.startTime.includes('Not')) ? entry.startTime : '—';
                const readableEnd = (entry.endTime && !entry.endTime.includes('Not')) ? entry.endTime : '—';

                return (
                  <div key={eIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>👤 {entry.employeeName}</span>
                        <span style={{ color: '#475569', fontWeight: '600' }}>🏢 {entry.business}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                        <span>📅 Datum: <strong>{entry.date}</strong></span>
                        <span style={{ color: '#0f172a' }}>
                          ⏰ Zeit: <strong>{readableStart}</strong> - <strong>{readableEnd}</strong> 
                          <span style={{ marginLeft: '6px', background: '#e0f2fe', color: '#0369a1', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {totalHours} Std.
                          </span>
                        </span>
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
      {/* Admin Actions Panel */}
{isAdmin && (
  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', justifyContent: 'flex-end' }}>
    <button
      onClick={() => handleDeleteEntry(entry.id)}
      style={{ padding: '5px 12px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
    >
      Bearbeiten (Edit)
    </button>
    <button
      onClick={() => handleDeleteEntry(entry.id)}
      style={{ padding: '5px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
    >
      Löschen (Delete)
    </button>
  </div>
)}              
                    {/* Inventory usage listings nested elements loop */}
                    {isAdmin && (
                      <div style={{ fontSize: '12.5px' }}>
                        {Array.isArray(entry.materialsList) && entry.materialsList.length > 0 ? (
                          entry.materialsList.map((m: any, mIdx: number) => (
                            <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #edf2f7' }}>
                              <span>
                                • {m.nameDe} {m.specification ? `[${m.specification}]` : ''}
                                {m.description && <em style={{ color: '#b45309', display: 'block', fontSize: '11.5px', marginLeft: '10px' }}>↳ Notiz: "{m.description}"</em>}
                              </span>
                              <span style={{ fontWeight: '700' }}>
                                <span style={{ color: '#2563eb' }}>B: {m.ordered}</span> | <span style={{ color: '#16a34a' }}>R: {m.returned}</span>
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11.5px' }}>Keine Materialänderungen erfasst.</div>
                        )}
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
