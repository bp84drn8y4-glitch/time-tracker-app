import React, { useState } from 'react';
import { Lock } from 'lucide-react';

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
      // 🌐 Connecting directly to your verified clean Render backend instance
      const res = await fetch('https://time-tracker-app-w8vf.onrender.com/model/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successfully log in and pass user details straight to the application
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Anmeldedaten ungültig (Invalid Credentials)');
      }
    } catch (err) {
      setError('Verbindung zum Server fehlgeschlagen. (Backend offline)');
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '35px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: '1px solid #eaeaea' }}>
        
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <Lock size={28} color="#2563eb" />
          </div>
          <h2 style={{ margin: '0 0 5px', fontSize: '24px', color: '#1e293b', fontWeight: '700' }}>Zeiterfassung</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Anmeldung erforderlich (Login Required)</p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div style={{ display: 'flex', gap: '10px', background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: '#991b1b', fontSize: '13px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Benutzername (Username)</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Passwort (Password)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            Einloggen (Sign In)
          </button>
        </form>
      </div>
    </div>
  );
}
