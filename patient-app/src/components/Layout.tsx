import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Download,
  Clock,
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';
import { getTheme, setTheme } from '../services/storage';
import { patientProfile } from '../data/mockData';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/retrieve', label: 'Retrieve Records', icon: Download },
  { to: '/history', label: 'Medical History', icon: Clock },
];

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

  const toggleThemeState = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">C</div>
          <div className="brand-text">
            Chipatala Connect
            <small>Digital Health Passport</small>
          </div>
          <button
            className="mobile-menu-btn"
            style={{ marginLeft: 'auto', display: sidebarOpen ? 'flex' : undefined }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">Patient Portal</div>

        <ul className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={20} className="nav-icon" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">&copy; 2026 Chipatala Connect</div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        <header className="header">
          <div className="logo">Chipatala</div>
          <div className="header-actions">
            <button className="btn btn-icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="btn btn-icon" onClick={() => navigate('/profile')}>
              <User size={20} />
            </button>
            <button className="btn btn-icon">
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
