# Campaña de Meta Ads: conversaciones por mensaje

Fecha: 2026-07-27
Estado: campaña y conjunto creados en PAUSED. Anuncios pendientes de insumos.

## Cambios durante la implementación

**El destino pasó de WhatsApp a Instagram Direct.** El diseño original apuntaba a
click-to-WhatsApp. Al crear el conjunto, la API lo rechazó:

```
Page With WhatsApp Business Account Required:
Your Page is not linked to a WhatsApp account.
```

La página `1067745016416249` no tiene una cuenta de WhatsApp Business vinculada, aunque al
diseñar se creyó que sí. Causas habituales: el número está en la app de WhatsApp común y no en
WhatsApp Business, o quedó vinculado a otra página.

Decisión del dueño: no esperar, y salir con `INSTAGRAM_DIRECT`. El objetivo de campaña, el
presupuesto, el público y los seis creativos **no cambian**. Cambia dónde cae la conversación:
el DM de @b2you.team en vez del WhatsApp del sitio.

Consecuencia operativa: las consultas entran por Instagram y no por el WhatsApp que ya se
atiende. Si más adelante se conecta WhatsApp Business a la página, el conjunto se puede duplicar
cambiando solo `destination_type`.

**Efecto secundario:** el ID numérico de Instagram deja de ser opcional. Con destino Direct los
anuncios tienen que entregar en Instagram, así que sin ese dato no se pueden crear.

## Segundo cambio: del mensaje al sitio web, con píxel

Con la campaña de Direct ya armada, el dueño pidió llevar el tráfico al sitio, y preguntó si se
podía instalar el píxel. Se hicieron las dos cosas, en ese orden, porque la segunda cambia la
primera: **sin píxel la única optimización posible es `LINK_CLICKS`** (Meta busca gente propensa a
clickear), y **con píxel se puede optimizar a `LANDING_PAGE_VIEWS`** (gente que efectivamente
carga la página). La diferencia es grande y justificó esperar.

### Píxel instalado

Dataset `1010170731888741` "B2YOU Web", creado por el dueño en Events Manager. El conector **no
tiene herramienta para crear datasets**, solo para leerlos y configurar eventos.

Tres piezas en el código, porque el snippet que da Meta no alcanza en una SPA:

1. `index.html`: código base (`init` + PageView de la carga inicial). El `<noscript>` va en el
   **body**, no en el head: adentro del head es HTML inválido y el build de Vite lo rechaza con
   `disallowed-content-in-noscript-in-head`.
2. `utils/metaPixel.js`: PageView por cambio de ruta, y un evento `Contact` en cada salida hacia
   WhatsApp. Sin lo primero, Meta solo vería la landing y `/productos`, `/Marcas` y `/Empresas`
   quedarían invisibles.
3. `main.jsx`: el componente `PixelTracker`, dentro del `Router` porque usa `useLocation`.

**Por qué el `Contact` se intercepta y no se llama a mano.** Los enlaces de WhatsApp están en unos
diez archivos y de dos formas: `<a href="wa.me/...">` y `window.open(...)` dentro de handlers.
En vez de tocar cada llamada y arriesgar que la próxima quede sin medir, se interceptan las dos
formas desde un solo lugar: un listener de clics en fase de captura, y un envoltorio de
`window.open` que delega siempre en la nativa.

### Destino de los anuncios

Todos a `https://b2you.com.ar/productos`. Mandando los seis al mismo lugar el test compara
creativos entre sí, sin que se mezcle el efecto de landings distintas.

No se puede hacer deep link a una categoría: el catálogo solo lee `pagina` y `vista` de la URL, y
el filtro por categoría vive en el estado de React. Que `/productos?categoria=Gorras` preseleccione
el filtro sería una mejora concreta del sitio para campañas futuras.

CTA `GET_QUOTE`, que coincide con el "Pedí tu cotización" ya impreso en los creativos.

`promoted_object` con `pixel_id` **no va** en un conjunto de `LANDING_PAGE_VIEWS`: la API lo
rechaza con "Promoted Object Invalid". Ese campo es para objetivos de conversión.

## Objetos creados

