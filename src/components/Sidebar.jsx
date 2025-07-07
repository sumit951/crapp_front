import { useAuth } from "../utils/idb.jsx";
import React from 'react'
import { LogOut, CircleUserRound, Bell } from "lucide-react";
import {useNavigate, Link } from "react-router-dom";
import logo from '../assets/logo.png';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { user, logout } = useAuth();
  return (
    <>
        {/* Sidebar */}
        <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#092e46] text-white transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:block`}
        >
            <div className="p-4 text-xl font-bold border-b border-white/20">
            <img src={logo} alt="Logo" />
            </div>
            <nav className="flex-1 p-4 space-y-4">
            <Link to="/" className="block hover:underline">Dashboard</Link>
            <Link to="/services" className="block hover:underline">Services</Link>
            <Link to="/packages" className="block hover:underline">Packages</Link>
            <Link to="/users" className="block hover:underline">Users</Link>
            <button
                onClick={logout}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center px-2 py-2 rounded-md bg-gray-100 text-black  transition"
              >
                <LogOut className="" size={13} />
              </button>
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

export default Sidebar