import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

const useSecurityMonitoring = () => {
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [userActivityStats, setUserActivityStats] = useState(null);
  const [bookListingsStats, setBookListingsStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useContext(UserContext);

  const fetchSecurityMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/security-metrics", {
        withCredentials: true,
      });
      setSecurityMetrics(response.data);
    } catch (error) {
      console.error("Error fetching security metrics:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivityStats = async () => {
    try {
      const response = await axios.get("/api/admin/user-activity-stats", {
        withCredentials: true,
      });
      setUserActivityStats(response.data);
    } catch (error) {
      console.error("Error fetching user activity stats:", error);
    }
  };

  const fetchBookListingsStats = async () => {
    try {
      const response = await axios.get("/api/admin/book-listings-stats", {
        withCredentials: true,
      });
      setBookListingsStats(response.data);
    } catch (error) {
      console.error("Error fetching book listings stats:", error);
    }
  };

  useEffect(() => {
    const loadSecurityData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSecurityMetrics(),
        fetchUserActivityStats(),
        fetchBookListingsStats(),
      ]);
      setLoading(false);
    };

    if (userInfo?.token) {
      loadSecurityData();
    }
  }, [userInfo?.token]);

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSecurityMetrics(),
      fetchUserActivityStats(),
      fetchBookListingsStats(),
    ]);
    setLoading(false);
  };

  return {
    securityMetrics,
    userActivityStats,
    bookListingsStats,
    loading,
    error,
    refreshData,
  };
};

export default useSecurityMonitoring;
