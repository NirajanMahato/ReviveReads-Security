import axios from "axios";
import { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import BottomNavBar from "../../../components/BottomNavBar";
import Navbar from "../../../components/Navbar";
import useUserBooks from "../../../hooks/useUserBooks";
import BookCard from "../homePage/BookCard";

const CustomerProfile = () => {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { allBooks } = useUserBooks(userId);

  // Fetch user details using Axios
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `/api/user/get-user-by-id/${userId}` // Adjust endpoint
        );
        setUserInfo(response.data);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [userId]);

  // Format Date
  const formatMemberSince = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Display Loading or Error Message
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  // Render Profile Page
  return (
    <div className="mx-auto max-w-[1300px]">
      <Navbar />
      <div className="md:px-8 px-2 lg:mt-0 md:mt-6 pb-20 md:flex gap-4 font-gilroyMedium">
        {/* User Info Card */}
        <div className="md:w-1/4 w-full md:h-96 flex flex-col items-center rounded-lg md:shadow p-6">
          <div className="md:w-24 md:h-24 w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
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
          <h2 className="text-xl font-semibold">{userInfo?.name}</h2>
          <p className="text-gray-500 font-gilroyLight text-sm">
            {userInfo?.email}
          </p>
          <div className="flex items-center mt-2">
            <FaLocationDot className="text-gray-400 mr-2" />
            <span className="text-gray-500">{userInfo?.address || "N/A"}</span>
          </div>

          <div className="border-t mt-3 pt-2">
            <p className="text-sm text-gray-500">
              Member since: {formatMemberSince(userInfo?.createdAt)}
            </p>
          </div>
          <button className="rounded-lg mt-4 bg-gray-800 w-full bg-custom text-white py-2 font-medium">
            Block user
          </button>
        </div>

        {/* Ad Posts Section */}
        <div className="md:w-3/4 shadow rounded-lg">
          <div className="border-b">
            <ul className="xl:w-2/5 lg:w-3/5 flex items-center justify-between md:px-6 px-3 py-4 font-gilroy">
              <li
                className={
                  "cursor-pointer border rounded-3xl px-3 py-1 font-semibold text-white bg-gray-700 shadow-md"
                }
              >
                Ad Posts
              </li>
            </ul>
          </div>

          {/* Fetch and Display Ads for this User */}
          <div className="px-2 py-4 gap-10">
            <BookCard products={allBooks} userId />
          </div>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default CustomerProfile;
