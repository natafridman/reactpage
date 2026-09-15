// Prepara una foto para usar de hero: la recorta a 2:1 (apaisado) y la exporta
// en webp a 1400 y 2400, igual que el hero de la landing.
//   node scripts/preparar-hero.mjs <origen.jpg> <nombre> [gravedad] [proporcion]
// gravedad: center (por defecto), north, south, attention
// proporcion: ancho/alto, 1.5 por defecto. El recorte final lo termina el CSS
// con object-fit: cover, asi que conviene no recortar de mas aca.
import sharp from 'sharp';
import path from 'node:path';

const [origen, nombre, gravedad = 'center', proporcion = '1.5'] = process.argv.slice(2);
if (!origen || !nombre) {
  console.error('uso: node scripts/preparar-hero.mjs <origen> <nombre> [gravedad]');
  process.exit(1);
}

const destino = 'public/images/hero';
for (const ancho of [1400, 2400]) {
  const salida = path.join(destino, `${nombre}-${ancho}.webp`);
  const info = await sharp(origen)
    .resize(ancho, Math.round(ancho / Number(proporcion)), { fit: 'cover', position: gravedad })
    .webp({ quality: 78 })
    .toFile(salida);
  console.log(`${salida}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
