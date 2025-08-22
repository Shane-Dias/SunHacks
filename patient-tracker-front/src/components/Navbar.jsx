import { FaBarsStaggered } from 'react-icons/fa6';
import { NavLink } from 'react-router-dom';
import NavLinks from './NavLinks';

const Navbar = () => {
  return (
    <nav className='bg-primaryLight shadow-md'>
      <div className='align-element'>
        <div className='navbar'>
          <div className='navbar-start'>
            {/* TITLE */}
            <NavLink
              to='/'
              className='hidden lg:flex btn text-xl items-center bg-primary text-white hover:bg-primaryMedium border-0 normal-case'
            >
              HealthLock
            </NavLink>
            {/* DROPDOWN */}
            <div className='dropdown'>
              <label tabIndex={0} className='btn btn-ghost lg:hidden'>
                <FaBarsStaggered className='h-6 w-6 text-primary' />
              </label>
              <ul
                tabIndex={0}
                className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52 border border-primaryLight'
              >
                <NavLinks isMobile={true} />
              </ul>
            </div>
          </div>
          <div className='navbar-center hidden lg:flex'>
            <ul className='menu menu-horizontal gap-2'>
              <NavLinks isMobile={false} />
            </ul>
          </div>
          <div className='navbar-end lg:hidden'>
            {/* Mobile title */}
            <NavLink
              to='/'
              className='btn btn-ghost text-xl text-primary font-bold normal-case'
            >
              HealthLock
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;