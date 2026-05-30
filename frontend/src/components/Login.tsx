import React, { useState } from 'react';
import { Lock, User, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { id: number; username: string; role: string }) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://time-tracker-app-w8vf.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.message || 'Anmeldedaten ungültig (Invalid Credentials)');
      }
    } catch (err) {
      setError('Verbindung zum Server fehlgeschlagen. Bitte starten Sie Ihren Backend-Dienst! (Backend offline)');
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '35px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: '1px solid #eaeaea' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <Lock size={28} color="#2563eb" />
          </div>
          <h2 style={{ margin: '0 0 5px', fontSize: '24px', color: '#1e293b', fontWeight: '700' }}>Zeiterfassung</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Anmeldung erforderlich (Login Required)</p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '10px', background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: '#991b1b', fontSize: '13px', alignItems: 'center' }}>
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Benutzername (Username)</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Passwort (Password)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', transition: '0.2s' }}>
            Einloggen (Sign In)
          </button>
        </form>
      </div>
    </div>
  );
}
