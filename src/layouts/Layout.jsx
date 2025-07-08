import { useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex w-full">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full">
        {/* Mobile toggle button */}
        <div className="md:hidden p-4 bg-white border-b">
          <button
            className="text-[#092e46]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
        <Header />

        <main
          className="flex-grow w-full overflow-y-auto"
          id="scroll-container"
        >
          <div className="container m-0 max-w-[100%]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-[#ddd] bg-[#fff] text-[#092e46] px-4 py-3 flex items-center justify-center">
          <p className="text-sm">
            © {new Date().getFullYear()} All Rights Reserved by Chanakya Research, 2011-2025
          </p>
        </footer>
      </div>
    </div>

  );
}
