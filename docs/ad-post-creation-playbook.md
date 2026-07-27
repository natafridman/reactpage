# Playbook: crear anuncios y posts (IG/Meta) para B2YOU

Guía para generar creativos (anuncios + posts) de forma programática, on-brand y sin diseñador.

Adaptado desde el playbook original escrito para el proyecto metAr
(`Trabajos/metAr/web/docs/ad-post-creation-playbook.md`). Lo que sigue ya está traducido a B2YOU:
paleta real, fuentes reales, logo real, stack real de este repo. Las partes universales (zonas
seguras de Instagram, método, checklist) se conservan.

> **Estado (2026-07-24): el pipeline está construido y corrió.** El renderer elegido es
> **Playwright** (opción B). El código vive en `ads/src/` y hay 5 conceptos entregados en `ads/`,
> tres en tema claro y dos en oscuro, cada uno en historia y post. Ver la sección 12 para los
> conceptos, la 13 para el estudio de competencia que definió el layout, la 14 para cómo agregar
> uno nuevo y la 15 para el tema oscuro.
> El esqueleto de satori de la sección 9 sigue siendo referencia sin ejecutar.

---

## 0. Qué se produce

- **Anuncio de historia**: 1080x1920 (9:16).
- **Anuncio/post de feed**: 1080x1350 (4:5), el formato más alto que permite el feed.
- Cada concepto se rinde en LOS DOS formatos, con el mismo bloque de contenido.
- Todo generado por código (no Figma): un script Node que rinde PNG. Reproducible, versionable, se
  itera cambiando datos y re-renderizando.

---

## 1. Con qué (stack técnico)

### La diferencia grande con metAr

metAr es una app **Next.js**, así que usaba `next/og` (`ImageResponse`) para rendir PNG.
**Este repo es Vite + React con pnpm, sin Next**, así que `next/og` no está disponible y traerlo
significaría instalar Next entero solo para un script. Había dos caminos razonables; se eligió el
B (Playwright). Quedan los dos documentados porque el A sigue siendo válido si cambian las
prioridades.

#### Opción A: satori + @resvg/resvg-js

Es exactamente lo que `next/og` envuelve por dentro, sin la dependencia de Next.

```
pnpm add -D satori @resvg/resvg-js
```

- **A favor**: el playbook de metAr transfiere 1 a 1 (mismo motor, mismos gotchas, mismo
  esqueleto). Sin browser, determinístico, rápido, fácil de correr en CI.
- **En contra**: satori no hace text shaping real. `letterSpacing` es px fijo, el soporte de ejes
  de fuente variable es pobre, y no hay `font-feature-settings` ni optical sizing. Para una marca
  cuya display es **Fraunces** (serif variable con optical size) eso se nota.
- **Fuentes**: satori come `.ttf`, `.otf` y `.woff` (no `.woff2`). Los dos ya están en el repo:
  - Fraunces: `node_modules/@fontsource/fraunces/files/fraunces-latin-<peso>-normal.woff`
    (108 archivos, un peso por archivo, que es justo lo que satori necesita porque evita el
    problema de la fuente variable).
  - Inter: `scripts/fonts/Inter-{Regular,Medium,MediumItalic,Bold}.ttf`.

#### Opción B: HTML + screenshot con Playwright

Escribir el creativo como HTML/CSS y sacarle una foto headless a 1080x1920 / 1080x1350.

```
pnpm add -D playwright
```

- **A favor**: CSS completo y real. Fraunces se renderiza con sus ejes variables, kerning y
  optical sizing de verdad; `letter-spacing` en `em`; `object-fit`, `mix-blend-mode`, `filter`,
  gradientes, `clip-path`, todo funciona. Se pueden reusar los tokens de `landing.css` en vez de
  duplicarlos. Las fotos de producto entran como `<img>` normal, sin base64.
- **En contra**: agrega un browser como dependencia, es más lento, y el resultado puede variar un
  poco entre máquinas. Se pierde el esqueleto de código de metAr (hay que escribir uno nuevo).
- Este repo **ya usa Playwright** para verificación visual, aunque vía MCP y no como dependencia
  npm. Ver la memoria `b2you-visual-verify-workflow`.

#### Decisión: opción B (Playwright)

**Elegida y ya en uso.** La marca es serif editorial + fotografía de producto real, y ahí el
renderizado tipográfico fino es parte del producto: la barra de calidad de este repo es
explícitamente "que no parezca hecho por IA", y la tipografía floja es uno de los delatores.

Al construir el primer concepto aparecieron tres cosas que **solo se resuelven con CSS real**, lo
que confirmó la decisión:

1. El logo (`B2 B2YOU Header Landscape.png`) tiene canal alfa pero está **totalmente opaco**: su
   fondo blanco es sólido. Sobre cream se ve un recuadro. Se resuelve con `mix-blend-mode:multiply`,
   que satori no soporta.
2. La costura entre el canvas cream y el fondo casi blanco de la foto se disimula con
   `mask-image:linear-gradient(...)`, tampoco disponible en satori.
3. El acento del sitio es Fraunces **itálica** dentro del titular. Con text shaping real se ve
   como en la web; satori lo aproximaría.

Satori sigue siendo la opción correcta si en el futuro se prioriza determinismo o CI.

**Instalación sin tocar el repo**: no hace falta `pnpm add -D playwright`. Alcanza con
`playwright-core` (1 paquete, no descarga browsers) apuntando al Chromium que ya está en
`C:/Users/Hogar/AppData/Local/ms-playwright/chromium-<build>/chrome-win64/chrome.exe`, instalado
por el Playwright MCP. Así el `package.json` del proyecto queda intacto.

