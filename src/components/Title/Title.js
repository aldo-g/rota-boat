import React, { useEffect, useRef } from 'react';
import './Title.css'; // Import the CSS file for styling

const Title = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Text styling
    context.font = '40px Bungee Shade, serif'; 
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.lineWidth = 8;

    // Add stroke (this is like the <text> stroke in SVG)
    context.strokeStyle = 'white';
    context.lineJoin = 'round';

    // Text and curve parameters
    const string = 'Cassie Calendar';
    const angle = Math.PI * 0.3; // Adjust the curvature (larger = flatter)
    const radius = 180; // Adjust radius for tighter or looser arcs

    // Position and rotate the canvas
    context.translate(canvas.width / 2 - 200, canvas.height / 2 + 50); // Center horizontally, adjust vertically
    context.rotate(-1 * angle / 2);

    // Adjust letter spacing
    const letterSpacing = 30; // Increase this value for more spacing

    // Draw each character along the curve
    for (let i = 0; i < string.length; i++) {
      context.rotate(angle / (string.length + 0.8)); // Rotate for each character
      context.save();
      context.translate(0, -1 * radius); // Move the text outwards
      context.strokeText(string[i], 0, 0); // Add stroke
      context.fillText(string[i], 0, 0); // Add fill
      context.restore();

      // Add extra spacing between characters
      context.translate(letterSpacing, 0);
    }
  }, []);

  return (
    <div className="title-container">
      <canvas
        ref={canvasRef}
        width={800} /* Adjust width */
        height={425} /* Adjust height */
        className="title-canvas"
      />
    </div>
  );
};

export default Title;
