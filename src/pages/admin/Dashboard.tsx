import React, { useState } from 'react';
import { useMockData } from '../../context/ApiDataContext';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

const Dashboard = () => {
  const { users, locations, schedules, removeSchedule } = useMockData();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const { showToast } = useToast();

  const confirmDelete = () => {
    if (shiftToDelete) {
      removeSchedule(shiftToDelete);
      showToast('Shift removed successfully', 'success');
    }
    setDeleteModalOpen(false);
    setShiftToDelete(null);
  };

  // Filter schedules for the selected date and location
  const daySchedules = schedules
    .filter(s => s.date === currentDate)
    .filter(s => locationFilter === 'all' || s.locationId === locationFilter)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Pending Requests
  const { requests, updateRequestStatus } = useMockData();
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Daily Roster</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <input 
            type="date" 
            className="input-field" 
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {daySchedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <h2>No shifts scheduled</h2>
            <p>There are no employees scheduled to work on {currentDate}.</p>
          </div>
        ) : (
          <div className="grid-scroll-x">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Location / Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Time & Shift</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Job Description (Task)</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {daySchedules.map(sched => {
                const user = users.find(u => u.id === sched.userId);
                const loc = locations.find(l => l.id === sched.locationId);
                return (
                  <tr key={sched.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{user?.name}</td>
                    <td style={{ padding: '1rem' }}>
                      {loc?.name || (
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: sched.locationId === 'day-off' ? '#d1fae5' : sched.locationId === 'holiday' ? '#fef3c7' : '#fee2e2', color: sched.locationId === 'day-off' ? '#059669' : sched.locationId === 'holiday' ? '#d97706' : '#dc2626' }}>
                          {sched.locationId.toUpperCase().replace('-', ' ')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>
                          {sched.startTime} - {sched.endTime}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sched.shiftType}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '200px' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{sched.jobDescription || 'None'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sched.notes}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => { setShiftToDelete(sched.id); setDeleteModalOpen(true); }}
                        className="btn btn-outline"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.75rem' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Pending Requests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map(req => {
              const u = users.find(user => user.id === req.userId);
              return (
                <div key={req.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid orange' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{u?.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({req.type})</span></h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{req.details}</p>
                    <small style={{ color: '#888' }}>Submitted: {new Date(req.createdAt).toLocaleString()}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => updateRequestStatus(req.id, 'approved')}>Approve</button>
                    <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => updateRequestStatus(req.id, 'rejected')}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Are you sure you want to remove this shift? This action cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
          <button className="btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={confirmDelete}>Delete Shift</button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
