import React, { useContext, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { UserContext } from "../../../context/UserContext";
import EditProfile from "../../public/userProfile/EditProfile";

const Settings = () => {
  const { userInfo } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditProfile = () => {
    setIsEditing(!isEditing); // Toggle between edit and view mode
  };

  const closeEditProfile = () => {
    setIsEditing(false); // Close the edit view
  };
  return (
    <div className="px-4 py-1.5 bg-gray-100 min-h-screen">
      <div className="md:px-8 px-2 lg:mt-0 md:mt-6 pb-20 md:flex gap-4 font-gilroyMedium">
        {isEditing ? (
          <div className="w-full bg-white flex flex-col items-center rounded-lg md:shadow p-6">
            <EditProfile onClose={closeEditProfile} />
          </div>
        ) : (
          <div className="w-full bg-white md:h-96 flex flex-col items-center rounded-lg md:shadow p-6">
            <div className="flex items-center justify-center mb-4 gap-3">
              <div className="md:w-24 md:h-24 w-20 h-20">
                <img
                  src={
                    userInfo?.avatar
                      ? `/api/uploads/users/${userInfo.avatar}`
                      : "/api/uploads/users/default_avatar.png"
                  }
                  alt="user"
                  className="md:w-24 md:h-24 w-20 h-20 object-cover rounded-full"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{userInfo?.name}</h2>
                <p className="text-gray-500 font-gilroyLight text-sm -mt-1">
                  {userInfo?.email}
                </p>
                <div className="flex items-center mt-1 text-xs -ml-0.5">
                  <FaLocationDot className="text-gray-400 mr-0.5" />
                  <span className="text-gray-500">
                    {userInfo?.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={toggleEditProfile}
              className="rounded-lg mt-4 bg-gray-800 w-28 bg-custom text-white py-2 font-medium"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