| Objeto | ID | Estado |
| --- | --- | --- |
| Campaña `B2YOU · Tráfico al sitio · 2026-07` | `120247546261110767` | PAUSED · vigente |
| Conjunto `Argentina · amplio · visitas a /productos` | `120247546298030767` | PAUSED |
| 6 anuncios (01 a 06) | `…46386190767` a `…46490200767` | PAUSED |
| Campaña `B2YOU · Conversaciones por mensaje · 2026-07` | `120247544246620767` | PAUSED · reemplazada |
| Conjunto `Argentina · amplio · Instagram Direct` | `120247544326990767` | PAUSED |
| 6 anuncios de Direct | `…45165380767` a `…45179180767` | PAUSED |

La campaña de mensajes se conserva pausada. No cuesta nada y sirve como variante lista para probar
contra la de tráfico, o para reactivar si el sitio no convierte.

Primera campaña paga de B2YOU. Se crea entera por el conector de Meta Ads, en estado pausado,
para que el dueño la revise en Ads Manager y la active él.

---

## 1. Objetivo

Conseguir conversaciones por WhatsApp con marcas y empresas que quieran accesorios de cuero
personalizados con su logo.

WhatsApp es el canal que el sitio ya usa para cotizar (`wa.me/5491178279281`, presente en el
código), así que la campaña no inventa un embudo nuevo: alimenta el que ya existe.

**Por qué no se optimiza a conversiones.** La cuenta no tiene píxel ni dataset instalado, así que
Meta no puede ver qué pasa después del clic. Optimizar a conversaciones iniciadas por mensaje es
lo único que se puede medir hoy sin instalar nada. Instalar el píxel en el sitio queda como
trabajo aparte y es lo que habilitaría retargeting más adelante.

---

## 2. Activos y estado de la cuenta

Verificado contra la API el 2026-07-27:

| Activo | Valor | Estado |
| --- | --- | --- |
| Cuenta publicitaria | `3071383336584896` "B2YOU Cuenta Publicitaria" | ARS, activa, con método de pago |
| Business | `1418325706180147` "B2YOU" | |
| Página de Facebook | `1067745016416249` "B2You" | única página del business |
| WhatsApp Business | `5491178279281` | conectado a la página (confirmado por el dueño) |
| Píxel / dataset | ninguno | limita la optimización, ver sección 1 |
| Catálogo de productos | ninguno | descarta anuncios dinámicos por catálogo |
| Campañas previas | ninguna | la cuenta arranca sin historial |
| Mínimo diario por conjunto | ARS 1.500,38 | dato de la API (`min_daily_budget_cents: 150038`) |

Las otras dos cuentas visibles (`152687079` y `436640162041242`) **no son de B2YOU**: su píxel es
"Pimbale pixel" de 2020 y sus campañas son posteos promocionados de otra marca. No se tocan.

---

## 3. Estructura

Una campaña, un conjunto, seis anuncios.

```
Campaña  B2YOU · Conversaciones WhatsApp · 2026-07     [PAUSED]
│  OUTCOME_ENGAGEMENT · AUCTION · sin categoría especial
│  CBO diario ARS 3.000 · LOWEST_COST_WITHOUT_CAP
│
└── Conjunto  Argentina · amplio · Instagram Direct    [PAUSED]
    │  optimization_goal: CONVERSATIONS
    │  destination_type: INSTAGRAM_DIRECT
    │  promoted_object: {"page_id": "1067745016416249"}
    │  billing_event: IMPRESSIONS
    │  targeting: {"geo_locations": {"countries": ["AR"]}}
    │
    ├── 1. gorras-grupal
    ├── 2. cinturones-grupal
    ├── 3. gorra-lifestyle
    ├── 4. cinturon-clasico
    ├── 5. mochila-espacio
    └── 6. cinturon-lifestyle
```

### Por qué un solo conjunto y no dos

La intención original era separar dos públicos: dueños de marcas de indumentaria y compras
corporativas. **No se puede hacer bien con las herramientas disponibles.**

El conector no expone `ads_targeting_search`. Su documentación lo menciona, pero el tool no está
publicado, y la API rechaza cualquier ID de interés inventado. Sin poder buscar intereses reales,
los dos conjuntos quedarían con targeting idéntico (Argentina + Advantage+ Audience), es decir dos
conjuntos compitiendo entre sí en la misma subasta por la misma gente, partiendo un presupuesto
que ya es chico.

Un solo conjunto amplio concentra el presupuesto, elimina el solapamiento y deja que Meta use el
creativo como señal para encontrar a quién le interesa. Es además lo que Meta recomienda para
cuentas nuevas sin píxel.

Si más adelante se quiere segmentar de verdad, la segmentación detallada se carga a mano en Ads
Manager, que sí tiene el buscador de intereses.

