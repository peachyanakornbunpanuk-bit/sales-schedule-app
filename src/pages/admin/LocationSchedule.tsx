import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMockData } from '../../context/ApiDataContext';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { GripVertical, ArrowLeft } from 'lucide-react';

// Draggable Employee Component (same as CalendarMonth)
const DraggableEmployee = ({ employee }: { employee: any }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `emp-${employee.id}`,
    data: { employee }
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 } : undefined;
  return (
    <div ref={setNodeRef} style={{...style, padding: '0.5rem', marginBottom: '0.5rem', cursor: 'grab', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} {...listeners} {...attributes} className="glass-card">
      <GripVertical size={14} color="var(--text-muted)" />
      <span>{employee.name}</span>
    </div>
  );
};

// Droppable Day Component for a specific location
const DroppableDay = ({ dateObj, isCurrentMonth, schedules, users, onAddClick, onRemove }: { dateObj: Date, isCurrentMonth: boolean, schedules: any[], users: any[], onAddClick: (d: Date) => void, onRemove: (id: string) => void }) => {
  const dateStr = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const { isOver, setNodeRef } = useDroppable({ id: `day-${dateStr}` });
  
  return (
    <div ref={setNodeRef} style={{ minHeight: '120px', padding: '0.5rem', border: '1px solid var(--surface-border)', background: isOver ? 'rgba(99,102,241,0.2)' : isCurrentMonth ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', opacity: isCurrentMonth ? 1 : 0.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dateObj.getDate()}</span>
        <button onClick={() => onAddClick(dateObj)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', fontSize: '1.2rem', lineHeight: 1 }}>+</button>
      </div>
      <div>
        {schedules.map(s => {
          const u = users.find(u => u.id === s.userId);
          return (
            <div key={s.id} className="glass-card" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.9)' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.startTime} - {s.endTime}</div>
              </div>
              <button onClick={() => onRemove(s.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', fontSize: '1rem', lineHeight: 1 }}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LocationSchedule = () => {
  const { id } = useParams();
  const { users, locations, schedules, addSchedule, removeSchedule } = useMockData();
  const { showToast } = useToast();
  
  const location = locations.find(l => l.id === id);
  const salesStaff = users.filter(u => u.role === 'sales');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingShift, setPendingShift] = useState<{userId: string, date: string} | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [shiftType, setShiftType] = useState('Full Day');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  if (!location) return <div style={{ padding: '2rem' }}>Location not found</div>;

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthDays - i));
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith('day-')) {
      const dateStr = over.id.toString().replace('day-', '');
      const userId = active.id.toString().replace('emp-', '');
      setPendingShift({ userId, date: dateStr });
      setJobDescription('');
      setNotes('');
      setIsModalOpen(true);
    }
  };

  const submitShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingShift) return;

    // Double-booking check
    const hasOverlap = schedules.some(s => 
      s.userId === pendingShift.userId && 
      s.date === pendingShift.date &&
      (
        (startTime >= s.startTime && startTime < s.endTime) ||
        (endTime > s.startTime && endTime <= s.endTime) ||
        (startTime <= s.startTime && endTime >= s.endTime)
      )
    );

    if (hasOverlap) {
      showToast('Employee is already scheduled during this time!', 'error');
      return;
    }

    addSchedule({
      userId: pendingShift.userId,
      locationId: location.id,
      date: pendingShift.date,
      startTime,
      endTime,
      shiftType,
      jobDescription,
      notes
    });
    showToast('Shift added successfully', 'success');
    setIsModalOpen(false);
    setPendingShift(null);
  };

  const confirmDelete = () => {
    if (shiftToDelete) {
      removeSchedule(shiftToDelete);
      showToast('Shift removed successfully', 'success');
    }
    setDeleteModalOpen(false);
    setShiftToDelete(null);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/admin/locations" className="btn btn-outline" style={{ padding: '0.5rem' }}><ArrowLeft size={18} /></Link>
        <h1 style={{ margin: 0 }}>{location.name} Schedule</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>&lt;</button>
        <h2 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button className="btn btn-outline" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>&gt;</button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
          {/* Sidebar */}
          <div className="glass-panel" style={{ width: '250px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Staff</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drag to assign to {location.name}</p>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              {salesStaff.map(emp => <DraggableEmployee key={emp.id} employee={emp} />)}
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="glass-card grid-scroll-x" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '1px', background: 'var(--surface-border)', border: '1px solid var(--surface-border)', minWidth: '700px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ background: 'var(--surface)', padding: '0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{d}</div>
              ))}
              {days.map((d, i) => {
                const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                const daySchedules = schedules.filter(s => s.date === dateStr && s.locationId === location.id);
                return (
                  <DroppableDay 
                    key={i} 
                    dateObj={d} 
                    isCurrentMonth={d.getMonth() === month} 
                    schedules={daySchedules} 
                    users={users} 
                    onAddClick={(dateObj) => {
                      setPendingShift({ userId: salesStaff.length ? salesStaff[0].id : '', date: new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0] });
                      setIsModalOpen(true);
                    }}
                    onRemove={(id) => { setShiftToDelete(id); setDeleteModalOpen(true); }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Shift">
        <form onSubmit={submitShift}>
          {pendingShift?.userId !== '' && pendingShift?.userId !== salesStaff[0]?.id ? (
            <div style={{ marginBottom: '1rem', fontWeight: 500 }}>
              Assigning shift for: <span style={{ color: 'var(--primary-color)' }}>{users.find(u => u.id === pendingShift?.userId)?.name}</span> on {pendingShift?.date}
            </div>
          ) : (
             <div className="form-group">
                <label className="form-label">Employee</label>
                <select className="input-field" value={pendingShift?.userId || ''} onChange={e => setPendingShift(prev => prev ? {...prev, userId: e.target.value} : null)} required>
                  {salesStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Start Time</label>
              <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">End Time</label>
              <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Shift</label>
              <select className="input-field" value={shiftType} onChange={e => setShiftType(e.target.value)} required>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Full Day">Full Day</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description (Task)</label>
            <input type="text" className="input-field" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="e.g. Promote new skincare products" required />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Please arrive 15 minutes early." style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Shift</button>
          </div>
        </form>
      </Modal>

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
export default LocationSchedule;
