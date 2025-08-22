import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/userSlice';
import { useQueryClient } from '@tanstack/react-query';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  const handleLogout = () => {
    navigate('/');
    dispatch(logoutUser());
    queryClient.removeQueries();
    setIsOpen(false);
  };

  const getGreeting = () => {
    if (!user) return '';
    return role === 'doctor' ? `Dr. ${user.username}` : user.username;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { id: 1, url: '/', text: 'Home' },
    { id: 2, url: '/appointments', text: 'Appointments', role: 'doctor' },
    { id: 3, url: '/medical-history', text: 'Medical Records', role: 'doctor' },
    { id: 4, url: '/patient-dashboard', text: 'Appointments', role:'patient' },
    { id: 5, url: '/documents', text: 'Documents' },
  ];

  const filteredLinks = links.filter((link) => {
    // Hide links that require specific roles if user doesn't have that role
    if (link.role && role !== link.role) return false;
    
    // Hide authenticated links if not logged in
    if ((link.url === '/manage-patient' || link.url === '/medical-history' || link.url === '/appointments') && !user) return false;
    
    return true;
  });

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:text-blue-200 transition duration-300"
          >
            HealthLock
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="flex space-x-6">
              {filteredLinks.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.url}
                  end={link.url === '/'}
                  className={({ isActive }) =>
                    `text-white font-medium transition duration-200 ${
                      isActive 
                        ? 'text-yellow-300 border-b-2 border-yellow-300' 
                        : 'hover:text-blue-200'
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              ))}
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4 border-l border-blue-300 pl-6">
                <span className="text-white font-medium">
                  Hello, {getGreeting()} ({role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm rounded-md bg-white text-blue-500 border border-blue-300 hover:bg-blue-100 transition duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4 border-l border-blue-300 pl-6">
                <Link
                  to="/login"
                  className="text-white font-medium hover:text-blue-200 transition duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700 transition duration-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-blue-200 transition duration-200"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-blue-600 border-t border-blue-400">
            <div className="px-4 py-2 space-y-2">
              {/* Mobile Navigation Links */}
              {filteredLinks.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.url}
                  end={link.url === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-white font-medium transition duration-200 ${
                      isActive 
                        ? 'bg-blue-700 text-yellow-300' 
                        : 'hover:bg-blue-700'
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-blue-400 pt-2 mt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-white font-medium">
                      Hello, {getGreeting()} ({role})
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md bg-white text-blue-500 hover:bg-blue-100 transition duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md text-white font-medium hover:bg-blue-700 transition duration-200"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition duration-200"
                    >
                      Create Account
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