# Import de productos nuevos desde Drive — para revisar

Fecha: 2026-07-30. Estado: importado localmente, build verificado, **sin commitear ni pushear**.

## Resumen rápido

**285 productos nuevos.** Catálogo: 103 → 388, y **390 tras la revisión del 2026-07-30**, que
separó 2 billeteras mal fusionadas. Todas las carpetas de producto de Drive procesadas.

| Tanda | Qué | Productos | Códigos |
| --- | --- | --- | --- |
| 1 | Billeteras + riñonera + portacelular + morral | 11 | BIL-005..012, RIN-003, CEL-001, MOR-002 |
| 2 | Cinturones hombre · cuero **nacional** | 56 | CIN-048..103 |
| 3 | Cinturones hombre · **importados** | 150 | CIN-104..253 |
| 4 | Cinturones **mujer** (nacional + PU importado) | 68 | CIN-254..321 |

**Lo que más conviene que revises, en orden:**

1. **Tanda 3 salió de una carpeta con descartes marcados** por el propio proveedor ("ELIMINAR", "NO
   ESTA EN EL CATALOGO"). Respeté los 8 marcados, pero puede haber más que no correspondan publicar.
   Es la tanda con más riesgo de las cuatro.
2. **Tandas 3 y 4b no tienen verificación de duplicados** — los archivos no traen nombre de artículo,
   así que no pude cruzarlos contra lo que ya existía. Son 194 de los 285.
3. **Sin color en las descripciones** de las tandas 3 y 4b: la detección automática fallaba ~40% y
   preferí omitirlo antes que afirmar un color equivocado.
4. **Nombres de ciudad inventados** en 262 de los 285. Los de tandas 1, 2-MAYORISTA y 4-015011 tienen
   descripción real del catálogo del proveedor; el resto es genérica.
5. Unas pocas agrupaciones dudosas, detalladas en cada tanda más abajo.

**Números que dan confianza:** `validate-proveedores` sin errores (388 productos, 324 aston),
1552 miniaturas generadas sin fallos, `catalogo-index.json` con 388 productos y 14 categorías,
`vite build` en verde.

Origen: 9 carpetas de Drive que bajaste vos a `Downloads/drive-download-2026073*` (el conector
no podía listar el contenido de 7 de las 9 carpetas — límite del conector, no de permisos; quedó
descartado ese camino). De las 8 carpetas reales tras descartar duplicados por nesteo, se
procesaron 2: **billeteras** (24 fotos) y **Nuevas** (10 fotos). Las 5 de cinturones y la de
catálogos (6 PDFs) se dejaron sin tocar, como pediste.

11 productos nuevos, 31 fotos, 2 categorías existentes (Billeteras, Riñoneras) + 2 nuevas
(Morrales ya existía, se sumó un producto; **Portacelular** es categoría nueva).

---

## Decisiones que tomé y que deberías revisar

### 1. Agrupaciones de fotos ambiguas (billeteras) — RESUELTO 2026-07-30

Revisadas con el dueño mirando los originales a tamaño completo. Dos de las tres fusiones estaban
mal y se separaron; la tercera se confirmó.

| Caso | Veredicto | Qué se hizo |
| --- | --- | --- |
| Zurich (BIL-005) | Eran **2 productos** | Se separó en `Billetera Ravena` (BIL-013) |
| Cracovia (BIL-007) | Eran **2 productos** | Se separó en `Billetera Gante` (BIL-014) |
| Amberes (BIL-009) | Era **1 producto** | Sin cambios |

- **Zurich**: el cuero no es el mismo. `8O3A1137` (ahora `ZURICH.jpg`) es cuero natural blando, de
  arruga y veta irregular. `Copy of 8O3A1156` (ahora `RAVENA.jpg`) es un grano prensado uniforme.
  Misma silueta de zip perimetral, material distinto. Zurich quedó con 3 fotos y Ravena con 2.
- **Cracovia**: la diferencia es estructural, no de textura. `8O3A1172/1174` (ahora `GANTE.jpg` y
  `GANTE(1).jpg`) tienen una **banda elástica de cierre** cruzada, visible tanto cerrada como
  abierta, que las otras dos no tienen. Cracovia quedó con 2 fotos y Gante con 2.
- **Amberes**: se confirmó como un solo producto, pero por un motivo distinto al que decía esta
  nota. No es "por color" sin certeza: las 5 fotos comparten el **mismo interior** (marrón
  chocolate, 4 ranuras, misma costura) y lo que cambia es el exterior, oscuro en unas y tan con
  grabado croco en otras. Son dos colores del mismo modelo, que es como el catálogo ya trata las
  variantes de color.
- Nada que revisar en las demás — quedaron con 1-2 fotos claras cada una.

### 2. `proveedor` — RESUELTO: `maleshab98@gmail.com` también es Aston

Este campo no es cosmético: rutea qué condiciones de pago ve el cliente en el pop-up del carrito
(`utils/paymentTerms.js`). Las carpetas "billeteras" y "Nuevas" las bajaste de una cuenta de Drive
(`maleshab98@gmail.com`) que en el momento de importar no tenía confirmado si era Aston. Se dejó
`proveedor:` vacío a propósito (mismo patrón que `Mundial/Camiseta`) para no adivinar en un campo
con consecuencia real, y se preguntó. Confirmaste que también es Aston, así que ya se completó
`proveedor: aston` en los 11 `metadata.txt`.

Queda para la memoria del repo: Aston opera bajo al menos 4 identidades de Google distintas
(`byworkness@gmail.com` la original, `accesoriosaston@gmail.com`, `fabianrosenthal.com.ar` /
`oficina@fabianrosenthal.com.ar` = Fabián Rosenthal, y `maleshab98@gmail.com`). Si en el futuro
aparece contenido de una cuenta nueva, no asumir que es un proveedor distinto sin confirmar.

### 3. Nombres y códigos inventados, como pediste

Convención existente: nombre de trabajo del proveedor → ciudad europea (ej. "Billetera Paris" del
proveedor pasó a ser "Billetera Oporto" en el sitio). Elegí ciudades no usadas todavía en ningún
producto del catálogo.

| Producto nuevo | Código | Categoría |
| --- | --- | --- |
| Billetera Zurich | BIL-005 | Billeteras |
| Billetera Sevilla | BIL-006 | Billeteras |
| Billetera Cracovia | BIL-007 | Billeteras |
| Billetera Ginebra | BIL-008 | Billeteras |
| Billetera Amberes | BIL-009 | Billeteras |
| Billetera Brujas | BIL-010 | Billeteras |
| Billetera Verona | BIL-011 | Billeteras |
| Billetera Salzburgo | BIL-012 | Billeteras |
| Riñonera Sofia | RIN-003 | Riñoneras |
| Portacelular Copenhague | CEL-001 | Portacelular (categoría nueva) |
| Morral Bilbao | MOR-002 | Morrales |
| Billetera Ravena | BIL-013 | Billeteras (separada de Zurich, 2026-07-30) |
| Billetera Gante | BIL-014 | Billeteras (separada de Cracovia, 2026-07-30) |

Nota sobre el código de Portacelular: usé el prefijo `CEL` (de "celular") en vez de `POR`, porque
`POR` ya lo usa Portadocumentos (`POR-001`) y hubiera chocado.

### 4. Categoría nueva: "Portacelular"

No existía. La creé porque el producto (bolso cruzado chico para celular) no encaja bien en
ninguna categoría existente, y crear categorías de un solo producto ya es un patrón establecido en
este catálogo (Maletines y Morrales arrancaron así). Verificado que las categorías se leen
dinámicamente del manifest (`Object.keys(manifest)` en App.jsx) y no están hardcodeadas en la
navegación (`Header.jsx` las recibe como prop), así que no rompe nada. La única lista hardcodeada
que existe es la de categorías destacadas de la landing (`LandingPage.jsx:40`), que **no** incluye
Portacelular — no es un bug, esa lista ya era curada a mano y de otro alcance.

### 5. Verificado que NO son duplicados de productos existentes

Comparé visualmente contra las 5 billeteras y las 2 riñoneras que ya estaban en el catálogo
(incluida `Riñonera Atenas`, que casi se me pasa por no estar en mi chequeo inicial). Ninguna de
las 11 nuevas coincide: distinta textura, proporción o material en cada caso. El detalle de la
comparación está en el historial del chat, no en este archivo.

### 6. Sin precios

No inventé `price_mayorista` ni `price_minorista` para ninguno de los 11: no hay planilla de
precios para este lote todavía. El sitio ya maneja bien esto — sin esos campos, cada ficha muestra
"Consultá precio" como el resto del catálogo.

---

---

## Segunda tanda: Cinturones · CUERO HOMBRE (56 productos nuevos)

La carpeta "CUERO HOMBRE" resultó tener tres sub-lotes con nombres que se pisan parcialmente:
raíz (43 archivos → 34 productos tras fusionar variantes de color/typos), `MAYORISTA` (24 fotos,
16 productos — coinciden 1 a 1 con los artículos del catálogo PDF "Hombre Cuero 2024" que ya
había leído, así que la descripción de cada uno sale del PDF: cuero, ancho de pase, tipo de
decoración) y `TIENDA NUBE ASTON` (51 fotos, 6 productos nuevos + 3 fusiones).

Tags: `hombre, nacional` en los 56. Es la **primera línea de cinturones de hombre en cuero
nacional del sitio** — verifiqué contra los 47 cinturones existentes y ninguno de los "hombre"
actuales tiene ese tag (todos son "hombre, importado"), así que no había nada para chocar.

### Casos de mismo nombre en sub-lotes distintos — verificados uno por uno, no asumidos

- **Lucas y Martin** aparecen en la raíz Y en MAYORISTA. Comparé las fotos: son productos
  **distintos** (la raíz es un modelo fino, MAYORISTA es un modelo grueso tipo "bombé" que coincide
  con la descripción del PDF). Quedaron como 4 productos separados: `Cinturon Burdeos`/`Cinturon
  Granada` (raíz) y `Cinturon Salamanca`/`Cinturon Alicante` (MAYORISTA).
- **Diego y Anibal(h)** aparecen en la raíz Y en TIENDA NUBE ASTON, con sufijo "H"/"CH". Comparé:
  son el **mismo** producto en otro color (mismo diseño de hebilla y textura, distinto tono). Sumé
  esas fotos como variante de color a `Cinturon Manchester` y `Cinturon Estocolmo` en vez de crear
  productos nuevos.
- **Rodrigo** (raíz + TIENDA NUBE): sumado a `Cinturon Palermo` por el mismo criterio, pero acá
  tengo **menos certeza** que con Diego — la hebilla se parece pero no es idéntica. Revisar
  `Cinturon Palermo` (7 fotos nuevas al final de la lista) por si conviene separarlas en un
  producto aparte.
- **Peter** (TIENDA NUBE): tenía 4 sufijos distintos (CH/N/T + sin sufijo, 13 fotos en total). Los
  traté como variantes de color del mismo producto, seros el patrón establecido en el resto de la
  carpeta, pero con 13 fotos es el caso con más volumen sin verificar foto por foto — podría ser
  2 o 3 productos en vez de 1.
- **Roman/Román**: mismo caso, 14 fotos con acento/sin acento, tratadas como una sola variante de
  nombre (no de producto).

### Nombres y códigos

Ciudades nuevas, sin repetir ninguna del catálogo (incluidas las 11 de la tanda anterior).
Códigos CIN-048 a CIN-103 (los existentes llegan a CIN-047).

---

## Tercera tanda: Cinturones · CHINA TEMPORADA / importados (150 productos)

Carpeta `014918`. Cinturones de hombre **importados**, tags `hombre, importado`.
Códigos CIN-104 a CIN-253. Nombres: ciudades europeas del este y de Alemania, todas verificadas
como no usadas antes.

### ⚠️ Lo más importante de esta tanda: la carpeta traía una planilla de descartes

`MODIFICACIONES CAT HOMBRE ASTON CHINA_.xlsx` no es un catálogo: es una lista de trabajo entre vos
y el proveedor, con columnas `ARCH FOTO / DESCRIPCION / ACCION`. **Marcaba 8 fotos como
"ELIMINAR"**, que quedaron fuera del import:

| Foto | Artículo | Acción |
| --- | --- | --- |
| IMG_7369, IMG_7370 | TORONTO 6014 | ELIMINAR |
| IMG_7371, IMG_7372 | MANCHESTER 5006 | ELIMINAR |
| IMG_7391, (7392) | TORONTO 6014 | ELIMINAR |
| (7393), IMG_7394 | SAN DIEGO 4001 | ELIMINAR |

7392 y 7393 estaban en la planilla pero no en la carpeta, así que se descartaron 6 archivos reales.
La planilla también dice "NO ESTA EN EL CATALOGO (2146) / FOTEAR Y ADJUNTAR" y "CONFIRMAR SI LO
TIENEN - ES SOLO NEGRO", o sea que **esta carpeta es material en revisión, no un catálogo cerrado**.
Vale la pena que mires si los 150 que creé deberían estar publicados o si hay más para descartar.

### Otros descartes automáticos

- **9 archivos byte-idénticos** (mismo md5) a otro ya incluido — eran los `Copy of ...`.
- **2 fotos de conjunto** (`G28A8069`, `G28A8071`, varios cinturones juntos) que no representan un
  producto individual.

De 178 fotos quedaron 162, agrupadas en 150 productos.

### Agrupación: por número base, verificada

`3055.jpg`, `3055(1).jpg` y `3055(2).jpg` son el mismo artículo en distintas vistas. Solo 10 de los
150 tienen más de una foto: `2147, 3055, 3057, 3065, 3380, 3386, 3389, 3390, 3399, 6014`. El resto
tiene una sola, o sea que en los bloques `IMG_` y `G28A` cada disparo es un artículo distinto.

### ⚠️ Riesgo asumido: no pude verificar duplicados

Los archivos se llaman `numero 3480`, `IMG_7350`, `G28A8018` — sin nombre de artículo. En las
tandas 1 y 2 pude descartar duplicados comparando nombres; **acá no**. Si alguno de estos 150 ya
existe entre los 9 cinturones de "hombre, importado" que ya tenías, quedó duplicado y no tengo cómo
detectarlo. Decidiste asumir ese riesgo.

### ⚠️ Descripciones sin color (a propósito)

Primero generé la descripción detectando el color dominante de cada foto por software. Al verificar
una muestra de 10, **4 estaban mal** (un cinturón azul descrito como "gris oscuro", un cognac como
"beige", dos negros como "beige" y "marrón"): el fondo gris de algunas fotos y los reflejos corren
el promedio. Extrapolando serían ~60 de 150 con el color equivocado a la vista del cliente.

Preferí quitar el color antes que afirmar uno incorrecto. Todas dicen "Cinturon de cuero con hebilla
metalica" sin color. **Si querés el color en la descripción, hay que cargarlo a mano.**

---

## Cuarta tanda: Cinturones de MUJER (68 productos)

Tres carpetas: `015011` (24 productos, con nombres reales), `015049` y `015124` (44 productos, sin
nombres). Códigos CIN-254 a CIN-321.

### 015011 — la mejor de todas las carpetas

Es la única cuyos nombres de artículo **coinciden con el catálogo PDF "Mujer cuero 2024"** que leí
al principio. Eso permitió escribir descripciones reales en vez de genéricas: "dos filas de
remaches, pase 30mm", "texan shell, pase 25mm", "hebilla forrada, pase 45mm", etc., tomadas del
catálogo del proveedor y no inventadas.

Separación de origen aplicando la regla del repo (cuero=nacional, PU=importado):
- raíz + `CINTURONES CATALOGO` → `mujer, nacional` (21 productos)
- `PU CINT MUJER` → `mujer, importado` (3 productos)

**Una separación que hice a mano:** el nombre `NAOMI` mezclaba dos modelos distintos — `NAOMI.jpg`
es un cinturón fino liso y los `Copy of NAOMI` son un modelo ancho tipo croco con hebilla ovalada
grande. Los separé en `Cinturon Guimaraes` y `Cinturon Viseu`. Si en realidad son el mismo artículo,
hay que fusionarlos.

### 015049 y 015124 — sin nombres de artículo

Mismo caso que la tanda 3: archivos `numero 860`, `G28A9249`. Verifiqué en hoja de contacto que
cada foto es un producto distinto (varias muestran el mismo modelo en dos colores dentro de la misma
foto, que es la convención de este proveedor). Un producto por foto, 44 en total, `mujer, nacional`.

Descripciones genéricas sin color, por el mismo motivo que la tanda 3.

⚠️ `015124/cuero flex nacional` resultó ser **duplicado exacto** de 11 archivos que ya estaban en la
raíz de esa misma carpeta (verificado por nombre 1 a 1), así que se omitió para no duplicar.

### Distribución final de cinturones tras las 4 tandas

| Tag | Productos |
| --- | --- |
| hombre, importado | 159 |
| mujer, nacional | 77 |
| hombre, nacional | 56 |
| mujer, importado | 29 |

Los filtros del sitio (`BELT_FILTERS` en SearchFilterBar) ahora tienen volumen real en las cuatro
combinaciones. Antes "hombre, nacional" no existía.

## Qué NO se tocó todavía

- `014936/FOTOS HISTORIAS` (~85 fotos, subcarpeta de CUERO HOMBRE): parecen fotos de contexto para
  redes, no fichas de producto sobre fondo blanco. No se procesaron. Vale una mirada por si hay
  material aprovechable para los anuncios.
- La carpeta de catálogos (`014829`, 6 PDF): para el final, como pediste. Contiene CATALOGO HOMBRE
  CUERO, MUJER CUERO, BILLETERAS CUERO VEGAN, CINTURONES STONE, HOMBRE CUERO VEGAN y MUJER CUERO
  VEGAN — los "VEGAN" y "STONE" sugieren líneas que todavía no están en el sitio.
- **Precios**: ningún producto de las 4 tandas tiene `price_mayorista` ni `price_minorista`. Todos
  muestran "Consultá precio", que es el comportamiento por defecto del sitio.
- ~19 carpetas `drive-download-*` viejas en `Downloads/` (de 2024-2026, ventas/fotos sueltas de
  otro trabajo) que se descomprimieron por accidente al procesar esto con un glob demasiado
  amplio. No se leyeron ni se usó nada de ahí; quedan como estaban, sin tocar.

## Verificación hecha

`validate-proveedores.mjs` (0 errores, 12 avisos esperados) → `generate-thumbnails.mjs` (62 miniaturas
nuevas) → `generate-catalog-index.mjs` (114 productos, 14 categorías) → `vite build` (verde) →
miniaturas servidas re-renderizadas y comparadas visualmente contra el catálogo, una por una.

## Pendiente

- ~~Revisar las 3 ambigüedades de agrupación de fotos (sección 1).~~ **Hecho 2026-07-30**: 2 se
  separaron, 1 se confirmó. El catálogo pasó de 388 a 390 productos.
- Revisar las agrupaciones dudosas de **cinturones**: `Cinturon Palermo` (Rodrigo), `Peter`
  (13 fotos tratadas como un producto) y `Roman/Román` (14 fotos). Detalle en la tanda 2.
- Revisar la separación de **NAOMI** en `Cinturon Guimaraes` y `Cinturon Viseu` (tanda 4), que es
  el caso inverso: ahí separé y podría corresponder fusionar.
- Decidir qué pasa con los **150 de la tanda 3**, que salieron de una carpeta con descartes
  marcados por el proveedor.
- Confirmar o cambiar los 262 nombres de ciudad inventados (sección 3).
- Decidir si commitear y pushear. No lo hice todavía.
