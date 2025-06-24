import React from "react";
import BottomNavBar from "../../../components/BottomNavBar";
import useConversation from "../../../zustand/useConverstaion";
import MessageContainer from "./MessageContainer";
import MessageSidebar from "./sidebar/MessageSidebar";

const MessagePage = () => {
  const { selectedConversation } = useConversation();

  return (
    <div className="w-full h-screen flex justify-between overflow-hidden relative">
      {/* Sidebar - hidden on mobile when conversation is selected */}
      <div
        className={`${
          selectedConversation ? "hidden sm:block" : "block"
        } sm:w-96 w-full h-full`}
      >
        <MessageSidebar />
      </div>

      {/* Message Container - full width on mobile when selected */}
      <div
        className={`${
          !selectedConversation ? "hidden sm:block" : "block"
        } flex-1 h-full`}
      >
        <MessageContainer />
      </div>

      <BottomNavBar />
    </div>
  );
};

export default MessagePage;
