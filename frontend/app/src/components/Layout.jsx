import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path === '/projects') return 'Projects';
        if (path.startsWith('/issues/')) return 'Issue Details';
        return 'Dashboard';
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">IT</div>
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-name">Issue Tracker</span>
                        <span className="sidebar-brand-sub">Internal Tool</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="sidebar-section-label">Navigation</span>

                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar-link-icon">📊</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/projects"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar-link-icon">📁</span>
                        Projects
                    </NavLink>

                    <span className="sidebar-section-label">Quick Actions</span>

                    <NavLink
                        to="/?create=true"
                        className="sidebar-link"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar-link-icon">➕</span>
                        Create Issue
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{getInitials(user?.name)}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name || 'User'}</div>
                            <div className="sidebar-user-role">{user?.role || 'employee'}</div>
                        </div>
                        <button className="sidebar-logout" onClick={logout} title="Logout">
                            ⏏
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            ☰
                        </button>
                        <h1 className="topbar-title">{getPageTitle()}</h1>
                    </div>
                    <div className="topbar-actions">
                        <span className={`badge badge-${user?.role || 'employee'}`}>
                            {user?.role || 'employee'}
                        </span>
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 99, display: 'none',
                    }}
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
