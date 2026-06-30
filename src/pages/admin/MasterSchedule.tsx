import React, { useState } from 'react';
import { useMockData } from '../../context/ApiDataContext';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { GripVertical, Plus, ChevronLeft, ChevronRight, ExternalLink, Printer, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

const DraggableEmployee = ({ employee }: { employee: any }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `emp-${employee.id}`,
    data: { employee }
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} 
      style={{
        ...style, padding: '0.5rem 1rem', marginBottom: '0.5rem', cursor: 'grab', 
        background: 'var(--primary-color)', color: 'white', display: 'inline-flex', alignItems: 'center', 
        gap: '0.5rem', fontSize: '0.85rem', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
      <GripVertical size={14} color="rgba(255,255,255,0.7)" />
      <span style={{ fontWeight: 500 }}>{employee.name}</span>
    </div>
  );
};

const DroppableLocationCard = ({ locationId, title, schedules, users, color }: { locationId: string, title: string, schedules: any[], users: any[], color?: string }) => {
  const { isOver, setNodeRef } = useDroppable({ id: `loc-${locationId}` });
  
  return (
    <div ref={setNodeRef} className="glass-card" style={{ 
      display: 'flex', flexDirection: 'column',
      borderTop: `4px solid ${color || 'var(--primary-color)'}`,
      background: isOver ? 'rgba(99,102,241,0.1)' : 'var(--surface)',
      transition: 'all 0.2s ease',
      height: '100%',
      minHeight: '200px'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{title}</span>
        {!['day-off', 'holiday', 'punishment'].includes(locationId) && (
          <Link to={`/admin/locations/${locationId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }} title="View Location Schedule">
            <ExternalLink size={14} /> Open
          </Link>
        )}
      </div>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignContent: 'flex-start' }}>
        {schedules.map(s => {
          const u = users.find(u => u.id === s.userId);
          return (
            <div key={s.id} style={{ 
              background: color || 'var(--primary-color)', color: 'white', padding: '0.35rem 0.75rem', 
              borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }} title={`${s.startTime}-${s.endTime} | ${s.jobDescription}`}>
              <span>{u?.name}</span>
            </div>
          );
        })}
        {schedules.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '100%', textAlign: 'center', marginTop: '1rem' }}>Drop here</div>}
      </div>
    </div>
  );
};

const MasterSchedule = () => {
  const { users, locations, schedules, addSchedule } = useMockData();
  const { showToast } = useToast();
  // Filter for manual dropdown (we still only manually assign sales staff if desired, but let's allow assigning anyone just in case, or stick to sales for manual)
  const salesStaff = users.filter(u => u.role === 'sales');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingShift, setPendingShift] = useState<{userId: string, locationId: string} | null>(null);
  
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [shiftType, setShiftType] = useState('Full Day');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');

  const nextDay = () => setCurrentDate(new Date(currentDate.getTime() + 86400000));
  const prevDay = () => setCurrentDate(new Date(currentDate.getTime() - 86400000));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith('loc-')) {
      const locId = over.id.toString().replace('loc-', '');
      const userId = active.id.toString().replace('emp-', '');
      
      // If it's a special category, we can just save it directly or open modal
      if (['day-off', 'holiday', 'punishment'].includes(locId)) {
        addSchedule({ userId, locationId: locId, date: dateStr, startTime: '00:00', endTime: '23:59', shiftType: 'Special', jobDescription: locId.toUpperCase() });
        showToast(`Employee assigned to ${locId}`, 'success');
      } else {
        setPendingShift({ userId, locationId: locId });
        setJobDescription('');
        setNotes('');
        setIsModalOpen(true);
      }
    }
  };

  const submitShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingShift) return;

    // Double-booking check
    const hasOverlap = schedules.some(s => 
      s.userId === pendingShift.userId && 
      s.date === dateStr &&
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
      locationId: pendingShift.locationId,
      date: dateStr,
      startTime,
      endTime,
      shiftType,
      jobDescription,
      notes
    });
    showToast('Shift assigned and notification sent!', 'success');
    setIsModalOpen(false);
    setPendingShift(null);
  };

  const handleFabClick = () => {
    // Open modal with no pre-selected user/location to allow manual entry
    setPendingShift({ userId: salesStaff.length > 0 ? salesStaff[0].id : '', locationId: locations.length > 0 ? locations[0].id : '' });
    setJobDescription('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleExportExcel = () => {
    const data = schedules.filter(s => s.date === dateStr).map(s => {
      const u = users.find(user => user.id === s.userId);
      const l = locations.find(loc => loc.id === s.locationId);
      return {
        Date: s.date,
        Employee: u?.name || 'Unknown',
        Location: l?.name || s.locationId.toUpperCase(),
        Start: s.startTime,
        End: s.endTime,
        Type: s.shiftType,
        Task: s.jobDescription,
        Notes: s.notes
      };
    });
    
    if (data.length === 0) {
      showToast('No shifts to export for this date.', 'error');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Roster");
    XLSX.writeFile(wb, `Schedule_${dateStr}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '100%', boxSizing: 'border-box' }}>
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Master Roster</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handlePrint} title="Print to PDF"><Printer size={18} /> Print</button>
          <button className="btn btn-outline" onClick={handleExportExcel} title="Export Excel"><Download size={18} /> Excel</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <button className="btn btn-outline" style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }} onClick={prevDay}><ChevronLeft size={20} /></button>
            <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <button className="btn btn-outline" style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }} onClick={nextDay}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0, flexDirection: 'column' }}>
          
          {/* Unassigned Staff Pool */}
          <div className="glass-panel no-print" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', minHeight: '80px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Unassigned:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
              {users.map(emp => {
                const isAssigned = schedules.some(s => s.userId === emp.id && s.date === dateStr);
                if (isAssigned) return null;
                
                if (emp.role === 'admin') {
                  return (
                    <div key={emp.id} style={{
                      padding: '0.5rem 1rem', marginBottom: '0.5rem',
                      background: '#475569', color: 'white', display: 'inline-flex', alignItems: 'center', 
                      gap: '0.5rem', fontSize: '0.85rem', borderRadius: '20px', opacity: 0.8
                    }} title="Admins cannot be scheduled via drag and drop">
                      <span style={{ fontWeight: 500 }}>{emp.name} (Admin)</span>
                    </div>
                  );
                }
                
                return <DraggableEmployee key={emp.id} employee={emp} />;
              })}
              {users.every(emp => schedules.some(s => s.userId === emp.id && s.date === dateStr)) && (
                <span style={{ color: 'var(--success)', fontStyle: 'italic', fontSize: '0.9rem' }}>All staff assigned!</span>
              )}
            </div>
          </div>
          
          {/* Locations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
            {/* Standard Locations */}
            {locations.map(loc => (
              <DroppableLocationCard 
                key={loc.id} 
                locationId={loc.id} 
                title={loc.name} 
                schedules={schedules.filter(s => s.date === dateStr && s.locationId === loc.id)} 
                users={users} 
              />
            ))}
            
            {/* Special Categories */}
            <DroppableLocationCard 
              locationId="day-off" title="Day Off" color="#10b981"
              schedules={schedules.filter(s => s.date === dateStr && s.locationId === 'day-off')} users={users} 
            />
            <DroppableLocationCard 
              locationId="holiday" title="Holiday" color="#f59e0b"
              schedules={schedules.filter(s => s.date === dateStr && s.locationId === 'holiday')} users={users} 
            />
            <DroppableLocationCard 
              locationId="punishment" title="Punishment" color="#ef4444"
              schedules={schedules.filter(s => s.date === dateStr && s.locationId === 'punishment')} users={users} 
            />
          </div>
        </div>
      </DndContext>

      {/* Floating Action Button */}
      <button 
        onClick={handleFabClick}
        className="no-print"
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100, transition: 'transform 0.2s' }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Add Shift Manually"
      >
        <Plus size={28} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Shift">
        <form onSubmit={submitShift}>
          <div style={{ marginBottom: '1.5rem', fontWeight: 500, fontSize: '1.1rem' }}>
            Assigning Shift
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Employee</label>
              <select className="input-field" value={pendingShift?.userId || ''} onChange={e => setPendingShift(prev => prev ? { ...prev, userId: e.target.value } : null)} required>
                {salesStaff.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <select className="input-field" value={pendingShift?.locationId || ''} onChange={e => setPendingShift(prev => prev ? { ...prev, locationId: e.target.value } : null)} required>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                <option value="day-off">Day Off</option>
                <option value="holiday">Holiday</option>
                <option value="punishment">Punishment</option>
              </select>
            </div>
          </div>
          
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
            <button type="submit" className="btn btn-primary">Save & Send Notification</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default MasterSchedule;
