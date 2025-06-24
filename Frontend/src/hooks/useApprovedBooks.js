import axios from "axios";
import { useEffect, useState } from "react";

const useApprovedBooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All"); // New state for genre

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/book/get-approved-books");
      const books = response?.data;

      setAllBooks(books); // Store all books
      setFilteredBooks(books); // Initialize filtered books
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = (tab, genre = selectedGenre) => {
    let filtered = [...allBooks];

    // Tab-based filtering
    if (tab === "New Listings") {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (tab === "Recommended") {
      filtered = filtered
        .sort((a, b) => a.price - b.price)
        .filter(
          (book) =>
            book.condition === "Like New" || book.condition === "Brand New"
        );
    }

    // Genre-based filtering
    if (genre !== "All") {
      filtered = filtered.filter((book) => book.genre === genre);
    }

    setFilteredBooks(filtered);
    setSelectedGenre(genre); // Update the selected genre state
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    allBooks,
    setAllBooks,
    filteredBooks,
    filterBooks,
    loading,
    selectedGenre,
    setSelectedGenre,
  };
};

export default useApprovedBooks;
