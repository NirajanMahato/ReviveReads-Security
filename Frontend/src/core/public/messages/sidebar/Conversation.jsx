import { useSocketContext } from "../../../../context/SocketContext";
import useConversation from "../../../../zustand/useConverstaion";

const Conversation = ({ conversation, lastIdx }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === conversation._id;

  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id);

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-gray-400 rounded-md px-2 py-1.5 cursor-pointer
				${isSelected ? "bg-gray-400" : ""}
			`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-9 rounded-full">
            <img
              src={`/api/uploads/users/${conversation.avatar}`}
              alt="user avatar"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between">
            <p className="font-bold text-gray-800">{conversation.name}</p>
          </div>
        </div>
      </div>
      {/* <div className="divider my-0 py-0 h-1" /> */}

      {!lastIdx && <div className="divider my-0 py-0 h-1" />}
    </>
  );
};
export default Conversation;
