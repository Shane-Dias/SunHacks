import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../features/userSlice";
import { useQueryClient } from "@tanstack/react-query";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  const handleLogout = () => {
    navigate("/");
    dispatch(logoutUser());
    queryClient.removeQueries();
  };

  const getGreeting = () => {
    if (!user) return "";
    if (role === "doctor") return `Dr. ${user.username}`;
    if (role === "patient") return `Patient ${user.username}`;
    return user.username;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Health<span className="text-primary">Lock</span>
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  {/* User Avatar/Icon */}
                  <div className="flex-shrink-0 bg-primaryLight rounded-full p-2">
                    <svg
                      className="h-5 w-5 text-primary"
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
                    <p className="text-sm font-semibold text-gray-900">
                      {getGreeting()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                  </div>
                </div>
                <button
                  className="rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primaryMedium transition-colors duration-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
