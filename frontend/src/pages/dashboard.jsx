import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { useState } from "react";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
  }`;

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch { }
    logout();
    navigate("/");
  };

  const userName = user?.name || "User";
  const userRole = user?.roles?.[0] || "user";
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">WareHousePro</p>
            <p className="text-slate-500 text-xs mt-0.5">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/dashboard" end className={navLinkClass}>
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/products" className={navLinkClass}>
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/categories" className={navLinkClass}>
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/warehouses" className={navLinkClass}>
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Warehouses
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/merchants" className={navLinkClass}>
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Merchants
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/transactions" className={navLinkClass}>
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Transactions
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Admin only section */}
        {isAdmin() && (
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Admin</p>
            <ul className="space-y-1">
              <li>
                <NavLink to="/dashboard/users" className={navLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  Manage Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/roles" className={navLinkClass}>
                  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Roles
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 border-r border-slate-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transform transition-transform lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>

          <div className="relative flex-1 max-w-sm hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
            <input type="text" placeholder="Cari..." className="w-full bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${isAdmin() ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {isAdmin() ? "Admin" : "User"}
            </span>
            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}