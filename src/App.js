import React, { useState } from 'react';
import Title from './components/Title/Title';
import Calendar from './components/Calendar/Calendar';
import DraggableFaces from './components/DraggableFaces/DraggableFaces';
import './styles/App.css';

const App = () => {
  const [faces] = useState([
    { name: 'Marina', img: '/images/new_faces/Marina.png' },
    { name: 'John', img: '/images/new_faces/Navo.png' },
    { name: 'Ali', img: '/images/new_faces/Ali.png' },
  ]);

  const [bookings, setBookings] = useState({});

  const handleBook = (date, face) => {
    setBookings((prev) => ({
      ...prev,
      [date]: face,
    }));
  };

  return (
    <div className="app">
      <Title />
      <div className="main-container">
        <Calendar bookings={bookings} onBook={handleBook} />
      </div>
      <div className="faces-bar">
        <DraggableFaces faces={faces} />
      </div>
    </div>
  );
};

export default App;
