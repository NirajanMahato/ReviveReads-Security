const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    hasUnread: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
