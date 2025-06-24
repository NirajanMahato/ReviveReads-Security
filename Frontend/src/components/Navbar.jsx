import React, { useContext, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import NotificationDropdown from "../core/public/notifications/NotificationDropdown";
import useApprovedBooks from "../hooks/useApprovedBooks";
import UserMenu from "./UserMenu";
import logo1 from "/Logos/Logo1.png";
import logo2 from "/Logos/Logo2.png";

const Navbar = () => {
  const { allBooks } = useApprovedBooks();
  const [search, setSearch] = useState("");
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const { userInfo, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredBooks = allBooks.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleBookClick = (bookId) => {
    setIsSearchBoxVisible(false);
    setSearch('');
    navigate(`/products/${bookId}`);
  };

  return (
    <div className="relative w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between md:pl-8 sm:px-6 px-4 py-4">
        <div className="inline-flex items-center space-x-2 lg:w-3/12">
          <Link to={"/"}>
            <img
              src={logo2}
              className={"lg:w-36 lg:block hidden"}
              alt={"logo"}
            />
          </Link>
          <button>
            <img
              src={logo1}
              className={"lg:hidden md:w-14 w-10"}
              alt={"logo"}
            />
          </button>
        </div>
        <div className="md:flex grow items-center justify-between lg:w-10/12">
          <div className="flex items-center justify-end w-full lg:pr-8 pr-2">
            <div className={"lg:w-64 md:w-40 w-36 h-[39px] flex items-center justify-between rounded-lg px-2 bg-gray-200"}>
              <input
                type={"search"}
                placeholder={"Search Book"}
                className={"w-full lg:pl-4 md:pl-2 bg-transparent text-center"}
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchBoxVisible(true)}
              />
              <span className={"animate-pulse text-xl text-gray-600 cursor-pointer"}>
                <LuSearch />
              </span>
            </div>
          </div>
          <div className="md:flex hidden items-center">
            <NotificationDropdown />
            <span className="border-l-2 border-gray-400 rounded-full h-7 ml-2"></span>
            {!loading && <UserMenu userInfo={userInfo} />}
          </div>
        </div>
      </div>

      {/* Search suggestions box */}
      {isSearchBoxVisible && search && (
        <div 
          className="absolute top-full left-0 w-full bg-white shadow-lg z-50 rounded-b-lg"
          onMouseDown={(e) => e.preventDefault()} // Prevent onBlur when clicking inside suggestions
        >
          <ul>
            {filteredBooks.map((book) => (
              <li
                key={book._id}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer font-gilroyMedium text-gray-700"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookClick(book._id);
                }}
              >
                <span className="block w-full h-full">
                  {book.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;