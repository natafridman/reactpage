// Saca el marco negro de las fotos de un producto: busca desde cada borde
// hacia adentro hasta que la linea deja de ser oscura, y recorta ahi mas un
// margen chico. Si no encuentra marco, no toca la foto.
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const carpeta = process.argv[2];
const aplicar = process.argv.includes('--aplicar');

const OSCURO = 110;      // por debajo de esto, el pixel cuenta como negro
const PROPORCION = 0.6;  // la linea es "marco" si 60% de sus pixeles son oscuros
const MARGEN = 2;        // unos pixeles extra, por el degrade del borde

function lineaOscura(datos, ancho, alto, canales, { fila, columna }) {
  let oscuros = 0;
  const total = fila !== undefined ? ancho : alto;
  for (let i = 0; i < total; i++) {
    const x = fila !== undefined ? i : columna;
    const y = fila !== undefined ? fila : i;
    const p = (y * ancho + x) * canales;
    const luz = (datos[p] + datos[p + 1] + datos[p + 2]) / 3;
    if (luz < OSCURO) oscuros++;
  }
  return oscuros / total >= PROPORCION;
}

for (const nombre of readdirSync(carpeta).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
  const ruta = path.join(carpeta, nombre);
  const img = sharp(ruta);
  const meta = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;

  // El marco no esta pegado al borde: suele haber unos pixeles blancos, despues
  // la linea negra y recien ahi la foto. Asi que no alcanza con avanzar
  // mientras la linea sea oscura; hay que buscar, dentro de una franja, cual es
  // la linea oscura mas profunda y cortar justo despues de esa.
  const limite = Math.round(Math.min(w, h) * 0.06);
  const masProfunda = (leer) => {
    let ultima = -1;
    for (let i = 0; i < limite; i++) if (leer(i)) ultima = i;
    return ultima;
  };
  const arriba = masProfunda((i) => lineaOscura(data, w, h, c, { fila: i })) + 1;
  const abajo = masProfunda((i) => lineaOscura(data, w, h, c, { fila: h - 1 - i })) + 1;
  const izq = masProfunda((i) => lineaOscura(data, w, h, c, { columna: i })) + 1;
  const der = masProfunda((i) => lineaOscura(data, w, h, c, { columna: w - 1 - i })) + 1;

  if (!arriba && !abajo && !izq && !der) {
    console.log(`   ${nombre}: sin marco, se deja como esta`);
    continue;
  }

  const t = Math.min(arriba + MARGEN, limite);
  const b = Math.min(abajo + MARGEN, limite);
  const l = Math.min(izq + MARGEN, limite);
  const r = Math.min(der + MARGEN, limite);
  console.log(`   ${nombre}: ${w}x${h} -> recorta arriba ${t}, abajo ${b}, izq ${l}, der ${r}`);

  if (aplicar) {
    const salida = await sharp(ruta)
      .extract({ left: l, top: t, width: w - l - r, height: h - t - b })
      [meta.format === 'png' ? 'png' : 'jpeg'](meta.format === 'png' ? { compressionLevel: 9 } : { quality: 92 })
      .toBuffer();
    const { writeFileSync } = await import('node:fs');
    writeFileSync(ruta, salida);
  }
}
console.log(aplicar ? 'listo, fotos reescritas' : 'solo prueba: agregar --aplicar para escribir');
