import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import db from '../../firebaseConfig';
import './Calendar.css';

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [bookedDays, setBookedDays] = useState({});
  const touchData = useRef(null); // To store drag data for touch devices

  // Fetch real-time bookings from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookings = {};
      snapshot.forEach((doc) => {
        bookings[doc.id] = doc.data();
      });
      setBookedDays(bookings);
    });
    return () => unsubscribe();
  }, []);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateDays = (month, year) => {
    const numDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);

    const days = Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1));

    const previousMonthDays = new Date(year, month, 0).getDate();
    const emptyDays = Array.from({ length: firstDay }, (_, i) =>
      new Date(year, month - 1, previousMonthDays - firstDay + i + 1)
    );

    return [...emptyDays, ...days];
  };

  const days = generateDays(currentMonth, currentYear);

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prevYear) => prevYear + 1);
    } else {
      setCurrentMonth((prevMonth) => prevMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prevYear) => prevYear - 1);
    } else {
      setCurrentMonth((prevMonth) => prevMonth - 1);
    }
  };

  const handleTouchStart = (event, face) => {
    touchData.current = face;
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target && target.classList.contains('calendar-day')) {
      target.classList.add('drag-over');
    }
  };

  const handleTouchEnd = async (event) => {
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

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

    // Remove drag-over class
    document.querySelectorAll('.calendar-day.drag-over').forEach((el) => {
      el.classList.remove('drag-over');
    });

    touchData.current = null; // Clear the touch data
  };

  const handleDrop = async (formattedDate, event) => {
    try {
      const face = JSON.parse(event.detail || event.dataTransfer.getData('application/json'));
      await setDoc(doc(db, 'bookings', formattedDate), face);
    } catch (error) {
      console.error('Failed to save booking:', error);
    }
  };

  const handleDragEnter = (e) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleCancelBooking = async (date) => {
    try {
      await deleteDoc(doc(db, 'bookings', date));
      setBookedDays((prev) => {
        const updated = { ...prev };
        delete updated[date];
        return updated;
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <span className="header-text">
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className="calendar-days-of-week">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-of-week">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          const isPlaceholder = day.getMonth() !== currentMonth;
          const formattedDate = day.toISOString().split('T')[0];
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();
          const booking = bookedDays[formattedDate];

          return (
            <div
              key={`${formattedDate}-${index}`}
              className={`calendar-day ${isToday ? 'today' : ''} ${
                booking ? 'booked' : ''
              } ${isPlaceholder ? 'placeholder' : ''}`}
              data-drop-target={!isPlaceholder}
              data-date={formattedDate}
              onDragOver={(e) => !isPlaceholder && e.preventDefault()}
              onDragEnter={!isPlaceholder ? handleDragEnter : null}
              onDragLeave={!isPlaceholder ? handleDragLeave : null}
              onDrop={(e) => !isPlaceholder && handleDrop(formattedDate, e)}
            >
              <span className="date-label">{day.getDate()}</span>
              {!isPlaceholder && booking && (
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
