import React from "react";

const BookDetailsModal = ({ isOpen, onClose, book, onApprove, onDecline }) => {
  if (!isOpen || !book) return null; // Don't render if modal is not open or book is not selected
  const formatMemberSince = (dateString) => {
    const options = { year: "numeric", month: "short" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full sm:w-96 md:w-[600px] lg:w-[650px] p-6">
        {/* Modal Header */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {book.title}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`rounded-full font-gilroyMedium px-2.5 py-[2px] bg-opacity-80 ${
                  book.condition === "Like New"
                    ? "bg-blue-200"
                    : book.condition === "Used"
                    ? "bg-yellow-200"
                    : book.condition === "Brand New"
                    ? "bg-green-200"
                    : book.condition === "Acceptable"
                    ? "bg-purple-200"
                    : "bg-gray-200 bg-opacity-80" // Default for other conditions
                }`}
              >
                {book?.condition}
              </span>
              <p className="text-gray-700 font-gilroySemiBold">
                NPR {book.price}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black font-bold text-2xl border w-8 h-8 rounded-full hover:bg-slate-200"
          >
            &times;
          </button>
        </div>

        {/* Book Details */}
        <div className="mt-6">
          <div className="">
            <span className="grid grid-cols-4 gap-6 mt-2">
              {book.images.slice(0, 6).map((image, index) => (
                <img
                  key={index}
                  className="h-32 w-32 object-cover rounded-lg shadow"
                  src={`/api/uploads/books/${image}`}
                  alt={`Image ${index + 1} of ${book.title}`}
                />
              ))}
            </span>
          </div>
          {/* Seller Info */}
          <div className="border-t border-b border-gray-200 py-3 my-3 mt-6">
            <div className="flex items-center space-x-3">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/customerprofile/${book?.seller._id}`)} // Redirect with user ID
              >
                <img
                  className="h-10 w-10 rounded-full object-cover shadow"
                  src={
                    book?.seller.avatar
                      ? `/api/uploads/users/${book?.seller.avatar}`
                      : "/api/uploads/users/default_avatar.png"
                  }
                  alt="Seller profile"
                />
              </div>
              <div>
                <h3 className="text-sm text-gray-900">
                  Sold by <b className="font-ppMori">{book?.seller.name}</b>
                </h3>
                <p className="text-xs text-gray-500">
                  Member since: {formatMemberSince(book?.seller.createdAt)} •{" "}
                  {book?.seller.address}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-4">
            <p className="text-sm text-gray-600">
              <strong>Genre:</strong> {book.genre}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Delivery:</strong>{" "}
              {book?.delivery
                ? "Available"
                : "No delivery available"}
            </p>
          </div>
          <div className="mt-1">
            <h4 className="text-sm font-gilroySemiBold text-gray-600">
              Description:
            </h4>
            <p className="text-sm mt-1 text-gray-600  rounded-md p-1.5 border">
              {book.description || "No description provided."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-1/3 flex justify-between mt-6 gap-4">
            <button
              onClick={() => onApprove(book._id, "Approved")}
              className="w-full py-3 text-white bg-green-600 rounded-lg text-sm font-semibold hover:bg-green-700 transition duration-200"
            >
              Approve
            </button>
            <button
              onClick={() => onDecline(book._id, "Declined")}
              className="w-full py-3 text-white bg-red-600 rounded-lg text-sm font-semibold hover:bg-red-700 transition duration-200"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
