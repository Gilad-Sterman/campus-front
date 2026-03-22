import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAdmin } from '../../utils/permissions';
import {
    FaChartLine,
    FaUsers,
    FaUserShield,
    FaUniversity,
    FaGraduationCap,
    FaComments,
    FaSignOutAlt
} from 'react-icons/fa';
import { logout } from '../../store/actions/authActions';
import '../../assets/scss/components/AdminLayout.scss';

// Tab Components
import DashboardTab from './tabs/DashboardTab';
import UsersTab from './tabs/UsersTab';
import StaffPermissionsTab from './tabs/StaffPermissionsTab';
import UniversitiesTab from './tabs/UniversitiesTab';
import ProgramsTab from './tabs/ProgramsTab';
import CommunityTab from './tabs/CommunityTab';
import UserDetailView from './tabs/UserDetailView';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'staff', label: 'Staff & Permissions', icon: <FaUserShield /> },
    { id: 'universities', label: 'Universities', icon: <FaUniversity /> },
    { id: 'programs', label: 'Programs', icon: <FaGraduationCap /> },
    { id: 'community', label: 'Community', icon: <FaComments /> },
];

function AdminLayout() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { user, isAuthenticated, loading, isInitialized } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Reset selected user when switching tabs
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSelectedUserId(null);
    };

    // Redirect non-admin users to home page
    useEffect(() => {
        if (isInitialized && isAuthenticated && user && !isAdmin(user?.role)) {
            navigate('/', { replace: true });
        }
    }, [isInitialized, isAuthenticated, user, navigate]);

    // Wait for initial auth check to complete
    if (!isInitialized || loading) {
        return <div className="admin-loading">Loading admin panel...</div>;
    }


    // Check if user has admin permissions
    if (!isAdmin(user?.role)) {
        return (
            <div className="admin-unauthorized">
                <h1>Access Denied</h1>
                <p>You don't have permission to access the admin panel.</p>
                <a href="/" className="btn btn-primary">Return Home</a>
            </div>
        );
    }

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    const renderTabContent = () => {
        if (activeTab === 'users' && selectedUserId) {
            return (
                <UserDetailView
                    userId={selectedUserId}
                    onBack={() => setSelectedUserId(null)}
                />
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return <DashboardTab />;
            case 'users':
                return <UsersTab onViewUser={(userId) => setSelectedUserId(userId)} />;
            case 'staff':
                return <StaffPermissionsTab />;
            case 'universities':
                return <UniversitiesTab />;
            case 'programs':
                return <ProgramsTab />;
            case 'community':
                return <CommunityTab />;
            default:
                return <DashboardTab />;
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <h2 className="logo">CampusIL</h2>
                    <p className="subtitle">Admin Panel</p>
                </div>
                <nav className="admin-sidebar__nav">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`admin-sidebar__nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <span className="admin-sidebar__nav-icon">{tab.icon}</span>
                            <span className="admin-sidebar__nav-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar__footer">
                    <span>Logged in as:</span>
                    <strong>{user?.email}</strong>
                    <button onClick={handleLogout} className="admin-sidebar__logout">
                        <FaSignOutAlt style={{ marginRight: '8px' }} /> LOG OUT
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                {renderTabContent()}
            </main>
        </div>
    );
}

export default AdminLayout;
