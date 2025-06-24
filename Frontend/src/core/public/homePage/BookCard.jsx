import { formatDistanceToNowStrict } from "date-fns";
import { useState } from "react";
import { MdOutlineBookmarkAdd } from "react-icons/md";
import { RiMessage3Line } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import { handleChatNow, handleSaveBook } from "../../../hooks/bookActions";
import ChatModal from "./ChatModal";

const BookCard = ({ products }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const authenticateToken = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const handleOpenChatModal = async (sellerId) => {
    const chatReady = await handleChatNow(sellerId, authenticateToken);
    if (chatReady) {
      setIsChatOpen(true); // Open modal only if chat setup is successful
    }
  };

  const location = useLocation();
  const gridClasses =
    location.pathname === "/"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 xl:grid-cols-2 lg:px-8";

  return (
    <div className={`grid gap-x-10 md:gap-y-8 gap-y-5 mt-6 ${gridClasses}`}>
      {products.map((product) => (
        <div
          key={product?._id}
          className="flex flex-col md:flex-row items-center max-w-96 border rounded-lg p-3 hover:shadow-lg hover:bg-blue-50 hover:bg-opacity-50 hover:border-gray-300 transition-all delay-75"
        >
          {product?.seller?._id !== userId ? (
            <Link to={`/products/${product?._id}`} className="md:w-44 w-full">
              <img
                src={`/api/uploads/books/${product?.images[0]}`}
                alt={product.title}
                className="w-full h-40 md:h-44 object-cover rounded-lg hover:scale-105 transition-all delay-75 hover:cursor-pointer"
              />
            </Link>
          ) : (
            <div className="md:w-44 w-full">
              <img
                src={`/api/uploads/books/${product?.images[0]}`}
                alt={product.title}
                className="w-full h-40 md:h-44 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="info-div flex flex-col px-2 py-2 w-full">
            <div className="hover:cursor-pointer">
              <h1
                className="font-gilroySemiBold md:text-lg"
                style={{ lineHeight: "1" }}
              >
                {product?.title}
              </h1>
              <h1
                className="md:text-xs text-[10px] text-gray-600 mt-1"
                style={{ lineHeight: "1" }}
              >
                {product.description.length > 50
                  ? `${product?.description.substring(0, 50)}...`
                  : product?.description}
              </h1>
            </div>
            <div className="flex items-center justify-between md:mt-3 mt-1">
              <h1 className="font-gilroySemiBold text-gray-700 md:text-lg text-sm">
                NPR {product?.price}
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
                    : "bg-gray-200 bg-opacity-80"
                }`}
              >
                {product?.condition}
              </h1>
            </div>
            <div className="flex md:text-xs text-[11px] justify-between border-b md:pb-2 pb-1">
              <h1>{product.seller?.address}</h1>
              <h1>
                {formatDistanceToNowStrict(new Date(product?.updatedAt))} ago
              </h1>
            </div>
            <div className="flex mt-3 justify-between text-gray-600">
              <button
                onClick={() => handleSaveBook(product?._id, authenticateToken)}
                disabled={product?.seller?._id === userId}
                className="flex items-center hover:text-yellow-600"
              >
                <MdOutlineBookmarkAdd className="text-xl" />
                <span className="text-sm ml-1">Save</span>
              </button>
              <button
                onClick={() => handleOpenChatModal(product?.seller?._id)}
                disabled={product?.seller?._id === userId}
                className="flex items-center hover:text-green-700"
              >
                <RiMessage3Line className="text-xl" />
                <span className="text-sm ml-1">Chat now</span>
              </button>
            </div>
          </div>
        </div>
      ))}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default BookCard;
