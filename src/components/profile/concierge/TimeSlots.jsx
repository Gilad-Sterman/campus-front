import { FaClock } from 'react-icons/fa';

const TimeSlots = ({ slots, selectedSlot, onSlotSelect, loading }) => {
  if (loading) {
    return (
      <div className="booking-timeslots">
        <div className="booking-timeslots__loading">Loading available times...</div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="booking-timeslots">
        <div className="booking-timeslots__empty">
          <FaClock />
          <p>No available time slots for this date. Please try another day.</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="booking-timeslots">
      <h3 className="booking-timeslots__title">Available Times</h3>
      <div className="booking-timeslots__grid">
        {slots.map((slot, idx) => {
          const isSelected = selectedSlot && 
            new Date(selectedSlot.start).getTime() === new Date(slot.start).getTime();

          return (
            <button
              key={idx}
              className={`booking-timeslots__slot ${isSelected ? 'booking-timeslots__slot--selected' : ''}`}
              onClick={() => onSlotSelect(slot)}
            >
              {formatTime(slot.start)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlots;
