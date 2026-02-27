import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function toggleTheme() {
    const next = dark ? 'light' : 'dark';
    setDark(!dark);
    setTheme(next);
  }

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
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="page-title">{pageTitle}</h1>
          </div>

          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search records…" />
            </div>

            <button className="topbar-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="topbar-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="badge-dot" />
            </button>

            <div className="topbar-avatar">{patientProfile.initials}</div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
