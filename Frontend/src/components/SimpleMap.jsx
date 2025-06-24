import React from "react";
import { FaLocationDot } from "react-icons/fa6";

const SimpleMap = ({ address }) => {
  // Convert address to URL-friendly format
  const encodedAddress = encodeURIComponent(address);

  return (
    <div className="relative md:h-48 h-28 rounded-lg overflow-hidden">
      <iframe
        title="Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=85.2937,27.6588,85.3765,27.7297&layer=mapnik&marker=${encodedAddress}`}
      />
      <div className="absolute flex items-center bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm shadow-md">
        <FaLocationDot className="mr-1" />
        {address || "Location not specified"}
      </div>
    </div>
  );
};

export default SimpleMap;
