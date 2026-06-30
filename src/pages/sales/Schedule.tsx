import React from 'react';
import { useMockData } from '../../context/ApiDataContext';
import { Calendar, MapPin, Clock, LogOut, FileQuestion, CheckCircle, XCircle, Settings } from 'lucide-react';
import Modal from '../../components/Modal';

const Schedule = () => {
  const { currentUser, users, logout, schedules, locations, requests, addRequest, updateUserProfile } = useMockData();
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [requestType, setRequestType] = React.useState<'Time-Off'|'Swap'>('Time-Off');
  const [requestDetails, setRequestDetails] = React.useState('');

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRequest(requestType, requestDetails);
    setShowRequestModal(false);
    setRequestDetails('');
  };
  
  // Find all schedules for the current user
  const mySchedules = schedules.filter(s => s.userId === currentUser?.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>My Schedule</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome back, {currentUser?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
            <FileQuestion size={18} /> Request Time Off / Swap
          </button>
        </div>
      </div>

      {/* Show Pending/Approved Requests */}
      {requests.filter(r => r.userId === currentUser?.id).length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>My Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {requests.filter(r => r.userId === currentUser?.id).map(req => (
              <div key={req.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{req.type}</strong>: {req.details}
                </div>
                <div>
                  {req.status === 'pending' && <span style={{ color: 'orange' }}>Pending</span>}
                  {req.status === 'approved' && <span style={{ color: 'green', display: 'flex', alignItems:'center', gap:'0.25rem' }}><CheckCircle size={16}/> Approved</span>}
                  {req.status === 'rejected' && <span style={{ color: 'red', display: 'flex', alignItems:'center', gap:'0.25rem' }}><XCircle size={16}/> Rejected</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mySchedules.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem 0' }}>No Upcoming Shifts</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>You don't have any shifts scheduled right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mySchedules.map(sched => {
            const loc = locations.find(l => l.id === sched.locationId);
            const dateObj = new Date(sched.date);
            // Handle timezone differences by parsing date part directly
            const [year, month, day] = sched.date.split('-');
            const displayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const isToday = sched.date === new Date().toISOString().split('T')[0];
            
            return (
              <div 
                key={sched.id} 
                className="glass-panel" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  borderLeft: isToday ? '4px solid var(--primary-color)' : '1px solid var(--surface-border)'
                }}
              >
                <div style={{ 
                  background: isToday ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)', 
                  color: isToday ? 'white' : 'var(--text-main)',
                  padding: '1rem', 
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: '80px',
                  marginRight: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {displayDate.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {displayDate.getDate()}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    {displayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{loc?.name}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={16} /> {loc?.address}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={16} /> {sched.shiftType}
                    </div>
                  </div>
                </div>
                
                {isToday && (
                  <div style={{ background: 'var(--success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                    TODAY
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Submit a Request">
        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Request Type</label>
            <select className="form-control" value={requestType} onChange={(e) => setRequestType(e.target.value as any)}>
              <option value="Time-Off">Time Off Request</option>
              <option value="Swap">Shift Swap Request</option>
            </select>
          </div>
          <div className="form-group">
            <label>Details / Reason / Dates</label>
            <textarea 
              className="form-control" 
              required 
              rows={4}
              value={requestDetails} 
              onChange={e => setRequestDetails(e.target.value)}
              placeholder={requestType === 'Time-Off' ? 'E.g., Sick leave for Dec 12th' : 'E.g., Swap my Dec 12th shift with John'}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Submit Request
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Schedule;
