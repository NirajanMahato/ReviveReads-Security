import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { GoHome } from "react-icons/go";
import { IoNotificationsOutline, IoPersonCircleOutline } from "react-icons/io5";
import { RiMessage3Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useNotifications } from "../context/NotificationContext";
import { UserContext } from "../context/UserContext";

const BottomNavBar = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useNotifications();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { userInfo } = useContext(UserContext);

  // Get profile path based on authentication and role
  const getProfilePath = () => {
    if (!isAuthenticated) return "/login";
    return userInfo?.role === "admin" ? "/admin/dashboard" : "/profile";
  };

  // Navigation items configuration
  const navItems = [
    {
      path: "/",
      icon: GoHome,
      label: "Home",
      match: (path) => path === "/",
    },
    {
      path: "/notifications",
      icon: IoNotificationsOutline,
      label: "Notifications",
      match: (path) => path.startsWith("/notifications"),
      badge: userInfo && unreadCount > 0 ? unreadCount : null,
    },
    {
      path: "/messages",
      icon: RiMessage3Line,
      label: "Messages",
      match: (path) => path.startsWith("/messages"),
      badge: hasUnreadMessages,
    },
    {
      path: getProfilePath(),
      icon: IoPersonCircleOutline,
      label: userInfo?.role === "admin" ? "Admin" : "Profile",
      match: (path) =>
        path === "/profile" || path === "/login" || path.startsWith("/admin"),
    },
  ];

  // Helper function to check if item is active
  const isActive = (item) => item.match(location.pathname);

  // Fetch unread messages
  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("/api/messages/unread", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHasUnreadMessages(response.data.unreadCount > 0);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // Initial fetch of unread messages
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadMessages();
    }
  }, [isAuthenticated]);

  // Socket connection for real-time updates
  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (!userId || !isAuthenticated) return;

    const socket = io("http://localhost:4000", {
      query: { userId },
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected for messages");
    });

    socket.on("updateUnreadMessages", (hasUnread) => {
      setHasUnreadMessages(hasUnread);
    });

    socket.on("newMessage", () => {
      // Fetch updated unread count when new message arrives
      fetchUnreadMessages();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white text-black shadow-md z-50 md:hidden">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="relative flex flex-col items-center justify-center w-16 h-full"
          >
            <div
              className={`flex flex-col items-center transition-all duration-200 ${
                isActive(item) ? "transform -translate-y-1" : ""
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`text-2xl transition-colors ${
                    isActive(item) ? "text-black" : "text-gray-500"
                  }`}
                />
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 ${
                      typeof item.badge === "number"
                        ? "bg-red-400 text-white text-[8px] w-3 h-3 flex items-center justify-center"
                        : "bg-blue-500 w-2 h-2"
                    } rounded-full`}
                  >
                    {typeof item.badge === "number" ? item.badge : ""}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive(item) ? "text-black" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
