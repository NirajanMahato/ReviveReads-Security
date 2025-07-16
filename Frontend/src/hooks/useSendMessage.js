import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { encryptMessage } from "../utils/crypto";
import useConversation from "../zustand/useConverstaion";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (message) => {
    setLoading(true);
    try {
      const encrypted = encryptMessage(message);
      const res = await axios.post(
        `/api/messages/send/${selectedConversation._id}`,
        { message: encrypted },
        { withCredentials: true }
      );

      const decrypted = { ...res.data, message };
      setMessages([...messages, decrypted]);
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
