# BLU Empresas — Prototipo Web

Prototipo de banca empresarial (vanilla JS + CSS, sin build step). SPA con hash routing.

## Design System

**Antes de escribir o modificar cualquier UI, lee [`design-system.json`](design-system.json).**
Es la fuente de verdad: tokens, 31 componentes, helpers JS, iconos, reglas de contenido y accesibilidad.

Reglas no negociables (el detalle está en el JSON):

- Cero dependencias: vanilla JS + CSS. No agregar frameworks ni bundlers.
- Siempre `var(--token)` — nunca hex, px, sombras o duraciones literales.
- Reutilizar clases y helpers existentes antes de crear nuevos.
- Cero emojis como iconos: usar `icon('nombre')` (58 iconos en `js/icons.js`).
- Todo importe lleva `.num` (tabular-nums).
- Todo token nuevo se declara en light **y** dark.
- Textos en español de Ecuador.

## Estructura

| Ruta | Contenido |
|---|---|
| `css/design-system.css` | Tokens + componentes primitivos |
| `css/app.css` | Shell, layouts y componentes de negocio |
| `css/legacy.css` | Skin de la app actual (comparativas "Antes / Después") |
| `js/app.js` | Helpers, shell, router, Home |
| `js/data.js` | DB mock + `money()` |
| `js/icons.js` | Set de iconos SVG |
| `js/screens-*.js` | Pantallas por dominio |
| `design-system.html` | Showcase navegable del DS |

## Convenciones

- **Rutas:** `Screens['mi-ruta'] = () => html`; navegar con `data-nav="ruta"` o `location.hash`.
  Cambiar el hash dispara un re-render **asíncrono** — leer el DOM en el mismo tick devuelve la pantalla anterior.
- **Cache busting:** subir `?v=N` en `index.html` y `design-system.html` en cada commit que toque `css/` o `js/`.
- **Verificación:** revisar en navegador en light, dark y 375px antes de dar un cambio por hecho.
