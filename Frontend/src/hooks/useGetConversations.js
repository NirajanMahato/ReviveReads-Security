import axios from "axios";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";

const useGetConversations = () => {
  const { userInfo } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/user/get-users-for-sidebar", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        setConversations(res.data);
      } catch (error) {
        const errorMessage = error.response
          ? error.response.data.error
          : error.message;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return { loading, conversations };
};

export default useGetConversations;
