import React from 'react';
import './BoatDisplay.css';

const BoatDisplay = ({ faceImage = '/images/Ali.png', boatImage = '/images/man-on-a-boat.png', text = 'Ali is boating today' }) => {
  return (
    <div className="boat-container">
      <div className="boat-text">{text}</div>
      <img src={boatImage} alt="Man on a Boat" className="boat-image" />
      <img src={faceImage} alt="Ali's Face" className="face-image" />
    </div>
  );
};

export default BoatDisplay;
