import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import LoadingScreen from "../LoadingScreen";

export const AdminRoute = ({ children }) => {
  const { userInfo, loading } = useContext(UserContext);
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated or not admin
  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
