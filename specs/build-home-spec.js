/* Ensambla specs/home-spec.html: un solo archivo autocontenido con
   (a) el Home real del mockup, funcionando, y (b) la especificación anotada. */
const fs = require('fs');
const path = require('path');
const ROOT = '/Users/q2025335/Documents/1-canales/blu-empresas/blu-web-prototype';
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const CSS = ['css/design-system.css', 'css/app.css', 'css/legacy.css'].map(read).join('\n\n');
const JS = [
  'js/icons.js', 'js/data.js', 'js/app.js',
  'js/screens-catalog.js', 'js/screens-products.js', 'js/screens-payments.js',
  'js/screens-services.js', 'js/screens-business.js', 'js/screens-auth.js',
  'js/onboarding-signature.js', 'js/onboarding-blu-plus.js', 'js/screens-legacy.js'
].map(read).join('\n;\n');

const spec = read('specs/home.json');
const carousel = read('specs/card-carousel.json');
const ds = read('design-system.json');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// El bloque <script> embebido no puede contener la secuencia de cierre literal.
const safeJS = JS.replace(/<\/script>/gi, '<\\/script>');

const out = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BLU Empresas — Especificación de Inicio (Home)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500;700;800&display=swap" rel="stylesheet">
<style id="appcss">
/* ============ CSS REAL DEL PROTOTIPO (design-system.css + app.css + legacy.css) ============ */
${CSS}

