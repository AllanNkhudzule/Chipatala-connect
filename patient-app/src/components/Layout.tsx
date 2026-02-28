import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Menu,
  User,
  LogOut,
} from 'lucide-react';
import { getTheme, setTheme } from '../services/storage';
import PatientSidebar from './PatientSidebar';
import NotificationPanel from './NotificationPanel';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/retrieve': 'Retrieve Records',
  '/history': 'Medical History',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => getTheme() === 'dark');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = dark ? 'light' : 'dark';
    setDark(!dark);
    setTheme(newTheme);
  };

  const [theme, setThemeState] = useState(getTheme());

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      <PatientSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="main-area">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className="btn btn-icon mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              style={{ marginRight: 16 }}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="logo">Chipatala</div>
          </div>
          <div className="header-actions">
            <button className="btn btn-icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <NotificationPanel />
            <button className="btn btn-icon" onClick={() => navigate('/profile')}>
              <User size={20} />
            </button>
            <button className="btn btn-icon" onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
