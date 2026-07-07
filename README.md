# BLU Empresas · Prototipo web (rediseño UX/UI)

Prototipo de rediseño de la banca digital empresarial de **Diners Club / BLU (Ecuador)**.
App estática (HTML + CSS + JavaScript vanilla, sin build) inspirada en el producto real y en las
mejores prácticas de banca internacional (Revolut, N26, Monzo, BBVA).

## Contenido

- `index.html` — punto de entrada de la app (SPA con hash-routing).
- `css/` — sistema de diseño y estilos (`design-system.css`, `app.css`, `legacy.css`).
- `js/` — lógica y pantallas (core, catálogo, productos, pagos, servicios, empresas, auth, onboarding).
- `presentacion.html` — presentación del rediseño (estudio de mercado, metodología, usabilidad).

## Ver en local

No requiere instalación. Levanta un servidor estático en la carpeta del proyecto:

```bash
# Opción 1 — Python
python3 -m http.server 4599
# luego abre http://localhost:4599

# Opción 2 — Node
npx serve .
```

> Los assets usan `?v=N` para evitar caché del navegador. Al editar CSS/JS, sube el número en `index.html`.

## Publicar con GitHub Pages

1. En GitHub: **Settings → Pages**.
2. En *Build and deployment* → *Source*: elige **Deploy from a branch**.
3. Branch: **main**, carpeta **/ (root)** → **Save**.
4. En 1–2 minutos quedará disponible en:
   `https://david-albuja.github.io/mockup-blu-empresas/`

Para colaborar, invita a otras personas en **Settings → Collaborators**.

## Estado

Rediseñadas: **Login · Home · Productos · Detalle de producto**. Navegación validada (QA sin rutas rotas).
