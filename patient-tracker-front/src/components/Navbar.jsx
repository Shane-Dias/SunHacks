import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../features/userSlice";
import { useQueryClient } from "@tanstack/react-query";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  const handleLogout = () => {
    navigate("/");
    dispatch(logoutUser());
    queryClient.removeQueries();
    setIsOpen(false);
  };

  const getGreeting = () => {
    if (!user) return "";
    return role === "doctor" ? `Dr. ${user.username}` : user.username;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { id: 1, url: "/", text: "Home" },
    { id: 2, url: "/appointments", text: "Appointments", role: "doctor" },
    { id: 3, url: "/medical-history", text: "Medical Records", role: "doctor" },
    { id: 4, url: "/patient-dashboard", text: "Appointments", role: "patient" },
    { id: 5, url: "/documents", text: "Documents" },
    { id: 6, url: "/analyzer", text: "Health Analyzer", role:'patient' },
    { id: 7, url: "/detector", text: "Health Detector", role:'patient' },
  ];

  const filteredLinks = links.filter((link) => {
    // Hide links that require specific roles if user doesn't have that role
    if (link.role && role !== link.role) return false;

    // Hide authenticated links if not logged in
    if (
      (link.url === "/manage-patient" ||
        link.url === "/medical-history" ||
        link.url === "/appointments") &&
      !user
    )
      return false;

    return true;
  });

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors duration-200"
          >
            <span className="text-primary">Health</span>Lock
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-8">
              {filteredLinks.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.url}
                  end={link.url === "/"}
                  className={({ isActive }) =>
                    `text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              ))}
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primaryLight rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {getGreeting()}
                    </span>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-primary hover:border-primary transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-8">
                <Link
                  to="/login"
                  className="text-base font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primaryMedium transition-colors duration-200"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200"
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-1">
              {/* Mobile Navigation Links */}
              {filteredLinks.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.url}
                  end={link.url === "/"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primaryLight text-primary"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primaryLight rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {getGreeting()}
                          </span>
                          <p className="text-xs text-gray-500 capitalize">
                            {role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:text-primary hover:border-primary transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg bg-primary text-white font-semibold text-center hover:bg-primaryMedium transition-colors duration-200"
                    >
                      Get started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
