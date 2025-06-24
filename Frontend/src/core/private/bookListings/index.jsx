import { createColumnHelper } from "@tanstack/react-table";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import useBooks from "../../../hooks/useBooks";
import DataTable from "../../../shared/DataTable/DataTable";
import Pagination from "../../../shared/Pagination/Pagination";
import BookDetailsModal from "../components/BookDetailModal";

const BookListings = () => {
  const { allBooks, loading, setAllBooks } = useBooks();

  // State variables for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [conditionFilter, setConditionFilter] = useState("All Conditions");
  const [sortOption, setSortOption] = useState("Latest");

  // State for modal
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter books based on the selected criteria
  const filteredBooks = allBooks
    .filter((book) => {
      const matchesStatus =
        statusFilter === "All Statuses" || book.status === statusFilter;
      const matchesCondition =
        conditionFilter === "All Conditions" ||
        book.condition === conditionFilter;
      const matchesSearchQuery =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.seller.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCondition && matchesSearchQuery;
    })
    .sort((a, b) => {
      if (sortOption === "Price: Low to High") return a.price - b.price;
      if (sortOption === "Price: High to Low") return b.price - a.price;
      if (sortOption === "Latest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5; // Number of books per page

  // Calculate pagination indexes
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  // Function to handle status updates
  const handleStatusUpdate = async (bookId, status) => {
    try {
      const book = allBooks.find((book) => book._id === bookId); // If the book is already in the target status (Approved or Declined)
      if (book.status === "Approved" && status === "Approved") {
        toast.error("This book has already been approved.");
        return;
      }
      if (book.status === "Declined" && status === "Declined") {
        toast.error("This book has already been declined.");
        return;
      }
      const response = await axios.patch(
        `/api/book/approve-book/${bookId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedBooks = allBooks.map((book) =>
        book._id === bookId
          ? { ...book, status: response.data.data.status }
          : book
      );

      setAllBooks(updatedBooks);
      toast.success(`Book ${status.toLowerCase()} successfully!`);
    } catch (error) {
      toast.error("Failed to update book status.");
      console.error(error);
    }
  };

  // Function to reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Statuses");
    setConditionFilter("All Conditions");
    setSortOption("Latest");
  };

  // Function to open the modal with the selected book's details
  const openModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
  };

  // Define columns for DataTable
  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("_id", {
      header: "View",
      cell: (info) => (
        <button onClick={() => openModal(info.row.original)}>
          <FaEye className="text-xl text-gray-600 hover:text-green-700" />
        </button>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Book",
      cell: (info) => {
        const book = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 overflow-hidden rounded">
              <img
                className="object-cover w-full h-full"
                src={`/api/uploads/books/${book.images[0]}`}
                alt={`Image of ${book.title}`}
              />
            </div>
            <div className="flex flex-col font-gilroyMedium">
              <div className="text-sm text-gray-900 hover:text-custom cursor-pointer">
                {book.title}
              </div>
              <div className="text-xs text-gray-600">NPR {book.price}</div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("genre", { header: "Genre" }),
    columnHelper.accessor("condition", { header: "Condition" }),
    columnHelper.accessor("seller.name", { header: "Seller" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
              status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "Approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const book = info.row.original;
        return (
          <div className="space-y-2 flex flex-col">
            <button
              onClick={() => handleStatusUpdate(book._id, "Approved")}
              className="py-1 w-20 text-sm text-white bg-gray-900 hover:bg-green-600 rounded-md"
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusUpdate(book._id, "Declined")}
              className="py-1 w-20 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
            >
              Decline
            </button>
          </div>
        );
      },
    }),
  ];

  return (
    <div className="px-4 bg-gray-100 min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold">Book Listings</h2>

      {/* Filters Section */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="mt-6 bg-white pb-4 rounded-lg shadow">
          <div className="py-5 sm:p-6 flex items-center gap-4">
            <div className="rounded-md min-w-60 h-12 flex items-center justify-between py-2 px-3 border border-gray-300 bg-white">
              <input
                type="text"
                className="sm:text-sm w-full"
                placeholder="Search books, sellers, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LuSearch className="text-xl text-gray-500" />
            </div>
            <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-3 xl:grid-cols-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered focus:outline-none w-full max-w-xs"
              >
                <option>All Statuses</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Declined</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="select select-bordered focus:outline-none w-full max-w-xs"
              >
                <option>All Conditions</option>
                <option>Brand New</option>
                <option>Like New</option>
                <option>Used</option>
                <option>Acceptable</option>
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="select select-bordered focus:outline-none w-full max-w-xs"
              >
                <option>Sort by: Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div className="">
              <button
                onClick={resetFilters}
                className="w-20 py-2 text-sm text-white bg-gray-800 hover:bg-gray-900 rounded-md col-span-1"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="pl-4">
            <DataTable columns={columns} data={currentBooks} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={allBooks.length}
            />
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      <BookDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        book={selectedBook}
        onApprove={handleStatusUpdate}
        onDecline={handleStatusUpdate}
      />
    </div>
  );
};

export default BookListings;
