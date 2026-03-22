import { useState, useEffect, useCallback } from 'react';
import { FaCalendarCheck, FaCalendarTimes, FaVideo, FaUser, FaSync } from 'react-icons/fa';
import conciergeApi from '../../services/conciergeApi';

const ConciergeAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter === 'upcoming') {
        params.startDate = new Date().toISOString();
        params.status = 'scheduled';
      } else if (filter === 'past') {
        params.endDate = new Date().toISOString();
      }

      const response = await conciergeApi.getAppointments(params);
      setAppointments(response.appointments || []);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAppointments();
  }, [filter]); // Only depend on filter, not fetchAppointments

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    const confirmMsg = newStatus === 'cancelled'
      ? 'Cancel this appointment? The student will be notified.'
      : 'Mark this appointment as completed?';

    if (!confirm(confirmMsg)) return;

    try {
      await conciergeApi.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to update appointment');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled': return 'status--scheduled';
      case 'completed': return 'status--completed';
      case 'cancelled': return 'status--cancelled';
      default: return '';
    }
  };

  const isMeetingAccessible = (scheduledAt) => {
    const appointmentTime = new Date(scheduledAt);
    const now = new Date();
    const thirtyMinutesBefore = new Date(appointmentTime.getTime() - 30 * 60 * 1000);
    
    return now >= thirtyMinutesBefore;
  };

  return (
    <div className="concierge-appointments">
      <div className="concierge-appointments__header">
        <div className="concierge-appointments__filters">
          <button
            className={`concierge-appointments__filter ${filter === 'upcoming' ? 'concierge-appointments__filter--active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`concierge-appointments__filter ${filter === 'past' ? 'concierge-appointments__filter--active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
          <button
            className={`concierge-appointments__filter ${filter === 'all' ? 'concierge-appointments__filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
        <button className="concierge-appointments__refresh" onClick={fetchAppointments} title="Refresh">
          <FaSync />
        </button>
      </div>

      {loading ? (
        <div className="concierge-appointments__loading">Loading appointments...</div>
      ) : error ? (
        <div className="concierge-appointments__error">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="concierge-appointments__empty">
          <FaCalendarCheck className="concierge-appointments__empty-icon" />
          <h3>No appointments found</h3>
          <p>{filter === 'upcoming'
            ? 'You have no upcoming appointments. Students will be able to book time with you once your calendar is connected.'
            : 'No appointments match the current filter.'
          }</p>
        </div>
      ) : (
        <div className="concierge-appointments__list">
          {appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.scheduled_at);
            const student = appointment.users;
            

            return (
              <div key={appointment.id} className="concierge-appointments__card">
                <div className="concierge-appointments__card-time">
                  <span className="concierge-appointments__date">{date}</span>
                  <span className="concierge-appointments__time">{time}</span>
                  <span className="concierge-appointments__duration">
                    {appointment.duration_minutes} min
                  </span>
                </div>

                <div className="concierge-appointments__card-info">
                  <div className="concierge-appointments__student">
                    <FaUser />
                    <span>
                      {student?.first_name} {student?.last_name}
                    </span>
                    <span className="concierge-appointments__student-email">
                      {student?.email}
                    </span>
                  </div>
                  {appointment.notes && (
                    <p className="concierge-appointments__notes">{appointment.notes}</p>
                  )}
                </div>

                <div className="concierge-appointments__card-actions">
                  <span className={`concierge-appointments__status ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>

                  {appointment.meeting_url && (
                    isMeetingAccessible(appointment.scheduled_at) ? (
                      <a
                        href={appointment.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="concierge-appointments__meeting-link"
                      >
                        <FaVideo /> Join
                      </a>
                    ) : (
                      <div className="concierge-appointments__meeting-link concierge-appointments__meeting-link--disabled">
                        <FaVideo /> Available 30 min before
                      </div>
                    )
                  )}

                  {appointment.status === 'scheduled' && (
                    <div className="concierge-appointments__action-btns">
                      <button
                        className="concierge-appointments__btn concierge-appointments__btn--complete"
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      >
                        <FaCalendarCheck /> Complete
                      </button>
                      <button
                        className="concierge-appointments__btn concierge-appointments__btn--cancel"
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      >
                        <FaCalendarTimes /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConciergeAppointments;