### Utilidades que ya están instaladas

- **sharp** (`0.34.5`, devDependency): contact sheets, montajes de revisión, preprocesar fotos
  (desaturar, redimensionar) y overlays de verificación de zonas seguras. Como el script vive
  dentro del repo, se importa directo (`import sharp from "sharp"`), sin el truco de `createRequire`
  que metAr necesitaba por correr afuera de la app.
- **pdfkit**: no sirve para esto, pero ojo, `scripts/generate-catalog.js` ya resolvió cómo cargar
  Fraunces desde `@fontsource` y es buena referencia de cómo se usa la tipografía de marca fuera
  del browser.

### Gotchas de Playwright (los dos que aparecieron de verdad)

- **`<meta charset="utf-8">` es obligatorio.** Al abrir el HTML por `file://` no hay header HTTP
  que declare el encoding, el browser cae a windows-1252 y todos los acentos se rompen
  (`MarroquinerÃ­a`, `AprobÃ¡s`, `PedÃ­ tu cotizaciÃ³n`). Servido por HTTP no pasa, porque el
  server manda el charset. Es un bug que **no se ve hasta que se mira el PNG**.
- **No confiar en el browser del MCP para el tamaño.** El Playwright MCP ajusta el
  `devicePixelRatio` cuando la ventana pedida no entra en la pantalla física: al pedir 1080x1920
  el DPR bajó a 0.5 y el viewport quedó en 2160x2700, así que el creativo se dibujó a media escala
  dentro de un PNG que igual medía 1080x1920. Para rendir hay que usar `playwright-core` con
  `viewport` y `deviceScaleFactor:1` explícitos. El MCP sirve para mirar, no para producir.
- **Esperar `document.fonts.ready`** antes del screenshot, o dispara con la fuente sin cargar.
- Verificar siempre el resultado: el script imprime `dpr`, `viewport` y el tamaño real del
  `.frame` en cada render, justamente para que un desajuste se note en la consola y no en la
  entrega.

### Gotchas de satori (solo si se elige la opción A)

- **Todo elemento con más de un hijo necesita `display:flex`.** Conviene un helper `h()` que lo
  agregue siempre.
- El **texto va solo en divs hoja**, nunca texto suelto al lado de otro elemento.
- Soporta `transform`, gradientes (`radial-gradient` / `linear-gradient`), `objectFit` /
  `objectPosition`, `position:absolute` con `top/left/right/bottom`, `box-shadow`, `text-shadow`,
  `letterSpacing` en px, `flexGrow`, `flexWrap`, `borderTop`.
- **Imágenes**: como nodo `{ type:"img", props:{ src, style } }` con `src` = **data URI base64**.
  No hay red durante el render. Para full bleed, `objectFit:"cover"` + `objectPosition`.
- `letterSpacing` es **fijo en px**: para el mismo texto a distintos tamaños hay que hacerlo
  proporcional (`-size * 0.04`) o el texto grande queda suelto.

---

## 2. Skills a cargar

**Marketing** (repo `github.com/coreyhaines31/marketingskills`, o las equivalentes ya instaladas):

- `ad-creative`: biblioteca de 15 plantillas de anuncio estático (Headline Statement, Us vs Them,
  Stat Callout, Review Card, Before/After, Problem/Solution, Founder Message, Feature Spotlight,
  FAQ Card, Competitor Callout, Numbered List, etc). **Regla núcleo: GROUND todo, nunca inventar
  stats ni testimonios.** Ciclar entre plantillas, porque diversidad de plantilla es diversidad de
  ángulo.
- `copywriting`, `marketing-psychology` (aversión a la pérdida, prueba social, escasez, framing),
  `social`, `offers`.

**Diseño**: `frontend-design` y `ui-ux-pro-max` están vendorizadas en `.claude/skills/` de este
repo. `high-end-visual-design` (jerarquía, whitespace, nunca el mismo layout dos veces) **no** está
acá, viene del set global de skills.

Ojo con `ad-creative`: varias de sus plantillas piden números (Stat Callout, Review Card). B2YOU
**no tiene métricas ni testimonios publicados** que se puedan citar. Ver sección 5.

---

## 3. Método (cómo)

1. **Estudiar la competencia primero.** Pedir capturas de anuncios de competidores. Robar
   **ÁNGULOS y estructura**, nunca los estilos ni las métricas falsas. Para B2YOU la competencia
   es marroquinería/merchandising corporativo y fábricas de accesorios con marca propia, no las
   SaaS que estudió metAr.
2. **Ciclar plantillas** de `ad-creative` para cubrir ángulos distintos, una pieza por plantilla.
3. **Dos formatos por concepto** (historia 1920 + post 1350). Mismo bloque, dos marcos.
4. **Verificar VIENDO.** Rendir PNG, abrirlo con Read, iterar. Para revisar muchos barato, armar
   montajes / contact sheets con sharp (una sola imagen con N piezas). Overlay de zonas seguras
   para chequear que nada crítico queda tapado.
5. **Fotos**: acá cambia todo respecto de metAr, ver sección 6.

---

## 4. Zonas seguras de Instagram (universal, se conserva)

Fuentes 2026 (priorizar Meta oficial): FirstPier, 1ClickReport, AdMake, Vaizle, Behaviour Digital,
Meta Business Help. Convergen en:

