import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onClose, variant = 'dropdown' }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        if (onClose) onClose();
    };

    // Определяем базовый класс: если variant='footer', добавляем модификатор
    const rootClass = variant === 'footer'
        ? 'profile-dropdown profile-dropdown--footer'
        : 'profile-dropdown';

    return (
        <div className={rootClass}>
            {/* Шапка: аватар + имя + выход */}
            <div className="profile-dropdown__header">
                <div className="profile-dropdown__avatar">
                    {user?.login?.charAt(0).toUpperCase()}
                </div>
                <span className="profile-dropdown__name">{user?.login}</span>
                <button className="profile-dropdown__logout" onClick={handleLogout} aria-label="Выйти">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Навигация */}
            <nav className="profile-dropdown__nav">
                {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                <Link to="/favorites" className="profile-dropdown__link" onClick={onClose}>
                    <div className="profile-dropdown__icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <span>Избранное</span>
                </Link>
                {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                <Link to="/continue-watching" className="profile-dropdown__link" onClick={onClose}>
                    <div className="profile-dropdown__icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <polygon points="5,3 19,12 5,21 5,3" />
                        </svg>
                    </div>
                    <span>Продолжить</span>
                </Link>
                {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                <Link to="/history" className="profile-dropdown__link" onClick={onClose}>
                    <div className="profile-dropdown__icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                    <span>Просмотренное</span>
                </Link>
                {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                <Link to="/dictionary" className="profile-dropdown__link" onClick={onClose}>
                    <div className="profile-dropdown__icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                    </div>
                    <span>Словарь</span>
                </Link>
            </nav>
        </div>
    );
};

export default ProfileDropdown;