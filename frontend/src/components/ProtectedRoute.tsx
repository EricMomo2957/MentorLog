import React from 'react'; // Add this line
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode; // Use React.ReactNode for better compatibility
    requiredRole?: 'admin' | 'student';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        alert("Access Denied: You do not have permission to view this page.");
        return <Navigate to="/" replace />;
    }

    // Wrap in a fragment to ensure it returns a valid React Element
    return <>{children}</>; 
};

export default ProtectedRoute;