### Por qué seis anuncios y no cuatro ni veintiséis

Meta no reparte la entrega en partes iguales: explora poco al principio y después concentra en el
anuncio que predice ganador. Sumar creativos no divide el presupuesto en N, deja a N-1 sin
impresiones y sin datos.

La API admite bastantes más, pero la recomendación de Meta es no pasar de 6 por conjunto porque
arriba de eso la entrega se fragmenta. Con ARS 3.000 por día, 6 es el techo útil.

### Presupuesto

CBO diario de **ARS 15.000** (`campaign_daily_budget: 1500000` en centavos), que es el equivalente
de los "10 USD por día" que pidió el dueño. Se creó con ARS 3.000 como valor de partida y se
corrigió cuando dio la cotización.

El salto importa: con ARS 3.000 los 6 creativos se hubieran repartido tan poca entrega que Meta
habría concentrado en uno o dos y el resto quedaba sin datos. A ARS 15.000 el test de creativos
produce información utilizable en los seis.

Se elige presupuesto **diario** y no total. El total (lifetime) sirve cuando la campaña tiene
fecha de inicio y fin cerradas, y su única ventaja real es habilitar la programación por días y
horarios. Su contra es que Meta reparte el gasto de forma despareja entre días, lo que hace que
los primeros resultados no sean comparables entre sí. Diario da ritmo parejo y se pausa y reanuda
sin recalcular nada.

Referencias de gasto: Meta puede gastar hasta 25% más que el diario en un día puntual y lo
compensa en otro, así que el límite real es semanal. Con ARS 3.000 por día: **ARS 21.000 por
semana, unos ARS 91.000 por mes**.

---

## 4. Los seis anuncios

Todos usan el formato feed 1080x1350 del set `ads/B2YOU-ad-*.png` y llevan el
`instagram_user_id` de @b2you.team.

**El CTA de un anuncio de mensajes a Direct, resuelto.** `ads_create_creative` no alcanza: no
expone `app_destination`, y sin ese campo Meta ve el conjunto pidiendo `INSTAGRAM_DIRECT` contra un
CTA que apunta a Messenger, y rechaza con "The ad's promoted object is invalid". Con
`call_to_action_type: MESSAGE_PAGE` el error pasa a ser "Call to Action Not Supported: your ad
won't run on Instagram".

Lo que funciona es crear el anuncio con `object_story_spec` crudo vía `ads_create_ad`:

```json
"call_to_action": {
  "type": "INSTAGRAM_MESSAGE",
  "value": { "app_destination": "INSTAGRAM_DIRECT" }
}
```

`link` se setea en `https://www.instagram.com/b2you.team` y `self_ai_disclosure: OPT_IN` va en el
nivel superior del spec del creativo, donde la API lo acepta.

El copy respeta las reglas del playbook (`docs/ad-post-creation-playbook.md`, sección 7): sin em
dash, sin superlativos, sin Title Case en español, sin precios, sin nombrar al proveedor, sin
métricas ni testimonios inventados. Los titulares no repiten lo que ya dice la imagen.

### 1. gorras-grupal

- Archivo: `ads/B2YOU-ad-gorras-grupal.png`
- Trabajo: comunica surtido y personalización de una sola vez
- Primary text: "Cuatro modelos de gorra para personalizar con tu logo, bordado o estampado. Producimos para marcas y empresas: aprobás la muestra antes de producir y el presupuesto es cerrado. Escribinos y te pasamos el catálogo."
- Titular: "Gorras con tu logo" (18/40)
- Descripción: "Aprobás la muestra" (18/30)

### 2. cinturones-grupal

- Archivo: `ads/B2YOU-ad-cinturones-grupal.png`
- Trabajo: lo mismo para la otra categoría fuerte, sin repetir formato
- Primary text: "Cuatro cinturones de cuero para personalizar con tu logo grabado. Tu logo, tu etiqueta, tu marca. Nosotros no aparecemos en el producto, y ese es el trabajo. Aprobás la muestra antes de producir."
- Titular: "Cuatro modelos, tu logo" (23/40)
- Descripción: "Grabado en cuero" (16/30)

### 3. gorra-lifestyle

- Archivo: `ads/B2YOU-ad-gorra-lifestyle.png`
- Trabajo: es el que frena el scroll, persona usando la gorra con luz de ventana. El titular cae
  sobre pared clara y lisa, así que respira, y el bordado "Tu marca" se lee bien sobre fondo claro
