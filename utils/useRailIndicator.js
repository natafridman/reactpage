import { useEffect, useRef, useState } from 'react';

// Mide un contenedor con scroll horizontal (el .gallery-rail-track adentro del
// ref) y devuelve la proporcion visible y la posicion, para dibujar una barra
// propia. `x` es el desplazamiento del pulgar en % de su propio ancho, asi se
// aplica con translateX sin calcular pixeles.
export function useRailIndicator() {
  const ref = useRef(null);
  const [state, setState] = useState({ show: false, w: 100, x: 0 });

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const track = root.querySelector('.gallery-rail-track');
    if (!track) return undefined;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const total = track.scrollWidth;
      const view = track.clientWidth;
      if (!total || total <= view + 2) { setState((s) => (s.show ? { show: false, w: 100, x: 0 } : s)); return; }
      const w = Math.max((view / total) * 100, 12);
      const maxScroll = total - view;
      const ratio = Math.min(Math.max(track.scrollLeft / maxScroll, 0), 1);
      const x = ratio * ((100 - w) / w) * 100;
      setState({ show: true, w, x });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    track.addEventListener('scroll', onScroll, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    ro && ro.observe(track);
    const imgs = track.querySelectorAll('img');
    imgs.forEach((im) => im.addEventListener('load', onScroll));
    return () => {
      track.removeEventListener('scroll', onScroll);
      ro && ro.disconnect();
      imgs.forEach((im) => im.removeEventListener('load', onScroll));
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return [ref, state];
}
