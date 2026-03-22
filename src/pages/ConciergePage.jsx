import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useSearchParams } from 'react-router-dom';
import { isConcierge } from '../utils/permissions';
import conciergeApi from '../services/conciergeApi';
import ConciergeCalendar from '../components/concierge/ConciergeCalendar';
import ConciergeAppointments from '../components/concierge/ConciergeAppointments';
import { FaCalendarAlt, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../store/actions/authActions';
import { useNavigate } from 'react-router-dom';

const ConciergePage = () => {
  const { user, isAuthenticated, isInitialized } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('calendar');
  const [calendarStatus, setCalendarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchCalendarStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await conciergeApi.getCalendarStatus();
      setCalendarStatus(response);
    } catch (error) {
      console.error('Failed to fetch calendar status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch calendar status on mount
  useEffect(() => {
    if (isAuthenticated && isConcierge(user?.role)) {
      fetchCalendarStatus();
    }
  }, [isAuthenticated, user?.role]); // Remove fetchCalendarStatus from dependencies

  // Handle OAuth callback redirect
  useEffect(() => {
    const callbackStatus = searchParams.get('calendar_callback');

    if (callbackStatus === 'success') {
      // Tokens were saved server-side during callback, just refresh status
      fetchCalendarStatus();
      window.history.replaceState({}, '', '/concierge');
    } else if (callbackStatus === 'error') {
      const message = searchParams.get('message');
      console.error('Calendar connection failed:', message);
      window.history.replaceState({}, '', '/concierge');
    }
  }, [searchParams.get('calendar_callback')]); // Only depend on the specific param

  // If not connected, default to calendar tab
  useEffect(() => {
    if (calendarStatus && !calendarStatus.connected) {
      setActiveTab('calendar');
    }
  }, [calendarStatus]);

  if (!isInitialized) {
    return <div className="concierge-page__loading">Loading...</div>;
  }


  if (!isConcierge(user?.role)) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="concierge-page">
      <header className="concierge-page__header">
        <div className="concierge-page__header-left">
          <h1 className="concierge-page__title">CampusIL</h1>
          <span className="concierge-page__subtitle">Concierge Portal</span>
        </div>
        <div className="concierge-page__header-right">
          <span className="concierge-page__user">
            {user?.first_name} {user?.last_name}
          </span>
          <button onClick={handleLogout} className="concierge-page__logout">
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </header>

      <nav className="concierge-page__tabs">
        <button
          className={`concierge-page__tab ${activeTab === 'calendar' ? 'concierge-page__tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <FaCalendarAlt /> Calendar
        </button>
        <button
          className={`concierge-page__tab ${activeTab === 'appointments' ? 'concierge-page__tab--active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <FaClipboardList /> Appointments
        </button>
      </nav>

      <main className="concierge-page__content">
        {loading ? (
          <div className="concierge-page__loading">Loading...</div>
        ) : activeTab === 'calendar' ? (
          <ConciergeCalendar
            calendarStatus={calendarStatus}
            onStatusChange={fetchCalendarStatus}
          />
        ) : (
          <ConciergeAppointments />
        )}
      </main>
    </div>
  );
};

export default ConciergePage;
