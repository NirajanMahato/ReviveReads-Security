import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

const useDashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useContext(UserContext);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/dashboard-summary", {
        withCredentials: true,
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return { summary, loading, error };
};

export default useDashboardSummary;
