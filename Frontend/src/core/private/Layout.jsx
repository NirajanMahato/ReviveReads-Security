import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const Layout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarExpanded((prevState) => !prevState);
  };

  return (
    <div className="flex mx-auto max-w-[1270px]">
      <div className="top-0 left-0 bottom-0 z-50">
        <Sidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
      </div>

      <div
        className={`flex-grow p-4 bg-gray-100 transition-all duration-300 ${
          sidebarExpanded ? "ml-60" : "ml-16"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
