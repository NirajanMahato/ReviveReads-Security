import axios from "axios";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConverstaion";

export const handleSaveBook = async (bookId) => {
  try {
    const response = await axios.post(
      "/api/user/add-to-favorites",
      { bookId },
      {
        withCredentials: true,
      }
    );
    toast.success(response.data.message);
  } catch (error) {
    if (error.response?.status === 401) {
      toast.error("Please login to save the book.");
    } else {
      toast.error(error.response?.data?.message || "Failed to save the book.");
    }
  }
};

export const handleChatNow = async (sellerId) => {
  try {
    const res = await axios.get(`/api/user/get-user-by-id/${sellerId}`, {
      withCredentials: true,
    });
    const { setSelectedConversation } = useConversation.getState(); // Access Zustand directly
    setSelectedConversation(res.data); // Set the seller conversation in Zustand
    return true; // To indicate chat modal can be opened
  } catch (error) {
    if (error.response?.status === 401) {
      toast.error("Please login to chat with the seller.");
    } else {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(errorMessage);
    }
    return false; // Chat modal won't open if the user is not logged in
  }
};
