import React, { useState } from 'react';
import { useMockData as useApiData } from '../context/ApiDataContext';
import { UserRole } from '../context/ApiDataContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { fetchData } = useApiData();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? 'http://localhost:3001/api/auth/register' : 'http://localhost:3001/api/auth/login';
      const body = isRegistering 
        ? JSON.stringify({ email, password, name, role })
        : JSON.stringify({ email, password });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save JWT token
      localStorage.setItem('token', data.token);
      
      // Tell ApiDataContext to re-fetch the user profile with the new token
      // This simulates onAuthStateChanged and triggers the redirect
      await fetchData(); 
      // Force reload to trigger useEffect in context
      window.location.reload();

    } catch (err: any) {
      console.error(err);
      
      let friendlyMessage = 'An error occurred during authentication.';
      if (err.message === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already registered. Please click "Sign In" below instead!';
      } else if (err.message === 'auth/invalid-credential' || err.message === 'auth/wrong-password' || err.message === 'auth/user-not-found') {
        friendlyMessage = 'Incorrect email or password. Please try again.';
      } else {
        friendlyMessage = err.message;
      }
      
      setError(friendlyMessage);
      alert(friendlyMessage);
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>ScheduleMaster</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
            {isRegistering ? 'Create a secure account.' : 'Welcome back! Please login.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Alice Smith" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="e.g. admin@sales.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Select Role</label>
              <select 
                className="input-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="admin">Admin (Manager)</option>
                <option value="sales">Sales (Employee)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          >
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
