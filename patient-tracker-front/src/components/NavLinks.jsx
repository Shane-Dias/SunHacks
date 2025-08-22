import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const links = [
  { id: 1, url: '/', text: 'home' },
  { id: 2, url: 'manage-patient', text: 'Manage patient', role: 'doctor' },
  { id: 3, url: 'medical-history', text: 'Medical Records', role: 'patient' },
  { id: 4, url: 'appointments', text: 'Appointments' },
];

const NavLinks = ({ isMobile = false }) => {
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);
  
  return (
    <>
      {links.map((link) => {
        const { id, url, text, requiredRole } = link;
        
        // Hide links that require specific roles if user doesn't have that role
        if (requiredRole && role !== requiredRole) return null;
        
        // Hide patient management links if not logged in
        if ((url === 'manage-patient' || url === 'medical-history' || url === 'appointments') && !user) return null;
        
        return (
          <li key={id} className={isMobile ? 'w-full' : ''}>
            <NavLink 
              className={({ isActive }) => 
                `capitalize px-3 py-2 rounded-md transition-colors duration-200 block ${
                  isActive 
                    ? 'text-primary font-medium bg-primaryLight' 
                    : 'text-gray-700 hover:text-primary hover:bg-primaryLight'
                } ${isMobile ? 'text-base' : 'text-sm'}`
              } 
              to={url}
            >
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};

export default NavLinks;