import React from "react";
import { IoClose } from "react-icons/io5";
import { useSocketContext } from "../../../context/SocketContext";
import useConversation from "../../../zustand/useConverstaion";
import MessageInput from "../messages/MessageInput";
import Messages from "../messages/Messages";

const ChatModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Hide modal if not open
  const { selectedConversation } = useConversation();

  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(selectedConversation._id);

  return (
    <div className="fixed md:bottom-4 bottom-16 md:right-4 right-6 w-80 h-96 bg-white shadow-lg border rounded-lg z-51">
      <div className="flex justify-between items-center px-3 py-2 border-b bg-gray-100">
        <div className="flex items-center gap-2">
          <div className={`avatar ${isOnline ? "online" : ""}`}>
            <div className="w-9 rounded-full">
              <img
                alt="Tailwind CSS chat bubble component"
                src={`/api/uploads/users/${selectedConversation.avatar}`}
              />
            </div>
          </div>
          <span className="text-gray-900 font-bold">
            {selectedConversation.name}
          </span>
        </div>
        <IoClose
          className="text-xl cursor-pointer hover:text-red-500"
          onClick={onClose}
        />
      </div>
      <div className="h-64 overflow-y-auto">
        <Messages />
      </div>
      <div className="md:px-3 px-2 my-3">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatModal;
