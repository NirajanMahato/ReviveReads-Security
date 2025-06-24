import { useEffect } from "react";
import axios from "axios";

const useUpdateUserStatus = () => {
  useEffect(() => {
    const updateUserStatus = async () => {
      const userId = localStorage.getItem("id"); // Get user ID from localStorage
      const token = localStorage.getItem("token"); // Get token for authentication

      if (!userId || !token) return; // Exit if user is not authenticated

      try {
        await axios.patch(
          `/api/user/${userId}/status`,
          {
            status: "Active", // Update user status to "Active"
            lastActivity: new Date(), // Set current timestamp as the last activity
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token for authorization
            },
          }
        );
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    };

    updateUserStatus();

    // Optionally, update status to "Away" or "Offline" on page unload
    const handleUnload = async () => {
      const userId = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      if (!userId || !token) return;

      try {
        await axios.patch(
          `/api/user/${userId}/status`,
          {
            status: "Away", // Set status to "Away" on page unload
            lastActivity: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
  }, []);
};

export default useUpdateUserStatus;
