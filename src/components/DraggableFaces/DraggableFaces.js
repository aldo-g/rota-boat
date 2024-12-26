// DraggableFaces.jsx

import React, { useRef } from 'react';
import './DraggableFaces.css';

const DraggableFaces = ({ faces }) => {
  const dragDataRef = useRef(null);
  const previewRef = useRef(null);

  // Helper function to create a preview image
  const createPreview = (src, x, y) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'drag-preview';
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    document.body.appendChild(img);
    return img;
  };

  // Helper function to find the nearest ancestor with data-drop-target="true"
  const findDropTarget = (element) => {
    while (element && element !== document.body) {
      if (element.dataset.dropTarget === 'true') {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  };

  // Handler for drag start (desktop)
  const handleDragStart = (event, face) => {
    const dragData = JSON.stringify(face);
    event.dataTransfer?.setData('application/json', dragData);
    dragDataRef.current = dragData;

    // Create and set the drag image
    const preview = createPreview(face.img, event.clientX, event.clientY);
    previewRef.current = preview;
    event.dataTransfer?.setDragImage(preview, 25, 25);
  };

  // Handler for drag movement (desktop)
  const handleDrag = (event) => {
    if (previewRef.current) {
      previewRef.current.style.left = `${event.clientX}px`;
      previewRef.current.style.top = `${event.clientY}px`;
    }
  };

  // Handler for drag end (desktop)
  const handleDragEnd = () => {
    previewRef.current?.remove();
    previewRef.current = null;
    dragDataRef.current = null;
  };

  // Handler for touch start (mobile)
  const handleTouchStart = (event, face) => {
    // Removed event.preventDefault() to avoid the passive listener error
    const touch = event.touches[0];
    const dragData = JSON.stringify(face);
    dragDataRef.current = dragData;

    // Create the touch preview
    const preview = createPreview(face.img, touch.clientX, touch.clientY);
    previewRef.current = preview;
  };

  // Handler for touch movement (mobile)
  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (previewRef.current) {
      previewRef.current.style.left = `${touch.clientX}px`;
      previewRef.current.style.top = `${touch.clientY}px`;
    }
  };

  // Handler for touch end (mobile)
  const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    console.log('Touch End:', touch.clientX, touch.clientY, target);

    // Use the helper function to find the drop target
    const dropTarget = findDropTarget(target);

    if (dropTarget && dragDataRef.current) {
      const dropEvent = new CustomEvent('drop', { detail: dragDataRef.current, bubbles: true });
      dropTarget.dispatchEvent(dropEvent);
    }

    // Clean up the preview
    previewRef.current?.remove();
    previewRef.current = null;
    dragDataRef.current = null;
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
          tabIndex="0" // For accessibility
          aria-grabbed="false"
          role="button"
        />
      ))}
    </div>
  );
};

export default DraggableFaces;