- Primary text: "La gorra que la gente elige ponerse, con tu logo bordado. Para tu marca, tu equipo o tu regalo empresarial. Aprobás la muestra antes de producir y el presupuesto es cerrado."
- Titular: "La gorra que se usa" (19/40)
- Descripción: "Bordado con tu logo" (19/30)

### 4. cinturon-clasico

- Archivo: `ads/B2YOU-ad-cinturon-clasico.png`
- Trabajo: plano cercano con "Tu marca" grabado grande y legible, el producto prueba el servicio
- Primary text: "Tu logo grabado en el cuero, no impreso encima. Cinturones para marcas y empresas, con presupuesto cerrado y muestra aprobada antes de producir. Escribinos y te pasamos el catálogo."
- Titular: "Grabado, no impreso" (19/40)
- Descripción: "Cuero genuino" (13/30)

### 5. mochila-espacio

- Archivo: `ads/B2YOU-ad-mochila-espacio.png`
- Trabajo: amplitud de catálogo, y la mochila es el regalo corporativo más pedido
- Primary text: "Mochilas, bolsos y carteras de cuero para personalizar con tu logo. Producimos para marcas y empresas: aprobás la muestra antes de producir y el presupuesto es cerrado."
- Titular: "Mochilas con tu logo" (20/40)
- Descripción: "Para tu equipo" (14/30)

### 6. cinturon-lifestyle

- Archivo: `ads/B2YOU-ad-cinturon-lifestyle.png`
- Trabajo: el cinturón puesto, en interior cálido con profundidad de fondo. Es el único que
  muestra la hebilla con "Tu marca" a tamaño legible sobre una persona
- Primary text: "Así se ve puesto: cinturón de cuero con tu logo grabado, para tu marca, tu equipo o tu regalo empresarial. Aprobás la muestra antes de producir y el presupuesto es cerrado."
- Titular: "Cinturones para tu equipo" (25/40)
- Descripción: "Presupuesto cerrado" (19/30)

---

## 5. Límites del conector y cómo se resuelven

Tres restricciones reales, encontradas leyendo los schemas de los tools antes de crear nada.

### Las imágenes tienen que venir de una URL pública

`ads_creative_upload_image` solo acepta `image_url`: el servidor de Meta descarga el archivo. No
hay forma de mandar bytes locales, y `ads/` está gitignoreado. Drive y Dropbox tampoco sirven
porque devuelven una página intermedia en vez del archivo.

**Primer intento, y por qué falló.** El dueño subió los 6 PNG desde Ads Manager y quedaron en la
**biblioteca del negocio** (`asset_library/business_creatives`, `global_scope_id` = el business),
no en la de la cuenta publicitaria. Son dos bibliotecas distintas con la misma interfaz.

Lo engañoso es que después de usarlas en un borrador, `ads_get_ad_images` **sí las lista** con
hash y nombre. Pero al pedirle `status`, `width`, `height` y `url`, Meta devuelve solo hash y
nombre: son punteros vacíos, no imágenes de la cuenta. Los 6 anuncios se crearon igual y
quedaron en `WITH_ISSUES` con "Image Not Found: you might not have permission to use it in ads".

**Lección:** que `ads_get_ad_images` devuelva un hash no significa que la imagen sirva. Verificar
siempre pidiendo `width`/`height`/`url`; si vienen vacíos, la imagen no es de la cuenta.

**Resolución definitiva.** Los 6 PNG se copiaron a `public/creativos/`, se desplegaron a Vercel y
quedan públicos en `https://b2you.com.ar/creativos/<archivo>.png`.

`ads_creative_upload_image` **no sirvió**: está bloqueado por rollout gradual en esta cuenta, igual
que `ads_get_ig_accounts` y `ads_creative_delete`. La vía que funcionó es pasar la URL en el campo
**`picture` dentro de `link_data`** del `object_story_spec`, al crear el anuncio.

Cuidado con la variante que NO anda: poner `image_url` en el nivel superior del creativo, que es lo
que sugiere la documentación del tool. Crea el anuncio sin error inmediato, pero el creativo queda
sin `image_hash` ni `image_url`, con un `thumbnail_url` que apunta a `share_arrow.gif`, y el
anuncio termina en "Missing Image: An image is required to show this ad on Instagram".

Comparación que lo deja claro, pidiendo `image_hash` e `image_url` de cada creativo:

