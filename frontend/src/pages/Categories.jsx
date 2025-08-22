import React from "react";
import { Outlet } from "react-router-dom";

export default function Categories() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 text-2xl font-bold text-blue-600 ">MONDAY</div>
      </aside>
    </div>
  );
}