- **Historia-anuncio (1080x1920)**:
  - **Arriba: reservar ~270px (14%)**, donde van foto de perfil, @usuario, "Publicidad", hora,
    barra de progreso y la X.
  - **Abajo: reservar ~380px (20%)**. Meta **autogenera** su botón CTA ("Más información")
    **centrado abajo** (~y=1540-1700) más la barra de "Enviar mensaje". **Ese botón es de Meta, no
    tuyo.**
  - **Banda central segura: y 270 a 1540.** Todo lo importante va ahí.
  - **Corrección respecto del playbook de metAr: en esta categoría no se dibuja un CTA propio.**
    metAr recomendaba poner un botón propio centrado dentro de la banda. Al mirar 5 anuncios
    reales de marroquinería (sección 13), **ninguno** lo hace: los cinco se apoyan en el botón que
    autogenera Meta. Dibujar uno propio deja dos botones apilados, que es un tell de amateur.
- **Post de feed (1080x1350)**: el @usuario va ARRIBA y el botón ABAJO, **fuera** de la imagen, así
  que se usa casi todo el cuadro con un margen prudente (~60px).
- **"Llenar el espacio"**: titular arriba + imagen grande que ocupa todo hasta el CTA, casi sin
  fondo vacío. Evitar contenido chico flotando con mucho vacío.

Truco de verificación: componer con sharp una franja roja semitransparente en top (0-270) y bottom
(1540-1920) sobre el render, para VER que nada crítico cae bajo el chrome de IG. Snippet en la
sección 8.

---

## 5. Marca B2YOU

### Paleta (tokens reales de `index.css`, tema claro)

| Token | Valor | Uso |
| --- | --- | --- |
| `--b2-cream` | `#FAFAF9` | fondo principal claro |
| `--b2-espresso` | `#281612` | bandas oscuras, fondo del tema oscuro |
| `--b2-cognac` | `#7A4F48` | **único acento**, CTA, detalles |
| `--b2-cognac-hover` | `#8F6259` | variante del acento |
| `--b2-black` | `#2D2D2D` | texto principal |
| `--b2-gray` | `#5A5A5A` | texto secundario |
| `--b2-light-gray` | `#888888` | texto terciario |
| `--b2-border` | `#E5E5E5` | bordes finos |
| `--b2-white` | `#FFFFFF` | blanco puro |

En tema oscuro el cognac se aclara a `#C08A7E` porque el cognac oscuro no contrasta contra
espresso. Mismo principio que en metAr con el celeste: **el acento cambia de valor según el
fondo**, no se usa el mismo hex en los dos temas.

### Tipografía

- **Display: Fraunces** (serif). Ya instalada como `@fontsource/fraunces` en devDependencies.
  Archivos por peso en `node_modules/@fontsource/fraunces/files/fraunces-latin-<peso>-normal.woff`.
- **Cuerpo: Inter**. TTF en `scripts/fonts/Inter-{Regular,Medium,MediumItalic,Bold}.ttf`.
- No mezclar más familias. Dos fuentes alcanzan.

### Logo

Assets reales en `public/images/Branding/`:

- `B2 B2YOU Header Landscape.png` y `...Landscape 2.png`: monograma B2 (con la flecha) + wordmark
  "B2YOU", negro sobre blanco.
- `B2 B2YOU Header.png`
- `B2YOU-logo-white.jpg`: versión para fondos oscuros. Es JPG, así que **no tiene transparencia**;
  revisar antes de componerlo sobre color.

**Acá desaparece un paso entero del playbook de metAr.** metAr no tenía el asset del logo y había
que bajar el TTF exacto (Poppins ExtraBold) de `github.com/google/fonts` para tipear el wordmark a
mano. B2YOU **tiene el archivo**, así que se usa el PNG y listo.

Regla dura que se conserva: **nunca tipear "B2YOU" a mano en otra fuente.** El wordmark es una
grotesca geométrica, **no es Fraunces**. Tipearlo en Fraunces sería un logo falso.

---

## 6. Fotos: acá B2YOU juega distinto

metAr no tenía producto físico, así que el playbook original dependía de buscar fotos en
DuckDuckGo (sesgando a pexels/unsplash) y vetar watermarks con un contact sheet.

**B2YOU tiene fotografía de producto propia**: 13 categorías y 103 productos en
`public/images/Categorias/`, cada uno en su carpeta con imágenes (`.jpeg` / `.webp`), miniaturas en
`.thumbs/` y un `metadata.txt`:

```
title: Cinturon Ancho
subtitle: Cuero Ancho Moderno
description: Cinturon ancho de cuero liso con hebilla cuadrada texturizada. ...
code: CIN-003
images: 3395(1).jpeg, 3395.jpeg
videos:
tags: hombre, importado
proveedor: aston
```

Categorías: Billeteras, Bolsos, Bufandas, Carteras, Cinturones, Gorras, Maletines, Mochilas,
Morrales, Mundial, Necessaires, Portadocumentos, Riñoneras.

Consecuencias:

- **La foto de producto sale del repo, no de internet.** Es material propio, licencia no es
  problema, y la memoria `design-bar-no-ai-look` pide explícitamente fotografía de producto real.
- **`description` y `subtitle` del metadata son copy ya escrito y verdadero.** Sirven de insumo
  directo, sin inventar.
