const Notification = require("../models/Notification");
const { emitNotification } = require("../socket/socket");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const createNotification = async (userId, type, message) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      message,
      isRead: false,
    });
    
    await notification.save();
    
    emitNotification(userId, notification);
    
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
};
