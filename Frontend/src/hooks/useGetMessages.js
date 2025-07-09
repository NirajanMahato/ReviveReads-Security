import axios from "axios";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import useConversation from "../zustand/useConverstaion";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await axios(`/api/messages/${selectedConversation._id}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });
        const data = await res.data;
        if (data.error) throw new Error(data.error);
        setMessages(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessages, userInfo.token]);

  return { messages, loading };
};

export default useGetMessages;
