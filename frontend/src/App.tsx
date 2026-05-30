import React, { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px', boxSizing: 'border-box' }}>
      {!user ? (
        <Login onLoginSuccess={(userData: any) => setUser(userData)} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}
