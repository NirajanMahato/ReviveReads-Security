import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

const useSecurityMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useContext(UserContext);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/security-metrics", {
        withCredentials: true,
      });
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching security metrics:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchMetrics();

      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchMetrics, 30000);

      return () => clearInterval(interval);
    }
  }, [userInfo?.token]);

  const refreshMetrics = () => {
    setLoading(true);
    fetchMetrics();
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
  };
};

export default useSecurityMetrics;
