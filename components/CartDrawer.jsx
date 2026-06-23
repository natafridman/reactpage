import { useEffect } from 'react';
import { useCart } from '/context/CartContext.jsx';
import { cartWhatsappUrl, formatARS } from '/utils/productUtils.js';

function CartDrawer() {
  const {
    items,
    isOpen,
    count,
    total,
    hasUnpriced,
    closeCart,
    increment,
    decrement,
    removeItem,
    clearCart,
  } = useCart();

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeCart]);

  const finalize = () => {
    if (items.length === 0) return;
    window.open(cartWhatsappUrl(items, total), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`cart-drawer-root ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="cart-backdrop" onClick={closeCart} />

      <aside
        className="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de pedido"
      >
        <header className="cart-panel-head">
          <div className="cart-panel-title">
            <h2>Tu pedido</h2>
            <span className="cart-panel-count">{count} {count === 1 ? 'producto' : 'productos'}</span>
          </div>
          <button className="cart-close" onClick={closeCart} aria-label="Cerrar carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Tu carrito está vacío</p>
            <span>Agregá productos y armá tu pedido para enviarlo por WhatsApp.</span>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((it) => (
                <li className="cart-item" key={it.key}>
                  <div className="cart-item-thumb">
                    <img
                      src={it.image}
                      alt={it.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.target.style.visibility = 'hidden'; }}
                    />
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-info">
                      <span className="cart-item-title">{it.title}</span>
                      {it.code && <span className="cart-item-code">{it.code}</span>}
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-qty">
                        <button onClick={() => decrement(it.key)} aria-label={`Quitar una unidad de ${it.title}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span>{it.qty}</span>
                        <button onClick={() => increment(it.key)} aria-label={`Agregar una unidad de ${it.title}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>
                      <span className={`cart-item-price ${it.price == null ? 'is-consult' : ''}`}>
                        {it.price == null ? 'A confirmar' : formatARS(it.price * it.qty)}
                      </span>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(it.key)} aria-label={`Eliminar ${it.title} del carrito`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6M14 11v6"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="cart-foot">
              {total > 0 ? (
                <>
                  <div className="cart-total-row">
                    <span>Total estimado</span>
                    <strong>{formatARS(total)}</strong>
                  </div>
                  {hasUnpriced && (
                    <p className="cart-foot-note">Algunos productos quedan con precio a confirmar.</p>
                  )}
                </>
              ) : (
                <p className="cart-foot-note">Te pasamos el presupuesto por WhatsApp.</p>
              )}
              <button className="cart-finalize" onClick={finalize}>
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.137 7.998L.074 31.79a.5.5 0 0 0 .612.613l7.89-2.066A15.93 15.93 0 0 0 16.004 32C24.837 32 32 24.837 32 16.001 32 7.163 24.837 0 16.004 0zm0 29.333a13.27 13.27 0 0 1-6.87-1.907.5.5 0 0 0-.426-.05l-5.47 1.432 1.43-5.393a.5.5 0 0 0-.054-.432A13.28 13.28 0 0 1 2.667 16C2.667 8.636 8.638 2.667 16.004 2.667c7.364 0 13.33 5.969 13.33 13.334 0 7.364-5.966 13.332-13.33 13.332z"/>
                </svg>
                Finalizar pedido por WhatsApp
              </button>
              <button className="cart-clear" onClick={clearCart}>Vaciar carrito</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
