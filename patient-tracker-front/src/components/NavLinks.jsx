import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const links = [
  { id: 1, url: '/', text: 'Home' },
  { id: 2, url: '/manage-patient', text: 'Manage Patient', role: 'doctor' },
  { id: 3, url: '/medical-history', text: 'Medical Records', role: 'patient' },
  { id: 4, url: '/appointments', text: 'Appointments' },
];

const NavLinks = ({ isMobile = false }) => {
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  return (
    <ul className={`flex ${isMobile ? 'flex-col' : 'flex-row'} space-x-4`}>
      {links.map((link) => {
        const { id, url, text, role: requiredRole } = link;

        // Hide links that require specific roles if user doesn't have that role
        if (requiredRole && role !== requiredRole) return null;

        // Hide patient management links if not logged in
        if ((url === '/manage-patient' || url === '/medical-history' || url === '/appointments') && !user) return null;

        return (
          <li key={id}>
            <NavLink
              className={({ isActive }) =>
                `text-lg font-semibold transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : 'text-gray-800 hover:text-blue-500'
                }`
              }
              to={url}
              end={url === '/'}
            >
              {text}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};

export default NavLinks;