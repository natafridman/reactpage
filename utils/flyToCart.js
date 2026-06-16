// Visual flourish: launch a small "+" token from the tapped button and arc it
// into the header cart button, then give the cart a quick bump. Pure DOM, no
// dependencies. No-op if either node is missing or off-screen.
export function flyToCart(sourceEl) {
  const cart = document.querySelector('.cart-toggle');
  if (!sourceEl || !cart || typeof sourceEl.getBoundingClientRect !== 'function') return;

  const s = sourceEl.getBoundingClientRect();
  const t = cart.getBoundingClientRect();
  if (!s.width || !t.width) return;

  const startX = s.left + s.width / 2;
  const startY = s.top + s.height / 2;
  // If the header is hidden / sliding in, its cart sits off-screen; aim at the
  // resting position so the token still lands on it once the header is down.
  const endX = t.left + t.width / 2;
  const endY = t.top < 8 ? 37 : t.top + t.height / 2;
  const dx = endX - startX;
  const dy = endY - startY;

  const fly = document.createElement('div');
  fly.className = 'fly-plus';
  fly.textContent = '+';
  fly.style.left = `${startX}px`;
  fly.style.top = `${startY}px`;
  document.body.appendChild(fly);

  // Arc upward at the midpoint, then shrink into the cart icon.
  const anim = fly.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      {
        transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 55}px)) scale(1.15)`,
        opacity: 1,
        offset: 0.55,
      },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`, opacity: 0.15 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.5, -0.3, 0.6, 1)' }
  );

  anim.onfinish = () => {
    fly.remove();
    cart.classList.remove('cart-bump');
    // reflow so the animation restarts even on rapid repeated adds
    void cart.offsetWidth;
    cart.classList.add('cart-bump');
    setTimeout(() => cart.classList.remove('cart-bump'), 360);
  };
  anim.oncancel = () => fly.remove();
}
