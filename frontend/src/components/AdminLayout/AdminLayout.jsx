import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = () => {
    // const { user, isAuthenticated } = useAuth();
    //
    // // Проверка авторизации и роли
    // if (!isAuthenticated) {
    //     return <Navigate to="/" replace />;
    // }

    // // Если есть поле role — проверяем
    // if (user?.role && user.role !== 'admin') {
    //     return <Navigate to="/" replace />;
    // }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-layout__main">
                <div className="admin-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;