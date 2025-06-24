import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../store/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0); // Add refresh counter
  const dispatch = useDispatch();

  // Access token and user ID from localStorage
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId && token) {
        try {
          const response = await axios.get(`/api/user/get-user-by-id/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserInfo(response.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      } else {
        setUserInfo(null);
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [userId, token, refresh]); // Add refresh to dependency array

  const logout = () => {
    dispatch(authActions.logout());
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserInfo(null);
    window.location.href = "/";
  };

  // Add refreshUserInfo function
  const refreshUserInfo = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, loading, logout, refreshUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};