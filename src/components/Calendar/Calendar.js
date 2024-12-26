// Calendar.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import db from '../../firebaseConfig';
import './Calendar.css';

const Calendar = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [bookedDays, setBookedDays] = useState({});
  const touchData = useRef(null);
  const currentDragOver = useRef(null); // Track the current drag-over cell

  // Real-time bookings listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookings = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});
      setBookedDays(bookings);
    });
    return unsubscribe;
  }, []);

  // Helper functions to get days
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Generate calendar days including placeholders for previous month
  const generateCalendarDays = () => {
    const numDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array.from({ length: numDays }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1));
    const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    const emptyDays = Array.from({ length: firstDay }, (_, i) =>
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDate - firstDay + i + 1)
    );
    return [...emptyDays, ...days];
  };

  // Change month by delta (-1 for previous, +1 for next)
  const changeMonth = (delta) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  // Throttling function to limit the rate at which a function can fire.
  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  // Handle touch events for dragging
  const handleTouchMove = useCallback(
    throttle((event) => {
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      console.log('Touch Move:', touch.clientX, touch.clientY, target);

      if (target && target.classList.contains('calendar-day')) {
        // Remove drag-over from previous cell
        if (currentDragOver.current && currentDragOver.current !== target) {
          currentDragOver.current.classList.remove('drag-over');
        }

        // Add drag-over to the new target
        if (currentDragOver.current !== target) {
          target.classList.add('drag-over');
          currentDragOver.current = target;
        }
      } else {
        // If not over a calendar day, remove drag-over from previous cell
        if (currentDragOver.current) {
          currentDragOver.current.classList.remove('drag-over');
          currentDragOver.current = null;
        }
      }
    }, 100),
    []
  );

  const handleTouchEnd = async (event) => {
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    console.log('Touch End:', touch.clientX, touch.clientY, target);

    if (target && target.dataset.dropTarget === 'true') {
      const formattedDate = target.getAttribute('data-date');
      const face = touchData.current;

      if (formattedDate && face) {
        try {
          await setDoc(doc(db, 'bookings', formattedDate), face);
        } catch (error) {
          console.error('Failed to save booking:', error);
        }
      }
    }

    // Remove drag-over class from any cell
    if (currentDragOver.current) {
      currentDragOver.current.classList.remove('drag-over');
      currentDragOver.current = null;
    }

    touchData.current = null; // Clear the touch data
  };

  // Handle drop event for drag-and-drop
  const handleDrop = async (date, event) => {
    let faceData = null;
    if (event.detail) {
      // Custom drop event from touch
      faceData = JSON.parse(event.detail);
    } else if (event.dataTransfer) {
      // Drop event from desktop drag
      faceData = JSON.parse(event.dataTransfer.getData('application/json'));
    }

    if (faceData) {
      try {
        await setDoc(doc(db, 'bookings', date), faceData);
      } catch (error) {
        console.error('Failed to save booking:', error);
      }
    }
  };

  // Cancel a booking
  const handleCancelBooking = async (date) => {
    try {
      await deleteDoc(doc(db, 'bookings', date));
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = generateCalendarDays();

  return (
    <div
      className="calendar"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with month navigation */}
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <span className="header-text">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      {/* Days of the week */}
      <div className="calendar-days-of-week">
        {daysOfWeek.map(day => (
          <div key={day} className="day-of-week">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {calendarDays.map(day => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const formattedDate = day.toISOString().split('T')[0];
          const isToday = day.toDateString() === today.toDateString();
          const booking = bookedDays[formattedDate];

          return (
            <div
              key={`${formattedDate}-${day.getDate()}`} // Ensure unique key
              className={`calendar-day ${isToday ? 'today' : ''} ${booking ? 'booked' : ''} ${!isCurrentMonth ? 'placeholder' : ''}`}
              data-drop-target={isCurrentMonth}
              data-date={formattedDate}
              onDragOver={isCurrentMonth ? (e) => e.preventDefault() : null}
              onDragEnter={isCurrentMonth ? (e) => e.currentTarget.classList.add('drag-over') : null}
              onDragLeave={isCurrentMonth ? (e) => e.currentTarget.classList.remove('drag-over') : null}
              onDrop={isCurrentMonth ? (e) => handleDrop(formattedDate, e) : null}
            >
              <span className="date-label">{day.getDate()}</span>
              {isCurrentMonth && booking && (
                <>
                  <img
                    src={booking.img}
                    alt={booking.name}
                    className="booking-face"
                    draggable={false}
                  />
                  <button
                    className="cancel-button"
                    onClick={() => handleCancelBooking(formattedDate)}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
