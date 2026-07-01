import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
  action?: { label: string; onClick: () => void; };
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error', action?: { label: string; onClick: () => void; }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error', action?: { label: string; onClick: () => void; }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, action ? 6000 : 3500); // Give more time if there's an action
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 2000 }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast-animate" style={{
            background: toast.type === 'success' ? '#fff' : '#fef2f2',
            color: toast.type === 'success' ? '#111827' : '#991b1b',
            borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            minWidth: '280px'
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
            <span style={{ flex: 1, fontSize: '0.95rem' }}>{toast.message}</span>
            {toast.action && (
              <button 
                onClick={() => { toast.action?.onClick(); removeToast(toast.id); }} 
                style={{ 
                  background: 'var(--primary-color)', color: 'white', border: 'none', 
                  padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', 
                  fontSize: '0.8rem', fontWeight: 600 
                }}>
                {toast.action.label}
              </button>
            )}
            <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) throw new Error('useToast must be used within ToastProvider');
  return context;
};
