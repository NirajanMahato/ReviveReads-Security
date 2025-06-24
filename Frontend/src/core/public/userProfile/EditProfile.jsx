import axios from "axios";
import React, { useContext, useRef, useState } from "react";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { UserContext } from "../../../context/UserContext";

const EditProfile = ({ onClose }) => {
  const { userInfo, setUserInfo } = useContext(UserContext);

  const [values, setValues] = useState({
    name: userInfo?.name || "",
    address: userInfo?.address || "",
    phone: userInfo?.phone || "",
    avatar: null,
  });

  const [previewImage, setPreviewImage] = useState(
    userInfo?.avatar
      ? `/api/uploads/users/${userInfo.avatar}`
      : "/api/uploads/users/default_avatar.png"
  );

  // Create a reference for the file input
  const fileInputRef = useRef(null);

  // Phone number validation function
  const isValidNepaliPhone = (phone) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if it starts with valid Nepali prefixes and has 10 digits
    const validPrefixes = [
      "984",
      "985",
      "986",
      "974",
      "975",
      "976",
      "980",
      "981",
      "982",
      "988",
    ];
    return (
      cleanPhone.length === 10 &&
      validPrefixes.some((prefix) => cleanPhone.startsWith(prefix))
    );
  };

  // Update the handleChange function in EditProfile component
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Only allow digits and limit to 10 characters
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      setValues((prev) => ({ ...prev, phone: cleanValue }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload and create a preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues((prev) => ({ ...prev, avatar: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle button click to trigger file input
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Access token and user ID from localStorage
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number if provided
    if (values.phone && !isValidNepaliPhone(values.phone)) {
      toast.error("Please enter a valid Nepali phone number");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("address", values.address);
    if (values.phone) formData.append("phone", values.phone);
    if (values.avatar) formData.append("avatar", values.avatar);

    try {
      const response = await axios.patch("/api/user", formData, { headers });
      setUserInfo(response.data.data);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          <RxCross2 />
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24">
          <img
            src={previewImage}
            alt="user"
            className="w-24 h-24 rounded-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef} // Attach the ref to the file input
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleButtonClick} // Trigger file input click
            className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center bg-gray-700 text-white p-1 rounded-full"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={userInfo?.email}
            readOnly
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div>
            <input
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition duration-200"
        >
          Update Profile
        </button>
      </div>
    </form>
  );
};

export default EditProfile;
