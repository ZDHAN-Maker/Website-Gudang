import React from "react";
import { Outlet } from "react-router-dom";

export default function Categories() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 text-2xl font-bold text-blue-600 ">MONDAY</div>
        <nav className="mt-6 text-gray-500 p-5 mb-2">
          Main Menu
          <ul className="space-y-2 px-4 text-black">
            <li className="hover:text-blue-500 mb-5 mt-5 cursor-pointer">
              <Link to="/dashboard">Overview</Link>
            </li>
            <li className="hover:text-blue-500 mb-5 mt-5 cursor-pointer">
              <Link to="/dashboard/product">Product</Link>
            </li>
            <li className="hover:text-blue-500 mb-5 mt-5 cursor-pointer">
              <Link to="/dashboard/categories">Categories</Link>
            </li>
            <li className="hover:text-blue-500 mb-5 mt-5 cursor-pointer">
              <Link to="/dashboard/warehouses">Warehouses</Link>
            </li>
            <li className="hover:text-blue-500 mb-5 mt-5 cursor-pointer">
              <Link to="/dashboard/merchants">Merchants</Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}
