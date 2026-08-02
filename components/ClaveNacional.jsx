import { useState, useRef, useEffect } from 'react';
import { LARGO_CLAVE, desbloquear } from '/utils/claveNacional.js';

// Cajita por caracter. El foco salta solo al escribir y vuelve con backspace,
// que es como funcionan los codigos de verificacion en cualquier lado.
// Se valida sola al completar el ultimo caracter: no hace falta boton.

function ClaveNacional({ desbloqueado, ocultos, onDesbloquear }) {
  const [chars, setChars] = useState(Array(LARGO_CLAVE).fill(''));
  const [error, setError] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const refs = useRef([]);

  // Al equivocarse se limpia y vuelve el foco al principio.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => {
      setChars(Array(LARGO_CLAVE).fill(''));
      setError(false);
      refs.current[0]?.focus();
    }, 900);
    return () => clearTimeout(t);
  }, [error]);

  function intentar(valor) {
    if (desbloquear(valor)) {
      onDesbloquear();
    } else {
      setError(true);
    }
  }

  function handleChange(i, raw) {
    // solo alfanumerico, y si pegan el codigo entero se reparte en las cajas
    const limpio = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!limpio) return;

    const next = [...chars];
    if (limpio.length > 1) {
      for (let k = 0; k < LARGO_CLAVE - i; k++) next[i + k] = limpio[k] || '';
    } else {
      next[i] = limpio;
    }
    setChars(next);

    const siguiente = Math.min(i + (limpio.length > 1 ? limpio.length : 1), LARGO_CLAVE - 1);
    refs.current[siguiente]?.focus();

    if (next.every((c) => c)) intentar(next.join(''));
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      e.preventDefault();
      const next = [...chars];
      next[i - 1] = '';
      setChars(next);
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < LARGO_CLAVE - 1) refs.current[i + 1]?.focus();
  }

  if (desbloqueado) {
    return (
      <div className="clave-nac clave-nac-ok">
        <p className="clave-nac-ok-texto">
          Estás viendo el catálogo completo de cinturones
        </p>
      </div>
    );
  }

  return (
    <div className={`clave-nac${error ? ' is-error' : ''}`}>
      <div className="clave-nac-fila">
      {abierto ? (
        <div className="clave-nac-campos" role="group" aria-label="Clave de acceso">
          {chars.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              className="clave-nac-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              maxLength={LARGO_CLAVE}
              value={c}
              aria-label={`Caracter ${i + 1} de ${LARGO_CLAVE}`}
              aria-invalid={error || undefined}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>
      ) : (
        <button
          type="button"
          className="clave-nac-abrir"
          onClick={() => {
            setAbierto(true);
            setTimeout(() => refs.current[0]?.focus(), 0);
          }}
        >
          Ingresar clave
        </button>
      )}
        {ocultos > 0 && (
          <span className="clave-nac-cuantos">
            ({ocultos} {ocultos === 1 ? 'modelo' : 'modelos'} de cinturones más disponibles)
          </span>
        )}
      </div>

      <p className="clave-nac-aviso" role="status">
        {error ? 'Clave incorrecta. Probá de nuevo.' : ' '}
      </p>
    </div>
  );
}

export default ClaveNacional;
