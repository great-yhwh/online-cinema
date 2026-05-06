import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();

    if (isLoading) {
        return <div className="loading">Проверка прав доступа...</div>;
    }

    if (!isAuthenticated) {
        // Неавторизован – редирект на главную (можно и модалку открыть, но проще так)
        return <Navigate to="/" replace />;
    }

    if (!isAdmin) {
        // Авторизован, но не админ – на главную
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;