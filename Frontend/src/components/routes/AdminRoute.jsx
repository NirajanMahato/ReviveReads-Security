import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import LoadingScreen from "../LoadingScreen";

export const AdminRoute = ({ children }) => {
  const { userInfo, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
