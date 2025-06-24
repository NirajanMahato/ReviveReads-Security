import { useContext, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { TiMessages } from "react-icons/ti";
import { UserContext } from "../../../context/UserContext";
import useConversation from "../../../zustand/useConverstaion";
import MessageInput from "./MessageInput";
import Messages from "./Messages";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  return (
    <div className="h-full flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <div className="border-b-2 px-4 py-2 mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedConversation(null)}
                className="sm:hidden text-2xl"
              >
                <IoArrowBack />
              </button>
              <div className="chat-image avatar">
                <div className="w-9 rounded-full">
                  <img
                    alt="User avatar"
                    src={`/api/uploads/users/${selectedConversation.avatar}`}
                  />
                </div>
              </div>
              <span className="text-gray-900 font-bold">
                {selectedConversation.name}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Messages />
          </div>
          <div className="md:px-8 px-4 my-3 md:pb-3 pb-16">
            <MessageInput />
          </div>
        </>
      )}
    </div>
  );
};

const NoChatSelected = () => {
  const { userInfo } = useContext(UserContext);
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-500 font-semibold flex flex-col items-center gap-2">
        <p>Welcome 👋 {userInfo?.name} ❄</p>
        <p>Select a chat to start messaging</p>
        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};

export default MessageContainer;
