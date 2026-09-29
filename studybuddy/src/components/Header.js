import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../images/StudyBuddy.png";
import Avatar from "../images/avatar.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for managing the dropdown visibility

  const handleNavigation = (route) => {
    if (location.pathname !== route) {
      navigate(route);
    }
  };

  const handleLogout = () => {
    // Add the logic for logging out, such as clearing tokens or session storage
    localStorage.removeItem("authToken"); // Assuming you're storing the auth token in localStorage
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <div className="flex items-center justify-between py-4 px-8 shadow-lg z-50">
    {/* // <div className="flex items-center gap-6 py-4 px-8 shadow-lg z-50 flex-nowrap"> */}

      <div className="flex items-center w-2/3 space-x-16">
        <img src={Logo} alt="StudyBuddy Logo" className="w-40" />
        <div className="flex items-center gap-6">
          <button
            className={`text-lg font-semibold px-5 py-2 rounded-lg transition duration-300 ease-in-out ${
              location.pathname === "/dashboard"
                ? "bg-[#BC7BDA] text-white shadow-lg"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
            onClick={() => handleNavigation("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`text-lg font-semibold px-5 py-2 rounded-lg transition duration-300 ease-in-out ${
              location.pathname === "/Quiz"
                ? "bg-[#BC7BDA] text-white shadow-lg"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
            onClick={() => handleNavigation("/Quiz")}
          >
            Assessments
          </button>
          <button
            className={`text-lg font-semibold px-5 py-2 rounded-lg transition duration-300 ease-in-out ${
              location.pathname === "/summarization"
                ? "bg-[#BC7BDA] text-white shadow-lg"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
            onClick={() => handleNavigation("/summarization")}
          >
            Summarization
          </button>
          <button
            className={`text-lg font-semibold px-5 py-2 rounded-lg transition duration-300 ease-in-out ${
              location.pathname === "/chatbot"
                ? "bg-[#BC7BDA] text-white shadow-lg"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
            onClick={() => handleNavigation("/chatbot")}
          >
            Chatbot
          </button>
          <button
            className={`text-lg font-semibold px-5 py-2 rounded-lg transition duration-300 ease-in-out ${
              location.pathname === "/pronunciation"
                ? "bg-[#BC7BDA] text-white shadow-lg"
                : "bg-transparent text-black hover:bg-gray-100"
            }`}
            onClick={() => handleNavigation("/pronunciation")}
          >
            Language Support
          </button>
        </div>
      </div>
      <div className="relative">
        <img
          className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-lg cursor-pointer"
          src={Avatar}
          alt="User Avatar"
          onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle the dropdown when clicked
        />
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border">
            <button
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
              onClick={() => {
                setDropdownOpen(false);
                navigate("/settings"); // Navigate to settings page
              }}
            >
              Settings
            </button>
            <button
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
              onClick={() => {
                setDropdownOpen(false);
                handleLogout(); // Handle the logout action
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;