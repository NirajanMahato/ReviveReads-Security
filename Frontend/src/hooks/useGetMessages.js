import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConverstaion";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await axios(`/api/messages/${selectedConversation._id}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
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
  }, [selectedConversation?._id, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
