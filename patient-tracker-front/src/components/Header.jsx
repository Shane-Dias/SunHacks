import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/userSlice';
import { useQueryClient } from '@tanstack/react-query';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  const handleLogout = () => {
    navigate('/');
    dispatch(logoutUser());
    queryClient.removeQueries();
  };

  const getGreeting = () => {
    if (!user) return '';
    return role === 'doctor' ? `Dr. ${user.username}` : user.username;
  };

  return (
    <header className='bg-gradient-to-r from-blue-500 to-teal-500 py-4 text-white shadow-lg'>
      <div className='container mx-auto flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>HealthLock</h1>
        <div className='flex items-center'>
          {user ? (
            <div className='flex items-center space-x-4'>
              <p className='text-lg font-medium'>Hello, {getGreeting()} ({role})</p>
              <button
                className='px-4 py-2 text-sm rounded-md bg-white text-blue-500 border border-blue-300 hover:bg-blue-100 transition duration-200'
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className='flex space-x-6'>
              <Link 
                to='/login' 
                className='text-lg font-medium hover:text-blue-200 transition duration-200'
              >
                Sign in
              </Link>
              <Link 
                to='/register' 
                className='px-4 py-2 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700 transition duration-200'
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;