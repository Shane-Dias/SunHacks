import { FaBars } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import NavLinks from './NavLinks';

const Navbar = () => {
  return (
    <nav className='bg-white shadow-lg'>
      <div className='container mx-auto flex justify-between items-center p-4'>
        <NavLink
          to='/'
          className='text-2xl font-bold text-primary hover:text-primaryDark transition duration-300'
        >
          HealthLock
        </NavLink>
        <div className='hidden lg:flex'>
          <ul className='flex space-x-6'>
            <NavLinks isMobile={false} />
          </ul>
        </div>
        <div className='lg:hidden'>
          <div className='dropdown'>
            <label tabIndex={0} className='btn btn-ghost'>
              <FaBars className='h-6 w-6 text-primary' />
            </label>
            <ul
              tabIndex={0}
              className='menu menu-sm dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52 border border-gray-200'
            >
              <NavLinks isMobile={true} />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;