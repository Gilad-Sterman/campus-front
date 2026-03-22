import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker = ({ selectedDate, onDateSelect, minDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const min = minDate || today;

  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];

    // Padding days from previous month
    const prevMonthLast = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ day: prevMonthLast - i, currentMonth: false, date: null });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0, 0, 0, 0);
      const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Fri/Sat for Israel
      const isPast = date < min;
      const isTooFar = date > new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

      days.push({
        day: d,
        currentMonth: true,
        date,
        disabled: isWeekend || isPast || isTooFar,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate && date.getTime() === selectedDate.getTime()
      });
    }

    return days;
  }, [viewMonth, viewYear, selectedDate, min]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth();

  return (
    <div className="booking-datepicker">
      <div className="booking-datepicker__header">
        <button
          className="booking-datepicker__nav"
          onClick={goToPrevMonth}
          disabled={isPrevDisabled}
        >
          <FaChevronLeft />
        </button>
        <span className="booking-datepicker__month">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button className="booking-datepicker__nav" onClick={goToNextMonth}>
          <FaChevronRight />
        </button>
      </div>

      <div className="booking-datepicker__grid">
        {DAYS.map(day => (
          <div key={day} className="booking-datepicker__day-label">{day}</div>
        ))}
        {calendarDays.map((item, idx) => (
          <button
            key={idx}
            className={`booking-datepicker__day
              ${!item.currentMonth ? 'booking-datepicker__day--other' : ''}
              ${item.disabled ? 'booking-datepicker__day--disabled' : ''}
              ${item.isToday ? 'booking-datepicker__day--today' : ''}
              ${item.isSelected ? 'booking-datepicker__day--selected' : ''}
            `}
            disabled={!item.currentMonth || item.disabled}
            onClick={() => item.date && !item.disabled && onDateSelect(item.date)}
          >
            {item.day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;
