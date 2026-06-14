import { Navigate } from 'react-router-dom';
import { useAuth } from './Auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  // console.log('ProtectedRoute:', { user, loading, allowedRoles }); 

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  if (!user)   return <Navigate to="/loginPortal" replace />;

  if (allowedRoles.length > 0) {
    const role = user?.role?.name || '';
    if (!allowedRoles.includes(role)) return <Navigate to="/loginPortal" replace />;
  }

  return children;
};

export default ProtectedRoute;