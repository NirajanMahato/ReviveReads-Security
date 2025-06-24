import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const AddBookModal = ({ showModal, closeModal, editBook = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    description: "",
    price: "",
    condition: "",
    delivery: false,
    images: [],
  });

  // Populate form data when editing
  useEffect(() => {
    if (editBook) {
      setFormData({
        title: editBook.title || "",
        genre: editBook.genre || "",
        description: editBook.description || "",
        price: editBook.price || "",
        condition: editBook.condition || "",
        delivery: editBook.delivery || false,
        images: [],
      });
    }
  }, [editBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...Array.from(files)],
      }));
    }
  };

  const removeImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  // Reference for the file input
  const fileInputRef = useRef(null);
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (key !== 'images') {
        form.append(key, formData[key]);
      }
    });

    // Append images
    formData.images.forEach((image) => {
      form.append("images", image);
    });

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      let response;
      if (editBook) {
        // Update existing book
        response = await axios.patch(
          `/api/book/update-book/${editBook._id}`,
          form,
          { headers }
        );
        toast.success("Book updated successfully");
      } else {
        // Create new book
        response = await axios.post("/api/book/post-book", form, { headers });
        toast.success("Book posted successfully");
      }

      // Reset form and close modal
      setFormData({
        title: "",
        genre: "",
        description: "",
        price: "",
        condition: "",
        delivery: false,
        images: [],
      });
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const genres = [
    "Arts & Photography",
    "Fiction",
    "Non Fiction & Biography",
    "Educational Textbook",
    "Magazines & Comics",
    "Technology",
    "Romance",
    "Other",
  ];

  if (!showModal) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white md:px-7 p-4 py-4 rounded-lg w-[650px] h-[620px] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {editBook ? "Edit Book" : "Post Your Book"}
          </h2>
          <button
            onClick={closeModal}
            className="text-black font-bold text-2xl border w-8 h-8 rounded-full hover:bg-slate-200"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="">
            <label htmlFor="title" className="block text-sm font-semibold">
              Book Title
            </label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
              placeholder="Enter the book title"
              required
            />
          </div>

          <div className="mt-3">
            <label
              htmlFor="description"
              className="block text-sm font-semibold"
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
              placeholder="Enter a description of the book"
              required
            />
          </div>

          <div className="mt-2 flex justify-between md:gap-4 gap-3">
            <div className="w-full">
              <label htmlFor="genre" className="block text-sm font-semibold">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full md:px-4 px-2 py-2 mt-1 md:text-base text-sm border border-gray-300 rounded-md"
                required
              >
                <option value="" disabled>
                  Select a genre
                </option>
                {genres.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label
                htmlFor="condition"
                className="block text-sm font-semibold"
              >
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full md:px-4 px-2 py-2 mt-1 md:text-base text-sm border border-gray-300 rounded-md"
                required
              >
                <option value="" disabled>
                  Select Condition
                </option>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Used">Used</option>
                <option value="Acceptable">Acceptable</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex justify-between items-end md:gap-6 gap-4">
            <div className="w-full">
              <label htmlFor="price" className="block text-sm font-semibold">
                Price
              </label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md no-arrows"
                placeholder="Enter the price"
                required
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "+" || e.key === "e") {
                    e.preventDefault(); // Prevents typing +, -, and 'e' (scientific notation)
                  }
                }}
              />
            </div>
            <div className="w-full">
              <label htmlFor="delivery" className="block text-sm font-semibold">
                Delivery Available
              </label>
              <input
                id="delivery"
                name="delivery"
                type="checkbox"
                checked={formData.delivery}
                onChange={() =>
                  setFormData((prevData) => ({
                    ...prevData,
                    delivery: !prevData.delivery,
                  }))
                }
                className="mr-2"
              />
              Yes
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="images" className="block text-sm font-semibold">
              Upload Images
            </label>

            <div className="flex md:gap-4 gap-2 mt-2">
              {/* Display selected images */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="md:w-32 md:h-28 w-16 h-16 relative group"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      className="md:w-32 md:h-28 w-16 h-16 object-cover rounded-md"
                    />
                    {/* Remove button for each image */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 text-black bg-white px-1 py-0.5 rounded-full shadow opacity-0 group-hover:opacity-100 hover:bg-gray-400 hover:text-black transition-opacity"
                    >
                      <RxCross2 />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input to add more images */}
              <input
                type="file"
                name="images"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.images.length < 4 && (
                <div
                  onClick={handleButtonClick}
                  className="md:w-32 md:h-28 w-16 h-16 text-gray-500 border-dashed border-2 border-gray-400 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:border-gray-600 hover:bg-gray-100 transition duration-300"
                >
                  <FaCloudUploadAlt className="md:text-5xl text-3xl" />
                  <h1 className="md:text-sm text-[8px] font-gilroyMedium md:block hidden">
                    Click to upload
                  </h1>
                  <h1 className="text-gray-400 md:text-[10px] text-[6px]">
                    Maximum 4 images
                  </h1>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-black transition duration-300"
          >
            {editBook ? "Update Book" : "Post Book"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
