import { useEffect, useRef } from "react";
import useGetMessages from "../../../hooks/useGetMessages";
import useListenMessages from "../../../hooks/useListenMessages";
import Message from "./Message";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const Messages = () => {
  const { messages, loading } = useGetMessages();
  useListenMessages();
  const lastMessageRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  // Helper function to format date
  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Check if the message was sent today, yesterday, or earlier
    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  let groupedMessages = [];
  let currentDate = null;

  for (let i = 0; i < messages.length; i++) {
    const messageDate = formatDate(messages[i].createdAt);
    if (messageDate !== currentDate) {
      groupedMessages.push({ date: messageDate, messages: [] });
      currentDate = messageDate;
    }
    groupedMessages[groupedMessages.length - 1].messages.push(messages[i]);
  }

  return (
    <div className="px-3 flex-1 overflow-auto">
      {!loading &&
        groupedMessages.length > 0 &&
        groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Display the date once for the group of messages */}
            <div className="flex justify-center text-xs text-gray-500 py-2">
              <h1 className="bg-gray-200 px-1.5 py-0.5 rounded-md">
                {group.date}
              </h1>
            </div>
            {group.messages.map((message, index) => (
              <div
                key={message._id}
                ref={
                  index === group.messages.length - 1 ? lastMessageRef : null
                }
              >
                <Message message={message} />
              </div>
            ))}
          </div>
        ))}
      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
      {!loading && messages.length === 0 && (
        <p className="text-center">Send a message to start the conversation</p>
      )}
    </div>
  );
};

export default Messages;
