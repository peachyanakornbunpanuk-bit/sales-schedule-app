import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Types
export type UserRole = 'admin' | 'sales';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface Schedule {
  id: string;
  userId: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  shiftType: string;
  jobDescription?: string;
  notes?: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'New' | 'Update' | 'Cancel';
  channel: 'Email' | 'LINE';
  status: 'Pending' | 'Success' | 'Failed';
  timestamp: string;
  payload: string;
}

export interface NotificationSettings {
  enableEmail: boolean;
  enableLine: boolean;
  deliveryMode: 'Immediate' | 'Scheduled';
  reminder1Day: boolean;
  reminder1Hour: boolean;
  reminder15Min: boolean;
}

interface ApiDataContextType {
  currentUser: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  locations: Location[];
  addLocation: (location: Omit<Location, 'id'>) => void;
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
  notifications: NotificationLog[];
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

export const MockDataProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Alice Admin', email: 'admin@sales.com', role: 'admin' },
    { id: '2', name: 'Bob Sales', email: 'bob@sales.com', role: 'sales' },
    { id: '3', name: 'Charlie Sales', email: 'charlie@sales.com', role: 'sales' },
  ]);

  const [locations, setLocations] = useState<Location[]>([
    { id: 'L1', name: 'Downtown Store', address: '123 Main St' },
    { id: 'L2', name: 'Uptown Kiosk', address: '456 High St' },
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([
    { id: 'S1', userId: '2', locationId: 'L1', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', shiftType: 'Morning', jobDescription: 'Promote new skincare products', notes: 'Arrive 15 mins early' },
  ]);

  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableEmail: true,
    enableLine: true,
    deliveryMode: 'Immediate',
    reminder1Day: true,
    reminder1Hour: false,
    reminder15Min: false
  });

  const login = (email: string, role: UserRole) => {
    const user = users.find(u => u.email === email && u.role === role);
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({
        id: Math.random().toString(),
        name: email.split('@')[0],
        email,
        role
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: `U${Date.now()}` }]);
  };

  const addLocation = (loc: Omit<Location, 'id'>) => {
    setLocations(prev => [...prev, { ...loc, id: `L${Date.now()}` }]);
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };

  // Internal mock queue processor
  const enqueueNotification = useCallback((type: 'New' | 'Update' | 'Cancel', schedule: Schedule) => {
    if (!notificationSettings.enableEmail && !notificationSettings.enableLine) return;
    
    const user = users.find(u => u.id === schedule.userId);
    if (!user) return;

    let locName = 'Special Category';
    if (!['day-off', 'holiday', 'punishment'].includes(schedule.locationId)) {
      locName = locations.find(l => l.id === schedule.locationId)?.name || 'Unknown';
    } else {
      locName = schedule.locationId.toUpperCase().replace('-', ' ');
    }

    const payload = `📅 ${type} Assignment
Hello ${user.name},
Your schedule has been ${type.toLowerCase()}d.
Location: ${locName}
Date: ${schedule.date}
Time: ${schedule.startTime} - ${schedule.endTime}
Shift: ${schedule.shiftType}
Task: ${schedule.jobDescription || 'None'}
Notes: ${schedule.notes || 'None'}
`;

    const send = (channel: 'Email' | 'LINE') => {
      const id = `N${Math.random().toString(36).substr(2, 9)}`;
      const log: NotificationLog = {
        id, userId: user.id, type, channel, status: 'Pending',
        timestamp: new Date().toISOString(), payload
      };
      
      setNotifications(prev => [log, ...prev]);

      // Simulate background delay then success
      setTimeout(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Success' } : n));
      }, Math.random() * 2000 + 1000);
    };

    if (notificationSettings.enableEmail) send('Email');
    if (notificationSettings.enableLine) send('LINE');
  }, [notificationSettings, users, locations]);

  const addSchedule = (sched: Omit<Schedule, 'id'>) => {
    const newSched = { ...sched, id: `S${Date.now()}` };
    setSchedules(prev => [...prev, newSched]);
    enqueueNotification('New', newSched);
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>) => {
    setSchedules(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const changedSched = updated.find(s => s.id === id);
      if (changedSched) enqueueNotification('Update', changedSched);
      return updated;
    });
  };

  const removeSchedule = (id: string) => {
    const sched = schedules.find(s => s.id === id);
    if (sched) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      enqueueNotification('Cancel', sched);
    }
  };

  return (
    <ApiDataContext.Provider value={{ 
      currentUser, login, logout, 
      users, addUser, 
      locations, addLocation, 
      schedules, addSchedule, updateSchedule, removeSchedule,
      notifications, notificationSettings, updateNotificationSettings
    }}>
      {children}
    </ApiDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(ApiDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};
