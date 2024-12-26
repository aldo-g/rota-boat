import React, { useRef } from 'react';
import './DraggableFaces.css';

const DraggableFaces = ({ faces }) => {
  const dragRef = useRef(null);
  const previewRef = useRef(null);

  const handleDragStart = (event, face) => {
    const dragData = JSON.stringify(face);
    event.dataTransfer?.setData('application/json', dragData); // For desktop
    dragRef.current = dragData;

    // Add the drag preview element
    const imgPreview = document.createElement('img');
    imgPreview.src = face.img;
    imgPreview.className = 'drag-preview';
    document.body.appendChild(imgPreview);
    previewRef.current = imgPreview;

    // Update preview position
    event.dataTransfer.setDragImage(imgPreview, 25, 25);
  };

  const handleDrag = (event) => {
    if (previewRef.current) {
      previewRef.current.style.left = `${event.clientX}px`;
      previewRef.current.style.top = `${event.clientY}px`;
    }
  };

  const handleDragEnd = () => {
    // Remove the drag preview
    if (previewRef.current) {
      previewRef.current.remove();
      previewRef.current = null;
    }
  };

  const handleTouchStart = (event, face) => {
    dragRef.current = JSON.stringify(face);

    // Create a preview element for touch
    const touchPreview = document.createElement('img');
    touchPreview.src = face.img;
    touchPreview.className = 'drag-preview';
    touchPreview.style.position = 'absolute';
    touchPreview.style.zIndex = '1000';
    touchPreview.style.width = '50px';
    document.body.appendChild(touchPreview);
    previewRef.current = touchPreview;

    const touch = event.touches[0];
    touchPreview.style.left = `${touch.clientX}px`;
    touchPreview.style.top = `${touch.clientY}px`;
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (previewRef.current) {
      previewRef.current.style.left = `${touch.clientX}px`;
      previewRef.current.style.top = `${touch.clientY}px`;
    }
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    // Dispatch drop event
    if (target && target.dataset.dropTarget === 'true') {
      const dragData = dragRef.current;
      const dropEvent = new CustomEvent('drop', { detail: dragData, bubbles: true });
      target.dispatchEvent(dropEvent);
    }

    // Remove the drag preview
    if (previewRef.current) {
      previewRef.current.remove();
      previewRef.current = null;
    }

    dragRef.current = null;
  };

  return (
    <div className="faces-container">
      {faces.map((face) => (
        <img
          key={face.name}
          src={face.img}
          alt={face.name}
          className="face"
          draggable
          onDragStart={(e) => handleDragStart(e, face)}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(e, face)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      ))}
    </div>
  );
};

export default DraggableFaces;
