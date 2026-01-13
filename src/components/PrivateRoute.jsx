// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = ({ roleRequired }) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user.isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired && user.role !== roleRequired) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
