import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { createContext, useContext } from "react";
import { FaBook } from "react-icons/fa6";
import { FiSettings, FiUsers } from "react-icons/fi";
import { PiChartLine } from "react-icons/pi";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import logo2 from "/Logos/Logo2.png";

const SidebarContext = createContext();

export default function Sidebar({ expanded, onToggle }) {
  const { userInfo, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const iconClassName = "text-xl";
  const sidebarItems = [
    {
      id: 1,
      icon: <PiChartLine />,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    { id: 2, icon: <FiUsers />, label: "Users", path: "/admin/users" },
    {
      id: 3,
      icon: <FaBook />,
      label: "Book Listings",
      path: "/admin/booklistings",
    },
    { id: 4, icon: <FiSettings />, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside
      className={`h-screen transition-all duration-300 fixed top-0 left-0 bottom-0 z-50 ${
        expanded ? "w-60" : "w-16"
      }`}
    >
      <nav className="h-full flex flex-col border-r shadow-sm">
        {/* Logo Section */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src={logo2}
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? "w-32" : "w-0"
            }`}
            alt="ReviveReads"
          />
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700"
          >
            {expanded ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        {/* Sidebar Items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-2 text-sm">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                text={item.label}
                path={item.path}
                iconClassName={iconClassName}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        {/* Profile Section */}
        <div className="border-t flex p-3 items-center cursor-pointer hover:bg-gray-100 dropdown dropdown-hover dropdown-top dropdown-content">
          <img
            src={
              userInfo?.avatar
                ? `/api/uploads/users/${userInfo.avatar}`
                : "/api/uploads/users/default_avatar.png"
            }
            alt={userInfo?.name}
            className="w-10 h-10 rounded-md object-cover"
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{userInfo?.name}</h4>
              <span className="text-xs text-gray-600">{userInfo?.email}</span>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-gray-100 rounded-box z-[1] w-52 p-2 shadow text-lg font-gilroyMedium"
          >
            <li>
              <a
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  navigate("/");
                }}
              >
                Home
              </a>
            </li>
            <li>
              <button onClick={handleLogout} className="text-red-600">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

// SidebarItem Component with Routing
function SidebarItem({ icon, text, path, iconClassName }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `relative flex items-center py-2.5 px-3 my-1 font-gilroyMedium rounded-md cursor-pointer transition-colors group
        ${
          isActive
            ? "bg-gradient-to-tr from-gray-800 to-gray-500 text-white"
            : "hover:bg-gray-50 text-gray-600"
        }`
      }
    >
      {/* Apply iconClassName dynamically */}
      <span className={`text-2xl ${iconClassName}`}>{icon}</span>
      <span
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "w-32 ml-3" : "w-0 h-0"
        }`}
      >
        {text}
      </span>

      {/* Tooltip for collapsed state */}
      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </NavLink>
  );
}
