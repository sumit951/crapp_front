import { useAuth } from "../utils/idb.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { LogOut, CircleUserRound, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


  
  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  

  return (
    <header className="bg-white text-[#092e46] shadow-md">
      <div className=" mx-auto flex items-center justify-between px-4 py-2">
        <h1
          className="text-2xl font-bold flex items-center cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        >
          <span role="img" aria-label="plate">
            <h1 className="text-gray-600"></h1>
          </span>{" "}
          
        </h1>

        {user ? (
          <div className="flex items-center space-x-4 text-sm">
            
            <div className="flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content={user.email}
                className="flex items-center px-2 py-2 rounded-md bg-gray-100 text-black  transition mr-3"
              >
                <CircleUserRound className="mr-1 pt-1" size={20} />
                <span className=" f-13">{user.name}</span>
              </button>
              <button
                onClick={logout}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center px-2 py-2 rounded-md bg-gray-100 text-black  transition"
              >
                <LogOut className="" size={13} />
              </button>
            </div>
          </div>
        ) : (
          navigate("/login")
        )}
      </div>

      <AnimatePresence>
        
      </AnimatePresence>
    </header>
  );
}
