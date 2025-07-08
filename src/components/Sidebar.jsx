import React from 'react'
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, CircleUserRound, Bell, LayoutDashboard, Settings, Users, Package } from "lucide-react";
import { useAuth } from "../utils/idb.jsx";
import logo from '../assets/logo.png';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#fff7f1] text-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:block`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-full" />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white hover:text-[#f58737] transition
              ${pathname === "/" ? "bg-[#f58737] text-white font-semibold" : "text-black"}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link 
            to="/services"
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white hover:text-[#f58737] transition
              ${pathname.startsWith("/services") ? "bg-[#f58737] text-white font-semibold" : "text-black"}`}
          >
            <Settings size={18} />
            Services
          </Link>

          <Link 
            to="/packages"
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white hover:text-[#f58737] transition
              ${pathname.startsWith("/packages") ? "bg-[#f58737] text-white font-semibold" : "text-black"}`}
          >
            <Package size={18} />
            Packages
          </Link>

          <Link 
            to="/users"
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white hover:text-[#f58737] transition
              ${pathname.startsWith("/users") ? "bg-[#f58737] text-white font-semibold" : "text-black"}`}
          >
            <Users size={18} />
            Users
          </Link>

          {/* <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-white hover:bg-red-500 hover:text-white text-black transition"
          >
            <LogOut size={18} />
            Logout
          </button> */}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  )
}

export default Sidebar;
