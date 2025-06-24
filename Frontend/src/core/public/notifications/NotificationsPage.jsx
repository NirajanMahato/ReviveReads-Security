import { format, isToday, isYesterday, parseISO } from "date-fns";
import React from "react";
import BottomNavBar from "../../../components/BottomNavBar";
import { useNotifications } from "../../../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, markAllAsRead } = useNotifications();

  const formatNotificationDate = (dateString) => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "MMM dd, yyyy 'at' hh:mm a");
  };

  return (
    <div className="container mx-auto md:px-10 px-3 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="md:text-2xl text-xl font-semibold mb-4">Your Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-600"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Conditionally render notifications or a no notifications message */}
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification, index) => (
            <li
              key={index}
              className={`p-4 rounded-lg shadow border-l-4 border-l-gray-800 ${
                notification.isRead ? "bg-white" : "bg-blue-50"
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <small className="text-xs text-gray-500">
                {formatNotificationDate(notification.createdAt)}
              </small>
            </li>
          ))}
        </ul>
      )}

      <BottomNavBar />
    </div>
  );
};

export default NotificationsPage;
