import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await authAPI.getMe();
            // Ожидаем { userId, login, role }
            setUser({
                userId: response.data.userId,
                login: response.data.login,
                role: response.data.role,
            });
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = (userData) => {
        // userData должен содержать userId, login, role
        setUser(userData);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (e) {
            console.error('Logout error:', e);
        }
        setUser(null);
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            isAdmin,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};