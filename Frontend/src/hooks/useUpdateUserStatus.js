import axios from "axios";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";

const useUpdateUserStatus = () => {
  const { userInfo } = useContext(UserContext);
  const userId = userInfo?._id; // or userInfo.id depending on backend

  useEffect(() => {
    const updateUserStatus = async () => {
      if (!userId) return; // Exit if user is not authenticated

      try {
        await axios.patch(
          `/api/user/${userId}/status`,
          {
            status: "Active", // Update user status to "Active"
            lastActivity: new Date(), // Set current timestamp as the last activity
          },
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    };

    updateUserStatus();

    // Optionally, update status to "Away" or "Offline" on page unload
    const handleUnload = async () => {
      if (!userId) return;

      try {
        await axios.patch(
          `/api/user/${userId}/status`,
          {
            status: "Away", // Set status to "Away" on page unload
            lastActivity: new Date(),
          },
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error("Error updating user status on unload:", error);
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [userId]);
};

export default useUpdateUserStatus;
