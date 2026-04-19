import { useDispatch } from 'react-redux';
import { logout } from '../../store/actions/authActions';
import {
  FiFileText,
  FiTarget,
  FiDollarSign,
  FiUsers,
  FiHelpCircle
} from 'react-icons/fi';

const ProfileSidebar = ({ activeSection, setActiveSection }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      id: 'applications-hub',
      label: 'Applications Hub',
      icon: FiFileText,
      isDefault: true
    },
    {
      id: 'my-applications',
      label: 'My Applications',
      icon: FiFileText,
    },
    {
      id: 'quiz-results',
      label: 'PathFinder',
      icon: FiTarget
    },
    {
      id: 'cost-calculator',
      label: 'CostCompare',
      icon: FiDollarSign
    },
    {
      id: 'study-buddy',
      label: 'PeerConnect',
      icon: FiUsers
    },
    {
      id: 'concierge',
      label: 'Concierge',
      icon: FiHelpCircle
    }
  ];

  return (
    <div className="profile-sidebar">
      <nav className="profile-nav">
        <ul className="profile-nav-list">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id} className="profile-nav-item">
                <button
                  className={`profile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="profile-nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
          <li key="logout" className="profile-nav-item">
            <button
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              <span className="profile-nav-label">Logout</span>
            </button>
          </li>
        </ul>

      </nav>
      {/* <div className="profile-sidebar-footer">
        <div className="profile-user-info">
          <div className="profile-avatar">
            {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="profile-user-details">
            <h3 className="profile-user-name">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.email
              }
            </h3>
            <p className="profile-user-email">{user?.email}</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ProfileSidebar;
