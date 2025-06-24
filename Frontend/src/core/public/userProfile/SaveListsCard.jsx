import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdBookmarkRemove } from "react-icons/md";
import { Link } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const SaveListsCard = () => {
  const [savedBooks, setSavedBooks] = useState([]);
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    const fetchSavedBooks = async () => {
      try {
        const response = await axios.get("/api/user/get-favorites-books", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSavedBooks(response.data);
      } catch (error) {
        console.error("Error fetching saved books:", error);
      }
    };
    fetchSavedBooks();
  }, []);

  // Remove saved book
  const handleRemoveSavedBook = async (bookId) => {
    try {
      const response = await axios.delete(
        `/api/user/remove-from-favorites/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSavedBooks(savedBooks.filter((book) => book._id !== bookId));
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error removing saved book:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-y-8 gap-y-5">
      {savedBooks.map((product) => (
        <div
          key={product?._id}
          className="flex items-center gap-x-2 max-w-96 border rounded-lg p-3 hover:shadow-sm hover:border-gray-300 transition-all delay-75"
        >
          <Link to={`/products/${product?._id}`}>
            <img
              src={`/api/uploads/books/${product?.images[0]}`}
              alt={product.title}
              className="rounded-lg lg:w-36 md:w-40 w-32 md:h-44 h-36 object-cover"
            />
          </Link>
          <div className="info-div flex flex-col px-2 py-2 w-full">
            <div className="hover:cursor-pointer">
              <h1
                className="font-gilroySemiBold md:text-lg "
                style={{ lineHeight: "1" }}
              >
                {product?.title}
              </h1>
              <h1
                className="md:text-xs text-[10px] text-gray-600 mt-1"
                style={{ lineHeight: "1" }}
              >
                {product.description.length > 50 // Adjust '50' for desired length
                  ? `${product?.description.substring(0, 50)}...` // Truncate text
                  : product?.description}
              </h1>
            </div>
            <div className="flex items-center justify-between md:mt-3 mt-11 pr-2">
              <h1 className="font-gilroySemiBold text-gray-700 md:text-lg text-sm">
                NPR {""}
                {product?.price}
              </h1>
              <h1
                className={`text-[10px] rounded-full px-[6px] py-[2px] bg-opacity-80 ${
                  product.condition === "Like New"
                    ? "bg-blue-200"
                    : product.condition === "Used"
                    ? "bg-yellow-200"
                    : product.condition === "Brand New"
                    ? "bg-green-200"
                    : product.condition === "Acceptable"
                    ? "bg-purple-200"
                    : "bg-gray-200 bg-opacity-80" // Default for other conditions
                }`}
              >
                {product?.condition}
              </h1>
            </div>
            <div className="flex md:text-xs text-[11px] justify-between border-b md:pb-2 pb-1">
              <h1 className="">{userInfo?.address}</h1>
              <h1 className="pr-1 text-gray-600">
                {formatDistanceToNowStrict(new Date(product?.updatedAt))} ago
              </h1>
            </div>
            <div className="flex justify-between md:mt-3 mt-2 pr-2 text-gray-600">
              <h1></h1>
              <button
                onClick={() => handleRemoveSavedBook(product._id)}
                className="flex items-center hover:text-red-700"
              >
                <MdBookmarkRemove className="md:text-xl" />
                <h1 className="text-sm">Remove</h1>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SaveListsCard;
