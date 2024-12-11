import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to handle menu toggle

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to the login page after logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-500 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">
          <Link to="/">Online Polling System</Link>
        </h1>

        {/* Menu for larger screens */}
        <nav className="hidden md:block">
          <ul className="flex gap-4">
            {auth.user ? (
              <>
                <li>
                  <span className="font-medium">Welcome, {auth.user.username}</span>
                </li>
                <li>
                  <Link
                    to="/polls/create"
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                  >
                    Create Poll
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/dashboard"
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/profile"
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:underline px-3 py-1 rounded">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:underline px-3 py-1 rounded">
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Hamburger Menu Button for smaller screens */}
        <button
          className="md:hidden bg-blue-700 px-3 py-1 rounded hover:bg-blue-600"
          onClick={toggleMenu}
        >
          ☰
        </button>
      </div>

      {/* Dropdown Menu for smaller screens */}
      {isMenuOpen && (
        <nav className="md:hidden mt-4 bg-blue-600 rounded shadow">
          <ul className="flex flex-col gap-2 p-4">
            {auth.user ? (
              <>
                <li>
                  <span className="font-medium">Welcome, {auth.user.username}</span>
                </li>
                <li>
                  <Link
                    to="/polls/create"
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 block text-center"
                  >
                    Create Poll
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/dashboard"
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 block text-center"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/profile"
                    className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 block text-center"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 block text-center"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:underline px-3 py-1 rounded block text-center">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:underline px-3 py-1 rounded block text-center">
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
