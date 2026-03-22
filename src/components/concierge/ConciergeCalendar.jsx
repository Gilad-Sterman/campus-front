import { useState } from 'react';
import { FaGoogle, FaCheckCircle, FaTimesCircle, FaSync, FaUnlink } from 'react-icons/fa';
import conciergeApi from '../../services/conciergeApi';

const ConciergeCalendar = ({ calendarStatus, onStatusChange }) => {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = calendarStatus?.connected;

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const response = await conciergeApi.connectCalendar();
      // Redirect to Google OAuth
      window.location.href = response.authUrl;
    } catch (err) {
      setError(err.message || 'Failed to initiate calendar connection');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Google Calendar? You will stop receiving meeting bookings.')) return;

    try {
      setDisconnecting(true);
      setError(null);
      await conciergeApi.disconnectCalendar();
      onStatusChange();
    } catch (err) {
      setError(err.message || 'Failed to disconnect calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="concierge-calendar">
        <div className="concierge-calendar__connect-card">
          <div className="concierge-calendar__icon">
            <FaGoogle />
          </div>
          <h2>Connect Your Calendar</h2>
          <p>
            Connect your Google Calendar to start receiving meeting bookings from students.
            We'll check your availability in real-time and add meetings directly to your calendar.
          </p>
          <div className="concierge-calendar__permissions">
            <h3>Permissions requested:</h3>
            <ul>
              <li><FaCheckCircle className="icon-success" /> View your calendar events (to check availability)</li>
              <li><FaCheckCircle className="icon-success" /> Create new events (for scheduled meetings)</li>
            </ul>
          </div>
          {error && <div className="concierge-calendar__error">{error}</div>}
          <button
            className="concierge-calendar__connect-btn"
            onClick={handleConnect}
            disabled={connecting}
          >
            <FaGoogle />
            {connecting ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="concierge-calendar">
      <div className="concierge-calendar__status-card">
        <div className="concierge-calendar__status-header">
          <div className="concierge-calendar__status-indicator concierge-calendar__status-indicator--connected">
            <FaCheckCircle />
            <span>Calendar Connected</span>
          </div>
          <button
            className="concierge-calendar__refresh-btn"
            onClick={onStatusChange}
            title="Refresh status"
          >
            <FaSync />
          </button>
        </div>

        <div className="concierge-calendar__details">
          <div className="concierge-calendar__detail-item">
            <label>Provider</label>
            <span><FaGoogle /> Google Calendar</span>
          </div>
          <div className="concierge-calendar__detail-item">
            <label>Connected Since</label>
            <span>{formatDate(calendarStatus?.details?.calendar_connected_at)}</span>
          </div>
          <div className="concierge-calendar__detail-item">
            <label>Last Synced</label>
            <span>{formatDate(calendarStatus?.details?.last_sync_at)}</span>
          </div>
        </div>

        <div className="concierge-calendar__info">
          <p>Your calendar is connected and students can book appointments with you. 
          Available 30-minute slots are shown based on your calendar availability.</p>
        </div>

        {error && <div className="concierge-calendar__error">{error}</div>}

        <div className="concierge-calendar__actions">
          <button
            className="concierge-calendar__disconnect-btn"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            <FaUnlink />
            {disconnecting ? 'Disconnecting...' : 'Disconnect Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConciergeCalendar;