- **`proveedor` NUNCA sale del repo.** Es información interna (ver sección 7).
- La búsqueda en DuckDuckGo queda **solo para lifestyle/contexto** (una persona, un escritorio, una
  textura) y **solo como referencia de composición**. Para campaña real: foto licenciada o propia.
  Hosts limpios: pexels y unsplash.com regular. Con watermark: shutterstock, dreamstime, alamy,
  adobe, freepik premium, istock, unsplash+.
- Para que una foto de contexto entre en la paleta: **desaturar** (`sharp.modulate({saturation:0.3})`)
  + **scrim espresso** encima (gradiente). Queda monocroma de marca en vez de "stock pegado".
  Cuidado: esto es para fotos **de fondo detrás de texto**. La foto de producto protagonista va
  con su color real, que el cuero cognac es la marca.

---

## 7. Copy: qué se puede afirmar y qué no

### La barra: que no parezca hecho por IA

Es la restricción más fuerte del proyecto (memoria `design-bar-no-ai-look`). El dueño juzga el
trabajo por si "parece hecho por IA". Traducido a creativos:

- **Sin stats de relleno.** Nada de "100%", "15+ años", "+500 marcas". B2YOU no publica esos
  números y no se inventan.
- **Sin superlativos**: premium, excelencia, impacto, líderes, calidad superior.
- **Sin Title Case en español.** Se escribe "Accesorios para marcas", no "Accesorios Para Marcas".
- **Un solo acento** (cognac), usado con moderación.
- **Restraint editorial y asimetría**, no la retícula centrada perfecta de plantilla.
- Delatores visuales prohibidos, heredados de la auditoría del sitio: iconos dentro de cuadraditos
  redondeados tintados, círculos numerados con línea conectora, gradientes diagonales cognac con
  glow de color, el checkmark de Feather en cada bullet, muros de logos en chips blancos.

### Reglas de escritura

- **Nunca em dash ni en dash.** Guion común. Es constraint duro del repo, no preferencia.
- Tono humano y local, pero profesional. Sin slang ("al toque", "en dos toques").
- Afirmaciones que constatan, no imperativos vacíos.
- **Nunca inventar métricas, testimonios ni resultados.**

### Inventario de pruebas reales (esto SÍ se puede usar)

Todo lo de acá abajo ya está publicado en el sitio, así que es afirmable:

- **Clientes reales**, con logo en `public/images/Clientes/`: yagmour, viacotone, birmingham,
  artful, floppy, samples studios, tbn club.
- **Aprobás la muestra antes de producir.**
- **Presupuesto cerrado, sin sorpresas.**
- **Cuero genuino, hecho para durar.**
- **Personalizable con tu logo** (grabado o estampado, según el metadata de producto).
- **Catálogo descargable** en PDF (`public/catalogo-b2you.pdf`).
- 13 categorías y 103 productos, si hace falta hablar de amplitud. Es un número verificable en el
  repo, no un número de marketing.
- Conversión por **WhatsApp** al `5491178279281`.

### Prohibiciones específicas de B2YOU

- **Nunca nombrar al proveedor.** Los productos tienen `proveedor: aston` / `javera` en el
  metadata. Es información interna y el sitio ya la esconde a propósito (incluido el pop-up de
  términos del carrito). En un anuncio sería una fuga.
- **Nunca mostrar precios.** Están ocultos en todo el sitio (`SHOW_PRICES=false`, las fichas dicen
  "Consultá precio") y el PDF tampoco los trae. Un anuncio con precio contradice el resto.

---

## 8. Layouts: qué transfiere de metAr y qué no

El repertorio de metAr era casi todo mockup de chat y de UI, porque el producto era software. B2YOU
vende objetos de cuero, así que la mitad no aplica.

**Transfieren:**

- **Headline statement**: puro tipográfico, una idea, palabra clave en cognac. Con Fraunces a
  tamaño grande es probablemente el más fuerte para esta marca.
- **Foto a sangre + scrim + titular**: producto o contexto ocupando todo, degradado espresso,
  titular encima.
- **Foto lifestyle + tarjeta flotante**: la foto de fondo, un dato concreto en una tarjeta.
- **Antes / después**: acá sería producto genérico vs producto con la marca del cliente aplicada.
- **Us vs Them**: dos columnas, sin caricaturizar al otro.
- **Feature spotlight**: un producto, un detalle real (la hebilla, la costura, el grabado).
- **Tema claro y tema oscuro**: cream vs espresso, con el acento cognac cambiando de valor según
  el fondo.

**No transfieren** (eran específicos de un producto de software): mecanismo comentario a DM, chat
de venta perdida, bandeja de mensajes sin responder, grilla de logos de redes sociales, post real
embebido con botón "Promocionar", hero con mockup de composer o de pantalla de ads.

**Sin explorar todavía**, y probablemente lo más propio de esta marca: la grilla de catálogo (varios
productos de una categoría), el detalle macro de material, y el logo del cliente aplicado sobre el
cuero. Definir cuando se arranque.

---

## 9. Esqueleto de código

> **Advertencia: lo que sigue viene de metAr y no fue ejecutado en este repo.** Está acá como
> referencia de estructura, con la marca ya traducida a B2YOU. Verificar todo al implementar.

### Opción A: satori + resvg

