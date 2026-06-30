import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ApiDataProvider } from './context/ApiDataContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ApiDataProvider>
        <App />
      </ApiDataProvider>
    </ToastProvider>
  </StrictMode>,
)
