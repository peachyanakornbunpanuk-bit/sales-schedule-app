import React, { useState } from 'react';
import { useMockData } from '../../context/ApiDataContext';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { Key } from 'lucide-react';

const Employees = () => {
  const { users, addUser } = useMockData();
  const { showToast } = useToast();
  
  // Group users by role so they are all visible
  const salesStaff = users.filter(u => u.role === 'sales');
  const adminStaff = users.filter(u => u.role === 'admin' || u.role === 'sales_manager');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', role: 'sales', phone: '' });

  const [loading, setLoading] = useState(false);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email) return;
    
    setLoading(true);
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newEmployee)
      });
      if (!res.ok) throw new Error('Failed to create employee');
      window.location.reload();
    } catch (err: any) {
      showToast(`Failed to create account: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPassword = window.prompt(`Enter new temporary password for ${name} (minimum 6 characters):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      return showToast('Password must be at least 6 characters', 'error');
    }
    try {
      const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
      const res = await fetch(`${API_BASE}/users/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to reset password');
      }
      showToast(`Password reset successful for ${name}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Employee Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Employee
        </button>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Sales Team</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '3rem' }}>
        {salesStaff.map(emp => (
          <div key={emp.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{emp.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{emp.email}</p>
            <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
              Sales
            </span>
            {emp.phone && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>📞 {emp.phone}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: emp.lineUserId ? 'var(--success)' : 'var(--text-muted)', margin: 0 }}>
                {emp.lineUserId ? '✅ LINE Linked' : '❌ LINE Not Linked'}
              </p>
              <button onClick={() => handleResetPassword(emp.id, emp.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }} title="Reset Password">
                <Key size={14} /> Reset
              </button>
            </div>
          </div>
        ))}
        {salesStaff.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No sales employees found.</div>
        )}
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Admin / Management Team</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {adminStaff.map(emp => (
          <div key={emp.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{emp.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{emp.email}</p>
            <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
              Admin
            </span>
            {emp.phone && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>📞 {emp.phone}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: emp.lineUserId ? 'var(--success)' : 'var(--text-muted)', margin: 0 }}>
                {emp.lineUserId ? '✅ LINE Linked' : '❌ LINE Not Linked'}
              </p>
              <button onClick={() => handleResetPassword(emp.id, emp.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }} title="Reset Password">
                <Key size={14} /> Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Employee">
        <form onSubmit={handleAddEmployee}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input type="text" className="input-field" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="input-field" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number (Optional)</label>
              <input type="tel" className="input-field" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} placeholder="For LINE linking" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select className="input-field" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}>
                <option value="sales">Sales Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
