// Inline quantity control shown on a product once it is in the cart. Mutations
// go straight to the cart context; reaching 0 removes the line (the parent then
// renders the "Agregar" button again). `variant` themes the size/shape.
function QtyStepper({ qty, onDecrement, onIncrement, variant = 'card', label = 'producto' }) {
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  const dec = (e) => { stop(e); onDecrement(); };
  const inc = (e) => { stop(e); onIncrement(e.currentTarget); };

  return (
    <div className={`qty-stepper qty-stepper--${variant}`} onClick={stop}>
      <button type="button" className="qty-stepper-btn" onClick={dec} aria-label={`Quitar una unidad de ${label}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <span className="qty-stepper-val" aria-live="polite">{qty}</span>
      <button type="button" className="qty-stepper-btn" onClick={inc} aria-label={`Agregar una unidad de ${label}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}

export default QtyStepper;
