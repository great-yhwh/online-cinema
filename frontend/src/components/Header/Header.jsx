import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';
import Logo from '../Logo/Logo';
import './Header.css';

const Header = () => {
    const { isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className="header">
                <div className="header__container">
                    <Link to="/" className="header__logo">
                        <Logo width={175} height={65} />
                    </Link>
{/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                    <nav className="header__nav">
                        <Link to="/" className={`header__nav-btn ${isActive('/') ? 'active' : ''}`}>
                            Главная
                        </Link>
                        <Link to="/movies" className={`header__nav-btn ${isActive('/movies') ? 'active' : ''}`}>
                            Фильмы
                        </Link>
                    </nav>

                    <div className="header__actions">
                        {isAuthenticated ? (
                            <div
                                className="header__profile-wrapper"
                                onMouseEnter={() => setShowProfile(true)}
                                onMouseLeave={() => setShowProfile(false)}
                            >
                                <button className="header__profile-btn">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </button>
                                {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
                            </div>
                        ) : (
                            <button className="header__login-btn" onClick={() => setShowAuthModal(true)}>
                                Войти
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </>
    );
};

export default Header;