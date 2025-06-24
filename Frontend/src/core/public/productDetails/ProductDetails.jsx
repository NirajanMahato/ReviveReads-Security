import { formatDistanceToNowStrict, parseISO } from "date-fns";
import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { GoClockFill } from "react-icons/go";
import { MdLocalShipping, MdOutlineBookmarkAdd } from "react-icons/md";
import { RiMessage3Line } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { handleChatNow, handleSaveBook } from "../../../hooks/bookActions";

import Navbar from "../../../components/Navbar";
import SimpleMap from "../../../components/SimpleMap";
import useProductDetails from "../../../hooks/useProductDetails";
import ChatModal from "../homePage/ChatModal";

const ProductDetails = () => {
  const { bookId } = useParams();
  const { product, loading, error } = useProductDetails(bookId);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const authenticateToken = localStorage.getItem("token");
  const handleOpenChatModal = async (sellerId) => {
    const chatReady = await handleChatNow(sellerId, authenticateToken);
    if (chatReady) {
      setIsChatOpen(true); // Open modal only if chat setup is successful
    }
  };

  const navigate = useNavigate();

  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading product details.
      </div>
    );
  }

  const formatMemberSince = (dateString) => {
    const options = { year: "numeric", month: "short" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navbar />
      <div className="flex lg:flex-row flex-col lg:items-start md:items-center md:px-8 px-5 lg:mt-3 md:mt-3 pb-6">
        {/* Product Image Section */}
        <div className="lg:w-1/3 md:w-1/2">
          <div className="flex justify-center rounded-lg pt-4 md:pb-8 pb-4">
            <img
              src={`/api/uploads/books/${mainImage || product?.images[0]}`}
              alt="book"
              className="rounded-lg object-cover md:w-80 w-44 md:h-96 h-56"
            />
          </div>
          <div className="flex justify-start gap-3 md:pl-10 pl-16">
            {product?.images.map((image, index) => (
              <img
                key={index}
                src={`/api/uploads/books/${image}`}
                alt={`Book Image ${index + 1}`}
                className={`rounded-lg object-cover md:w-16 w-10 md:h-16 h-10 cursor-pointer transition-transform ${
                  mainImage === image
                    ? "border-2 border-gray-500 transform scale-105"
                    : "hover:scale-105"
                }`}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="lg:w-2/3 w-full lg:pl-8 lg:pr-2 lg:mt-0 mt-6">
          <h1 className="lg:text-3xl md:text-2xl text-xl font-ppMori text-gray-900">
            {product?.title}
          </h1>
          <h1 className="md:text-xl font-gilroyMedium text-gray-500 mt-1 pl-1">
            रू. {product?.price}
          </h1>

          {/* Seller Info */}
          <div className="border-t border-b border-gray-200 py-3 my-3">
            <div className="flex items-center space-x-4">
              <div
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/customerprofile/${product?.seller._id}`)
                } // Redirect with user ID
              >
                <img
                  className="h-12 w-12 rounded-full object-cover shadow"
                  src={
                    product?.seller.avatar
                      ? `/api/uploads/users/${product?.seller.avatar}`
                      : "/api/uploads/users/default_avatar.png"
                  }
                  alt="Seller profile"
                />
              </div>
              <div>
                <h3 className="text-sm text-gray-900">
                  Sold by <b className="font-ppMori">{product?.seller.name}</b>
                </h3>
                <p className="text-xs text-gray-500">
                  Member since: {formatMemberSince(product?.seller.createdAt)} •{" "}
                  {product?.seller.address}
                </p>
              </div>
            </div>
          </div>

          <div className="">
            <h2 className="text-xl font-gilroySemiBold text-gray-900">
              Book Details
            </h2>
            <div className="grid grid-cols-2 md:gap-x-4 gap-x-0 gap-y-3 font-gilroyMedium mt-1">
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="text-sm font-medium text-gray-900">
                  {product?.condition}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Genre</p>
                <p className="text-sm font-medium text-gray-900">
                  {" "}
                  {product?.genre}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-6 lg:pr-14">
            <button
              onClick={() => handleSaveBook(product?._id, authenticateToken)}
              className="rounded-lg shadow-lg flex items-center justify-center w-1/2 bg-black hover:bg-gray-800 text-white py-3"
            >
              <MdOutlineBookmarkAdd className="md:text-xl  mr-1" />
              Save
            </button>
            <button
              onClick={() => handleOpenChatModal(product?.seller?._id)}
              className="rounded-lg shadow-lg flex items-center justify-center w-1/2 bg-green-700 hover:bg-green-800 text-white py-3"
            >
              <RiMessage3Line className="md:text-xl  mr-1" />
              Chat Now
            </button>
          </div>

          <div className="text-sm mt-3 font-gilroyMedium text-gray-500">
            <span className="flex items-center">
              <GoClockFill />
              <h1 className="pl-1">
                {product?.createdAt
                  ? `Posted ${formatDistanceToNowStrict(
                      parseISO(product.createdAt)
                    )} ago`
                  : "Posted just now"}
              </h1>
            </span>
            <span className="flex items-center">
              <MdLocalShipping />
              <h1 className="pl-1">
                {product?.delivery
                  ? "Shipping: रू. 60 • Delivery in 1-3 business days"
                  : "No delivery available"}
              </h1>
            </span>
          </div>

          <div className="flex border-b mt-4 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`mr-4 pb-2 text-lg font-gilroyMedium ${
                activeTab === "description"
                  ? "text-gray-900 font-gilroySemiBold border-b-2 border-gray-900"
                  : "text-gray-700 border-b-2 border-transparent"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`pb-2 text-lg font-gilroyMedium ${
                activeTab === "location"
                  ? "text-gray-900 font-gilroySemiBold border-b-2 border-gray-900"
                  : "text-gray-700 border-b-2 border-transparent"
              }`}
            >
              Location
            </button>
          </div>

          {activeTab === "description" && (
            <div className="p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">{product?.description}</p>
            </div>
          )}

          {activeTab === "location" && (
            <div className="md:p-6 rounded-lg border border-gray-200">
              {product?.seller?.address ? (
                <SimpleMap address={product.seller.address} />
              ) : (
                <div className="relative md:h-48 h-28 rounded-lg overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
                  <FaLocationDot className="text-2xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Location not specified
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </>
  );
};

export default ProductDetails;
