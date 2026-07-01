import React from 'react';
import { useMockData } from '../../context/ApiDataContext';
import { BarChart3, Activity, Clock, Users, CalendarDays, CheckCircle2 } from 'lucide-react';

import { Skeleton, SkeletonCard } from '../../components/Skeleton';

const Analytics = () => {
  const { kpiData, auditLogs, users } = useMockData();

  if (!kpiData) {
    return (
      <div style={{ padding: '2rem' }}>
        <Skeleton width="200px" height="30px" style={{ marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const totalShifts = kpiData.totalPublishedShifts + kpiData.totalDraftShifts;
  const coverageCount = kpiData.userCoverage.length;
  const activeSalesUsers = users.filter(u => u.role === 'sales').length;
  const coveragePercentage = activeSalesUsers > 0 ? Math.round((coverageCount / activeSalesUsers) * 100) : 0;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 size={28} color="var(--primary-color)" /> KPI Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Total Published Shifts</span>
            <CheckCircle2 size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{kpiData.totalPublishedShifts}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Draft Shifts</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{kpiData.totalDraftShifts}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Team Coverage</span>
            <Users size={20} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{coveragePercentage}%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{coverageCount} of {activeSalesUsers} staff scheduled</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} /> Audit Log (Recent Activity)
      </h2>
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {auditLogs && auditLogs.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-border)', background: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Timestamp</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Admin</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Target ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Details</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 20).map((log) => {
                const admin = users.find(u => u.id === log.adminId);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{admin?.name || log.adminId}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        background: log.action.includes('DELETE') ? 'rgba(239,68,68,0.1)' : log.action.includes('CREATE') ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                        color: log.action.includes('DELETE') ? 'var(--danger)' : log.action.includes('CREATE') ? 'var(--success)' : 'var(--primary-color)'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.targetId}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{log.details}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity found.</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