```js
// scripts/render-ads.mjs  ·  node scripts/render-ads.mjs <out-dir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const OUT = process.argv[2] || "ads-out";
mkdirSync(OUT, { recursive: true });

const FR = "node_modules/@fontsource/fraunces/files";
const FONTS = [
  { name: "Display", data: readFileSync(`${FR}/fraunces-latin-600-normal.woff`), weight: 600, style: "normal" },
  { name: "Body",    data: readFileSync("scripts/fonts/Inter-Regular.ttf"),      weight: 400, style: "normal" },
  { name: "Body",    data: readFileSync("scripts/fonts/Inter-Bold.ttf"),         weight: 700, style: "normal" },
];

// helper: satori exige display:flex en todo nodo con mas de un hijo
const h = (type, props = {}, ...kids) => {
  const style = { display: "flex", ...(props.style || {}) };
  const c = kids.flat().filter((x) => x != null && x !== false);
  return { type, props: { ...props, style, children: c.length <= 1 ? c[0] : c } };
};
const txt = (s, style = {}) => h("div", { style }, String(s));
const dataUri = (f, mime = "image/jpeg") =>
  `data:${mime};base64,${readFileSync(f).toString("base64")}`;

const CREAM = "#FAFAF9", ESPRESSO = "#281612", COGNAC = "#7A4F48", COGNAC_LIGHT = "#C08A7E";

// el logo es un ASSET, no texto tipeado
const Logo = (height = 44, onDark = false) =>
  h("img", {
    src: dataUri(
      onDark
        ? "public/images/Branding/B2YOU-logo-white.jpg"
        : "public/images/Branding/B2 B2YOU Header Landscape.png",
      onDark ? "image/jpeg" : "image/png"
    ),
    style: { height, objectFit: "contain" },
  });

// MARCOS: la historia reserva 270 arriba y 380 abajo (zona del CTA que pone Meta).
const storyFrame = (content, dark = false) =>
  h("div", {
    style: {
      width: 1080, height: 1920, flexDirection: "column", justifyContent: "center",
      fontFamily: "Body", padding: "270px 72px 380px",
      background: dark ? ESPRESSO : CREAM,
    },
  }, content);

const postFrame = (content, dark = false) =>
  h("div", {
    style: {
      width: 1080, height: 1350, flexDirection: "column", justifyContent: "center",
      fontFamily: "Body", padding: "60px 60px 68px",
      background: dark ? ESPRESSO : CREAM,
    },
  }, content);

async function emit(el, key, w, hh) {
  const svg = await satori(el, { width: w, height: hh, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: w } }).render().asPng();
  writeFileSync(path.join(OUT, `${key}.png`), png);
  console.log("OK", key);
}
```

### Opción B: HTML + Playwright

```js
// scripts/render-ads.mjs  ·  node scripts/render-ads.mjs <out-dir>
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const OUT = process.argv[2] || "ads-out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function emit(html, key, w, hh) {
  const page = await browser.newPage({ viewport: { width: w, height: hh } });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);   // sin esto se dispara antes de cargar Fraunces
  await page.screenshot({ path: `${OUT}/${key}.png` });
  await page.close();
}
```

Con este camino el CSS se escribe normal: `@font-face` apuntando a los `.woff` de
`@fontsource/fraunces`, `letter-spacing` en `em`, `object-fit: cover` en las fotos, y los tokens
copiados de `index.css`. Las imágenes se referencian con `file://` o se sirve el `public/` con el
dev server de Vite.

### Verificación de zonas seguras (sharp, ya instalado)

```js
import sharp from "sharp";

const band = (h) =>
  Buffer.from(`<svg width="1080" height="${h}"><rect width="1080" height="${h}" fill="red" opacity="0.32"/></svg>`);

await sharp(render)
  .composite([
    { input: band(270),  top: 0,    left: 0 },
    { input: band(380),  top: 1540, left: 0 },
  ])
  .toFile(check);
```

### Fotos de contexto: fetch de DuckDuckGo (solo referencia, ver sección 6)

