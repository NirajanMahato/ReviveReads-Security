import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../store/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Make request with credentials to get user info from cookies
        const response = await axios.get("/api/user/me", {
          withCredentials: true,
        });
        setUserInfo(response.data);
        // Update Redux state
        dispatch(authActions.login());
        dispatch(authActions.changeRole(response.data.role));
      } catch (error) {
        // Silently handle auth errors - user is not logged in
        setUserInfo(null);
        dispatch(authActions.logout());
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [refresh, dispatch]);

  const logout = async () => {
    try {
      // Call logout endpoint to clear cookies
      await axios.post(
        "/api/user/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      dispatch(authActions.logout());
      setUserInfo(null);
      window.location.href = "/";
    }
  };

  const refreshUserInfo = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <UserContext.Provider
      value={{ userInfo, setUserInfo, loading, logout, refreshUserInfo }}
    >
      {children}
    </UserContext.Provider>
  );
};
