import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);
    const location = useLocation();
  
    if (!isAuthenticated || role !== 'admin') {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  
    return children;
  };