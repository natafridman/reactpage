import { useRef, useEffect, useState } from 'react';

function ImageModal({ modalDisplay, modalOpen, imageSrc, allImages, onClose, onImageChange }) {
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);
  const contentRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentIndex = allImages ? allImages.indexOf(imageSrc) : -1;
  const hasMultiple = allImages && allImages.length > 1;

  useEffect(() => {
    setSwipeOffset(0);
    setIsTransitioning(false);
  }, [imageSrc]);

  const handleBackdropClick = (e) => {
    if (e.target.id === 'imageModal') {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const goToImage = (direction) => {
    if (!hasMultiple || isTransitioning) return;
    const newIndex = (currentIndex + direction + allImages.length) % allImages.length;
    setIsTransitioning(true);
    setSwipeOffset(direction > 0 ? -window.innerWidth : window.innerWidth);
    setTimeout(() => {
      onImageChange(allImages[newIndex]);
      setSwipeOffset(0);
      setIsTransitioning(false);
    }, 250);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (!isTransitioning) {
      setSwipeOffset(touchDeltaX.current);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const threshold = 60;
    if (Math.abs(touchDeltaX.current) > threshold && hasMultiple) {
      goToImage(touchDeltaX.current < 0 ? 1 : -1);
    } else {
      setSwipeOffset(0);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!modalOpen || !hasMultiple) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goToImage(1);
      if (e.key === 'ArrowLeft') goToImage(-1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen, currentIndex, allImages]);

  return (
    <div
      id="imageModal"
      className={`modal ${modalOpen ? 'show' : ''}`}
      style={{ display: modalDisplay ? 'flex' : 'none' }}
      onClick={handleBackdropClick}
    >
      <span
        className="modal-close"
        id="modalClose"
        onClick={handleCloseClick}
      >
        &times;
      </span>

      {hasMultiple && (
        <button className="modal-nav modal-nav-left" onClick={(e) => { e.stopPropagation(); goToImage(-1); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}

      <div
        className="modal-content"
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${modalOpen ? 1 : 0.9}) translateX(${swipeOffset}px)`,
          transition: isTransitioning || swipeOffset === 0
            ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease'
            : 'none'
        }}
      >
        <img id="modalImage" src={imageSrc} alt="Imagen ampliada" />
      </div>

      {hasMultiple && (
        <button className="modal-nav modal-nav-right" onClick={(e) => { e.stopPropagation(); goToImage(1); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}

      {hasMultiple && (
        <div className="modal-counter">
          {currentIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  );
}

export default ImageModal;
