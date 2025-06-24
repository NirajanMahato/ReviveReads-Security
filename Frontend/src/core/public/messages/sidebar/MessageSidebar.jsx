import React from "react";
import { IoArrowBack } from "react-icons/io5";
import useConversation from "../../../../zustand/useConverstaion";
import Conversations from "./Conversations";

const MessageSidebar = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();

  return (
    <div className="h-full bg-[#EEEEEE] border-r border-slate-500 p-4 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        {selectedConversation && (
          <button
            onClick={() => setSelectedConversation(null)}
            className="sm:hidden text-2xl"
          >
            <IoArrowBack />
          </button>
        )}
        <h1 className="font-gilroyMedium md:text-3xl text-2xl">Chats</h1>
      </div>
      <div className="divider pb-3"></div>
      <div className="flex-1 overflow-y-auto">
        <Conversations />
      </div>
    </div>
  );
};

export default MessageSidebar;
