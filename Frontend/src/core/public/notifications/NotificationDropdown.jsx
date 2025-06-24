import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { IoNotificationsOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";
import { UserContext } from "../../../context/UserContext";

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { userInfo } = useContext(UserContext);
  const [isHovered, setIsHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!userInfo) return;

    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 200);
    setHideTimeout(timeout);
  };

  const handleButtonClick = () => {
    if (!userInfo) {
      toast.error("Please login to access notifications");
    } else {
      navigate("/notifications");
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleButtonClick}
    >
      {/* Notification Bell */}
      <button className="relative flex items-center justify-center">
        <IoNotificationsOutline className="text-2xl text-gray-600 hover:text-black" />
        {userInfo && unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-400 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isHovered && userInfo && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-lg z-50 transition-opacity duration-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <ul className="max-h-40 overflow-y-auto">
            {notifications &&
              notifications.slice(0, 3).map((notification, index) => (
                <li
                  key={index}
                  className={`p-4 ${
                    notification.isRead ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <small className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
          </ul>
          <div className="p-4 text-center border-t border-gray-200">
            <Link
              to="/notifications"
              className="text-sm text-blue-500 hover:underline"
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
