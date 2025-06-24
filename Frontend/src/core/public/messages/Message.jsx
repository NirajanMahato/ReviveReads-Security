import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import useConversation from "../../../zustand/useConverstaion";

const Message = ({ message }) => {
  const { userInfo } = useContext(UserContext);
  const { selectedConversation } = useConversation();
  const fromMe = message.senderId === userInfo._id;
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe
    ? `/api/uploads/users/${userInfo.avatar}`
    : `/api/uploads/users/${selectedConversation.avatar}`;
  const bubbleBgColor = fromMe ? "" : "bg-gray-300";
  const textColor = fromMe ? "text-gray-100" : "text-gray-900";
  const shakeClass = message.shouldShake ? "shake" : "";

  // Extract hours and minutes
  const messageCreatedAt = new Date(message.createdAt);
  let hours = messageCreatedAt.getHours();
  const minutes = messageCreatedAt.getMinutes();
  const period = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
  hours = hours % 12; // Convert to 12-hour format
  hours = hours ? hours : 12; // 0 becomes 12 for 12 AM/PM
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Format minutes
  const formattedTime = `${hours}:${formattedMinutes} ${period}`; // Format as "hh:mm AM/PM"

  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-9 rounded-full">
          <img alt="Tailwind CSS chat bubble component" src={profilePic} />
        </div>
      </div>
      <div
        className={`chat-bubble leading-4 flex items-center ${textColor} ${bubbleBgColor} ${shakeClass} pb-2`}
      >
        {message.message}
      </div>
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formattedTime}
      </div>
    </div>
  );
};
export default Message;