```js
const UA = "Mozilla/5.0 ... Chrome/124 Safari/537.36";
async function ddg(q) {
  const t = await (await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`,
    { headers: { "User-Agent": UA } })).text();
  const vqd = t.match(/vqd=["']?([\d-]+)["']?/)?.[1];
  const j = await (await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=,,,&p=1`,
    { headers: { "User-Agent": UA, Referer: "https://duckduckgo.com/" } })).json();
  return (j.results || []).map((x) => x.image); // filtrar por host y revisar en contact sheet
}
```

---

## 10. Flujo repetible (paso a paso)

1. Leer las skills de marketing y diseño. Pedir capturas de competidores. Releer las memorias
   `design-bar-no-ai-look` y `b2you-visual-verify-workflow`.
2. **Decidir el renderer** (sección 1) e instalar lo que corresponda.
3. Escribir el script de render con los marcos (historia y post con sus zonas seguras) y un
   diccionario de conceptos. Un loop rinde cada concepto por 2 formatos.
4. Elegir productos y fotos de `public/images/Categorias/`, leyendo su `metadata.txt` para el copy.
5. Rendir, revisar con Read y contact sheets, iterar tamaños, safe zones y copy.
6. Verificar zonas seguras con el overlay rojo.
7. Pasar el checklist. Entregar en pares historia + post.

---

## 11. Checklist antes de entregar

- [ ] Historia + post por cada concepto.
- [ ] Nada crítico bajo el top 270 ni el bottom 380, verificado con overlay. CTA propio dentro de
      la banda segura.
- [ ] El post de feed usa casi todo el cuadro (el usuario y el botón van fuera de la imagen).
- [ ] Logo puesto como asset real. "B2YOU" nunca tipeado a mano, nunca en Fraunces.
- [ ] Un solo acento cognac, con el valor correcto para el fondo (`#7A4F48` sobre cream,
      `#C08A7E` sobre espresso).
- [ ] Copy sin em dash ni en dash, sin slang, sin superlativos, sin Title Case en español.
- [ ] Cero métricas, testimonios o resultados inventados. Todo lo afirmado sale del inventario de
      la sección 7.
- [ ] Sin nombre de proveedor. Sin precios.
- [ ] Fotos de producto propias del repo. Las de internet solo como referencia de composición.
- [ ] Sin los delatores de IA listados en la sección 7.
- [ ] Variedad de layout y de ángulo, sin repetir plantilla. Probar tema claro y oscuro.

---

## 12. Conceptos producidos (2026-07-24)

Los tres comparten el mismo marco (layout B, sección 13) y el mismo sistema tipográfico. Lo que
cambia es el producto y el argumento. Así se ve como campaña y no como tres piezas sueltas.

| id | layout | estructura del texto | titular / contenido |
| --- | --- | --- | --- |
| `anonimato` | hero claro | solo frase | Nadie va a saber que lo hicimos *nosotros*. |
| `frente-vacio` | hero claro, centrado | frase + línea | El frente está vacío. Por *ahora*. |
| `bordado-o-parche` | hero claro | pregunta + respuesta | ¿Bordado o *parche*? |
| `regalo-real` | hero oscuro, texto abajo | solo frase | Un regalo que se usa *de verdad*. |
| `para-usar` | hero oscuro, a la derecha | frase + línea | Para regalar o para *usar*. |
| `confian` | plano, sin foto | lista + cierre | Los 6 clientes como tipografía |
| `catalogo` | grilla 3x2 | dos datos + línea | 13 categorías, 103 productos |
| `asi-no` | partido a la mitad | dos columnas comparadas | Cómo suele ser / Cómo es con nosotros |
| `costuras` | macro oscuro | solo frase, al pie | Las costuras se hacen *a mano*. |

**Nada de eyebrow + título + subtítulo en todos.** Esa era la receta de las primeras cinco piezas y
es lo que hace que una tanda parezca plantilla aunque cambien la foto y el copy. Cada concepto
declara sus propias `partes` y su alineación, así que la estructura del texto cambia pieza por
pieza: hay piezas de una sola frase, de pregunta y respuesta, de lista, de datos numéricos y de
dos columnas. Tres alineaciones distintas (izquierda, centro, derecha) y el logo a veces arriba y
a veces abajo.

**El hilo común, y es un hallazgo del material, no una idea impuesta**: todas las fotos de producto
del repo muestran el artículo **en blanco, sin ninguna marca encima**. Cinturones y gorras por
igual. Esa ausencia es literalmente el producto que vende B2YOU, así que la foto no ilustra el
titular, lo demuestra.

Copy de las gorras, todo verificable contra `metadata.txt`: "bordado frontal" (Gorra Casual y
Trucker), "corduroy" (Milán), "tela lavada" (Casual), "malla transpirable" (Trucker). El titular
`elige-ponerse` es casi textual de la descripción de la Gorra Trucker ("La gorra que la gente elige
ponerse"), usado como línea general de categoría. En Descargas hay además un archivo
`.DST` de máquina Tajima de bordado en gorra desarmada, o sea que el bordado es producción real.

### El concepto "Anonimato" en detalle

**Plantilla**: Headline Statement (la número 1 de `ad-creative`).

**Insight**: B2YOU fabrica para marcas que le ponen su propio logo al producto. El accesorio sale
al mundo sin decir B2YOU en ningún lado. Eso, que suena a debilidad, es exactamente el servicio.

**Copy**:

- Eyebrow: "Marroquinería para marcas y empresas"
- Titular: "Nadie va a saber que lo hicimos *nosotros*." (la itálica en una sola palabra, como
  manda `.accent`)
- Cuerpo: "Ese es el trabajo. Accesorios de cuero con tu logo grabado. Aprobás la muestra antes de
  producir."
- CTA: "Pedí tu cotización" (el mismo texto que usa el sitio) con el glifo de WhatsApp.

**Foto**: `Cinturones/Cinturon Vestir/8O3A2284.jpeg` (3091x4636). Elegida sobre 78 candidatas
mirando un contact sheet. Gana porque su tercio superior ya es fondo claro vacío (espacio natural
para el titular) y sus dos tercios inferiores son una extensión grande de cuero cognac **sin
ninguna marca encima**: la foto no decora el titular, lo demuestra. Se descartó
`Cinturon Cosido` porque tiene una etiqueta con código de producto visible bajo la hebilla.

**Estilos**: todos sacados del sitio, ninguno inventado. `.brand-story-eyebrow` (Inter 700, .22em,
cognac), `.brand-story-title` (Fraunces 600, -.015em, lh 1.06, `--b2-black`), `.accent` (itálica
500), `.brand-story-text` (lh 1.7, `--b2-gray`), `.closing-cta-primary` (pill 999px + glifo de
WhatsApp). La primera versión usaba una línea divisoria y un CTA rectangular que **no existen en el
sitio**: eran invención, o sea justo el olor a IA que hay que evitar.

**Texto del anuncio en Meta** (validado contra los límites):

| Campo | Texto | Largo |
| --- | --- | --- |
| Primary text | Producimos accesorios de cuero para marcas y empresas. Tu logo grabado, tu etiqueta, tu marca. Nosotros no aparecemos en el producto, y ese es el trabajo. Aprobás la muestra antes de producir y el presupuesto es cerrado. | 220 (el gancho entra completo en los 125 visibles) |
| Headline | Accesorios de cuero con tu marca | 32 / 40 |
| Description | Aprobás la muestra | 18 / 30 |

**Cómo reproducirlo**:

```
cd ads && pnpm install --ignore-workspace   # una sola vez: instala playwright-core
pnpm all                                    # build + render + verify
```

O paso por paso, desde la raíz del repo:

```
node ads/src/build-ad.mjs         # arma el HTML con fuentes y fotos embebidas
node ads/src/render.mjs           # rinde los PNG con viewport y DPR exactos
node ads/src/verify-safezones.mjs # overlay de zonas seguras + montaje del par
```

`ads/` tiene su propio `package.json` a propósito: `playwright-core` solo hace falta para rendir
anuncios y no tiene por qué ensuciar las dependencias del sitio. `ads/src/.build/` (el HTML
intermedio, unos 3.5MB por archivo) está gitignoreado.

---

## 13. Estudio de la competencia (5 anuncios, 2026-07-24)

Capturas de historias-anuncio reales en el feed argentino: `aston.accesorios`, `studebakerofficial`,
`exotica.accesorios`, `felipesalvador.zapatos`, `vakapicueros`. Lo que se roba son ángulos y
estructura, nunca estilos ni métricas.

**1. Ninguno dibuja su propio botón.** Los cinco CTA visibles ("Comprar" en cuatro, "COTIZAR" con
glifo de WhatsApp en vakapi) son el botón que autogenera Meta, en su posición fija de abajo. Cero
botones propios dentro de la imagen. Es la corrección más importante al playbook heredado.

**2. Cuatro de cinco ponen el texto SOBRE la foto a sangre.** El único que separa foto y texto es
`exotica`, con una tarjeta blanca redondeada sobre fondo negro, y es justo el que parece ficha de
catálogo en vez de anuncio. Si la foto y el texto viven en bloques separados, el anuncio se lee
como e-commerce.

**3. Nadie usa serif.** Todos sans, condensadas o geométricas, casi siempre en mayúscula. Fraunces
diferencia a B2YOU de entrada en ese feed, sin esfuerzo.

**4. El producto siempre está en contexto**: puesto encima de alguien (`aston`, tres cinturones
sobre jeans), sostenido en la mano en el taller (`vakapi`), montado en un set (`felipesalvador`),
apoyado en madera (`studebaker`). El único con recorte sobre blanco es `exotica`, el más flojo.
**Esto marca un hueco real de B2YOU**: casi todas sus fotos son recorte sobre blanco. Falta
fotografía lifestyle y de taller.

**5. Dos registros tipográficos válidos**, los dos funcionan:
   - Titular gigante en mayúscula sobre la foto (`aston`: "NUEVOS INGRESOS"; `vakapi`: "REGALOS
     CORPORATIVOS").
   - Bloque chico y silencioso abajo a la izquierda, dejando que la foto haga el trabajo
     (`felipesalvador`: eyebrow + nombre de producto + precio). Es el mejor ejecutado de los cinco
     y su paleta, marrón cálido sobre crema, es la misma familia que la de B2YOU.

**6. El precio como palanca no está disponible.** `felipesalvador` muestra "$42.650, 6 cuotas sin
interés". B2YOU tiene los precios ocultos en todo el sitio por política, así que ese recurso queda
descartado y hay que compensar con otra cosa.

### Qué cambió en el creativo por esto

- Se sacó el botón propio (hallazgo 1). El espacio liberado fue a la foto.
- Se probó la foto a sangre con el texto sobre su propia zona clara (hallazgo 2), que es la
  variante **B**. La foto mide 3091x4636, o sea 1620 de alto a 1080 de ancho: anclada abajo
  arranca en y=300, justo donde termina el chrome de IG, y su fondo claro llega hasta ~y=932. El
  texto entra completo ahí, sin bloque aparte y sin costura.
- Quedaron las dos variantes en `ads/` para comparar: **A** (canvas cream + banda de foto) y **B**
  (foto a sangre). B gana: más presencia de producto y el degradé del fondo de estudio da
  profundidad donde A tiene un plano liso.

---

## 14. El generador es multi-concepto y se autoubica

`ads/src/build-ad.mjs` tiene un array `CONCEPTS`. Agregar una pieza es agregar un objeto con
`photo`, `eyebrow`, `h1`, `body` y el cuerpo de titular por formato. No hay que tocar coordenadas.

**Por qué se autoubica.** El script mide con sharp en qué fila deja de ser claro el fondo de cada
foto y apoya el bloque de texto 44px por encima de ese punto. Las fotos de producto de B2YOU tienen
zonas claras muy distintas (39% el cinturón, 37% la gorra gris, 29% la camel), así que posicionar a
mano significaría recalcular todo cada vez que cambia una foto.

**El bug que enseñó esto.** En la primera pasada el logo estaba en `position:absolute` a una altura
fija mientras el bloque de texto era bottom-anchored. Con la gorra camel, que tiene poca zona clara,
el texto subió y **el eyebrow quedó impreso encima del logo**. El logo ahora vive dentro del flujo
del bloque, así que sube y baja con el texto y nunca colisiona.

**La verificación es del render, no del cálculo.** `render.mjs` mide el `getBoundingClientRect()`
real del bloque ya dibujado y lo compara contra la banda 270-1540. Si algo se sale, lo imprime y
sale con código 1. Se mide sobre el render porque el alto del bloque depende de cómo corte cada
línea de texto, que es justo lo que no se puede predecir desde el script.

```
cd ads && pnpm install --ignore-workspace   # una sola vez
pnpm all                                    # build + render + verify
```

---

## 15. Tema oscuro sobre fotos lifestyle

### Corrección importante: SÍ hay fotografía lifestyle propia

La sección 6 decía que casi todas las fotos son recorte sobre blanco y que faltaba lifestyle. Es
cierto para cinturones y gorras, pero **no para todo el catálogo**. Un barrido midiendo el brillo
de las cuatro esquinas de cada foto encontró **38 fotos con fondo real**, y varias son lifestyle de
verdad, con personas y calle:

- `Riñoneras/Bandolera Siena`: cuatro tomas con modelos, pared soleada y ciudad.
- `Mochilas/Mochila London`: hombre de espaldas con la mochila puesta, en la calle.
- `Bolsos/Bolso Duffle`: el bolso sobre una senda peatonal, luz dura.
- `Necessaries/Neceser Lisboa`, `Carteras/Cartera Bari`, `Billeteras/Billetera Roma`: fondos de
  cemento y superficies, sin modelo.

Vale la pena correr ese barrido antes de asumir que no hay material. El criterio: muestrear las
esquinas de una miniatura y quedarse con las que tengan alguna por debajo de 215 de luminancia.

### Cómo se arma el tema oscuro

- La foto va **a sangre** cubriendo el cuadro entero, sin máscara.
- Encima, un **scrim espresso** en gradiente de arriba hacia abajo
  (`.92` a `.82` a `.45` a `0`), que oscurece la franja donde se apoya el texto y deja el producto
  limpio abajo. De paso tiñe la foto de espresso y la mete en la paleta, que es la versión suave
  del truco de desaturar más scrim de la sección 6.
- El bloque de texto se ancla **arriba** (`y=310` en historia, `64` en post), no abajo. En tema
  claro se ancla abajo porque depende de la zona clara medida; acá el scrim garantiza el contraste,
  así que no hay nada que medir.
- **Colores**: el acento pasa de `#7A4F48` a `#C08A7E`. No es decisión del script: `index.css` ya
  lo hace en `.vision-label`, con un comentario que explica que el cognac oscuro no llega al
  contraste mínimo sobre fondo oscuro. Titular en `#FBF7F4` y cuerpo en `rgba(251,247,244,.80)`,
  que es lo que usa `.vision-text`.

### El logo en oscuro: alfa real, no blend

El asset `B2YOU-logo-white.jpg` es blanco sobre cognac sólido y **no tiene transparencia**, así que
no sirve tal cual. El primer intento fue invertir el PNG negro y mezclarlo con
`mix-blend-mode:screen`, y **falló**: el bloque de texto tiene `z-index`, o sea que crea su propio
contexto de apilado, el blend no llega a componerse contra la foto y el logo sale como un recuadro.

La solución es generar el logo con alfa real en tiempo de build, con sharp: se toma la luminancia
del PNG negro sobre blanco, se invierte para usarla como canal alfa (tinta opaca, papel
transparente) y se rellena con el color que corresponda. `logoConAlfa("#2D2D2D")` para tema claro y
`logoConAlfa("#FBF7F4")` para oscuro. Sin blend modes, funciona en cualquier contexto de apilado.

---

## 16. Recortar producto y entrar en la textura

Dos trampas que aparecieron al hacer los layouts de grilla y de macro. Las dos se veían recién en
el PNG, no en el código.

### El umbral de recorte tiene que salir de cada foto

Para la grilla, los productos vienen recortados sobre blanco de estudio y hay que sacarles el fondo
para que el cream del lienzo pase por atrás. Sin eso, cada celda dibuja su propio recuadro, que es
el muro de fichas que la memoria del repo prohíbe.

El primer intento usó un umbral de luminancia **fijo** (transparente arriba de 246). Falló. Medida
la mediana del borde de cada foto, los fondos de estudio de este catálogo van de **233 a 255**:

| foto | fondo |
| --- | --- |
| Cinturón Vestir | 233 |
| Cartera Cali | 243 |
| Mochila Pekín | 243 |
| Gorra Milán | 253 |
| Billetera Oslo | 254 |
| Bolso Duffle | 255 |

Con umbral fijo, las de fondo más oscuro quedaban casi opacas y seguían mostrando el recuadro. La
solución es sacar el umbral **de cada foto**: mediana del borde (que es fondo puro por definición) y
una rampa de `mediana-3` a `mediana-15`. Desplazar el color hacia el cream tampoco alcanzaba,
porque el fondo no es plano: tiene viñeteo y la sombra del producto.

### `object-position` no sirve para hacer zoom

Para el macro había que entrar en el cuero y dejar afuera el fondo blanco de arriba. Poner
`object-position: center 78%` **no hizo nada**, y tiene explicación: la foto es 1333x2000 y el
cuadro 1080x1920, así que con `cover` la imagen se escala por altura y calza exacto en vertical.
Solo sobra a los lados, y por eso el componente vertical de `object-position` no tiene nada que
mover.

Para recortar de verdad hay que agrandar la imagen y correrla: `height: H * zoom` con
`top: -H * desdeY`. En `costuras` es `zoom 1.5` y `desdeY 0.5`, o sea que se ve del 33% al 100% de
la foto: puro cuero y costura.
