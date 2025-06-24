import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem("id");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();

      // Socket connection
      const socket = io("http://localhost:4000", {
        query: { userId },
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
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
