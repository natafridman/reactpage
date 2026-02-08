function ImageModal({ modalDisplay, modalOpen, imageSrc, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.id === 'imageModal') {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

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
      <div className="modal-content">
        <img id="modalImage" src={imageSrc} alt="Imagen ampliada" />
      </div>
    </div>
  );
}

export default ImageModal;
