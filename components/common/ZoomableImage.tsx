import React, { useState, useRef } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const startPanPosition = useRef({ x: 0, y: 0 });
  const startTouchDist = useRef(0);
  const startScale = useRef(1);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const clampPan = (x: number, y: number, currentScale: number) => {
    const { width = 0, height = 0 } = containerRef.current?.getBoundingClientRect() || {};
    const maxPanX = Math.max(0, (width * currentScale - width) / 2);
    const maxPanY = Math.max(0, (height * currentScale - height) / 2);
    return {
      x: clamp(x, -maxPanX, maxPanX),
      y: clamp(y, -maxPanY, maxPanY),
    };
  };
  
  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { deltaY, clientX, clientY } = e;
    const zoomIntensity = 0.1;
    const newScale = clamp(scale - deltaY * zoomIntensity * 0.1, 1, 5);

    if (newScale === 1) {
        resetZoom();
        return;
    }

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
    const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);
    
    setPan(clampPan(newPanX, newPanY, newScale));
    setScale(newScale);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 || e.button !== 0) return;
    isInteracting.current = true;
    startPan.current = { x: e.clientX, y: e.clientY };
    startPanPosition.current = pan;
    (e.currentTarget as HTMLDivElement).style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isInteracting.current) return;
    const dx = e.clientX - startPan.current.x;
    const dy = e.clientY - startPan.current.y;
    setPan(clampPan(startPanPosition.current.x + dx, startPanPosition.current.y + dy, scale));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    isInteracting.current = false;
    (e.currentTarget as HTMLDivElement).style.cursor = scale > 1 ? 'grab' : 'default';
  };
  
  const getTouchDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) { // Pinch
      isInteracting.current = true;
      startTouchDist.current = getTouchDistance(e.touches);
      startScale.current = scale;
    } else if (e.touches.length === 1 && scale > 1) { // Pan
      isInteracting.current = true;
      startPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startPanPosition.current = pan;
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isInteracting.current) return;
    e.preventDefault();

    if (e.touches.length === 2) { // Pinching
        const newDist = getTouchDistance(e.touches);
        const scaleMultiplier = newDist / startTouchDist.current;
        const newScale = clamp(startScale.current * scaleMultiplier, 1, 5);
        setScale(newScale);

    } else if (e.touches.length === 1 && scale > 1) { // Panning
        const dx = e.touches[0].clientX - startPan.current.x;
        const dy = e.touches[0].clientY - startPan.current.y;
        setPan(clampPan(startPanPosition.current.x + dx, startPanPosition.current.y + dy, scale));
    }
  };
  
  const handleTouchEnd = () => {
    isInteracting.current = false;
    if (scale === 1) {
        resetZoom();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-base-200 dark:bg-dark-base-300 rounded-lg overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={resetZoom}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: scale > 1 ? 'grab' : 'default',
        touchAction: 'none' // Prevent browser default touch actions like scroll
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transition: isInteracting.current ? 'none' : 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default ZoomableImage;
