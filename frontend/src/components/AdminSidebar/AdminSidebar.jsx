import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo/Logo';
import './AdminSidebar.css';
import LogoAdmPanel from "../Logo/LogoAdmPanel";

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navSections = [
        {
            title: 'Главная',
            items: [
                { to: '/admin', icon: 'home', label: 'Меню', end: true },
            ],
        },
        {
            title: 'Контент',
            items: [
                { to: '/admin/movies', icon: 'star', label: 'Все фильмы', end: true }, // ← добавить end
                { to: '/admin/movies/add', icon: 'plus', label: 'Добавить фильм' },
                { to: '/admin/video-files', icon: 'film', label: 'Видеофайлы' },
            ],
        },
        {
            title: 'Каталог',
            items: [
                { to: '/admin/genres', icon: 'tag', label: 'Жанры' },
                { to: '/admin/subtitles', icon: 'chat', label: 'Субтитры' },
                { to: '/admin/dictionary', icon: 'book', label: 'Словарь' },
            ],
        },
        {
            title: 'Отчет',
            items: [
                { to: '/admin/reports', icon: 'report', label: 'Отчет' },
            ],
        },
    ];

    const renderIcon = (icon) => {
        switch (icon) {
            case 'home':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                );
            case 'star':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                );
            case 'plus':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                );
            case 'film':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                        <line x1="7" y1="2" x2="7" y2="22" />
                        <line x1="17" y1="2" x2="17" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <line x1="2" y1="7" x2="7" y2="7" />
                        <line x1="2" y1="17" x2="7" y2="17" />
                        <line x1="17" y1="7" x2="22" y2="7" />
                        <line x1="17" y1="17" x2="22" y2="17" />
                    </svg>
                );
            case 'tag':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                );
            case 'chat':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    </svg>
                );
            case 'book':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                );
            case 'report':
                return (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.21 15.89A10 10 0 118 2.83" />
                        <path d="M22 12A10 10 0 0012 2v10z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <aside className="admin-sidebar">
            {/* Logo */}
            <div className="admin-sidebar__logo">
                <NavLink to="/admin">
                    <LogoAdmPanel width={106} height={50} />
                </NavLink>
            </div>

            {/* Navigation */}
            <nav className="admin-sidebar__nav">
                <div className="admin-sidebar__sections">
                    {navSections.map((section) => (
                        <div key={section.title} className="admin-sidebar__section">
                            <span className="admin-sidebar__section-title">{section.title}</span>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                                    }
                                >
                                    <span className="admin-sidebar__link-icon">
                                        {renderIcon(item.icon)}
                                    </span>
                                    <span className="admin-sidebar__link-text">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </div>
            </nav>

            {/* User */}
            <div className="admin-sidebar__user">
                <div className="admin-sidebar__user-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <div className="admin-sidebar__user-info">
                    <span className="admin-sidebar__user-name">{user?.login || 'Admin'}</span>
                    <span className="admin-sidebar__user-role">Администратор</span>
                </div>
                <button className="admin-sidebar__logout" onClick={handleLogout} title="Выйти">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;