/* Renderiza specs/historias-usuario.html desde specs/historias-usuario.json.
   Documento navegable con todas las HU del mock en el formato aceptado (WI 11263). */
const fs = require('fs');
const path = require('path');
const ROOT = '/Users/q2025335/Documents/1-canales/blu-empresas/blu-web-prototype';
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'specs/historias-usuario.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const M = data.meta;
let totalHU = 0; data.canales.forEach(c => totalHU += c.hus.length);

const toc = data.canales.map(c =>
  `<li><a href="#${c.id}">${esc(c.id)} · ${esc(c.nombre)}</a> <span class="toc-count">${c.hus.length} HU</span></li>`
).join('');

const canales = data.canales.map(c => `
  <section class="canal" id="${c.id}">
    <div class="canal__head"><span class="canal__id">${esc(c.id)}</span><h2>${esc(c.nombre)}</h2><span class="canal__tag">${esc(c.tag)}</span></div>
    ${c.hus.map(h => `
      <article class="hu">
        <header class="hu__head">
          <div>
            <div class="hu__type">User Story</div>
            <h3 class="hu__title">${esc(h.titulo)}</h3>
          </div>
          <div class="hu__meta">
            <span class="chip chip--sp">${h.storyPoints} SP</span>
            <span class="chip">${esc(h.ruta)}</span>
          </div>
        </header>

        <div class="hu__grid">
          <div class="hu__block hu__block--desc">
            <div class="hu__label">Descripción</div>
            <p><strong>Como</strong> ${esc(h.descripcion.como)},</p>
            <p><strong>Quiero</strong> ${esc(h.descripcion.quiero)}</p>
            <p><strong>Para</strong> ${esc(h.descripcion.para)}.</p>
          </div>

          <div class="hu__block hu__block--ac">
            <div class="hu__label">Criterios de aceptación</div>
            <ol class="ac">
              ${h.criterios.map(cr => `<li>${esc(cr)}</li>`).join('')}
            </ol>
          </div>
        </div>

        <div class="hu__foot">
          <div><span class="hu__k">Definition of Ready</span><span class="hu__v">${esc(h.definitionOfReady)}</span></div>
          <div><span class="hu__k">Definition of Done</span><span class="hu__v">${esc(M.definitionOfDoneGlobal)}</span></div>
          <div><span class="hu__k">Services</span><span class="hu__v">${esc(h.services)}</span></div>
          <div><span class="hu__k">Tags</span><span class="hu__v">${h.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</span></div>
          <div><span class="hu__k">Value Area</span><span class="hu__v">${esc(data.meta.valueArea)}</span></div>
        </div>
      </article>`).join('')}
  </section>`).join('');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(M.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root{
    --navy:#04195D;--navy-2:#031242;--ink:#141414;--slate:#333;--muted:#6b7280;
    --line:#e5e7eb;--line-2:#f0f1f4;--bg:#f6f7f9;--surface:#fff;--surface-2:#f8f9fc;
    --sky:#0B56A4;--sky-bg:#E5F1FF;--green:#096B3A;--green-bg:#E8F5E9;
    --grad:linear-gradient(135deg,#020b27 0%,#04195D 55%,#36477d 120%);
  }
  *{box-sizing:border-box;margin:0}
  body{font-family:'Mulish',system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;font-size:14px}
  .wrap{max-width:1080px;margin:0 auto;padding:36px 22px 90px}
  a{color:var(--sky);text-decoration:none}
  a:hover{text-decoration:underline}
  code{font-family:ui-monospace,Menlo,monospace;font-size:.9em}

  .hero{background:var(--grad);color:#fff;border-radius:20px;padding:38px;position:relative;overflow:hidden;margin-bottom:28px}
  .hero::before{content:"";position:absolute;width:420px;height:420px;border-radius:50%;top:-160px;right:-90px;background:radial-gradient(circle,rgba(46,91,255,.4),transparent 65%)}
  .hero>*{position:relative;z-index:1}
  .hero h1{font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1.15}
  .hero p{color:rgba(255,255,255,.74);margin-top:10px;max-width:70ch;font-size:14.5px}
  .hero .badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
  .hero .badges span{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 14px;font-size:12px;font-weight:600}

  .fmt{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px 24px;margin-bottom:24px}
  .fmt h2{font-size:16px;font-weight:800;margin-bottom:10px}
  .fmt ol{margin:0;padding-left:20px}
  .fmt li{padding:3px 0;color:var(--slate)}
  .fmt .src{margin-top:12px;font-size:12.5px;color:var(--muted)}

  .toc{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px 24px;margin-bottom:30px}
  .toc h2{font-size:15px;font-weight:800;margin-bottom:8px}
  .toc ul{list-style:none;padding:0;margin:0;columns:2;column-gap:28px}
  .toc li{padding:5px 0;font-weight:600;display:flex;justify-content:space-between;gap:10px;break-inside:avoid}
  .toc-count{color:var(--muted);font-weight:600;font-size:12px}

  .canal{margin-top:40px;scroll-margin-top:16px}
  .canal__head{display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:2px solid var(--navy);margin-bottom:18px;flex-wrap:wrap}
  .canal__id{background:var(--navy);color:#fff;font-weight:800;font-size:13px;padding:4px 12px;border-radius:8px}
  .canal__head h2{font-size:22px;font-weight:800;letter-spacing:-.01em}
  .canal__tag{margin-left:auto;font-size:12px;color:var(--muted);background:var(--surface-2);border:1px solid var(--line);padding:4px 12px;border-radius:999px}

  .hu{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px 24px;margin-bottom:16px;box-shadow:0 1px 2px rgba(16,22,51,.05)}
  .hu__head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:14px}
  .hu__type{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--sky)}
  .hu__title{font-size:17px;font-weight:800;letter-spacing:-.01em;margin-top:2px}
  .hu__meta{display:flex;gap:6px;flex-wrap:wrap}
  .chip{font-size:11.5px;font-weight:600;color:var(--slate);background:var(--surface-2);border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-family:ui-monospace,Menlo,monospace}
  .chip--sp{background:var(--navy);color:#fff;border-color:var(--navy);font-family:'Mulish',sans-serif}

  .hu__grid{display:grid;grid-template-columns:1fr 1.6fr;gap:20px}
  .hu__label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px}
  .hu__block--desc{background:var(--surface-2);border:1px solid var(--line-2);border-radius:12px;padding:16px}
  .hu__block--desc p{margin:2px 0}
  .hu__block--desc strong{color:var(--navy)}
  .ac{margin:0;padding-left:18px}
  .ac li{padding:5px 0;color:var(--slate)}

  .hu__foot{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 24px;margin-top:18px;padding-top:16px;border-top:1px solid var(--line-2)}
  .hu__foot>div{display:flex;flex-direction:column;gap:2px}
  .hu__k{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
  .hu__v{font-size:12.5px;color:var(--slate)}
  .tag{display:inline-block;background:var(--sky-bg);color:var(--sky);font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px}

  @media(max-width:760px){
    .hu__grid{grid-template-columns:1fr}
    .hu__foot{grid-template-columns:1fr}
    .toc ul{columns:1}
    .hero{padding:26px}.hero h1{font-size:24px}
  }
  @media print{
    body{background:#fff}
    .hu,.canal{break-inside:avoid}
    .hero::before{display:none}
  }
</style>
</head>
<body>
<div class="wrap">

  <header class="hero">
    <h1>Historias de Usuario — BLU Empresas</h1>
    <p>${esc(M.descripcion)}</p>
    <div class="badges">
      <span>${totalHU} Historias de Usuario</span>
      <span>${data.canales.length} canales</span>
      <span>User Story · Value Area: Business</span>
      <span>v${esc(M.version)} · ${esc(M.updated)}</span>
    </div>
  </header>

  <section class="fmt">
    <h2>Formato aceptado</h2>
    <ol>
      ${M.formatoBasadoEn.estructuraAceptada.map(s => `<li>${esc(s)}</li>`).join('')}
    </ol>
    <div class="src">Basado en el work item de referencia
      <a href="${esc(M.formatoBasadoEn.url)}" target="_blank" rel="noopener noreferrer">#${M.formatoBasadoEn.workItem}</a>
      — «${esc(M.formatoBasadoEn.titulo)}». Prototipo: <a href="${esc(M.prototipo)}" target="_blank" rel="noopener noreferrer">${esc(M.prototipo)}</a></div>
  </section>

  <nav class="toc">
    <h2>Índice por canal</h2>
    <ul>${toc}</ul>
  </nav>

  ${canales}

</div>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'specs/historias-usuario.html'), html);
console.log('specs/historias-usuario.html →', (html.length / 1024).toFixed(1), 'KB ·', totalHU, 'HU');
