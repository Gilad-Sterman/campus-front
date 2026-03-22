import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaVideo, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import conciergeApi from '../../../services/conciergeApi';

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', icon: FaCalendarAlt, className: 'status--scheduled' },
  completed: { label: 'Completed', icon: FaCheckCircle, className: 'status--completed' },
  cancelled: { label: 'Cancelled', icon: FaTimesCircle, className: 'status--cancelled' }
};

const StudentAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await conciergeApi.getMyAppointments();
        setAppointments(response.appointments || []);
      } catch (err) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isPast = (dateString) => new Date(dateString) < new Date();

  const isMeetingAccessible = (scheduledAt) => {
    const appointmentTime = new Date(scheduledAt);
    const now = new Date();
    const thirtyMinutesBefore = new Date(appointmentTime.getTime() - 30 * 60 * 1000);
    
    return now >= thirtyMinutesBefore;
  };

  if (loading) {
    return (
      <div className="student-appointments__loading">
        <FaSpinner className="spin" />
        <span>Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return <div className="booking-error">{error}</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="student-appointments__empty">
        <FaCalendarAlt />
        <p>You don't have any appointments yet.</p>
      </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'scheduled' && !isPast(a.scheduled_at));
  const past = appointments.filter(a => a.status !== 'scheduled' || isPast(a.scheduled_at));

  return (
    <div className="student-appointments">
      {upcoming.length > 0 && (
        <div className="student-appointments__section">
          <h4 className="student-appointments__section-title">Upcoming</h4>
          {upcoming.map(appt => {
            const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
            const StatusIcon = statusCfg.icon;
            return (
              <div key={appt.id} className="student-appointments__card">
                <div className="student-appointments__card-header">
                  <span className={`student-appointments__status ${statusCfg.className}`}>
                    <StatusIcon /> {statusCfg.label}
                  </span>
                </div>
                <div className="student-appointments__card-body">
                  <div className="student-appointments__detail">
                    <FaCalendarAlt />
                    <span>{formatDate(appt.scheduled_at)}</span>
                  </div>
                  <div className="student-appointments__detail">
                    <FaClock />
                    <span>{formatTime(appt.scheduled_at)} ({appt.duration_minutes || 30} min)</span>
                  </div>
                  <div className="student-appointments__detail">
                    <FaUser />
                    <span>{appt.concierge_name}</span>
                  </div>
                  {appt.meeting_url && (
                    <div className="student-appointments__detail">
                      <FaVideo />
                      {isMeetingAccessible(appt.scheduled_at) ? (
                        <a href={appt.meeting_url} target="_blank" rel="noreferrer">
                          Join Meeting
                        </a>
                      ) : (
                        <span className="meeting-link-disabled">
                          Available 30 min before
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <div className="student-appointments__section">
          <h4 className="student-appointments__section-title">Past</h4>
          {past.map(appt => {
            const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
            const StatusIcon = statusCfg.icon;
            return (
              <div key={appt.id} className="student-appointments__card student-appointments__card--past">
                <div className="student-appointments__card-header">
                  <span className={`student-appointments__status ${statusCfg.className}`}>
                    <StatusIcon /> {statusCfg.label}
                  </span>
                </div>
                <div className="student-appointments__card-body">
                  <div className="student-appointments__detail">
                    <FaCalendarAlt />
                    <span>{formatDate(appt.scheduled_at)}</span>
                  </div>
                  <div className="student-appointments__detail">
                    <FaClock />
                    <span>{formatTime(appt.scheduled_at)} ({appt.duration_minutes || 30} min)</span>
                  </div>
                  <div className="student-appointments__detail">
                    <FaUser />
                    <span>{appt.concierge_name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAppointments;
