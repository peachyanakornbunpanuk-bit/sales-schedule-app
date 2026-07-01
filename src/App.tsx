import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMockData } from './context/ApiDataContext';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import Locations from './pages/admin/Locations';
import LocationSchedule from './pages/admin/LocationSchedule';
import CalendarMonth from './pages/admin/CalendarMonth';
import MasterSchedule from './pages/admin/MasterSchedule';
import NotificationHistory from './pages/admin/NotificationHistory';
import NotificationSettings from './pages/admin/NotificationSettings';
import Reports from './pages/admin/Reports';
import SalesLayout from './components/SalesLayout';
import SalesSchedule from './pages/sales/Schedule';
import EmployeeCalendar from './pages/sales/EmployeeCalendar';
import ProfileSettings from './pages/shared/ProfileSettings';

import { SkeletonCard, Skeleton } from './components/Skeleton';

const ProtectedRoute = ({ children, roleRequired }: { children: React.ReactNode, roleRequired: 'admin' | 'sales' }) => {
  const { currentUser } = useMockData();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role !== roleRequired) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/sales'} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { currentUser, loading } = useMockData();

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100vh', gap: '2rem' }}>
        <Skeleton width="40%" height="40px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/sales'} replace />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MasterSchedule />} />
          <Route path="daily-roster" element={<AdminDashboard />} />
          <Route path="calendar" element={<CalendarMonth />} />
          <Route path="employees" element={<Employees />} />
          <Route path="locations" element={<Locations />} />
          <Route path="locations/:id" element={<LocationSchedule />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<NotificationHistory />} />
          <Route path="settings/notifications" element={<NotificationSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute roleRequired="sales">
              <SalesLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SalesSchedule />} />
          <Route path="calendar" element={<EmployeeCalendar />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
