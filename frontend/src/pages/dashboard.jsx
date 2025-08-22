import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
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

        <div className="mt-8 px-4">
          <h3 className="text-sm text-gray-500 font-semibold mb-2">
            Account Settings
          </h3>
          <ul className="space-y-2">
            <li className="hover:text-blue-500">Roles</li>
            <li className="hover:text-blue-500">Manage Users</li>
            <li className="hover:text-blue-500">Settings</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4 border p-2 rounded-lg bg-white shadow text-black ">
            Overview
            <button className="p-2 bg-gray-100 rounded-full">🔍</button>
            <button className="p-2 bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 bg-green-100 rounded-full text-green-600 font-bold">
              PRO
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <div className="text-right">
              <p className="font-semibold">Manager User</p>
              <p className="text-sm text-gray-500">manager</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-black">Total Revenue</p>
            <h2 className="text-2xl font-bold text-black">Rp 0</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-black">Total Transactions</p>
            <h2 className="text-2xl font-bold text-black">0</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-black">Products Sold</p>
            <h2 className="text-2xl font-bold text-black">0</h2>
          </div>
        </div>

        {/* Promo Card */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-xl mb-6 shadow border">
            <h3 className="text-lg font-bold">Access Pro Featured</h3>
            <p className="mt-2">
              Track, Manage, and Distribute <br /> Stock Easily! 🚀
            </p>
            <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
              Upgrade Now
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h3 className="text-lg text-black">Lastes Transaction</h3>
          </div>
        </div>

        {/* Lastest Transaction */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">Lastest Transaction</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Shen Zhen</p>
              <p className="text-sm text-gray-500">0812345672132</p>
              <p className="text-sm text-gray-700 mt-2">Product Assigned (2)</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Toko Sebelah Menara</p>
              <p className="text-blue-600 font-bold">Rp 2.164.800</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