/* ============ Capa propia del documento de especificación ============ */
.spec-doc { font-family: var(--font); color: var(--ink); background: var(--bg); }
.spec-wrap { max-width: 1180px; margin: 0 auto; padding: 40px 24px 80px; }
.spec-hero { background: var(--grad-navy); color:#fff; border-radius: 20px; padding: 40px; margin-bottom: 32px; position:relative; overflow:hidden; }
.spec-hero::before { content:""; position:absolute; width:420px; height:420px; border-radius:50%; top:-160px; right:-90px; background: radial-gradient(circle, rgba(46,91,255,.4), transparent 65%); }
.spec-hero > * { position: relative; z-index:1; }
.spec-hero h1 { font-size: 34px; font-weight: 800; letter-spacing:-.02em; line-height:1.15; }
.spec-hero p { color: rgba(255,255,255,.72); margin-top: 10px; max-width: 62ch; font-size: 15px; }
.spec-meta { display:flex; flex-wrap:wrap; gap:10px; margin-top:22px; }
.spec-meta span { background: rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.16); border-radius:999px; padding:6px 14px; font-size:12px; font-weight:600; }
.spec-sec { margin-top: 44px; }
.spec-sec > h2 { font-size: 24px; font-weight:800; letter-spacing:-.01em; padding-bottom:10px; border-bottom:2px solid var(--line-2); margin-bottom:18px; }
.spec-sec > h3 { font-size: 17px; font-weight:700; margin: 26px 0 10px; }
.spec-sec p { color: var(--slate); max-width: 78ch; margin-bottom: 12px; font-size: 14px; }
.spec-note { background: var(--blu-50); border:1px solid var(--blu-100); border-left:4px solid var(--primary); border-radius:12px; padding:14px 18px; font-size:13.5px; color: var(--slate); margin:14px 0; }
.spec-warn { background: var(--warning-bg); border:1px solid color-mix(in srgb, var(--warning) 30%, transparent); border-left:4px solid var(--warning); border-radius:12px; padding:14px 18px; font-size:13.5px; color: var(--slate); margin:14px 0; }
.spec-t { width:100%; border-collapse:collapse; font-size:13px; margin:12px 0 20px; background:var(--surface); border:1px solid var(--line-2); border-radius:12px; overflow:hidden; }
.spec-t th { text-align:left; background:var(--surface-2); font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); padding:10px 14px; border-bottom:1px solid var(--line); font-weight:700; }
.spec-t td { padding:10px 14px; border-bottom:1px solid var(--line-2); vertical-align:top; }
.spec-t tr:last-child td { border-bottom:none; }
.spec-t code, .spec-doc code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; background:var(--bg-2); padding:2px 6px; border-radius:5px; }
.spec-scroll { overflow-x:auto; }
.spec-code { background:#0d1220; color:#dbe4ff; border-radius:14px; padding:18px 20px; overflow-x:auto; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; line-height:1.65; margin:12px 0 20px; }
.spec-code .c { color:#7f8db3; }
.spec-swatch { display:grid; grid-template-columns:repeat(auto-fill,minmax(168px,1fr)); gap:12px; margin:14px 0 22px; }
.spec-swatch div { border:1px solid var(--line-2); border-radius:12px; overflow:hidden; background:var(--surface); }
.spec-swatch i { display:block; height:52px; }
.spec-swatch b { display:block; font-size:12px; padding:8px 12px 2px; font-weight:700; }
.spec-swatch small { display:block; font-size:11px; color:var(--muted); padding:0 12px 10px; font-family:ui-monospace,Menlo,monospace; }
.spec-frame { border:1px solid var(--line); border-radius:18px; overflow:hidden; background:var(--surface); box-shadow:var(--e-3); }
.spec-frame__bar { display:flex; align-items:center; gap:10px; padding:12px 16px; background:var(--surface-2); border-bottom:1px solid var(--line-2); font-size:12px; font-weight:600; color:var(--muted); }
.spec-frame__bar i { width:11px; height:11px; border-radius:50%; background:var(--line); display:block; }
.spec-live { height: 1080px; border:0; width:100%; display:block; margin:0 auto; }
.spec-vp { display:flex; gap:6px; margin-left:auto; }
.spec-vp button { border:1px solid var(--line); background:var(--surface); color:var(--slate); font:inherit; font-size:11px; font-weight:700; padding:5px 12px; border-radius:999px; cursor:pointer; }
.spec-vp button.on { background:var(--primary); color:#fff; border-color:var(--primary); }
.spec-stage { background:var(--bg-2); padding:0; }
.spec-toc { background:var(--surface); border:1px solid var(--line-2); border-radius:14px; padding:18px 22px; margin-bottom:30px; }
.spec-toc ol { margin:0; padding-left:20px; }
.spec-toc li { padding:4px 0; font-size:14px; }
.spec-toc a { color:var(--primary); font-weight:600; }
.spec-toc a:hover { text-decoration:underline; }
.spec-anat { display:grid; grid-template-columns: 34px 1fr; gap:0 14px; }
.spec-anat b { grid-column:1; width:28px; height:28px; border-radius:50%; background:var(--primary); color:#fff; display:grid; place-items:center; font-size:12px; font-weight:800; }
.spec-anat div { grid-column:2; padding-bottom:20px; }
.spec-anat h4 { font-size:15px; font-weight:700; margin-bottom:4px; }
.spec-anat p { font-size:13.5px; margin:0; }
@media (max-width:760px){ .spec-wrap{padding:24px 16px 60px} .spec-hero{padding:26px} .spec-hero h1{font-size:26px} }
</style>
</head>
<body class="spec-doc">
<div class="spec-wrap">

  <header class="spec-hero">
    <h1>Inicio (Home)<br>Especificación de implementación</h1>
    <p>Documento único de entrega a desarrollo. Contiene el Home ejecutable exactamente como está en el mockup, el HTML y el CSS completos, las medidas verificadas y el contrato de datos. Lo que se implemente contra este documento debe verse idéntico al render incrustado más abajo.</p>
    <div class="spec-meta">
      <span>Ruta · #/inicio</span>
      <span>Vanilla JS + CSS · sin dependencias</span>
      <span>Mulish · navy #04195D</span>
      <span>WCAG 2.2 AA</span>
      <span>v1.0 · 23 jul 2026</span>
    </div>
  </header>

  <nav class="spec-toc">
    <ol>
      <li><a href="#render">Render de referencia (el Home real, funcionando)</a></li>
      <li><a href="#anatomia">Anatomía: los tres bloques</a></li>
      <li><a href="#tokens">Tokens: color, tipografía, espaciado, radios, sombras</a></li>
      <li><a href="#medidas">Medidas verificadas en 375 / 1280 / 1440 px</a></li>
      <li><a href="#html">HTML completo del Home</a></li>
      <li><a href="#css">CSS completo del Home</a></li>
      <li><a href="#datos">Contrato de datos</a></li>
      <li><a href="#criterios">Criterios de aceptación</a></li>
    </ol>
  </nav>

  <section class="spec-sec" id="render">
    <h2>1 · Render de referencia</h2>
    <p>Este no es una captura: es el Home del mockup corriendo dentro de este mismo archivo, con su CSS y su JS reales. Es la fuente de verdad visual. Cambia el ancho de la ventana para ver el comportamiento responsive, y usa las pestañas de producto para ver las cuatro categorías.</p>
    <div class="spec-frame">
      <div class="spec-frame__bar"><i></i><i></i><i></i><span>Inicio · #/inicio</span>
        <span class="spec-vp">
          <button data-vp="375">Móvil 375</button>
          <button data-vp="768">Tablet 768</button>
          <button data-vp="0" class="on">Escritorio</button>
        </span>
      </div>
      <div class="spec-stage"><iframe class="spec-live" id="liveFrame" title="Home del mockup BLU Empresas"></iframe></div>
    </div>
    <div class="spec-note"><strong>Cómo usarlo:</strong> abre las herramientas de desarrollo sobre el marco de arriba e inspecciona cualquier elemento. Todos los valores computados que veas ahí son los valores objetivo de la implementación.</div>
  </section>

  <section class="spec-sec" id="anatomia">
    <h2>2 · Anatomía</h2>
    <p>El Home responde tres preguntas en orden: quién soy, cuánto vendí, qué tengo con el banco. Se compone de tres bloques dentro de <code>.content</code> (padding 32&nbsp;px, ancho máximo 1000&nbsp;px hasta 1280&nbsp;px y libre por encima). Cada bloque va envuelto en <code>.section</code>, que aplica la animación de entrada <code>riseIn</code> (320&nbsp;ms).</p>

    <div class="spec-anat">
      <b>1</b>
      <div>
        <h4>Encabezado — <code>.page-head.section</code></h4>
        <p>Fila <code>.row.between.wrap</code> con gap 12&nbsp;px. A la izquierda: <code>h1</code> con el nombre de la empresa (24&nbsp;px / 700 / line-height 1.1), el chip «Cambiar» y debajo el saludo «Hola, {nombre}» en <code>--muted</code>. A la derecha: tres <code>.icon-btn</code> de 44×44&nbsp;px (Transferir, Pago masivo, Aprobaciones con badge rojo «3») y el botón secundario de ClubMiles.</p>
      </div>
      <b>2</b>
      <div>
        <h4>Tus ventas — <code>.sales-summary</code></h4>
        <p>Encabezado con <code>h2.h3</code> «Tus ventas» y el enlace «Mira el detalle». Debajo, grilla de 3 columnas iguales con gap 16&nbsp;px. La primera card lleva <code>--hl</code>: borde <code>--blu-200</code>, degradado vertical <code>--blu-50 → --surface</code> al 60&nbsp;%, texto alineado a la izquierda y el pill verde de crecimiento. Las otras dos son centradas. Los centavos van en <code>.cents</code> al 58&nbsp;% del tamaño y en <code>--muted</code>.</p>
      </div>
      <b>3</b>
      <div>
        <h4>Tus Productos — tabs + carrusel + resumen</h4>
        <p>Todo dentro de una <code>.card.card--pad</code>. Arriba, tabs pill (<code>.prod-tabs--inline</code>) con el activo en <code>--blu-900</code> sobre blanco. En medio, el carrusel <code>.prod-strip</code> con scroll-snap horizontal. Abajo, una card de resumen con el total de la categoría y dos botones: «Solicitar {producto}» (secundario) y «Ver todo» (ghost).</p>
        <p><strong>Regla obligatoria:</strong> una categoría solo aparece si el usuario tiene ese producto. Los tabs se construyen filtrando por <code>length &gt; 0</code>; nunca se muestra un tab vacío.</p>
      </div>
    </div>
  </section>

  <section class="spec-sec" id="tokens">
    <h2>3 · Tokens</h2>
    <p>Ningún valor se escribe literal en los componentes: todo sale de estas variables CSS, declaradas en <code>:root</code> y redeclaradas en <code>[data-theme="dark"]</code>.</p>

    <h3>Color de marca</h3>
    <div class="spec-swatch">
      <div><i style="background:#e6e8ef"></i><b>blu-50</b><small>#e6e8ef</small></div>
      <div><i style="background:#b1b8cd"></i><b>blu-100</b><small>#b1b8cd</small></div>
      <div><i style="background:#8c95b4"></i><b>blu-200</b><small>#8c95b4</small></div>
      <div><i style="background:#576592"></i><b>blu-300</b><small>#576592</small></div>
      <div><i style="background:#36477d"></i><b>blu-400</b><small>#36477d</small></div>
      <div><i style="background:#04195D"></i><b>blu-500 · --primary</b><small>#04195D</small></div>
      <div><i style="background:#031242"></i><b>blu-700 · --primary-strong</b><small>#031242</small></div>
      <div><i style="background:#020b27"></i><b>blu-900 · tab activo</b><small>#020b27</small></div>
    </div>

    <h3>Semánticos y neutros</h3>
    <table class="spec-t">
      <thead><tr><th>Token</th><th>Light</th><th>Dark</th><th>Uso en el Home</th></tr></thead>
      <tbody>
        <tr><td><code>--primary</code></td><td>#04195D</td><td>#5B7BFF</td><td>Enlace «Mira el detalle», monto de la card destacada, icono de atajo</td></tr>
        <tr><td><code>--ink</code></td><td>#141414</td><td>#E9EDF9</td><td>Título de empresa, montos de venta, nombre de producto</td></tr>
        <tr><td><code>--slate</code></td><td>#333333</td><td>#B7C0D6</td><td>Texto del chip, labels de atajos</td></tr>
        <tr><td><code>--muted</code></td><td>#757575</td><td>#8B94AB</td><td>Saludo, labels y captions de las cards, centavos</td></tr>
        <tr><td><code>--line</code></td><td>#CBCBCB</td><td>#262C40</td><td>Borde de <code>.sales-card</code> y de <code>.prod-xl</code></td></tr>
        <tr><td><code>--line-2</code></td><td>#EEEEEE</td><td>#1E2437</td><td>Borde de <code>.card</code>, fondo de la píldora de tabs</td></tr>
        <tr><td><code>--surface</code></td><td>#FFFFFF</td><td>#131A2C</td><td>Fondo de todas las cards</td></tr>
        <tr><td><code>--bg</code></td><td>#F6F6F6</td><td>#0B0F1E</td><td>Fondo de la pantalla</td></tr>
        <tr><td><code>--success</code> / <code>--success-bg</code></td><td>#096B3A / #E8F5E9</td><td>#34C77E / #0F2A1E</td><td>Pill de crecimiento, badge «Al día», pill de interés</td></tr>
        <tr><td><code>--warning</code> / <code>--warning-bg</code></td><td>#8B6901 / #FFF9E6</td><td>#E7B84B / #2A2410</td><td>Badge «Por pagar»</td></tr>
        <tr><td><code>--error</code> / <code>--error-bg</code></td><td>#B61010 / #FDEAEA</td><td>#FF6B72 / #2E1517</td><td>Badge «3» de aprobaciones, estado en mora</td></tr>
      </tbody>
    </table>

    <h3>Tipografía · Mulish</h3>
    <table class="spec-t">
      <thead><tr><th>Rol</th><th>Tamaño</th><th>Peso</th><th>Otros</th><th>Dónde</th></tr></thead>
      <tbody>
        <tr><td>Título de empresa</td><td>24 px</td><td>700</td><td>tracking −.01em · lh 1.1</td><td><code>.page-head h1</code></td></tr>
        <tr><td>Título de sección</td><td>20 px</td><td>600</td><td>lh 1.25</td><td><code>h2.h3</code></td></tr>
        <tr><td>Monto de venta</td><td>30 px</td><td>800</td><td>lh 1.1 · tabular</td><td><code>.sales-card__amt</code></td></tr>
        <tr><td>Centavos</td><td>.58em</td><td>700</td><td>color <code>--muted</code></td><td><code>.cents</code></td></tr>
        <tr><td>Total de categoría</td><td>22 px</td><td>700</td><td>tracking −.02em</td><td><code>.kpi__value</code></td></tr>
        <tr><td>Monto de producto</td><td>22 px</td><td>800</td><td>tabular</td><td><code>.prod-xl__amt</code></td></tr>
        <tr><td>Nombre de producto</td><td>15 px</td><td>700</td><td>—</td><td><code>.prod-xl__name</code></td></tr>
        <tr><td>Cuerpo / captions</td><td>13 px</td><td>500</td><td>color <code>--muted</code></td><td><code>.sales-card__label</code>, <code>__cap</code></td></tr>
        <tr><td>Identificador de producto</td><td>12 px</td><td>400</td><td>tracking .06em · tabular</td><td><code>.prod-xl__id</code></td></tr>
      </tbody>
    </table>
    <div class="spec-note">Todo importe, porcentaje o número de cuenta lleva la clase <code>.num</code> (<code>font-variant-numeric: tabular-nums</code>). Sin ella los dígitos cambian de ancho y el layout salta al actualizarse.</div>

    <h3>Espaciado, radios y sombras</h3>
    <table class="spec-t">
      <thead><tr><th>Grupo</th><th>Valores</th><th>Uso en el Home</th></tr></thead>
      <tbody>
        <tr><td>Espaciado (grid 8)</td><td>4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64</td><td>Padding de página 32 · padding de card 24 · gap de grilla 16</td></tr>
        <tr><td>Radios</td><td>8 · 12 · 16 · 20 · 28 · 999</td><td>Card 16 · card de producto 20 · chips y botones 999</td></tr>
        <tr><td>Sombras</td><td><code>--e-1</code> a <code>--e-4</code></td><td>Reposo de cards <code>--e-1</code> · hover de venta <code>--e-2</code> · hover de producto <code>--e-3</code></td></tr>
        <tr><td>Foco</td><td><code>--ring</code> = 0 0 0 4px rgba(76,113,252,.28)</td><td>Obligatorio en todo elemento interactivo. No eliminar el outline sin reemplazarlo.</td></tr>
        <tr><td>Motion</td><td>140 / 220 / 320 ms · ease <code>cubic-bezier(.4,0,.2,1)</code></td><td>Solo se animan <code>transform</code> y <code>opacity</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="spec-sec" id="medidas">
    <h2>4 · Medidas verificadas</h2>
    <p>Medidas tomadas con <code>getBoundingClientRect()</code> sobre el mockup corriendo. Son los valores objetivo; la implementación debe reproducirlos.</p>

    <h3>Card de producto en el carrusel</h3>
    <div class="spec-scroll">
    <table class="spec-t">
      <thead><tr><th>Viewport</th><th>.prod-xl</th><th>.prod-xl__media</th><th>.bank-card</th><th>Relación de aspecto</th></tr></thead>
      <tbody>
        <tr><td>375 px</td><td>230 × 219</td><td>216 × 130</td><td>188 × 116</td><td>1.620</td></tr>
        <tr><td>1280 px</td><td>288.7 × 219</td><td>274.7 × 166.3</td><td>246.7 × 152.3</td><td>1.620</td></tr>
        <tr><td>1440 px</td><td>300 × 223.3</td><td>286 × 173.3</td><td>258 × 159.3</td><td>1.620</td></tr>
      </tbody>
    </table>
    </div>

    <div class="spec-warn"><strong>Divergencia conocida a corregir.</strong> A 1440&nbsp;px la card de tarjeta mide 223.3&nbsp;px de alto y la de cuenta 219.3&nbsp;px: 4&nbsp;px de diferencia. La causa es que el <code>aspect-ratio</code> del arte hace crecer la tarjeta por encima del <code>min-height</code> de 219&nbsp;px. La corrección especificada es topar el arte con <code>max-width: 274px</code> sobre <code>.prod-xl__media</code>, con lo que el alto natural queda en 212&nbsp;px en todo el rango superior y el <code>min-height</code> vuelve a gobernar para las cuatro categorías. Ver <code>specs/card-carousel.json</code>.</div>

    <h3>Reglas de dimensionamiento</h3>
    <table class="spec-t">
      <thead><tr><th>Elemento</th><th>Regla</th><th>Intención</th></tr></thead>
      <tbody>
        <tr><td>Ancho de card (móvil)</td><td><code>flex: 0 0 clamp(230px, 68%, 280px)</code></td><td>Se ve una card más el borde de la siguiente: invita al swipe</td></tr>
        <tr><td>Ancho de card (≥720 px)</td><td><code>flex-basis: clamp(240px, calc(33.333% - var(--s-4)*2/3), 300px)</code></td><td>Entran exactamente 3 por vista</td></tr>
        <tr><td>Alto de card</td><td><code>min-height: 219px</code></td><td>Las cuatro categorías miden lo mismo</td></tr>
        <tr><td>Borde de card</td><td><code>1px solid var(--line)</code> · radio 20 px</td><td>Único borde; el arte interior no lleva borde propio</td></tr>
        <tr><td>Arte de tarjeta</td><td><code>aspect-ratio: 1.62</code> · radio 16 px · padding 20 px</td><td>Proporción de tarjeta física; no alterar</td></tr>
        <tr><td>Carrusel</td><td><code>gap: 16px</code> · <code>scroll-snap-type: x mandatory</code> · scrollbar oculta</td><td>El desbordamiento vive aquí; la página nunca scrollea en horizontal</td></tr>
      </tbody>
    </table>

    <h3>Puntos de quiebre</h3>
    <table class="spec-t">
      <thead><tr><th>Ancho</th><th>Qué cambia</th></tr></thead>
      <tbody>
        <tr><td>≥ 1280 px</td><td><code>.content</code> pierde el ancho máximo y ocupa todo el espacio junto al menú</td></tr>
        <tr><td>≥ 720 px</td><td>El carrusel pasa a 3 productos por vista</td></tr>
        <tr><td>≤ 860 px</td><td>El sidebar se oculta y aparece la barra inferior; la topbar baja a 60 px</td></tr>
        <tr><td>≤ 760 px</td><td><code>.sales-summary</code> pasa a una columna y las cards se alinean a la izquierda</td></tr>
      </tbody>
    </table>
  </section>

  <section class="spec-sec" id="html">
    <h2>5 · HTML del Home</h2>
    <p>Estructura literal que produce <code>Screens.inicio</code>. Los iconos se insertan con <code>icon('nombre')</code>, que devuelve un <code>&lt;svg viewBox="0 0 24 24"&gt;</code> del set de 58 piezas: nunca se usan emojis.</p>
    <div class="spec-code"><pre>${esc(`<!-- 1 · ENCABEZADO -->
<div class="page-head section">
  <div class="row between wrap" style="gap:12px">
    <div>
      <div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">
        <h1 style="line-height:1.1">{empresa.name}</h1>
        <button class="chip" aria-label="Cambiar de empresa">
          {icon:building} Cambiar {icon:chevronDown}
        </button>
      </div>
      <p class="text-muted" style="margin-top:4px">Hola, {user.first}</p>
    </div>
    <div class="row wrap" style="gap:8px;align-items:center">
      <button class="icon-btn tip" data-nav="transferencias" data-tip="Transferir" aria-label="Transferir">{icon:send}</button>
      <button class="icon-btn tip" data-nav="carga-archivo"  data-tip="Pago masivo" aria-label="Pago masivo">{icon:upload}</button>
      <button class="icon-btn tip" data-nav="aprobaciones"   data-tip="Aprobaciones" aria-label="Aprobaciones" style="position:relative">
        {icon:approve}
        <span class="badge badge--error" style="position:absolute;top:-3px;right:-3px;padding:1px 6px;font-size:10px">3</span>
      </button>
      <button class="btn btn--secondary btn--sm" data-nav="recompensas">{icon:gift} 48.250 ClubMiles</button>
    </div>
  </div>
</div>

<!-- 2 · TUS VENTAS -->
<div class="section mb-6">
  <div class="row between wrap mb-4" style="gap:10px">
    <h2 class="h3">Tus ventas</h2>
    <a class="row" data-nav="caja" style="gap:6px;font-size:13px;font-weight:600;color:var(--primary);cursor:pointer">
      Mira el detalle {icon:chevron}
    </a>
  </div>
  <div class="sales-summary">
    <button class="sales-card sales-card--hl" data-nav="caja">
      <div class="row between" style="align-items:flex-start">
        <div class="sales-card__label">Ventas del mes</div>
        <span class="sales-card__grow">{icon:arrowUp} +{crecimiento}%</span>
      </div>
      <div class="sales-card__amt num">$128.480<span class="cents">,50</span></div>
      <div class="sales-card__cap">Periodo {periodo} · vs. mes anterior</div>
    </button>
    <button class="sales-card" data-nav="caja">
      <div class="sales-card__label">Pagos recibidos</div>
      <div class="sales-card__amt num">$96.320<span class="cents">,06</span></div>
      <div class="sales-card__cap">Periodo {periodo}</div>
    </button>
    <button class="sales-card" data-nav="caja">
      <div class="sales-card__label">Total por cobrar</div>
      <div class="sales-card__amt num">$81.200<span class="cents">,00</span></div>
      <div class="sales-card__cap">{fechaCobro}</div>
    </button>
  </div>
</div>

<!-- 3 · TUS PRODUCTOS -->
<div class="section mb-6">
  <div class="row between wrap mb-4" style="gap:10px">
    <h2 class="h3">Tus Productos</h2>
  </div>
  <div class="card card--pad">
    <div class="mb-4">
      <div class="scroll-x" style="max-width:100%;padding-bottom:0">
        <div class="prod-tabs prod-tabs--inline" id="prodTabs" role="tablist">
          <!-- solo las categorias con productos; la primera arranca activa -->
          <button class="is-active" data-c="tarjeta"   role="tab" aria-selected="true">Tarjetas</button>
          <button                    data-c="cuenta"    role="tab" aria-selected="false">Cuentas</button>
          <button                    data-c="credito"   role="tab" aria-selected="false">Créditos</button>
          <button                    data-c="inversion" role="tab" aria-selected="false">Inversiones</button>
        </div>
      </div>
    </div>
    <div id="prodXlHost"></div>   <!-- carrusel -->
    <div id="prodXlExtra" class="mt-4"></div>  <!-- resumen + CTAs -->
  </div>
</div>`)}</pre></div>

    <h3>Card de tarjeta dentro del carrusel</h3>
    <div class="spec-code"><pre>${esc(`<button class="prod-xl" data-nav="detalle-producto?id={id}" aria-label="Abrir {name}">
  <div class="prod-xl__media">
    <div class="bank-card {variant}" tabindex="0" role="group"
         aria-label="Tarjeta {name} {kind} terminación {last4}">
      <div class="row between">
        <div>
          <div class="bank-card__brand">blu</div>
          <div class="bank-card__type">{name} · {type}</div>
          <span class="bank-card__kind">Principal | Adicional</span>
        </div>
        <div class="bank-card__chip"></div>
      </div>
      <div class="bank-card__number num">•••• {last4}</div>
      <div class="bank-card__foot">
        <div><small>Saldo consumido</small><strong class="num">{deudaTotal}</strong></div>
        <div style="text-align:right"><small>Total a pagar</small><strong class="num">{pagoTotal | "Al día"}</strong></div>
      </div>
    </div>
  </div>
  <div class="prod-xl__body">
    <div class="row between" style="gap:8px;align-items:center">
      <span class="prod-xl__sub" style="margin:0">Pagar hasta {pago}</span>
      <span class="badge badge--warning"><span class="dot"></span>Por pagar</span>
      <!-- si pagoTotal = 0 → <span class="badge badge--success">Al día</span> -->
    </div>
  </div>
</button>`)}</pre></div>
    <div class="spec-warn"><strong>Regla de negocio.</strong> «Pagar hasta {fecha}» nunca va sobre el arte de la tarjeta: va debajo, en el cuerpo. Sobre el arte solo van «Saldo consumido» y «Total a pagar».</div>

    <h3>Card plana — cuenta, crédito e inversión</h3>
    <p>Las tres comparten el mismo molde: el shell <code>.prod-xl</code> con el modificador <code>.acct-card-plain</code>, sin arte de tarjeta, con el contenido centrado y un pill de dato destacado al pie.</p>
    <div class="spec-code"><pre>${esc(`<button class="prod-xl acct-card-plain" data-nav="detalle-producto?id={id}" aria-label="Abrir {name}">
  <div class="prod-xl__body">
    <span class="prod__ic prod__ic--acct" style="margin:0 auto 8px">{icon:wallet}</span>
    <div class="prod-xl__name">{name}</div>
    <div class="prod-xl__id num">{type} · {num}</div>
    <div class="prod-xl__amt num" style="font-size:22px;margin-top:10px">{saldo}</div>
    <div class="prod-xl__sub">Saldo disponible</div>
    <div class="acct-interes">{icon:arrowUp} <strong class="num">+{interesMes}</strong> este mes</div>
  </div>
</button>

<!-- Tinte del icono segun producto -->
<!-- cuenta    → .prod__ic--acct    fondo rgba(42,63,110,.12)  icono #2E4A82  wallet -->
<!-- credito   → .prod__ic--credit  fondo rgba(84,91,108,.15)  icono #4A5262  coins  -->
<!-- inversion → .prod__ic--invest  fondo rgba(70,63,156,.14)  icono #453FA0  chart  -->

<!-- Pill segun estado -->
<!-- normal → .acct-interes                  verde   (--success-bg / --success) -->
<!-- aviso  → .acct-interes.acct-interes--warn   ambar   (--warn-bg / --warn)      -->
<!-- mora   → .acct-interes.acct-interes--danger rojo    (--error-bg / --error)    -->`)}</pre></div>

    <h3>Resumen de categoría y llamadas a la acción</h3>
    <div class="spec-code"><pre>${esc(`<div class="card card--pad section">
  <div class="text-muted" style="font-size:13px">Tu saldo total en cuentas con nosotros</div>
  <div class="kpi__value num" style="font-size:22px;margin-top:4px">$48.910,20</div>
  <div class="row wrap mt-4" style="gap:8px">
    <button class="btn btn--secondary btn--sm" data-nav="{ruta}">{icon:plus} Abrir cuenta</button>
    <button class="btn btn--ghost btn--sm" data-nav="{ruta}">Ver todo {icon:chevron}</button>
  </div>
</div>`)}</pre></div>
    <table class="spec-t">
      <thead><tr><th>Categoría</th><th>Etiqueta del resumen</th><th>Botón de solicitud</th><th>Ruta</th><th>«Ver todo» va a</th></tr></thead>
      <tbody>
        <tr><td>Tarjetas</td><td>Cupo disponible</td><td>Solicitar tarjeta adicional</td><td><code>onboarding-signature</code></td><td><code>tarjetas</code></td></tr>
        <tr><td>Cuentas</td><td>Tu saldo total en cuentas con nosotros</td><td>Abrir cuenta</td><td><code>onboarding-blu-plus</code></td><td><code>cuentas?cat=cuenta</code></td></tr>
        <tr><td>Créditos</td><td>Total de tus créditos con nosotros</td><td>Solicitar crédito</td><td><code>sim-credito</code></td><td><code>cuentas?cat=credito</code></td></tr>
        <tr><td>Inversiones</td><td>Total de tus inversiones</td><td>Invertir ahora</td><td><code>ofertas</code></td><td><code>cuentas?cat=inversion</code></td></tr>
      </tbody>
    </table>
    <div class="spec-note">El botón de solicitud nunca es genérico: siempre nombra el producto de la categoría activa.</div>
  </section>

  <section class="spec-sec" id="css">
    <h2>6 · CSS del Home</h2>
    <p>Reglas literales de los componentes propios del Home. Los primitivos (<code>.card</code>, <code>.btn</code>, <code>.chip</code>, <code>.badge</code>, <code>.icon-btn</code>) viven en <code>css/design-system.css</code> y no se repiten aquí.</p>
    <div class="spec-code"><pre>${esc(`/* ---------- Resumen de ventas ---------- */
.sales-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.sales-card {
  display: flex; flex-direction: column; gap: 6px; text-align: center;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-md);
  padding: 22px 20px; cursor: pointer; width: 100%;
  transition: box-shadow var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease), transform var(--dur-1) var(--ease);
}
.sales-card:hover          { box-shadow: var(--e-2); border-color: var(--blu-200); }
.sales-card:active         { transform: translateY(1px); }
.sales-card:focus-visible  { box-shadow: var(--ring); outline: none; }
.sales-card__label { font-size: 13px; color: var(--muted); font-weight: 500; }
.sales-card__amt   { font-size: 30px; font-weight: 800; color: var(--ink); line-height: 1.1; }
.sales-card__amt .cents { font-size: .58em; font-weight: 700; color: var(--muted); }
.sales-card__cap   { font-size: 12px; color: var(--muted); }

/* Card destacada: Ventas del mes */
.sales-card--hl { border-color: var(--blu-200); background: linear-gradient(180deg, var(--blu-50) 0%, var(--surface) 60%); text-align: left; }
.sales-card--hl .sales-card__amt { color: var(--primary-strong); }
.sales-card__grow {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--success-bg); color: var(--success);
  font-size: 14px; font-weight: 800; padding: 4px 10px; border-radius: var(--r-full);
}
.sales-card__grow svg { width: 15px; height: 15px; }
@media (max-width: 760px) { .sales-summary { grid-template-columns: 1fr; } .sales-card { text-align: left; } }

/* ---------- Tabs de producto ---------- */
.prod-tabs { display: flex; gap: 6px; padding: 5px; background: var(--line-2); border-radius: var(--r-full); }
.prod-tabs button {
  flex: 1; min-height: 42px; border: 0; background: transparent; padding: 10px 12px;
  border-radius: var(--r-full); font: inherit; font-weight: 600; font-size: 13px;
  color: var(--muted); cursor: pointer;
  transition: background var(--dur-2) var(--ease), color var(--dur-2) var(--ease);
}
.prod-tabs button:hover      { color: var(--ink); }
.prod-tabs button.is-active  { background: var(--blu-900); color: #fff; box-shadow: var(--e-1); }
.prod-tabs--inline           { display: inline-flex; width: max-content; }
.prod-tabs--inline button    { flex: 0 0 auto; min-height: 38px; padding: 8px 16px; white-space: nowrap; }

/* ---------- Carrusel ---------- */
.prod-strip {
  display: flex; gap: var(--s-4); overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 6px 2px 14px; -ms-overflow-style: none; scrollbar-width: none;
}
.prod-strip::-webkit-scrollbar { display: none; }

/* ---------- Card de producto ---------- */
.prod-xl {
  scroll-snap-align: start; flex: 0 0 clamp(230px, 68%, 280px);
  display: flex; flex-direction: column; text-align: left;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg);
  overflow: hidden; box-shadow: var(--e-1); cursor: pointer;
  transition: transform var(--dur-3) var(--ease-out), box-shadow var(--dur-3) var(--ease);
}
.prod-xl:hover         { transform: translateY(-4px); box-shadow: var(--e-3); }
.prod-xl:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.prod-xl__media { padding: 14px 14px 0; }
.prod-xl__body  { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; }
.prod-xl__name  { font-weight: 700; font-size: 14px; color: var(--ink); }
.prod-xl__id    { font-size: 11px; color: var(--muted); letter-spacing: .06em; margin-top: 2px; }
.prod-xl__amt   { font-size: 21px; font-weight: 800; color: var(--ink); margin-top: 8px; letter-spacing: -.02em; }
.prod-xl__sub   { font-size: 11px; color: var(--muted); margin-top: 3px; }

/* Desktop: 3 productos por vista, con tope para que no crezcan de mas */
@media (min-width: 720px) {
  .prod-xl { flex-basis: clamp(240px, calc(33.333% - var(--s-4) * 2 / 3), 300px); }
}

/* ---------- Card plana: cuenta, credito, inversion ---------- */
.acct-card-plain .prod-xl__body { align-items: center; text-align: center; padding-top: 24px; padding-bottom: 20px; }
.acct-card-plain .prod__ic       { width: 64px; height: 64px; border-radius: 16px; }
.acct-card-plain .prod__ic svg   { width: 28px; height: 28px; }
.acct-card-plain .prod-xl__name  { font-size: 17px; margin-top: 2px; }
.acct-card-plain .prod-xl__id    { font-size: 13px; margin-top: 4px; }
.acct-card-plain .prod-xl__sub   { font-size: 13px; margin-top: 6px; line-height: 1.4; }

/* Pill de dato destacado */
.acct-interes {
  display: inline-flex; align-items: center; gap: 5px; align-self: center; margin-top: 16px;
  background: var(--success-bg); color: var(--success);
  font-size: 13px; font-weight: 800; padding: 6px 13px; border-radius: var(--r-full);
  box-shadow: 0 2px 8px rgba(11,127,69,.18);
  border: 1px solid color-mix(in srgb, var(--success) 25%, transparent);
}
.acct-interes svg    { width: 15px; height: 15px; }
.acct-interes strong { font-weight: 900; }
.acct-interes--warn   { background: var(--warn-bg);  color: var(--warn);  box-shadow: 0 2px 8px rgba(183,121,31,.18); }
.acct-interes--danger { background: var(--error-bg); color: var(--error); box-shadow: 0 2px 8px rgba(220,38,38,.18); }

/* Compactacion dentro del carrusel: iguala el alto al de la tarjeta */
.prod-strip .prod-xl { min-height: 219px; }
.prod-strip .acct-card-plain .prod-xl__body { padding-top: 14px; padding-bottom: 14px; justify-content: center; }
.prod-strip .acct-card-plain .prod__ic      { width: 42px; height: 42px; border-radius: 12px; margin-bottom: 4px !important; }
.prod-strip .acct-card-plain .prod__ic svg  { width: 21px; height: 21px; }
.prod-strip .acct-card-plain .prod-xl__name { font-size: 15px; }
.prod-strip .acct-card-plain .prod-xl__id   { font-size: 12px; margin-top: 2px; }
.prod-strip .acct-card-plain .prod-xl__amt  { margin-top: 8px !important; }
.prod-strip .acct-card-plain .prod-xl__sub  { font-size: 12px; margin-top: 3px; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prod-strip .acct-card-plain .acct-interes  { margin-top: 8px !important; font-size: 12px; padding: 4px 10px; }

/* ---------- Arte de tarjeta ---------- */
.bank-card {
  position: relative; aspect-ratio: 1.62; border-radius: var(--r-md); padding: var(--s-5);
  background: var(--grad-card); color: #fff; overflow: hidden; box-shadow: var(--e-2);
  display: flex; flex-direction: column; justify-content: space-between;
  transition: transform var(--dur-3) var(--ease-out), box-shadow var(--dur-3) var(--ease);
}
.bank-card:hover { transform: translateY(-4px) rotate(-.4deg); box-shadow: var(--e-4); }
.bank-card::before {
  content: ""; position: absolute; width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.22), transparent 68%); top: -70px; right: -50px;
}
.bank-card::after {
  content: ""; position: absolute; width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(50,197,255,.35), transparent 70%); bottom: -60px; left: -30px;
}
.bank-card > *            { position: relative; z-index: 1; }
.bank-card__brand         { font-weight: 800; font-size: 16px; letter-spacing: -.02em; }
.bank-card__type          { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; opacity: .82; }
.bank-card__kind          { display: inline-block; margin-top: 8px; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.32); padding: 2px 9px; border-radius: 999px; }
.bank-card__chip          { width: 34px; height: 26px; border-radius: 6px; background: linear-gradient(135deg, #f5d98b, #c9a24b); box-shadow: inset 0 0 0 1px rgba(255,255,255,.4); }
.bank-card__number        { font-size: 16px; letter-spacing: .12em; font-weight: 500; }
.bank-card__foot          { display: flex; justify-content: space-between; align-items: flex-end; }
.bank-card__foot small    { display: block; font-size: 9px; letter-spacing: .1em; opacity: .7; text-transform: uppercase; }

/* Variantes de marca */
.bank-card--black  { background: linear-gradient(135deg, #141519 0%, #2a2b33 58%, #4a4c58 130%); }
.bank-card--indigo { background: linear-gradient(135deg, #0A1F6B 0%, #2C55F5 60%, #4C71FC 130%); }
.bank-card--teal   { background: linear-gradient(135deg, #063C57 0%, #1B7BA6 55%, #32C5FF 130%); }

/* ---------- Tinte de icono por producto ---------- */
.prod__ic           { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; flex: none; }
.prod__ic svg       { width: 22px; height: 22px; }
.prod__ic--card     { background: var(--blu-50);            color: var(--blu-600); }
.prod__ic--acct     { background: rgba(42,63,110,.12);      color: #2E4A82; }
.prod__ic--credit   { background: rgba(84,91,108,.15);      color: #4A5262; }
.prod__ic--invest   { background: rgba(70,63,156,.14);      color: #453FA0; }`)}</pre></div>
  </section>

  <section class="spec-sec" id="datos">
    <h2>7 · Contrato de datos</h2>
    <p>Campos que el Home consume. Los formatos monetarios son ecuatorianos: punto de miles y coma decimal.</p>
    <div class="spec-scroll">
    <table class="spec-t">
      <thead><tr><th>Origen</th><th>Campos</th><th>Dónde se usa</th></tr></thead>
      <tbody>
        <tr><td><code>empresa</code></td><td><code>name</code>, <code>otras[]</code></td><td>Título del encabezado y chip de cambio</td></tr>
        <tr><td><code>user</code></td><td><code>first</code></td><td>Saludo</td></tr>
        <tr><td><code>ventasResumen</code></td><td><code>ventasMes</code>, <code>crecimiento</code>, <code>pagosRecibidos</code>, <code>porCobrar</code>, <code>periodo</code>, <code>fechaCobro</code></td><td>Las tres cards de venta</td></tr>
        <tr><td><code>cards[]</code></td><td><code>id</code>, <code>name</code>, <code>type</code>, <code>last4</code>, <code>variant</code>, <code>pagoTotal</code>, <code>deudaTotal</code>, <code>pago</code>, <code>kind</code>/<code>principal</code></td><td>Arte de tarjeta y badge de estado</td></tr>
        <tr><td><code>accounts[]</code></td><td><code>id</code>, <code>name</code>, <code>type</code>, <code>num</code>, <code>saldo</code>, <code>interesMes</code>, <code>estado</code></td><td>Card de cuenta y pill de interés</td></tr>
        <tr><td><code>credits[]</code></td><td><code>id</code>, <code>name</code>, <code>num</code>, <code>saldo</code>, <code>estado</code>, <code>prox</code></td><td>Card de crédito y pill de estado</td></tr>
        <tr><td><code>investments[]</code></td><td><code>id</code>, <code>name</code>, <code>tipo</code>, <code>last4</code>, <code>tasa</code>, <code>monto</code>, <code>vence</code>, <code>interesMes</code></td><td>Card de inversión</td></tr>
        <tr><td><code>net</code></td><td><code>cupoGlobal</code>, <code>cupoGlobalDisp</code></td><td>Resumen de la categoría Tarjetas</td></tr>
      </tbody>
    </table>
    </div>

    <h3>Modo privacidad</h3>
    <p>Un interruptor global oculta los importes sensibles reemplazándolos por <code>••••••</code>. Se aplica a: los dos valores del pie de la tarjeta, el saldo de cuenta, el monto y el interés de inversión, y los totales de cupo, saldo e inversiones. <strong>No</strong> se aplica al saldo de crédito, al total de créditos ni a las cifras de venta.</p>

    <h3>Glosario obligatorio</h3>
    <table class="spec-t">
      <thead><tr><th>Término</th><th>Significado</th></tr></thead>
      <tbody>
        <tr><td>Saldo consumido</td><td>Deuda consumida de la tarjeta. Va en el pie izquierdo del arte.</td></tr>
        <tr><td>Total a pagar</td><td>Monto del corte. Pie derecho del arte. Si es cero se escribe «Al día».</td></tr>
        <tr><td>Pagar hasta</td><td>Fecha límite. Va en el cuerpo de la card, nunca sobre el arte.</td></tr>
        <tr><td>Cupo disponible</td><td>Cupo restante, compartido entre todas las tarjetas de la empresa.</td></tr>
        <tr><td>Fecha de finalización</td><td>Vencimiento de una inversión. No se dice «vence».</td></tr>
        <tr><td>Para ti</td><td>Nombre del catálogo de productos ofertados.</td></tr>
      </tbody>
    </table>
  </section>

  <section class="spec-sec" id="criterios">
    <h2>8 · Criterios de aceptación</h2>
    <p>Lista verificable para revisar la implementación contra el mockup. Cada punto se comprueba inspeccionando el elemento y comparando el valor computado.</p>
    <table class="spec-t">
      <thead><tr><th>#</th><th>Criterio</th><th>Cómo se verifica</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>El orden de los bloques es encabezado → Tus ventas → Tus Productos</td><td>Inspección visual</td></tr>
        <tr><td>2</td><td>La primera card de venta lleva degradado, alineación izquierda y pill verde de crecimiento; las otras dos son centradas y planas</td><td>Comparar con el render de referencia</td></tr>
        <tr><td>3</td><td>Las cuatro categorías de producto miden 219 px de alto en 375, 1280 y 1440 px</td><td>12 mediciones de <code>.prod-strip .prod-xl</code></td></tr>
        <tr><td>4</td><td>El borde de las cuatro categorías es idéntico: 1 px sólido <code>--line</code>, radio 20 px</td><td><code>border</code> y <code>borderRadius</code> computados</td></tr>
        <tr><td>5</td><td>La relación de aspecto del arte de tarjeta es 1.62 en todo el rango</td><td><code>width/height</code> de <code>.bank-card</code></td></tr>
        <tr><td>6</td><td>Un tab de categoría sin productos no se renderiza</td><td>Vaciar una colección y recargar</td></tr>
        <tr><td>7</td><td>Todo importe usa cifras tabulares</td><td><code>font-variant-numeric</code> computado</td></tr>
        <tr><td>8</td><td>Todo control interactivo muestra anillo de foco visible al navegar con teclado</td><td>Recorrido con Tab</td></tr>
        <tr><td>9</td><td>Los tres botones de atajo tienen <code>aria-label</code>; los tabs exponen <code>role</code> y <code>aria-selected</code> actualizado</td><td>Árbol de accesibilidad</td></tr>
        <tr><td>10</td><td>Ningún estado se comunica solo por color: «Por pagar», «Al día» y «En mora» llevan texto</td><td>Inspección</td></tr>
        <tr><td>11</td><td>La página no scrollea en horizontal en ningún ancho; el desbordamiento vive en el carrusel</td><td><code>scrollWidth &lt;= clientWidth</code> en el documento</td></tr>
        <tr><td>12</td><td>A 760 px las cards de venta pasan a una columna y se alinean a la izquierda</td><td>Redimensionar</td></tr>
        <tr><td>13</td><td>El modo oscuro respeta el contraste y no invierte colores</td><td>Alternar tema y revisar</td></tr>
        <tr><td>14</td><td>Con <code>prefers-reduced-motion</code> activo no hay animaciones</td><td>Activar la preferencia del sistema</td></tr>
      </tbody>
    </table>
  </section>

</div>

<script type="text/plain" id="appjs">${safeJS}</script>
<script>
/* El Home real, aislado en un iframe con el mismo CSS y JS del prototipo. */
(function(){
  var CSS = document.getElementById('appcss').textContent;
  var JS  = document.getElementById('appjs').textContent;
  var doc = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500;700;800&display=swap" rel="stylesheet">'
    + '<style>' + CSS + '</style></head><body><div id="root"></div>'
    + '<scr' + 'ipt>' + JS + '<\\/scr' + 'ipt>'
    + '<scr' + 'ipt>location.hash="#/inicio";<\\/scr' + 'ipt>'
    + '</body></html>';
  var f = document.getElementById('liveFrame');
  f.srcdoc = doc;

  /* Selector de ancho: permite revisar el responsive sin salir del documento. */
  document.querySelectorAll('.spec-vp button').forEach(function(b){
    b.onclick = function(){
      document.querySelectorAll('.spec-vp button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      var w = b.dataset.vp;
      f.style.width = w === '0' ? '100%' : w + 'px';
    };
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'specs/home-spec.html'), out);
console.log('specs/home-spec.html →', (out.length / 1024).toFixed(1), 'KB');
