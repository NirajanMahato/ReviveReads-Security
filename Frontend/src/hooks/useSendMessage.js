import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConverstaion";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/messages/send/${selectedConversation._id}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessages([...messages, res.data]);
      toast.success("Message sent!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
