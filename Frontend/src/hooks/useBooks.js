import axios from "axios";
import { useEffect, useState } from "react";

const useBooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/book/get-all-books", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const books = response?.data;

      setAllBooks(books); // Store all books
      setFilteredBooks(books); // Initialize filtered books
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = (tab) => {
    let filtered = [];

    if (tab === "New Listings") {
      filtered = [...allBooks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (tab === "Recommended") {
      filtered = allBooks
        .sort((a, b) => a.price - b.price) // Sort by price
        .filter(
          (book) =>
            book.condition === "Like New" || book.condition === "Brand New"
        );
    }
    setFilteredBooks(filtered);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { allBooks, setAllBooks, filteredBooks, filterBooks, loading };
};

export default useBooks;
