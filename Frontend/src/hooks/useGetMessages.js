import axios from "axios";
import { useEffect, useState } from "react";
import { decryptMessage } from "../utils/crypto";
import useConversation from "../zustand/useConverstaion";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/messages/${selectedConversation._id}`,
          { withCredentials: true }
        );
        const decrypted = res.data.map((msg) => ({
          ...msg,
          message: decryptMessage(msg.message),
        }));
        setMessages(decrypted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
