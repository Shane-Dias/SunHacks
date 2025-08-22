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
    if (role === 'doctor') return `Dr. ${user.username}`;
    return user.username;
  };

  return (
    <header className='bg-primary py-3 text-white shadow-md'>
      <div className='align-element flex justify-center sm:justify-end'>
        {user ? (
          <div className='flex gap-x-4 sm:gap-x-8 items-center'>
            <p className='text-sm sm:text-base font-medium'>
              Hello, {getGreeting()} ({role})
            </p>
            <button
              className='px-4 py-1.5 text-sm rounded-md bg-white text-primary border border-primary hover:bg-primaryLight hover:text-white transition-colors duration-200'
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className='flex gap-x-6 justify-center items-center'>
            <Link 
              to='/login' 
              className='text-sm sm:text-base font-medium hover:text-primaryLight transition-colors duration-200'
            >
              Sign in
            </Link>
            <Link 
              to='/register' 
              className='px-4 py-1.5 text-sm rounded-md bg-primaryMedium text-white hover:bg-primaryDark transition-colors duration-200'
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;