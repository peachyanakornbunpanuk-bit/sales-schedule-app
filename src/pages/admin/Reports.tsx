import React, { useState } from 'react';
import { useMockData } from '../../context/ApiDataContext';

const Reports = () => {
  const { users, locations, schedules } = useMockData();
  const salesStaff = users.filter(u => u.role === 'sales');
  
  // Default to current month
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  // Analytics calculation
  // 1. Filter schedules for the selected month/year
  const monthSchedules = schedules.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getMonth() === reportMonth && sDate.getFullYear() === reportYear;
  });

  // 2. Aggregate data per employee
  const employeeStats = salesStaff.map(emp => {
    const empSchedules = monthSchedules.filter(s => s.userId === emp.id);
    
    // Calculate total hours
    let totalHours = 0;
    const locationSet = new Set<string>();
    const taskSet = new Set<string>();

    empSchedules.forEach(s => {
      // Parse times (e.g. "09:00", "17:00")
      const startParts = s.startTime.split(':').map(Number);
      const endParts = s.endTime.split(':').map(Number);
      
      const start = startParts[0] + (startParts[1] / 60);
      const end = endParts[0] + (endParts[1] / 60);
      
      let diff = end - start;
      if (diff < 0) diff += 24; // Handle overnight shifts if any
      totalHours += diff;

      // Track locations and tasks
      locationSet.add(s.locationId);
      if (s.jobDescription) taskSet.add(s.jobDescription);
    });

    const locationNames = Array.from(locationSet).map(locId => {
      if (['day-off', 'holiday', 'punishment'].includes(locId)) {
        return locId.toUpperCase().replace('-', ' ');
      }
      return locations.find(l => l.id === locId)?.name || locId;
    });

    return {
      id: emp.id,
      name: emp.name,
      totalShifts: empSchedules.length,
      totalHours: totalHours.toFixed(1),
      locations: locationNames,
      tasks: Array.from(taskSet)
    };
  });

  // Sorting
  const sortedStats = [...employeeStats].sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));

  // Top level stats
  const totalSystemHours = sortedStats.reduce((sum, emp) => sum + parseFloat(emp.totalHours), 0).toFixed(1);
  const totalSystemShifts = monthSchedules.length;
  
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '100%', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Reports & Analytics</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem', border: 'none', background: 'transparent', fontWeight: 600 }} value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))}>
            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(2000, i, 1).toLocaleDateString('en-US', {month: 'long'})}</option>)}
          </select>
          <select className="input-field" style={{ width: 'auto', padding: '0.5rem', border: 'none', background: 'transparent', fontWeight: 600 }} value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))}>
            {Array.from({length: 10}).map((_, i) => <option key={i} value={new Date().getFullYear() - 5 + i}>{new Date().getFullYear() - 5 + i}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Hours Scheduled</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{totalSystemHours}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Shifts Assigned</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{totalSystemShifts}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Top Performer</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', textAlign: 'center', marginTop: '0.5rem' }}>
            {sortedStats.length > 0 && parseFloat(sortedStats[0].totalHours) > 0 ? sortedStats[0].name : '-'}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Employee Breakdown</h3>
        <div className="grid-scroll-x">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Total Shifts</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Total Hours</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Locations Worked</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Tasks / Descriptions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      {emp.totalShifts}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{emp.totalHours} hrs</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {emp.locations.length > 0 ? emp.locations.map((loc, idx) => (
                         <span key={idx} style={{ background: 'var(--surface-border)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>{loc}</span>
                      )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                     <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                       {emp.tasks.length > 0 ? emp.tasks.map((task, idx) => (
                         <li key={idx} style={{ marginBottom: '0.25rem' }}>{task}</li>
                       )) : <li style={{ color: 'var(--text-muted)', listStyle: 'none', marginLeft: '-1.2rem' }}>None</li>}
                     </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
