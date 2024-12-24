import React from 'react';
import './DraggableFaces.css';

const DraggableFaces = ({ faces }) => {
  return (
    <div className="faces">
      {faces.map((face) => (
        <img
          key={face.name}
          src={face.img}
          alt={face.name}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(face))}
          className="face"
        />
      ))}
    </div>
  );
};

export default DraggableFaces;
