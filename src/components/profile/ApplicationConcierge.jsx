import { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaVideo, FaUser, FaList } from 'react-icons/fa';
import conciergeApi from '../../services/conciergeApi';
import DatePicker from './concierge/DatePicker';
import TimeSlots from './concierge/TimeSlots';
import StudentAppointments from './concierge/StudentAppointments';

const ApplicationConcierge = () => {
  const [activeTab, setActiveTab] = useState('book'); // book | appointments
  const [step, setStep] = useState('select-date'); // select-date | confirm | success
  const [concierges, setConcierges] = useState([]);
  const [selectedConcierge, setSelectedConcierge] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Fetch available concierges on mount
  useEffect(() => {
    const fetchConcierges = async () => {
      try {
        setLoading(true);
        const response = await conciergeApi.getAvailableConcierges();
        setConcierges(response.concierges || []);
        // Auto-select first concierge if only one
        if (response.concierges?.length === 1) {
          setSelectedConcierge(response.concierges[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load concierges');
      } finally {
        setLoading(false);
      }
    };
    fetchConcierges();
  }, []);

  // Fetch available slots when date or concierge changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !selectedConcierge) return;

    try {
      setSlotsLoading(true);
      setSelectedSlot(null);
      setError(null);

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await conciergeApi.getAvailableSlots(
        selectedConcierge.user_id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setSlots(response.slots || []);
    } catch (err) {
      setError(err.message || 'Failed to load time slots');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDate, selectedConcierge]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('select-date');
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleBook = async () => {
    if (!selectedSlot || !selectedConcierge) return;

    try {
      setBooking(true);
      setError(null);

      const response = await conciergeApi.bookAppointment(
        selectedConcierge.user_id,
        new Date(selectedSlot.start).toISOString(),
        notes || undefined
      );

      setBookedAppointment(response.appointment);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const handleBookAnother = () => {
    setStep('select-date');
    setSelectedDate(null);
    setSelectedSlot(null);
    setNotes('');
    setBookedAppointment(null);
    setError(null);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const renderTabs = () => (
    <div className="profile-tabs">
      <button
        className={`tab-button ${activeTab === 'book' ? 'active' : ''}`}
        onClick={() => setActiveTab('book')}
      >
        Book Appointment
      </button>
      <button
        className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
        onClick={() => setActiveTab('appointments')}
      >
        My Appointments
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="profile-section">
        <div className="profile-section-content">
          <div className="loading-state">Loading...</div>
        </div>
      </div>
    );
  }

  if (concierges.length === 0) {
    return (
      <div className="profile-section">
        <div className="profile-section-content">
          {/* {renderTabs()} */}
          <div className="tab-content">
            {activeTab === 'book' ? (
              <div className="booking-empty">
                <FaCalendarAlt className="booking-empty__icon" />
                <h3>No Concierges Available</h3>
                <p>There are currently no concierges available for booking. Please check back later.</p>
              </div>
            ) : (
              <StudentAppointments />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success' && bookedAppointment) {
    const { date, time } = formatDateTime(bookedAppointment.scheduled_at);
    return (
      <div className="profile-section">
        <div className="profile-section-content">
          {/* {renderTabs()} */}
          <div className="tab-content">
            {activeTab === 'book' ? (
              <div className="booking-success">
                <FaCheckCircle className="booking-success__icon" />
                <h2>Appointment Booked!</h2>
                <p>Your consultation has been scheduled.</p>

                <div className="booking-success__details">
                  <div className="booking-success__detail">
                    <FaCalendarAlt />
                    <div>
                      <strong>{date}</strong>
                      <span>{time} (30 min)</span>
                    </div>
                  </div>
                  <div className="booking-success__detail">
                    <FaUser />
                    <div>
                      <strong>{bookedAppointment.concierge_name}</strong>
                      <span>Your Concierge</span>
                    </div>
                  </div>
                  {bookedAppointment.meeting_url && (
                    <div className="booking-success__detail">
                      <FaVideo />
                      <div>
                        <a href={bookedAppointment.meeting_url} target="_blank" rel="noreferrer">
                          Join Meeting Link
                        </a>
                        <span>Google Meet</span>
                      </div>
                    </div>
                  )}
                </div>

                <button className="booking-success__btn" onClick={handleBookAnother}>
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <StudentAppointments />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-section-content">
        {/* {renderTabs()} */}

        <div className="tab-content padding">
          {activeTab === 'appointments' ? (
            <StudentAppointments />
          ) : (
            <>
              {error && <div className="booking-error">{error}</div>}

              {concierges.length > 1 && (
                <div className="booking-concierge-select">
                  <h2>Need Help?</h2>
                  <p>Book your time with the Campus Israel Concierge for personal guidance, application support and to set your goals and stay on track.</p>
                  <div className='info-cards'>
                    <div className='card'>
                      <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/Group%2038.png" alt="" />
                      <h4>30-Minute Sessions</h4>
                      <p> Dedicated one-on-one time with an expert</p>
                    </div>
                    <div className='card'>
                      <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/Group%2039.png" alt="" />
                      <h4>Virtual Meeting</h4>
                      <p>Connect via Zoom from anywhere</p>
                    </div>
                    <div className='card'>
                      <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/calendar_2271072%201.png" alt="" />
                      <h4>Call invitations</h4>
                      <p>Guidance Counselor and Parent welcome. Your choice.</p>
                    </div>
                  </div>
                  <div className="booking-concierge-select__list">
                    {concierges.map((c) => (
                      <button
                        key={c.user_id}
                        className={`booking-concierge-select__item ${selectedConcierge?.user_id === c.user_id ? 'booking-concierge-select__item--selected' : ''
                          }`}
                        onClick={() => {
                          setSelectedConcierge(c);
                          setSelectedSlot(null);
                        }}
                      >
                        <span><FaUser /> {c.name}</span>
                        <div className='btn-primary btn-schedule'>Schedule a Meeting </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedConcierge && (
                <div className="booking-layout">
                  <div className="booking-layout__calendar">
                    <h3>Select a Date</h3>
                    <DatePicker
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                    />
                  </div>

                  <div className="booking-layout__slots">
                    {selectedDate ? (
                      <TimeSlots
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSlotSelect={handleSlotSelect}
                        loading={slotsLoading}
                      />
                    ) : (
                      <div className="booking-timeslots__empty">
                        <FaCalendarAlt />
                        <p>Select a date to see available times</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'confirm' && selectedSlot && (
                <div className="booking-confirm">
                  <h3>Confirm Your Appointment</h3>
                  <div className="booking-confirm__summary">
                    <div className="booking-confirm__row">
                      <span className="booking-confirm__label">Date</span>
                      <span>{formatDateTime(selectedSlot.start).date}</span>
                    </div>
                    <div className="booking-confirm__row">
                      <span className="booking-confirm__label">Time</span>
                      <span>{formatDateTime(selectedSlot.start).time} (30 min)</span>
                    </div>
                    <div className="booking-confirm__row">
                      <span className="booking-confirm__label">Concierge</span>
                      <span>{selectedConcierge.name}</span>
                    </div>
                  </div>

                  <div className="booking-confirm__notes">
                    <label htmlFor="booking-notes">Notes (optional)</label>
                    <textarea
                      id="booking-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything you'd like the concierge to know..."
                      rows={3}
                    />
                  </div>

                  <button
                    className="booking-confirm__btn"
                    onClick={handleBook}
                    disabled={booking}
                  >
                    {booking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationConcierge;
