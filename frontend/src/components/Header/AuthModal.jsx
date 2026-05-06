import React, { useState } from 'react';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [loginValue, setLoginValue] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await authAPI.register(loginValue, password);
                const loginRes = await authAPI.login(loginValue, password);
                authLogin({
                    userId: loginRes.data.userId,
                    login: loginRes.data.login,
                    role: loginRes.data.role,
                });
            } else {
                const loginRes = await authAPI.login(loginValue, password);
                authLogin({
                    userId: loginRes.data.userId,
                    login: loginRes.data.login,
                    role: loginRes.data.role,
                });
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal__close" onClick={onClose}>✕</button>

                <h2 className="auth-modal__title">
                    {isRegister ? 'Создать аккаунт' : 'Вход'}
                </h2>

                <form className="auth-modal__form" onSubmit={handleSubmit}>
                    <div className="auth-modal__field">
                        <input
                            type="text"
                            className="auth-modal__input"
                            value={loginValue}
                            onChange={(e) => setLoginValue(e.target.value)}
                            placeholder="Логин"
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="auth-modal__field">
                        <input
                            type="password"
                            className="auth-modal__input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <div className="auth-modal__error">{error}</div>}

                    <button
                        type="submit"
                        className="auth-modal__submit"
                        disabled={loading}
                    >
                        {loading ? '...' : isRegister ? 'Создать аккаунт' : 'Войти'}
                    </button>
                </form>

                <div className="auth-modal__switch">
                    <button
                        className={`auth-modal__switch-btn ${!isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(false); setError(''); }}
                    >
                        Авторизация
                    </button>
                    <button
                        className={`auth-modal__switch-btn ${isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(true); setError(''); }}
                    >
                        Создать аккаунт
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;