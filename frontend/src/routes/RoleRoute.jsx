import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute Component
 * 
 * Verifies that the authenticated user's role is permitted to access the route.
 * If the user's role is not allowed, redirects to their corresponding dashboard:
 * - admin -> /admin/dashboard
 * - organizer -> /organizer/dashboard
 * - student -> /student/dashboard
 * - Default fallback -> /
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'organizer') {
      return <Navigate to="/organizer/dashboard" replace />;
    } else if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
