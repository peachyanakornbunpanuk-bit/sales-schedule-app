import React, { useState } from 'react';
import { useMockData } from '../../context/ApiDataContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';

const CalendarDay = ({ dateObj, isCurrentMonth, schedules, users, onShiftClick }: { dateObj: Date, isCurrentMonth: boolean, schedules: any[], users: any[], onShiftClick: (s: any) => void }) => {
  return (
    <div style={{ minHeight: '100px', padding: '0.5rem', border: '1px solid var(--surface-border)', background: isCurrentMonth ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', opacity: isCurrentMonth ? 1 : 0.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dateObj.getDate()}</span>
      </div>
      <div>
        {schedules.map(s => {
          const u = users.find(u => u.id === s.userId);
          return (
            <div key={s.id} onClick={(e) => { e.stopPropagation(); onShiftClick(s); }} style={{ background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'} title={`${u?.name} (${s.startTime} - ${s.endTime})`}>
              {u?.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EmployeeCalendar = () => {
  const { users, locations, schedules, currentUser, addRequest } = useMockData();
  const { showToast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewShift, setViewShift] = useState<any>(null);
  const [requestDetails, setRequestDetails] = useState('');

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthDays - i));
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  // Next month leading days (to fill 6 rows, 42 cells)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }

  const handleRequestAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewShift || !currentUser) return;

    try {
      if (viewShift.userId === currentUser.id) {
        // Request Time Off for own shift
        await addRequest('Time-Off', `Requested time off for shift on ${viewShift.date}: ${requestDetails}`, viewShift.id);
        showToast('Time Off request submitted successfully.', 'success');
      } else {
        // Request Swap for colleague's shift
        await addRequest('Swap', `Requested to swap shift on ${viewShift.date}: ${requestDetails}`, viewShift.id, viewShift.userId);
        showToast('Swap request submitted. A LINE notification has been sent to your colleague and supervisor.', 'success');
      }
      setViewShift(null);
      setRequestDetails('');
    } catch (err: any) {
      showToast('Failed to submit request', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Master Calendar</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Click any shift to view details or request a swap</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem' }} value={month} onChange={e => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}>
            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(year, i, 1).toLocaleDateString('en-US', {month: 'long'})}</option>)}
          </select>
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem' }} value={year} onChange={e => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}>
            {Array.from({length: 10}).map((_, i) => <option key={i} value={new Date().getFullYear() - 5 + i}>{new Date().getFullYear() - 5 + i}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card grid-scroll-x" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '1px', background: 'var(--surface-border)', border: '1px solid var(--surface-border)', minWidth: '700px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ background: 'var(--surface)', padding: '0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{d}</div>
          ))}
          {days.map((d, i) => {
            const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            const daySchedules = schedules.filter(s => s.date === dateStr);
            return (
              <CalendarDay 
                key={i} 
                dateObj={d} 
                isCurrentMonth={d.getMonth() === month} 
                schedules={daySchedules} 
                users={users} 
                onShiftClick={(s) => {
                  setViewShift(s);
                  setRequestDetails('');
                }}
              />
            );
          })}
        </div>
      </div>

      <Modal isOpen={!!viewShift} onClose={() => setViewShift(null)} title="Shift Details">
        {viewShift && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Employee</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{users.find(u => u.id === viewShift.userId)?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location</div>
              <div style={{ fontWeight: 500 }}>{locations.find(l => l.id === viewShift.locationId)?.name || viewShift.locationId.toUpperCase()}</div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date & Time</div>
                <div style={{ fontWeight: 500 }}>{viewShift.date} | {viewShift.startTime} - {viewShift.endTime}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shift Type</div>
                <div style={{ fontWeight: 500 }}>{viewShift.shiftType}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Job Description (Task)</div>
              <div style={{ fontWeight: 500 }}>{viewShift.jobDescription || 'None'}</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '1rem 0' }} />

            <form onSubmit={handleRequestAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  {viewShift.userId === currentUser?.id ? 'Request Time Off for this shift' : 'Request a Swap for this shift'}
                </label>
                <textarea 
                  className="input-field" 
                  rows={3} 
                  required
                  placeholder="Provide a reason or details..."
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setViewShift(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {viewShift.userId === currentUser?.id ? 'Submit Time Off Request' : 'Submit Swap Request'}
                </button>
              </div>
            </form>

          </div>
        )}
      </Modal>
    </div>
  );
};
export default EmployeeCalendar;
