import axios from "axios";
import { useEffect, useState } from "react";

const useDashboardSummary = () => {
  const [summary, setSummary] = useState({
    newUsersCount: 0,
    newBooksCount: 0,
    totalBooksCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get("/api/admin/summary", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSummary(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard summary:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, loading, error };
};

export default useDashboardSummary;
