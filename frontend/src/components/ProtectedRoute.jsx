import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary text-gray-100 font-sans">
        <div className="glass-card p-8 rounded-2xl text-center shadow-lg fade-in">
          <h2 className="text-xl font-medium mb-4">Initializing Workspace...</h2>
          <div className="w-10 h-10 border-4 border-white/10 border-t-accent-purple rounded-full mx-auto animate-custom-spin" />
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check RBAC whitelist
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
