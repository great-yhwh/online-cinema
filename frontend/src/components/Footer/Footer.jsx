import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo/Logo';
import './Footer.css';
import ProfileDropdown from "../Header/ProfileDropdown";

const Footer = () => {
    const { isAuthenticated } = useAuth(); // user и logout здесь больше не нужны для рендера профиля

    // ====== АВТОРИЗОВАННЫЙ ФУТЕР ======
    if (isAuthenticated) {
        return (
            <footer className="footer footer--auth">
                <div className="footer__container footer__container--auth">
                    {/* Left columns */}
                    <div className="footer__left-auth">
                        <div className="footer__col-auth">
                            {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                            <h3 className="footer__col-title">Фильмы</h3>
                            <Link to="/movies?sortBy=year" className="footer__link">По дате поступления</Link>
                            <Link to="/movies?sortBy=rating" className="footer__link">По рейтингу Кинопоиск</Link>
                            <Link to="/movies" className="footer__link">Все жанры</Link>
                        </div>
                        <div className="footer__col-auth">
                            <h3 className="footer__col-title">Сериалы</h3>
                            <span className="footer__link">По дате поступления</span>
                            <span className="footer__link">По рейтингу Кинопоиск</span>
                            <span className="footer__link">Все жанры</span>
                        </div>
                    </div>

                    <div className="footer__profile-compact">
                        <ProfileDropdown variant="footer" />
                    </div>
                </div>
            </footer>
        );
    }

    // ====== НЕ АВТОРИЗОВАННЫЙ ФУТЕР ======
    return (
        <footer className="footer footer--guest">
            <div className="footer__container footer__container--guest">
                {/* Column 1: Logo + description */}
                <div className="footer__about">
                    <div className="footer__logo-wrap">
                        <Logo width={112} height={40} />
                    </div>
                    <p className="footer__description">
                        Лучший сервис для просмотра фильмов и сериалов в высоком качестве. Смотрите новинки кино первыми.
                    </p>
                </div>

                {/* Columns 2 & 3 */}
                <div className="footer__columns-guest">
                    <div className="footer__col-guest">
                        <h3 className="footer__col-title">Разделы</h3>
                        <Link to="/movies" className="footer__link">Новинки</Link> {/*!!!!!!!!!!!!!!!!!!!!!!!111111*/}
                        <Link to="/movies" className="footer__link">Случайное</Link>
                    </div>

                    <div className="footer__col-guest">
                        <h3 className="footer__col-title">Контакты</h3>
                        <span className="footer__link">Помощь</span>
                        <span className="footer__link">Политика конфиденциальности</span>
                    </div>
                </div>

                {/* Column 4: Соцсети */}
                <div className="footer__social">
                    <h3 className="footer__col-title footer__col-title--center">Мы в соцсетях</h3>
                    <div className="footer__social-icons">
                        <a href="#" className="footer__social-link" aria-label="Instagram">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7E7E7F" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <circle cx="12" cy="12" r="5" />
                                <circle cx="17.5" cy="6.5" r="1.5" fill="#7E7E7F" stroke="none" />
                            </svg>
                        </a>
                        <a href="#" className="footer__social-link" aria-label="Twitter">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7E7E7F" strokeWidth="2">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                            </svg>
                        </a>
                        <a href="#" className="footer__social-link" aria-label="Facebook">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7E7E7F" strokeWidth="2">
                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;