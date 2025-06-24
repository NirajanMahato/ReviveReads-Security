import axios from "axios";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConverstaion";

export const handleSaveBook = async (bookId, token) => {
  if (token) {
    try {
      const response = await axios.post(
        "/api/user/add-to-favorites",
        { bookId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save the book."
      );
    }
  } else {
    toast.error("Please login to save the book.");
  }
};

export const handleChatNow = async (sellerId, token) => {
  if (token) {
    try {
      const res = await axios.get(`/api/user/get-user-by-id/${sellerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { setSelectedConversation } = useConversation.getState(); // Access Zustand directly
      setSelectedConversation(res.data); // Set the seller conversation in Zustand
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
    return true; // To indicate chat modal can be opened
  } else {
    toast.error("Please login to chat with the seller.");
    return false; // Chat modal won't open if the user is not logged in
  }
};
