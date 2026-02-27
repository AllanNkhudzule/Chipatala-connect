import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Lock,
  FilePlus,
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { doctorProfile } from '../data/mockData';
import { getTheme, setTheme } from '../services/storage';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/patient-access', label: 'Patient Access', icon: Lock },
  { to: '/create-record', label: 'Create Record', icon: FilePlus },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/patient-access': 'Patient Access',
  '/create-record': 'Create Record',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme);
  const location = useLocation();

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setThemeState(next);
  };

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">C</div>
          <div className="brand-text">
            Chipatala Connect
            <small>Doctor Portal</small>
          </div>
          <button
            className="mobile-menu-btn"
            style={{ marginLeft: 'auto', display: sidebarOpen ? 'flex' : undefined }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">Navigation</div>

        <ul className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} className="nav-icon" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="topbar-avatar">{doctorProfile.initials}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '.88rem' }}>
                {doctorProfile.name}
              </div>
              <div style={{ fontSize: '.75rem' }}>{doctorProfile.specialty}</div>
              <div style={{ fontSize: '.72rem' }}>{doctorProfile.hospital}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <h1 className="page-title">{pageTitle}</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search patients, records..." />
            </div>
            <button className="topbar-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="topbar-btn" title="Notifications">
              <Bell size={18} />
              <span className="badge-dot" />
            </button>
            <div className="topbar-avatar">{doctorProfile.initials}</div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
