import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications", {
        withCredentials: true,
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    } catch (error) {
      // Silently handle auth errors - user is not logged in
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "/api/notifications/mark-read",
        {},
        {
          withCredentials: true,
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      // Handle error silently or show toast
      if (error.response?.status !== 401) {
        toast.error("Failed to mark notifications as read");
      }
    }
  };

  useEffect(() => {
    // Check if user is authenticated by trying to fetch notifications
    const checkAuthAndFetch = async () => {
      try {
        await fetchNotifications();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Socket connection only when authenticated
      const socket = io("http://localhost:4000", {
        withCredentials: true,
      });

      // Listen for new notifications
      socket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast(notification.message, {
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAllAsRead,
        isAuthenticated,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
