import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-between mt-4 mr-3 rounded-md bg-slate-50 p-1.5">
      <div className="flex pl-1 gap-2 font-gilroyMedium">
        <h1 className="text-gray-500">Total</h1>
        <h1 className="text-gray-700">{totalItems}</h1>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-xl mr-2 p-0.5 disabled:opacity-50 hover:bg-gray-300 rounded-md"
        >
          <IoIosArrowBack />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`w-6 mx-1 h-6 text-xs rounded-full ${
              currentPage === number
                ? "bg-gray-900 text-white"
                : "hover:bg-gray-300"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-xl ml-2 p-0.5 disabled:opacity-50 hover:bg-gray-300 rounded-md"
        >
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
