import { useEffect } from "react";
import useApprovedBooks from "../../../hooks/useApprovedBooks";
import BookCard from "./BookCard";

const RecommendSection = ({ activeTab, setActiveTab }) => {
  const {
    allBooks,
    filteredBooks,
    filterBooks,
    loading,
    selectedGenre,
    setSelectedGenre,
  } = useApprovedBooks();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterBooks(tab);
  };

  const handleGenreChange = (event) => {
    const genre = event.target.value;
    setSelectedGenre(genre);
    filterBooks(activeTab, genre);
  };

  useEffect(() => {
    filterBooks(activeTab);
  }, [activeTab]);

  // Generate unique genres from allBooks
  const genres = Array.from(new Set(["All", ...allBooks.map((book) => book.genre)]));

  return (
    <div className="md:px-8 px-4 lg:mt-0 md:mt-6 mt-10 pb-20">
      <div className="flex md:flex-row flex-col gap-y-4 justify-between">
        <div>
          <button
            onClick={() => handleTabChange("Recommended")}
            className={`mr-4 md:text-xl text-lg font-ppMori ${
              activeTab === "Recommended"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => handleTabChange("New Listings")}
            className={`md:text-xl text-lg font-ppMori ${
              activeTab === "New Listings"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            New Listings
          </button>
        </div>
        <select
          className="select select-bordered md:w-48 max-w-48 font-gilroyMedium"
          value={selectedGenre}
          onChange={handleGenreChange}
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center mt-10">
          <h1 className="loading loading-infinity loading-lg"></h1>
        </div>
      ) : (
        <BookCard products={filteredBooks} />
      )}
    </div>
  );
};

export default RecommendSection;
