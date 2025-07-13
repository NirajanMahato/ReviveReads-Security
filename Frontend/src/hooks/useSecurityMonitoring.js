import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

const useSecurityMonitoring = () => {
  const [securityStats, setSecurityStats] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [activityLogs, setActivityLogs] = useState({
    logs: [],
    pagination: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useContext(UserContext);

  const fetchSecurityStats = async () => {
    try {
      const response = await axios.get("/api/activity-logs/stats", {
        withCredentials: true,
      });
      setSecurityStats(response.data);
    } catch (error) {
      console.error("Error fetching security stats:", error);
      setError(error.message);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const response = await axios.get(
        "/api/activity-logs/security-events?limit=50",
        {
          withCredentials: true,
        }
      );
      setSecurityEvents(response.data);
    } catch (error) {
      console.error("Error fetching security events:", error);
      setError(error.message);
    }
  };

  const fetchActivityLogs = async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 20,
        ...filters,
      });

      const response = await axios.get(`/api/activity-logs?${params}`, {
        withCredentials: true,
      });
      setActivityLogs(response.data);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadSecurityData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchSecurityStats(),
          fetchSecurityEvents(),
          fetchActivityLogs(),
        ]);
      } catch (error) {
        console.error("Error loading security data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      loadSecurityData();
    }
  }, [userInfo]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSecurityStats(),
        fetchSecurityEvents(),
        fetchActivityLogs(),
      ]);
    } catch (error) {
      console.error("Error refreshing security data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    securityStats,
    securityEvents,
    activityLogs,
    loading,
    error,
    refreshData,
    fetchActivityLogs,
  };
};

export default useSecurityMonitoring;