| Campo | `picture` en `link_data` | `image_url` arriba |
| --- | --- | --- |
| `image_hash` | presente | ausente |
| `image_url` | URL real de fbcdn | ausente |
| `thumbnail_url` | miniatura del producto | `share_arrow.gif` (placeholder) |

### Un creativo, una sola imagen

`ads_create_creative` no expone personalización por ubicación, así que no se puede poner el 4:5 en
feed y el 9:16 en historias dentro del mismo anuncio.

**Resolución:** se crean los 6 anuncios con el 4:5. Los `ads/B2YOU-story-*.png` correspondientes
existen y se agregan a mano en Ads Manager, que sí soporta asset por ubicación. Queda anotado como
paso opcional de mejora, no como bloqueante.

### Instagram necesita el ID de la cuenta

El creativo lleva `instagram_user_id` o no entrega en las ubicaciones de Instagram, y con destino
`INSTAGRAM_DIRECT` eso deja de ser opcional: sin ese dato no hay anuncio posible.
`ads_get_ig_accounts` devuelve un error de rollout gradual para esta cuenta, así que el dato no se
puede obtener por API.

**Resuelto.** El dueño lo pasó: `@b2you.team` = **`17841480298053905`**.

---

## 6. Riesgos aceptados

**Doble botón de CTA.** Los 26 creativos del lookbook traen su propia píldora "Pedí tu cotización"
dibujada dentro de la imagen. Meta agrega su propio botón, así que van a convivir dos. Esto
contradice el hallazgo de la sección 13 del playbook, donde ninguno de los 5 competidores
estudiados dibuja botón propio. En feed el botón de Meta va fuera de la imagen y el choque es
menor; en historias quedan apilados.

Decisión del dueño: salir así y mirarlo en la vista previa real antes de activar. Si molesta, los
creativos se regeneran sin la píldora.

**Cuenta sin historial.** Meta arranca sin ninguna señal previa de esta cuenta, así que la fase de
aprendizaje va a ser más cara y más lenta que en una cuenta con recorrido. Es inevitable en una
primera campaña.

---

## 7. Requisitos antes de poder crear

1. ~~El `instagram_user_id`~~ → resuelto: `17841480298053905`.
2. **Los 6 PNG subidos a la biblioteca de medios de la cuenta `3071383336584896`.** Único
   bloqueante que queda. `ads_get_ad_images` devuelve vacío al 2026-07-27.
3. Confirmación o corrección del presupuesto de ARS 3.000 por día. No bloquea: se edita en
   Ads Manager antes de activar.

---

## 8. Qué NO incluye este diseño

- Instalación del píxel en el sitio. Es lo que habilitaría optimizar a conversiones y hacer
  retargeting, y merece su propio trabajo.
- Catálogo de productos en Meta ni anuncios dinámicos.
- Públicos personalizados ni lookalikes. No hay datos de origen todavía.
- Regeneración de creativos sin el botón propio.
- Activación de la campaña. La activa el dueño, a mano, después de revisar.
- **Programación por horarios (dayparting).** Ads Manager la sugiere prometiendo "22,8% más de
  conversiones", pero ese número es una estimación agregada de Meta, no algo medido en esta
  cuenta, que no tiene historial. Se descarta por ahora por tres razones: no se sabe todavía a
  qué hora entran las consultas, achicar las horas reduce el pool de subasta justo cuando la
  campaña necesita volumen para salir de aprendizaje, y programar horarios suele exigir
  presupuesto total, que se descartó a propósito en la sección 3.

  **Cuándo revisarlo:** después de una o dos semanas con entrega, pidiendo el desglose
  `hourly_stats_aggregated_by_advertiser_time_zone` en `ads_get_ad_entities` para ver cuándo
  entran las conversaciones de verdad. La excepción que lo adelantaría es que los DM se atiendan
  solo en horario de oficina: ahí el desperdicio nocturno es real desde el día uno.

---

## 9. Verificación

Después de crear, y antes de entregar:

1. `ads_get_ad_entities` a nivel campaña, conjunto y anuncio, confirmando que existen los 8
   objetos esperados (1 campaña + 1 conjunto + 6 anuncios) y que **los 8 están en PAUSED**.
2. `ads_get_ad_preview` de los 6 anuncios, mirando cada uno para confirmar que la imagen es la
   correcta, que el copy no se corta y que el botón de WhatsApp aparece.
3. Confirmar que el presupuesto quedó a nivel campaña (CBO) y no a nivel conjunto.
