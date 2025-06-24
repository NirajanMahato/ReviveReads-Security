import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";

const SoldCard = () => {
  const [soldBooks, setSoldBooks] = useState([]);
  const authenticateToken = localStorage.getItem("token");

  // Fetch sold books from the backend
  const fetchSoldBooks = async () => {
    if (!authenticateToken) {
      toast.error("Please log in to view sold books.");
      return;
    }

    try {
      const response = await axios.get("/api/book/sold", {
        headers: {
          Authorization: `Bearer ${authenticateToken}`,
        },
      });
      setSoldBooks(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSoldBooks();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {soldBooks.length === 0 ? (
        <div className="col-span-full text-center text-gray-600">
          No sold books to display.
        </div>
      ) : (
        soldBooks.map((book) => (
          <div
            key={book._id}
            className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-all"
          >
            <h1 className="font-gilroySemiBold text-lg text-gray-800">
              {book.title}
            </h1>
            <p className="text-gray-600 text-sm mt-2">NPR {book.price}</p>
            {/* <p className="text-gray-500 text-sm mt-1">
              Sold to: <span className="font-medium">{book.buyer.name}</span>
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Sold on:{" "}
              <span className="font-medium">
                {format(new Date(book.soldDate), "MMMM d, yyyy")}
              </span>
            </p> */}
          </div>
        ))
      )}
    </div>
  );
};

export default SoldCard;
