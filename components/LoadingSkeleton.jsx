function LoadingSkeleton() {
  return (
    <div className="loading-overlay" id="loadingOverlay">
      <div className="loading-product-skeleton">
        <div className="loading-gallery-side">
          <div className="loading-number"></div>
          <div className="loading-text"></div>
          <div className="loading-gallery">
            <div className="loading-gallery-item"></div>
            <div className="loading-gallery-item"></div>
            <div className="loading-gallery-item"></div>
            <div className="loading-gallery-item"></div>
            <div className="loading-gallery-item"></div>
            <div className="loading-gallery-item"></div>
          </div>
        </div>
        <div className="loading-hero-side"></div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
