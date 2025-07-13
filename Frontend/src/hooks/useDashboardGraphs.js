import axios from "axios";
import { useEffect, useState } from "react";

const useDashboardGraphs = () => {
  const [bookListingsData, setBookListingsData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        // Fetch Book Listings Data
        const bookResponse = await axios.get("/api/admin/book-listings-stats", {
          withCredentials: true,
        });
        setBookListingsData(bookResponse.data);

        // Fetch User Activity Data
        const userResponse = await axios.get("/api/admin/user-activity-stats", {
          withCredentials: true,
        });
        setUserActivityData(userResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching graph data:", error);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  return { bookListingsData, userActivityData, loading };
};

export default useDashboardGraphs;
