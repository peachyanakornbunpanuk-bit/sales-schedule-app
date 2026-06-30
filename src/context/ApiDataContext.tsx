import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type UserRole = 'admin' | 'sales_manager' | 'sales';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lineUserId?: string;
  phone?: string;
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
  date: string;
  startTime: string;
  endTime: string;
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
export interface RequestLog {
  id: string;
  userId: string;
  type: 'Time-Off' | 'Swap';
  status: 'pending' | 'approved' | 'rejected';
  details: string;
  createdAt: string;
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
  loading: boolean;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUserProfile: (id: string, updates: any) => Promise<void>;
  locations: Location[];
  addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
  notifications: NotificationLog[];
  requests: RequestLog[];
  addRequest: (type: string, details: string, targetShiftId?: string, targetUserId?: string) => Promise<void>;
  updateRequestStatus: (id: string, status: string) => Promise<void>;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  fetchData: () => Promise<void>;
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

export const ApiDataProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableEmail: true, enableLine: true, deliveryMode: 'Immediate',
    reminder1Day: true, reminder1Hour: false, reminder15Min: false
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const [uRes, lRes, sRes, nRes, reqRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers: getHeaders() }),
        fetch(`${API_BASE}/locations`, { headers: getHeaders() }),
        fetch(`${API_BASE}/schedules`, { headers: getHeaders() }),
        fetch(`${API_BASE}/notifications`, { headers: getHeaders() }),
        fetch(`${API_BASE}/requests`, { headers: getHeaders() })
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (lRes.ok) setLocations(await lRes.json());
      if (sRes.ok) setSchedules(await sRes.json());
      if (nRes.ok) setNotifications(await nRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  // Authentication Listener (Initial check via token)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
            await fetchData();
          } else {
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    
    // Polling simulation for "real-time" feel since we dropped Firestore
    checkAuth();
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) fetchData();
    }, 5000); // refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to add user');
    await fetchData();
  };

  const updateUserProfile = async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update user profile');
    await fetchData();
  };

  const addLocation = async (loc: Omit<Location, 'id'>) => {
    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(loc)
    });
    if (!res.ok) throw new Error('Failed to add location');
    await fetchData();
  };

  const addSchedule = async (sched: Omit<Schedule, 'id'>) => {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sched)
    });
    if (!res.ok) throw new Error('Failed to add schedule');
    await fetchData();
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update schedule');
    await fetchData();
  };

  const removeSchedule = async (id: string) => {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete schedule');
    await fetchData();
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };

  const addRequest = async (type: string, details: string, targetShiftId?: string, targetUserId?: string) => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type, details, targetShiftId, targetUserId })
    });
    if (!res.ok) throw new Error('Failed to submit request');
    await fetchData();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update request');
    await fetchData();
  };

  return (
    <ApiDataContext.Provider value={{ 
      currentUser, loading, logout, 
      users, addUser, updateUserProfile, 
      locations, addLocation, 
      schedules, addSchedule, updateSchedule, removeSchedule,
      notifications, requests, addRequest, updateRequestStatus, notificationSettings, updateNotificationSettings,
      fetchData
    }}>
      {children}
    </ApiDataContext.Provider>
  );
};

export const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (context === undefined) {
    throw new Error('useApiData must be used within a ApiDataProvider');
  }
  return context;
};

// Aliased to minimize refactoring across components
export const useMockData = useApiData;
export const useFirebaseData = useApiData;
