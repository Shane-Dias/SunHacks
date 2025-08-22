import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const NavLinks = ({ isMobile = false }) => {
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);
  
  // Define links based on user role
  const getRoleSpecificLinks = () => {
    const commonLinks = [
      { id: 1, url: '/', text: 'Home' }
    ];

    // If no user is logged in, show only home
    if (!user) {
      return commonLinks;
    }

    if (role === 'doctor') {
      return [
        ...commonLinks,
        { id: 2, url: 'manage-patient', text: 'Manage Patients' },
        { id: 3, url: 'appointments', text: 'Appointments' },
        { id: 6, url: 'analyzer', text: 'Health Analyzer' },
        { id: 7, url: 'detector', text: 'Health Detector' }
      ];
    }

    if (role === 'patient') {
      return [
        ...commonLinks,
        { id: 4, url: 'medical-history', text: 'Medical Records' },
        { id: 5, url: 'patient-dashboard', text: 'My Appointments' },
        { id: 6, url: 'analyzer', text: 'Health Analyzer' },
        { id: 7, url: 'detector', text: 'Health Detector' }
      ];
    }

    // Fallback for unknown roles
    return commonLinks;
  };

  const roleSpecificLinks = getRoleSpecificLinks();

  return (
    <>
      {roleSpecificLinks.map((link) => {
        const { id, url, text } = link;
        
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
              end={url === '/'}
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