import axios from "axios";
import { useEffect, useState } from "react";

const useUserBooks = (userId) => {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/book/get-book-by-user", {
        headers: {
          id: userId,
        },
      });
      setAllBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [userId]);

  return { allBooks, loading, fetchBooks };
};

export default useUserBooks;
