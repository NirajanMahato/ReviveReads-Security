const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { getReceiverSocketId, io } = require("../socket/socket");
const { encryptMessage, decryptMessage } = require("../utils/crypto");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const encryptedMessage = encryptMessage(message);
    const newMessage = new Message({
      senderId,
      receiverId,
      message: encryptedMessage,
      read: false,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = newMessage._id;
      conversation.hasUnread = true;
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("updateUnreadMessages", true);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    await markMessagesAsRead(userToChatId, senderId);

    const receiverSocketId = getReceiverSocketId(senderId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("updateUnreadMessages", false);
    }
    const decryptedMessages = conversation.messages.map((msg) => ({
      ...msg,
      message: decryptMessage(msg.message),
    }));
    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markMessagesAsRead = async (senderId, receiverId) => {
  await Message.updateMany(
    {
      senderId,
      receiverId,
      read: false,
    },
    { read: true }
  );
};

const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    }).populate("messages");

    let unreadCount = 0;
    conversations.forEach((conversation) => {
      const unreadMessages = conversation.messages.filter(
        (message) => message.receiverId.toString() === userId && !message.read
      );
      unreadCount += unreadMessages.length;
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error in getUnreadMessageCount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadMessageCount,
};
