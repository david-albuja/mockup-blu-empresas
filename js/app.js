/* ============================================================
   BLU Web — App controller (router + UI kit + screens)
   Vanilla ES6, sin dependencias. Preparado para portar a Angular.
   ============================================================ */
'use strict';

/* ---------- Estado global ligero ---------- */
const State = { masked: false, route: 'inicio' };

/* ---------- Utilidades UI ---------- */
const $ = (s, r=document) => r.querySelector(s);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html!=null) n.innerHTML = html; return n; };

function toast({ title, msg, type='success' }) {
  let region = $('.toast-region');
  if (!region) { region = el('div', 'toast-region'); region.setAttribute('aria-live','polite'); document.body.appendChild(region); }
  const ic = type === 'error' ? 'alert' : (type === 'info' ? 'info' : 'checkCircle');
  const t = el('div', `toast toast--${type}`, `${icon(ic)}<div><div class="toast-title">${title}</div>${msg?`<div class="toast-msg">${msg}</div>`:''}</div>`);
  region.appendChild(t);
  setTimeout(() => { t.classList.add('is-out'); setTimeout(()=>t.remove(), 240); }, 3800);
}

function openModal(html, opts={}) {
  const ov = el('div', 'modal-overlay');
  ov.innerHTML = `<div class="modal ${opts.wide?'modal--wide':''}" role="dialog" aria-modal="true">${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov); });
  document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ closeModal(ov); document.removeEventListener('keydown', esc);} });
  document.body.appendChild(ov);
  const f = ov.querySelector('input,button,[tabindex]'); if (f) setTimeout(()=>f.focus(), 60);
  return ov;
}
function closeModal(node) { const ov = node?.closest ? node.closest('.modal-overlay') : node; if(!ov) return; ov.style.animation='fadeIn .18s reverse'; setTimeout(()=>ov.remove(), 160); }

/* Barra de carga superior en cada transición */
function routeProgress() {
  let bar = $('#route-bar');
  if (!bar) { bar = el('div'); bar.id='route-bar'; Object.assign(bar.style, { position:'fixed', top:0, left:0, height:'3px', background:'var(--grad-brand)', zIndex:2000, width:'0%', transition:'width .3s ease, opacity .3s' }); document.body.appendChild(bar); }
  bar.style.opacity='1'; bar.style.width='0%';
  requestAnimationFrame(()=>{ bar.style.width='75%'; });
  setTimeout(()=>{ bar.style.width='100%'; setTimeout(()=>{ bar.style.opacity='0'; }, 220); }, 260);
}

/* ---------- Componentes reutilizables (HTML factories) ---------- */
const UI = {
  bankCard(c, mini=false) {
    const isPrepaid = c.saldo !== undefined;   // prepago: funciona con saldo, no con cupo
    const foot = isPrepaid
      ? `<div><small>Saldo disponible</small><strong class="num">${State.masked?'••••••':money(c.saldo)}</strong></div><div style="text-align:right"><small>Prepago</small><strong>Recargable</strong></div>`
      : `<div><small>Total a pagar</small><strong class="num">${c.pagoTotal>0?(State.masked?'••••••':money(c.pagoTotal)):'Al día'}</strong></div><div style="text-align:right"><small>Pagar hasta</small><strong>${c.pago||'—'}</strong></div>`;
    return `<div class="bank-card ${mini?'bank-card--mini':''} ${c.variant?'bank-card--'+c.variant:''}" tabindex="0" role="group" aria-label="Tarjeta ${c.name} terminación ${c.last4}">
      <div class="row between">
        <div><div class="bank-card__brand">blu</div><div class="bank-card__type">${c.name} · ${c.type}</div></div>
        <div class="bank-card__chip"></div>
      </div>
      <div class="bank-card__number num">${c.number}</div>
      <div class="bank-card__foot">${foot}</div>
    </div>`;
  },
  quickAction(ic, label, route) {
    return `<button class="qa" data-nav="${route||''}" aria-label="${label}"><span class="qa__ic">${icon(ic)}</span><span class="qa__label">${label}</span></button>`;
  },
  txRow(m) {
    const isIn = m.amount > 0;
    return `<div class="tx"><span class="tx__ic">${icon(m.icon)}</span>
      <div class="tx__main"><div class="tx__title">${m.merchant}</div><div class="tx__meta">${m.cat} · ${m.date} · ${m.card}</div></div>
      <div class="tx__amt ${isIn?'is-in':''} num">${money(m.amount, true)}</div></div>`;
  },
  sectionTitle(t, action) { return `<div class="row between mb-4"><h2 class="h3">${t}</h2>${action||''}</div>`; },
  skeletonCard() { return `<div class="card card--pad"><div class="sk sk--title"></div><div class="sk sk--text" style="width:80%"></div><div class="sk sk--card mt-4"></div></div>`; },
};

/* ---------- Estados vacíos / error reutilizables ---------- */
function emptyState(title, msg, ic='search', action) {
  return `<div class="state"><div class="state__art">${icon(ic)}</div><h3>${title}</h3><p>${msg}</p>${action||''}</div>`;
}
function errorState(title='Algo salió mal', msg='No pudimos cargar la información. Intenta nuevamente.', onRetry) {
  return `<div class="state state--error"><div class="state__art">${icon('alert')}</div><h3>${title}</h3><p>${msg}</p><button class="btn btn--secondary mt-4" ${onRetry?`onclick="${onRetry}"`:''}>${icon('clock')} Reintentar</button></div>`;
}

/* Estado de un crédito (al día / mora / legal / judicial) — lógica de negocio Diners */
function creditEstado(estado) {
  const map = {
    'mora':     { label: 'En mora',    cls: 'badge--warning', pagable: true,  consultarDiners: false, pagoLabel: 'Pago inmediato' },
    'legal':    { label: 'En legal',    cls: 'badge--error',   pagable: false, consultarDiners: true,  pagoLabel: 'Pago inmediato' },
    'judicial': { label: 'En judicial', cls: 'badge--error',   pagable: false, consultarDiners: true,  pagoLabel: 'Pago inmediato' },
  };
  return map[estado] || { label: 'Al día', cls: 'badge--success', pagable: true, consultarDiners: false, pagoLabel: '' };
}
/* Volver a la pantalla anterior real (historial); si no hay, cae al fallback. */
function goBack(fallback) {
  const cur = location.hash;
  history.back();
  setTimeout(() => { if (location.hash === cur) location.hash = '#/' + (fallback || 'inicio'); }, 60);
}
/* ---------- Scaffold de sub-pantalla (encabezado + volver) ---------- */
function pageHead(title, sub, back='inicio', actions='') {
  return `<div class="page-head section"><a class="row" style="gap:6px;color:var(--primary);font-weight:600;font-size:13px;margin-bottom:10px;cursor:pointer" onclick="goBack('${back}')">${icon('back')} Volver</a><div class="row between wrap"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>${actions}</div></div>`;
}
/* Encabezado de sección (claro, con eyebrow y acciones) */
function premiumHead(title, sub, back = 'inicio', actions = '', eyebrow = '') {
  return `<div class="page-head section">
    <a class="row" style="gap:6px;color:var(--primary);font-weight:600;font-size:13px;margin-bottom:10px;cursor:pointer" onclick="goBack('${back}')">${icon('back')} Volver</a>
    <div class="row between wrap" style="gap:14px">
      <div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>
      ${actions ? `<div class="row wrap" style="gap:8px">${actions}</div>` : ''}
    </div>
  </div>`;
}
/* Fila de detalle clave/valor */
function kv(k, v, strong) { return `<div class="sum-row"><span class="k">${k}</span><span class="v ${strong?'num':''}">${v}</span></div>`; }
/* Tarjeta contenedora simple */
function panel(title, body, action='') { return `<div class="card card--pad section">${title?`<div class="row between mb-4"><h2 class="h4">${title}</h2>${action}</div>`:''}${body}</div>`; }
/* Info banner */
function infoBanner(text, ic='shield') { return `<div class="card card--pad section" style="background:var(--blu-50);border-color:var(--blu-100)"><div class="row" style="gap:10px;align-items:flex-start">${icon(ic)}<div class="text-slate" style="font-size:13px">${text}</div></div></div>`; }

/* Umbrales: listas grandes no se renderizan en pantalla; se ofrece descarga en Excel */
const DATA_LIMIT = { adicionales: 20, movimientos: 100 };
const xlsxToast = (name) => `toast({title:'Generando Excel…',msg:'${name} se descargará en unos segundos.',type:'info'})`;
function exportChip(name) { return `<button class="chip" onclick="${xlsxToast(name)}">${icon('download')} Exportar Excel</button>`; }
function bulkExport(count, noun, filename) {
  return `<div class="card card--pad section" style="text-align:center">
    <div class="state__art" style="margin:0 auto 12px;background:var(--blu-50);color:var(--primary)">${icon('file')}</div>
    <h3 class="h4">${count.toLocaleString('es-EC')} ${noun}</h3>
    <p class="text-muted mt-2" style="max-width:46ch;margin-left:auto;margin-right:auto">Son demasiados para mostrarlos en pantalla. Descárgalos en Excel para acceder y procesar la información rápidamente.</p>
    <button class="btn btn--primary mt-4" onclick="${xlsxToast(filename)}">${icon('download')} Descargar Excel</button>
  </div>`;
}
/* Slider/rango para simuladores */
function slider(id, min, max, val, step=1) { return `<input type="range" id="${id}" min="${min}" max="${max}" value="${val}" step="${step}" style="width:100%;accent-color:var(--blu-600);height:6px;cursor:pointer">`; }

/* ---------- Tema claro/oscuro ---------- */
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('blu-theme', t); } catch(e){} State.theme = t; }
function toggleTheme() { applyTheme(State.theme === 'dark' ? 'light' : 'dark'); render(); }
(function initTheme(){ let t='light'; try { t = localStorage.getItem('blu-theme') || 'light'; } catch(e){} applyTheme(t); })();

/* "Antes": las pantallas #/antes-* son réplicas fieles de la app actual (repo Azure).
   Se navega a ellas con el botón "Ver app actual" del topbar (sin re-skin de tokens). */
document.documentElement.removeAttribute('data-skin');

/* ---------- Carrusel paginado (2 por vista, flechas + dots) ---------- */
function carouselHTML(items, label='Carrusel') {
  return `<div class="carousel" data-carousel role="group" aria-roledescription="carrusel" aria-label="${label}">
    <button class="carousel__nav carousel__nav--prev" aria-label="Anterior" data-prev>${icon('back')}</button>
    <div class="carousel__viewport"><div class="carousel__track">${items.map(h=>`<div class="carousel__item">${h}</div>`).join('')}</div></div>
    <button class="carousel__nav carousel__nav--next" aria-label="Siguiente" data-next>${icon('chevron')}</button>
    <div class="carousel__dots" data-dots></div>
  </div>`;
}
function initCarousel(root) {
  if (!root) return;
  const track = root.querySelector('.carousel__track');
  const viewport = root.querySelector('.carousel__viewport');
  const items = [...track.children];
  const dotsWrap = root.querySelector('[data-dots]');
  const prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
  const gap = 16; let page = 0;
  const perView = () => (viewport.clientWidth > 520 ? Math.min(2, items.length) : 1);
  const pages = () => Math.max(1, Math.ceil(items.length / perView()));
  function renderDots() {
    dotsWrap.innerHTML = Array.from({length: pages()}, (_,i)=>`<button class="${i===page?'is-active':''}" aria-label="Ir a página ${i+1}"${i===page?' aria-current="true"':''}></button>`).join('');
    [...dotsWrap.children].forEach((d,i)=> d.onclick=()=>go(i));
  }
  function go(p) {
    page = Math.max(0, Math.min(p, pages()-1));
    track.style.transform = `translateX(-${page * (viewport.clientWidth + gap)}px)`;
    prev.disabled = page === 0; next.disabled = page >= pages()-1;
    renderDots();
  }
  prev.onclick = () => go(page-1); next.onclick = () => go(page+1);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => go(Math.min(page, pages()-1)), 150); });
  requestAnimationFrame(() => go(0));
}

/* ---------- Skeleton helper (muestra loading → contenido) ---------- */
function withSkeleton(view, skeletonHTML, buildFn, delay=650) {
  view.innerHTML = skeletonHTML;
  setTimeout(() => { view.innerHTML = ''; buildFn(view); }, delay);
}

/* ============================================================
   PANTALLAS
   ============================================================ */
const Screens = {};

/* ---------- LOGIN ---------- */
Screens.login = {
  title: 'Ingreso',
  full: true,
  render(view) {
    view.innerHTML = `
    <div class="auth">
      <aside class="auth__aside premium">
        <div class="brand" style="padding:0"><div class="brand__mark">b</div><div class="brand__name" style="color:#fff">blu</div></div>
        <div>
          <span class="badge badge--glass mb-4">${icon('building')} Banca Empresas</span>
          <h1 class="auth__pitch">Banca empresarial<br>simple, segura y a tu medida.</h1>
          <p class="on-navy-dim" style="max-width:440px;margin-top:14px">Controla la liquidez, pagos y cobros de tu empresa con el respaldo de Diners Club.</p>
          <div class="auth__feats" style="margin-top:28px">
            <div class="premium-feat"><span class="ic">${icon('chart')}</span> Posición consolidada y flujo de caja en tiempo real</div>
            <div class="premium-feat"><span class="ic">${icon('approve')}</span> Aprobaciones y pagos masivos con doble firma</div>
            <div class="premium-feat"><span class="ic">${icon('shield')}</span> Token dinámico y control de accesos por rol</div>
          </div>
        </div>
        <div class="on-navy-dim" style="font-size:12px">© 2026 Diners Club del Ecuador · Banco Diners Club</div>
      </aside>
      <section class="auth__panel">
        <form class="auth__form" id="loginForm" novalidate>
          <div class="brand" style="padding-left:0"><div class="brand__mark">b</div><div class="brand__name">blu</div><span class="badge badge--info" style="margin-left:auto">Empresas</span></div>
          <h2 class="h2 mt-4">Bienvenido de nuevo</h2>
          <p class="text-muted mb-6">Ingresa a tu banca empresarial.</p>

          <div class="field" id="fUser">
            <label for="user">Usuario / RUC <span class="req">*</span></label>
            <div class="control">${icon('user')}<input id="user" type="text" autocomplete="username" placeholder="Usuario o RUC" value="empresa.robles"></div>
            <span class="error-text">${icon('alert')} Ingresa tu usuario.</span>
          </div>

          <div class="field" id="fPass">
            <label for="pass">Contraseña <span class="req">*</span></label>
            <div class="control">${icon('lock')}<input id="pass" type="password" autocomplete="current-password" placeholder="••••••••" value="demo1234">
              <button type="button" class="eye-toggle" id="tgPass" aria-label="Mostrar contraseña">${icon('eye')}</button></div>
            <span class="error-text">${icon('alert')} Ingresa tu contraseña.</span>
          </div>

          <div class="row" style="justify-content:flex-end;margin-bottom:var(--s-6)">
            <a href="#/recuperar" style="font-size:13px;font-weight:600;color:var(--primary)">¿Olvidaste tu usuario o clave?</a>
          </div>

          <button class="btn btn--primary btn--lg btn--block" type="submit" id="loginBtn">Ingresar</button>
          <p class="text-muted mt-6" style="text-align:center;font-size:13px">¿No cuentas con tu usuario para ingresar? <a href="#/crear-usuario" style="color:var(--primary);font-weight:600">Crea tu usuario aquí</a></p>
        </form>
      </section>
    </div>`;

    $('#tgPass').onclick = (e) => { const i=$('#pass'); const show=i.type==='password'; i.type=show?'text':'password'; e.currentTarget.innerHTML=icon(show?'eyeOff':'eye'); e.currentTarget.setAttribute('aria-label', show?'Ocultar contraseña':'Mostrar contraseña'); };
    $('#loginForm').onsubmit = (e) => {
      e.preventDefault();
      let ok = true;
      const u=$('#user'), p=$('#pass');
      $('#fUser').classList.toggle('has-error', !u.value.trim()); if(!u.value.trim()) ok=false;
      $('#fPass').classList.toggle('has-error', !p.value.trim()); if(!p.value.trim()) ok=false;
      if(!ok){ u.value.trim()||u.focus()||p.focus(); return; }
      const btn=$('#loginBtn'); btn.classList.add('is-loading');
      setTimeout(()=>{ btn.classList.remove('is-loading'); loginSoftToken(); }, 800);
    };
  }
};

/* Cara de la tarjeta en el Home: últimos 4 dígitos, total a pagar y cupo disponible
   (global, el mismo valor en todas las tarjetas — el cupo nunca es por tarjeta).
   "Pagar hasta X" NO va sobre la imagen; se muestra debajo, en el cuerpo. */
function homeCardFace(c) {
  // Datos propios de cada tarjeta (no el cupo global compartido)
  const totalTxt = c.pagoTotal > 0 ? (State.masked ? '••••••' : money(c.pagoTotal)) : 'Al día';
  const consumidoTxt = State.masked ? '••••••' : money(c.deudaTotal || 0);
  const kind = c.kind || (c.principal === false ? 'Adicional' : 'Principal');
  return `<div class="bank-card ${c.variant?'bank-card--'+c.variant:''}" tabindex="0" role="group" aria-label="Tarjeta ${c.name} ${kind} terminación ${c.last4}">
    <div class="row between">
      <div><div class="bank-card__brand">blu</div><div class="bank-card__type">${c.name} · ${c.type}</div><span class="bank-card__kind">${kind}</span></div>
      <div class="bank-card__chip"></div>
    </div>
    <div class="bank-card__number num">•••• ${c.last4}</div>
    <div class="bank-card__foot">
      <div><small>Saldo consumido</small><strong class="num">${consumidoTxt}</strong></div>
      <div style="text-align:right"><small>Total a pagar</small><strong class="num">${totalTxt}</strong></div>
    </div>
  </div>`;
}
function homeTarjetaCard(c) {
  const badge = c.pagoTotal > 0
    ? `<span class="badge badge--warning"><span class="dot"></span>Por pagar</span>`
    : `<span class="badge badge--success">Al día</span>`;
  return `<button class="prod-xl" data-nav="detalle-producto?id=${c.id}" aria-label="Abrir ${c.name}">
    <div class="prod-xl__media">${homeCardFace(c)}</div>
    <div class="prod-xl__body">
      <div class="row between" style="gap:8px;align-items:center">
        <span class="prod-xl__sub" style="margin:0">${c.pagoTotal>0?`Pagar hasta ${c.pago}`:''}</span>
        ${badge}
      </div>
    </div>
  </button>`;
}
/* Cuentas, créditos e inversiones en el Home: cards homologadas (mismo shell prod-xl
   que las tarjetas), en carrusel con scroll horizontal. */
/* Cuenta en el Home: card limpia (sin cover/fondo de color), contenido centrado,
   con el saldo y un pill de interés del mes destacado. */
function homeAcctRow(a) {
  const cancelada = a.estado === 'cancelada';
  return `<button class="prod-xl acct-card-plain" data-nav="detalle-producto?id=${a.id}" aria-label="Abrir ${a.name}">
    <div class="prod-xl__body">
      <span class="prod__ic prod__ic--acct" style="margin:0 auto 8px">${icon('wallet')}</span>
      <div class="prod-xl__name">${a.name}</div>
      <div class="prod-xl__id num">${a.type} · ${a.num}${cancelada?' · Cancelada':''}</div>
      <div class="prod-xl__amt num" style="font-size:22px;margin-top:10px">${State.masked?'$ ••••••':money(a.saldo)}</div>
      <div class="prod-xl__sub">${cancelada?'Saldo por retirar · cuenta cerrada':'Saldo disponible'}</div>
      ${cancelada
        ? `<div class="acct-interes acct-interes--warn">${icon('alert')} Retira tu saldo</div>`
        : (a.interesMes ? `<div class="acct-interes">${icon('arrowUp')} <strong class="num">${money(a.interesMes, true)}</strong> este mes</div>` : '')}
    </div>
  </button>`;
}
function homeCreditRow(c) {
  const e = creditEstado(c.estado);
  const sub = e.consultarDiners ? 'Consulta el total con Diners' : (c.estado==='mora' ? 'Pago inmediato' : `Vence ${c.prox}`);
  const pillCls = e.cls === 'badge--success' ? '' : e.cls === 'badge--warning' ? 'acct-interes--warn' : 'acct-interes--danger';
  const pillIcon = e.cls === 'badge--success' ? 'check' : 'alert';
  return `<button class="prod-xl acct-card-plain" data-nav="detalle-producto?id=${c.id}" aria-label="Abrir ${c.name}">
    <div class="prod-xl__body">
      <span class="prod__ic prod__ic--credit" style="margin:0 auto 8px">${icon('coins')}</span>
      <div class="prod-xl__name">${c.name}</div>
      <div class="prod-xl__id num">${c.num}</div>
      <div class="prod-xl__amt num" style="font-size:22px;margin-top:10px">${e.consultarDiners ? 'Consultar' : money(c.saldo)}</div>
      <div class="prod-xl__sub">${sub}</div>
      <div class="acct-interes ${pillCls}">${icon(pillIcon)} ${e.label}</div>
    </div>
  </button>`;
}
function homeInvestRow(iv) {
  return `<button class="prod-xl acct-card-plain" data-nav="detalle-producto?id=${iv.id}" aria-label="Abrir ${iv.name}">
    <div class="prod-xl__body">
      <span class="prod__ic prod__ic--invest" style="margin:0 auto 8px">${icon('chart')}</span>
      <div class="prod-xl__name">${iv.tipo || iv.name}</div>
      <div class="prod-xl__id num">···${iv.last4} · ${iv.tasa}</div>
      <div class="prod-xl__amt num" style="font-size:22px;margin-top:10px">${State.masked?'$ ••••••':money(iv.monto)}</div>
      <div class="prod-xl__sub">${iv.vence === 'Sin plazo fijo' ? 'Sin plazo fijo' : `Fecha de finalización: ${iv.vence}`}</div>
      <div class="acct-interes">${icon('arrowUp')} <strong class="num">${State.masked?'••••':money(iv.interesMes||0,true)}</strong> este mes</div>
    </div>
  </button>`;
}

/* ---------- INICIO / DASHBOARD ---------- */
Screens.inicio = {
  title: 'Inicio',
  render(view) {
    const sk = `<div class="grid" style="gap:20px">${UI.skeletonCard()}${UI.skeletonCard()}</div>`;
    withSkeleton(view, sk, build);

    function build(v) {
      const N = DB.net;
      const p = moneyParts(N.activo);

      // Cada sección de producto solo aparece si el usuario realmente tiene ese producto.
      const prodData = { tarjeta: DB.cards, prepago: DB.prepaid, cuenta: DB.accounts, credito: DB.credits, inversion: DB.investments };
      const prodTabsAll = [['tarjeta','Tarjetas'],['cuenta','Cuentas'],['credito','Créditos'],['inversion','Inversiones']];
      const prodTabs = prodTabsAll.filter(t => (prodData[t[0]]||[]).length > 0);
      const VR = DB.ventasResumen;
      const bigMoney = (n) => { const m = moneyParts(n); return `${m.int}<span class="cents">,${m.dec}</span>`; };

      v.innerHTML = `
      <div class="page-head section">
        <div class="row between wrap" style="gap:12px">
          <div>
            <div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">
              <h1 style="line-height:1.1">${DB.empresa.name}</h1>
              <button class="chip" onclick="toast({title:'Cambiar empresa',msg:'${DB.empresa.name} · ${DB.empresa.otras.join(' · ')}',type:'info'})" aria-label="Cambiar de empresa">${icon('building')} Cambiar ${icon('chevronDown')}</button>
            </div>
            <p class="text-muted" style="margin-top:4px">Hola, ${DB.user.first}</p>
          </div>
          <div class="row wrap" style="gap:8px;align-items:center">
            <button class="icon-btn tip" data-nav="transferencias" data-tip="Transferir" aria-label="Transferir">${icon('send')}</button>
            <button class="icon-btn tip" data-nav="carga-archivo" data-tip="Pago masivo" aria-label="Pago masivo">${icon('upload')}</button>
            <button class="icon-btn tip" data-nav="aprobaciones" data-tip="Aprobaciones" aria-label="Aprobaciones" style="position:relative">${icon('approve')}<span class="badge badge--error" style="position:absolute;top:-3px;right:-3px;padding:1px 6px;font-size:10px">3</span></button>
            <button class="btn btn--secondary btn--sm" data-nav="recompensas">${icon('gift')} 48.250 ClubMiles</button>
          </div>
        </div>
      </div>

      <!-- Tus ventas (adquirencia): encabeza el Home en lugar de la posición consolidada -->
      <div class="section mb-6">
        <div class="row between wrap mb-4" style="gap:10px">
          <h2 class="h3">Tus ventas</h2>
          <a class="row" data-nav="caja" style="gap:6px;font-size:13px;font-weight:600;color:var(--primary);cursor:pointer">Mira el detalle ${icon('chevron')}</a>
        </div>
        <div class="sales-summary">
          <button class="sales-card sales-card--hl" data-nav="caja">
            <div class="row between" style="align-items:flex-start">
              <div class="sales-card__label">Ventas del mes</div>
              <span class="sales-card__grow">${icon('arrowUp')} +${String(VR.crecimiento).replace('.',',')}%</span>
            </div>
            <div class="sales-card__amt num">${bigMoney(VR.ventasMes)}</div>
            <div class="sales-card__cap">Periodo ${VR.periodo} · vs. mes anterior</div>
          </button>
          <button class="sales-card" data-nav="caja">
            <div class="sales-card__label">Pagos recibidos</div>
            <div class="sales-card__amt num">${bigMoney(VR.pagosRecibidos)}</div>
            <div class="sales-card__cap">Periodo ${VR.periodo}</div>
          </button>
          <button class="sales-card" data-nav="caja">
            <div class="sales-card__label">Total por cobrar</div>
            <div class="sales-card__amt num">${bigMoney(VR.porCobrar)}</div>
            <div class="sales-card__cap">${VR.fechaCobro}</div>
          </button>
        </div>
      </div>

      <!-- Tus productos con nosotros: solo se listan las categorías que el usuario tiene -->
      <div class="section mb-6">
        <div class="row between wrap mb-4" style="gap:10px">
          <h2 class="h3">Tus Productos</h2>
        </div>
        <div class="card card--pad">
          <div class="mb-4"><div class="scroll-x" style="max-width:100%;padding-bottom:0"><div class="prod-tabs prod-tabs--inline" id="prodTabs" role="tablist">
            ${prodTabs.map((t,i)=>`<button class="${i===0?'is-active':''}" data-c="${t[0]}" role="tab" aria-selected="${i===0?'true':'false'}">${t[1]}</button>`).join('')}
          </div></div></div>
          <div id="prodXlHost"></div>
          <div id="prodXlExtra" class="mt-4"></div>
        </div>
      </div>`;

      // "Ver todo" consistente: cada categoría lleva a ver todos los productos de ESA categoría
      const seeAllNav = { tarjeta:'tarjetas', prepago:'tarjetas', cuenta:'cuentas?cat=cuenta', credito:'cuentas?cat=credito', inversion:'cuentas?cat=inversion', caja:'caja' };
      const solicitarRoute = { tarjeta:'onboarding-signature', prepago:'ofertas', cuenta:'onboarding-blu-plus', credito:'sim-credito', inversion:'ofertas' };
      const solicitarLabel = { tarjeta:'Solicitar tarjeta adicional', prepago:'Solicitar prepago', cuenta:'Abrir cuenta', credito:'Solicitar crédito', inversion:'Invertir ahora' };
      // Un botón "Solicitar" por producto (no genérico) + "Ver todo" junto al total monetario
      function ctaRow(kind) {
        return `<div class="row wrap mt-4" style="gap:8px">
          <button class="btn btn--secondary btn--sm" data-nav="${solicitarRoute[kind]}">${icon('plus')} ${solicitarLabel[kind]}</button>
          <button class="btn btn--ghost btn--sm" data-nav="${seeAllNav[kind]}">Ver todo ${icon('chevron')}</button>
        </div>`;
      }

      const prodExtra = (kind) => {
        if (kind === 'tarjeta') return `<div class="card card--pad section"><div class="text-muted" style="font-size:13px">Tus tarjetas con nosotros</div><div class="text-muted" style="font-size:12px;margin-top:8px">Cupo disponible</div><div class="kpi__value num" style="font-size:22px">${State.masked?'••••':money(N.cupoGlobalDisp)}</div><div class="text-muted" style="font-size:12px">de ${money(N.cupoGlobal)} de cupo total · compartido entre todas tus tarjetas</div>${ctaRow('tarjeta')}</div>`;
        if (kind === 'cuenta') { const t=DB.accounts.filter(a=>a.estado!=='cancelada').reduce((s,a)=>s+a.saldo,0); return `<div class="card card--pad section"><div class="text-muted" style="font-size:13px">Tu saldo total en cuentas con nosotros</div><div class="kpi__value num" style="font-size:22px;margin-top:4px">${State.masked?'••••':money(t)}</div>${ctaRow('cuenta')}</div>`; }
        if (kind === 'credito') { const t=DB.credits.reduce((s,c)=>s+c.saldo,0); return `<div class="card card--pad section"><div class="text-muted" style="font-size:13px">Total de tus créditos con nosotros</div><div class="kpi__value num" style="font-size:22px;margin-top:4px">${money(t)}</div>${ctaRow('credito')}</div>`; }
        if (kind === 'inversion') { const t=DB.investments.reduce((s,i)=>s+i.monto,0); return `<div class="card card--pad section"><div class="text-muted" style="font-size:13px">Total de tus inversiones</div><div class="kpi__value num" style="font-size:22px;margin-top:4px">${State.masked?'••••':money(t)}</div>${ctaRow('inversion')}</div>`; }
        return '';
      };

      // Todos los productos homologados como cards prod-xl, en carrusel con scroll horizontal.
      const cardBuilder = { tarjeta: homeTarjetaCard, cuenta: homeAcctRow, credito: homeCreditRow, inversion: homeInvestRow };
      function renderProducts(kind) {
        $('#prodXlHost').innerHTML = `<div class="prod-strip">${(prodData[kind]||[]).map(cardBuilder[kind]).join('')}</div>`;
        $('#prodXlExtra').innerHTML = prodExtra(kind);
      }
      view.querySelectorAll('#prodTabs [data-c]').forEach(b => b.onclick = () => {
        view.querySelectorAll('#prodTabs [data-c]').forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected','false'); });
        b.classList.add('is-active'); b.setAttribute('aria-selected','true'); renderProducts(b.dataset.c);
      });
      renderProducts(prodTabs[0][0]);
    }
  }
};

/* Donut chart (SVG puro) */
function drawDonut(host, data, centerLabel='Total mes') {
  if(!host) return;
  const size=160, r=58, c=2*Math.PI*r, cx=size/2;
  let off=0;
  const segs = data.map(d=>{ const len=c*d.pct/100; const s=`<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${d.color}" stroke-width="18" stroke-dasharray="${len} ${c-len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cx})" stroke-linecap="butt"><title>${d.cat}: ${d.pct}%</title></circle>`; off+=len; return s; }).join('');
  const total = data.reduce((a,b)=>a+b.val,0);
  host.innerHTML = `<div style="display:flex;justify-content:center"><svg viewBox="0 0 ${size} ${size}" width="180" height="180" role="img" aria-label="Distribución de gastos del mes">
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--bg-2)" stroke-width="18"/>${segs}
    <text x="${cx}" y="${cx-4}" text-anchor="middle" font-size="11" fill="var(--muted)">${centerLabel}</text>
    <text x="${cx}" y="${cx+16}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink)">${money(-total).replace('-','')}</text>
  </svg></div>`;
}

function toggleMask() { State.masked = !State.masked; render(); }

/* ---------- TARJETAS DE CRÉDITO ---------- */
/* ---- Componentes corporativos de producto ---- */
const TINT = {
  card:     ['var(--blu-50)', 'var(--blu-600)'],
  navy:     ['rgba(42,63,110,.12)', '#2E4A82'],
  graphite: ['rgba(84,91,108,.15)', '#4A5262'],
  indigo:   ['rgba(70,63,156,.14)', '#453FA0'],
};
function statTile(ic, tint, label, value) {
  const [bg, fg] = TINT[tint] || TINT.card;
  return `<div class="stat-tile"><span class="st-ic" style="background:${bg};color:${fg}">${icon(ic)}</span><div class="st-l">${label}</div><div class="st-v num">${value}</div></div>`;
}
const CARD_GRAD = {
  diners: 'linear-gradient(135deg, #0A277E 0%, #124CFD 55%, #32C5FF 130%)',
  black:  'linear-gradient(135deg, #141519 0%, #2a2b33 58%, #4a4c58 130%)',
  indigo: 'linear-gradient(135deg, #0A1F6B 0%, #2C55F5 60%, #4C71FC 130%)',
  teal:   'linear-gradient(135deg, #063C57 0%, #1B7BA6 55%, #32C5FF 130%)',
};
function miniCardArt(c) {
  return `<div class="pcard__art" style="background:${CARD_GRAD[c.variant] || CARD_GRAD.diners}"><span class="mini-chip"></span><span class="mini-brand">blu</span></div>`;
}
const ACCT_GRAD = {
  account:    'linear-gradient(135deg, #14213F 0%, #26365E 55%, #3A4F80 120%)',
  credit:     'linear-gradient(135deg, #24272F 0%, #3A3F4C 55%, #545B6C 120%)',
  investment: 'linear-gradient(135deg, #1E1B48 0%, #322C82 55%, #463F9C 120%)',
};
function acctRow(item, kind) {
  let cfg;
  if (kind === 'account') {
    const cancelada = item.estado === 'cancelada';
    cfg = { ic:'wallet', name:item.name, sub:`${item.type} · ${item.num}${cancelada?' · Cancelada':''}`, amt:money(item.saldo), lbl:cancelada?'Saldo por retirar':'Saldo disponible', mask:true };
  } else if (kind === 'credit') {
    const e = creditEstado(item.estado);
    cfg = { ic:'coins', name:item.name, sub:`Crédito · ${item.num}`, amt:e.consultarDiners?'Consultar':money(item.saldo), lbl:e.consultarDiners?'Consulta con Diners':'Saldo pendiente', mask:false, pill:e };
  } else {
    cfg = { ic:'chart', name:item.name, sub:`Inversión · tasa ${item.tasa}`, amt:money(item.monto), lbl:'Invertido', mask:true };
  }
  return `<div class="pcard-row">
    <div class="pcard-row__art" style="background:${ACCT_GRAD[kind]}">${icon(cfg.ic)}</div>
    <div class="pcard-row__body">
      <div class="pcard-row__name" data-nav="detalle-producto?id=${item.id}">${cfg.name}</div>
      <div class="pcard-row__num">${cfg.sub}</div>
      ${cfg.pill ? `<div class="pcard-row__pill"><span class="badge ${cfg.pill.cls}">${cfg.pill.label}</span></div>` : ''}
    </div>
    <div class="pcard-row__value">
      <div class="pcard-row__lbl">${cfg.lbl}</div>
      <div class="pcard-row__amt num">${(cfg.mask && State.masked) ? '••••' : cfg.amt}</div>
    </div>
    <button class="btn btn--primary btn--sm" data-nav="detalle-producto?id=${item.id}">Ver detalles</button>
  </div>`;
}
/* Fila de lista (sección Tarjetas de crédito): logo + nombre + estado, saldo a la derecha + CTA */
function tarjetaListRow(c) {
  const alDia = c.pagoTotal <= 0;
  return `<div class="pcard-row">
    ${miniCardArt(c)}
    <div class="pcard-row__body">
      <div class="pcard-row__name" data-nav="detalle-producto?id=${c.id}">${c.name}</div>
      <div class="pcard-row__num">···${c.last4}${c.titular?` · ${c.titular}`:''}</div>
      ${alDia
        ? `<div class="pcard-row__pill"><span class="badge badge--success">Tarjeta al día</span><span class="tip" data-tip="Sin saldo pendiente de pago" tabindex="0" aria-label="Sin saldo pendiente de pago">${icon('info')}</span></div>`
        : `<div class="pcard-row__num" style="margin-top:2px">Pagar hasta ${c.pago}</div>`}
    </div>
    <div class="pcard-row__value">
      <div class="pcard-row__lbl">${alDia ? 'Estado' : 'Saldo a pagar'}</div>
      <div class="pcard-row__amt num ${alDia ? 'is-success' : ''}">${alDia ? 'Al día' : (State.masked ? '••••' : money(c.pagoTotal))}</div>
    </div>
    <button class="btn btn--primary btn--sm" data-nav="detalle-producto?id=${c.id}">Ver detalles</button>
  </div>`;
}
function prepagoListRow(c) {
  return `<div class="pcard-row">
    ${miniCardArt(c)}
    <div class="pcard-row__body">
      <div class="pcard-row__name" data-nav="detalle-producto?id=${c.id}">${c.name}</div>
      <div class="pcard-row__num">${c.type} · ···${c.last4}${c.titular?` · ${c.titular}`:''}</div>
    </div>
    <div class="pcard-row__value">
      <div class="pcard-row__lbl">Saldo disponible</div>
      <div class="pcard-row__amt num">${State.masked ? '••••' : money(c.saldo)}</div>
    </div>
    <button class="btn btn--primary btn--sm" data-nav="detalle-producto?id=${c.id}">Ver detalles</button>
  </div>`;
}
function addProductCard(route, label) {
  return `<button class="pcard" data-nav="${route}" style="border-style:dashed;background:transparent;color:var(--primary);font-weight:600;justify-content:center;min-height:80px">${icon('plus')} ${label}</button>`;
}

Screens.tarjetas = {
  title: 'Tarjetas de crédito',
  render(view) {
    const N = DB.net;
    const principales = DB.cards.filter(c => c.principal !== false);
    const adicionales = DB.cards.filter(c => c.principal === false);
    const deuda = DB.cards.reduce((s,c)=>s+c.pagoTotal,0);
    view.innerHTML = `
    ${premiumHead('Mira tus tarjetas', `${DB.cards.length} tarjetas · el cupo es global y compartido`, 'inicio', '', 'Productos')}
    <div class="stat-tiles section mb-6">
      ${statTile('card', 'card', 'Cupo global', State.masked?'••••':money(N.cupoGlobal))}
      ${statTile('wallet', 'navy', 'Cupo disponible', State.masked?'••••':money(N.cupoGlobalDisp))}
      ${statTile('coins', 'graphite', 'Deuda en tarjetas', State.masked?'••••':money(deuda))}
    </div>
    <div class="segmented section mb-4" id="tcTabs" role="tablist">
      <button class="is-active" data-t="principales" role="tab" aria-selected="true">Tus tarjetas</button>
      <button data-t="adicionales" role="tab" aria-selected="false">Tus adicionales</button>
      <button data-t="prepago" role="tab" aria-selected="false">Prepago</button>
    </div>
    <div id="tcBody"></div>`;

    // Navegación por badges: el contenido cambia según la categoría seleccionada
    function renderTcTab(t) {
      const body = $('#tcBody');
      if (t === 'principales') {
        body.innerHTML = `<div class="pcard-list section mb-6">${principales.map(tarjetaListRow).join('')}</div>`;
      } else if (t === 'adicionales') {
        body.innerHTML = `
        <div class="row between wrap mb-4" style="gap:10px"><button class="btn btn--primary btn--sm" data-nav="onboarding-signature">${icon('plus')} Solicitar tarjeta adicional</button>${adicionales.length > DATA_LIMIT.adicionales ? '' : exportChip('tarjetas-adicionales.xlsx')}</div>
        ${adicionales.length > DATA_LIMIT.adicionales
          ? bulkExport(adicionales.length, 'tarjetas adicionales', 'tarjetas-adicionales.xlsx')
          : `<div class="pcard-list section mb-6">${adicionales.map(tarjetaListRow).join('')}${addProductCard('tarjetas-adicionales', 'Administrar adicionales')}</div>`}`;
      } else {
        body.innerHTML = `
        <div class="row between wrap mb-4" style="gap:10px"><button class="btn btn--primary btn--sm" data-nav="solicitar-prepago">${icon('plus')} Solicitar prepago</button></div>
        <div class="pcard-list section mb-6">${DB.prepaid.map(prepagoListRow).join('')}</div>`;
      }
    }
    view.querySelectorAll('#tcTabs [data-t]').forEach(b => b.onclick = () => {
      view.querySelectorAll('#tcTabs [data-t]').forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected','false'); });
      b.classList.add('is-active'); b.setAttribute('aria-selected','true'); renderTcTab(b.dataset.t);
    });
    renderTcTab('principales');
  }
};

/* ---------- PREPAGO (pantalla propia, accesible desde el menú Productos) ---------- */
Screens.prepago = {
  title: 'Prepago',
  render(view) {
    const PREP_RECENT = 6;
    const total = DB.prepaid.reduce((s,c)=>s+c.saldo,0);
    view.innerHTML = `
    ${premiumHead('Tarjetas prepago', `${DB.prepaid.length} tarjetas · saldo total ${State.masked?'••••':money(total)}`, 'inicio',
      `<button class="btn btn--primary btn--sm" data-nav="ofertas">${icon('plus')} Solicitar prepago</button>`, 'Productos')}
    <div class="card card--pad section">
      <p class="text-muted mb-4" style="font-size:13px">Busca la tarjeta prepago de tu colaborador por nombre y apellido, o por los últimos 4 dígitos.</p>
      <div class="grid grid-2" style="gap:10px">
        <div class="control">${icon('user')}<input id="prepName" placeholder="Nombre y apellido" autocomplete="off"></div>
        <div class="control">${icon('card')}<input id="prepLast4" placeholder="Últimos 4 dígitos" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      <div class="mt-6 mb-2"><span class="text-muted" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em" id="prepLbl">Tarjetas recientes</span></div>
      <div id="prepResults"></div>
    </div>`;

    function search() {
      const nameQ = ($('#prepName')?.value || '').trim().toLowerCase();
      const l4Q = ($('#prepLast4')?.value || '').trim();
      const resEl = $('#prepResults'), lbl = $('#prepLbl'); if (!resEl) return;
      const searching = !!(nameQ || l4Q);
      if (lbl) lbl.textContent = searching ? 'Resultados' : 'Tarjetas recientes';
      if (!searching) { resEl.innerHTML = `<div class="pcard-list">${DB.prepaid.slice(0, PREP_RECENT).map(prepagoListRow).join('')}</div>`; return; }
      const matches = DB.prepaid.filter(c => (!nameQ || (c.titular||'').toLowerCase().includes(nameQ)) && (!l4Q || c.last4.includes(l4Q)));
      resEl.innerHTML = matches.length ? `<div class="pcard-list">${matches.map(prepagoListRow).join('')}</div>` : emptyState('Sin resultados', 'No encontramos una tarjeta con esos datos.', 'search');
    }
    search();
    $('#prepName').oninput = search;
    $('#prepLast4').oninput = () => { const i=$('#prepLast4'); i.value=i.value.replace(/\D/g,'').slice(0,4); search(); };
  }
};

/* ---------- SOLICITAR PREPAGO (mismos campos que una tarjeta adicional) ---------- */
Screens['solicitar-prepago'] = {
  title: 'Solicitar prepago',
  render(view) {
    view.innerHTML = `
    ${premiumHead('Solicita una tarjeta prepago', 'Asígnala a un colaborador con un saldo de recarga inicial.', 'prepago', '', 'Productos')}
    <div class="grid" style="grid-template-columns:1fr 340px;gap:20px;align-items:start">
      <div class="card card--pad section">
        <h2 class="h4 mb-4">Datos del colaborador</h2>
        <div class="field" id="spNombreF"><label>Nombre completo <span class="req">*</span></label><div class="control">${icon('user')}<input id="spNombre" placeholder="Nombre y apellidos"></div><span class="error-text">${icon('alert')} Ingresa el nombre completo.</span></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field" id="spCedF"><label>Cédula <span class="req">*</span></label><div class="control">${icon('file')}<input id="spCedula" inputmode="numeric" placeholder="0102030405"></div><span class="error-text">${icon('alert')} Ingresa la cédula.</span></div>
          <div class="field"><label>Celular <span class="req">*</span></label><div class="control">${icon('phone')}<input id="spCelular" inputmode="numeric" placeholder="099 000 0000"></div></div>
        </div>
        <div class="field"><label>Correo electrónico <span class="req">*</span></label><div class="control">${icon('receipt')}<input id="spCorreo" type="email" placeholder="correo@empresa.com"></div></div>
        <div class="divider"></div>
        <div class="field"><label>Saldo de recarga inicial</label><div class="control">${icon('coins')}<span class="prefix">$</span><input id="spMonto" inputmode="decimal" placeholder="0,00" value="500"></div><span class="hint">Puedes recargar más saldo en cualquier momento.</span></div>
        <button class="btn btn--primary btn--lg btn--block mt-4" id="spBtn">${icon('card')} Solicitar prepago</button>
      </div>
      <aside style="position:sticky;top:calc(var(--topbar-h) + 24px)">
        ${infoBanner('La tarjeta prepago funciona con saldo cargado, no consume cupo de crédito.','card')}
      </aside>
    </div>`;
    $('#spBtn').onclick = () => {
      const n=$('#spNombre'), c=$('#spCedula');
      let ok=true;
      if(!n.value.trim()){ $('#spNombreF').classList.add('has-error'); ok=false; }
      if(!c.value.trim()){ $('#spCedF').classList.add('has-error'); ok=false; }
      if(!ok) return;
      $('#spBtn').classList.add('is-loading');
      setTimeout(()=>{ successModal('Prepago solicitada', `La tarjeta prepago para ${n.value.trim()} quedó en proceso. Te avisaremos cuando esté lista.`, 'prepago'); }, 1000);
    };
    ['spNombre','spCedula'].forEach(id=>{ const e=$('#'+id); e.oninput=()=>e.closest('.field').classList.remove('has-error'); });
  }
};

function freezeModal() {
  const ov = openModal(`
    <div class="modal__head"><h3 class="h3">Bloqueo temporal</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body">
      <div class="state__art" style="margin:0 auto var(--s-4)">${icon('lock')}</div>
      <p class="text-slate" style="text-align:center">Bloquearás temporalmente <strong>Diners Club ···4417</strong>. Podrás desbloquearla cuando quieras. Tus pagos automáticos se pausarán.</p>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--danger" id="confirmFreeze">Bloquear tarjeta</button></div>`);
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  ov.querySelector('#confirmFreeze').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); toast({title:'Tarjeta bloqueada', msg:'Diners Club ···4417 quedó inactiva.', type:'success'}); },900); };
}

/* Tarjeta-visual estandarizada para cuentas / créditos / inversiones */
function acctCard(item, kind, extraCls = '') {
  const map = {
    account:    { cls:'acct-card--acct',   ic:'wallet', label:item.type,     name:item.name, sub:item.num,          amt:money(item.saldo), lbl:'Saldo disponible', mask:true },
    credit:     { cls:'acct-card--credit', ic:'coins',  label:'Crédito',      name:item.name, sub:item.num,          amt:money(item.saldo), lbl:'Saldo pendiente',  mask:false },
    investment: { cls:'acct-card--invest', ic:'chart',  label:'Inversión',    name:item.name, sub:'Tasa '+item.tasa, amt:money(item.monto), lbl:'Invertido',        mask:true },
  }[kind];
  return `<div class="acct-card ${map.cls} ${extraCls}" role="button" tabindex="0" data-nav="detalle-producto?id=${item.id}" aria-label="Abrir ${map.name}">
    <div class="acct-card__top"><span class="ic">${icon(map.ic)}</span><span class="badge badge--glass">${map.label}</span></div>
    <div><div class="acct-card__label">${map.lbl}</div><div class="acct-card__amt num">${(map.mask&&State.masked)?'••••••':map.amt}</div><div style="font-size:13px;opacity:.9;margin-top:6px">${map.name} · ${map.sub}</div></div>
  </div>`;
}

/* ---------- CUENTAS Y CRÉDITOS (mismo patrón que Tarjetas) ---------- */
Screens.cuentas = {
  title: 'Cuentas y créditos',
  render(view) {
    const cat = getParam('cat'); // 'cuenta' | 'credito' | 'inversion' | null (todas)
    const saldo = DB.accounts.reduce((s,a)=>s+a.saldo,0), credito = DB.credits.reduce((s,c)=>s+c.saldo,0), invertido = DB.investments.reduce((s,i)=>s+i.monto,0);
    const total = DB.accounts.length + DB.credits.length + DB.investments.length;
    const titulo = cat==='cuenta' ? 'Mira tus cuentas' : cat==='credito' ? 'Mira tus créditos' : cat==='inversion' ? 'Mira tus inversiones' : 'Mira tus cuentas y créditos';
    const secCuentas = `<div class="section mb-6"><h2 class="h4 mb-4">Cuentas</h2>
      <div class="pcard-list">${DB.accounts.map(a=>acctRow(a,'account')).join('')}${addProductCard('onboarding-blu-plus','Abrir cuenta blu+')}</div></div>`;
    const secCreditos = `<div class="section mb-6"><h2 class="h4 mb-4">Créditos</h2>
      <div class="pcard-list">${DB.credits.map(cr=>acctRow(cr,'credit')).join('')}</div></div>`;
    const secInv = `<div class="section mb-6"><h2 class="h4 mb-4">Inversiones</h2>
      <div class="pcard-list">${DB.investments.map(iv=>acctRow(iv,'investment')).join('')}</div></div>`;
    const secciones = cat==='cuenta' ? secCuentas : cat==='credito' ? secCreditos : cat==='inversion' ? secInv : (secCuentas+secCreditos+secInv);
    // Naming homologado en toda la plataforma (mismos términos que el Home)
    const tiles = cat==='cuenta' ? statTile('wallet','navy','Total cuentas con nosotros',State.masked?'••••':money(saldo))
      : cat==='credito' ? statTile('coins','graphite','Total de tus créditos',money(credito))
      : cat==='inversion' ? statTile('chart','indigo','Total de tus inversiones',State.masked?'••••':money(invertido))
      : statTile('wallet','navy','Total cuentas con nosotros',State.masked?'••••':money(saldo))+statTile('coins','graphite','Total de tus créditos',money(credito))+statTile('chart','indigo','Total de tus inversiones',State.masked?'••••':money(invertido));
    view.innerHTML = `
    ${premiumHead(titulo, cat ? '' : `${total} productos`, 'inicio',
      `<button class="btn btn--primary btn--sm" data-nav="ofertas">${icon('plus')} Abrir producto</button>`, 'Productos')}
    <div class="stat-tiles section mb-6">${tiles}</div>
    ${secciones}`;
  }
};

/* ---------- TRANSFERENCIAS (flujo con validación + confirmación) ---------- */
Screens.transferencias = {
  title: 'Transferencias',
  render(view) {
    view.innerHTML = `
    ${pageHead('Transferir dinero','A cuentas propias, terceros u otros bancos.','inicio')}
    <div class="grid" style="grid-template-columns: 1fr 340px; align-items:start">
      <div class="card card--pad section">
        <div class="stepper mb-6" id="steps">
          <div class="step is-active"><span class="bullet">1</span><span class="label">Datos</span></div><span class="bar"></span>
          <div class="step"><span class="bullet">2</span><span class="label">Confirmar</span></div><span class="bar"></span>
          <div class="step"><span class="bullet">${icon('check')}</span><span class="label">Listo</span></div>
        </div>
        <form id="trForm" novalidate>
          <div class="field"><label>Desde</label><div class="control">${icon('wallet')}<select id="trFrom"><option>Cuenta de Ahorros BLU ···2205 — ${money(DB.accounts[0].saldo)}</option><option>Cuenta Corriente ···7781 — ${money(DB.accounts[1].saldo)}</option></select>${icon('chevronDown')}</div></div>

          <div class="field" id="fBenef"><label>Destinatario <span class="req">*</span></label><div class="control">${icon('contacts')}<select id="trBenef"><option value="">Selecciona un contacto…</option>${DB.contacts.map(c=>`<option value="${c.id}">${c.name} — ${c.bank} ${c.acc}</option>`).join('')}<option value="new">+ Nuevo destinatario</option></select>${icon('chevronDown')}</div><span class="error-text">${icon('alert')} Selecciona a quién transferir.</span></div>

          <!-- Nuevo destinatario: campos según tipo de banco -->
          <div id="newBenef" style="display:none;border:1px solid var(--line-2);border-radius:var(--r-md);padding:16px;margin-bottom:16px;background:var(--surface-2)">
            <div class="field"><label>Tipo de transferencia</label><div class="control">${icon('building')}<select id="trTipo"><option value="diners">Mismo banco (Diners)</option><option value="banred">Otro banco · BANRED</option><option value="spi">Otro banco · SPI</option></select>${icon('chevronDown')}</div></div>
            <div class="field" id="fAcc"><label>Número de cuenta <span class="req">*</span></label><div class="control">${icon('wallet')}<input id="trAcc" inputmode="numeric" placeholder="Número de cuenta"></div></div>
            <div class="field" id="fId" style="display:none"><label>Identificación (cédula / RUC / pasaporte) <span class="req">*</span></label><div class="control">${icon('file')}<input id="trId" placeholder="Identificación del titular"></div></div>
            <div class="field" id="fName" style="display:none"><label>Nombre del cliente <span class="req">*</span></label><div class="control">${icon('user')}<input id="trName" placeholder="Nombre del titular"></div></div>
            <button type="button" class="btn btn--secondary btn--block" id="trVerify">${icon('search')} Verificar información</button>
            <div id="trVerified" style="display:none;margin-top:12px" class="detail-cta detail-cta--ok">${icon('checkCircle')}<span>Titular verificado: <strong id="trVerifiedName">—</strong></span></div>
            <div class="divider"></div>
            <div class="field" style="margin:0"><label>Alias (opcional)</label><div class="control">${icon('star')}<input id="trAlias" maxlength="30" placeholder="Ej. Proveedor TIA"></div></div>
            <label class="row" style="gap:10px;cursor:pointer;align-items:center;margin-top:10px"><input type="checkbox" id="trFav"><span class="text-slate" style="font-size:13px">Guardar en favoritos con este alias</span></label>
          </div>

          <div class="field" id="fAmount"><label>Monto <span class="req">*</span></label><div class="control"><span class="prefix">$</span><input id="trAmount" inputmode="decimal" placeholder="0,00" aria-describedby="amtHint"></div><span class="hint" id="amtHint">Disponible: ${money(DB.accounts[0].saldo)}</span><span class="error-text">${icon('alert')} <span id="amtErr">Ingresa un monto válido.</span></span></div>

          <div class="field"><label>Concepto (opcional)</label><div class="control">${icon('receipt')}<input id="trConcept" maxlength="40" placeholder="Ej. Pago arriendo"></div></div>

          <button class="btn btn--primary btn--lg btn--block mt-2" type="submit">Continuar</button>
        </form>
      </div>

      <div class="grid" style="gap:16px">
        <div class="card card--pad section"><h3 class="h4 mb-4">Contactos frecuentes</h3>${DB.contacts.filter(c=>c.fav).map(c=>`<button class="prod" data-fav="${c.id}" style="width:100%"><span class="avatar">${c.initials}</span><div class="prod__main" style="text-align:left"><div class="prod__title">${c.name}</div><div class="prod__sub">${c.bank} ${c.acc}</div></div><span class="prod__chev">${icon('chevron')}</span></button>`).join('')}</div>
        <div class="card card--pad section" style="background:var(--blu-50);border-color:var(--blu-100)"><div class="row" style="gap:10px;align-items:flex-start">${icon('shield','')}<div><div style="font-weight:600;font-size:13px">Transferencia protegida</div><div class="text-muted" style="font-size:12px">Validaremos con token dinámico antes de enviar.</div></div></div></div>
      </div>
    </div>`;

    const benef=$('#trBenef'), amount=$('#trAmount'), nb=$('#newBenef');
    function applyTipo() {
      const t=$('#trTipo').value;
      $('#fId').style.display = (t==='banred'||t==='spi') ? 'block' : 'none';
      $('#fName').style.display = (t==='spi') ? 'block' : 'none';
      $('#trVerify').style.display = (t==='spi') ? 'none' : 'block';
      $('#trVerified').style.display='none';
    }
    benef.onchange = () => { nb.style.display = benef.value==='new' ? 'block' : 'none'; if(benef.value==='new') applyTipo(); $('#fBenef').classList.remove('has-error'); };
    $('#trTipo').onchange = applyTipo;
    $('#trAcc').oninput = () => $('#fAcc').classList.remove('has-error');
    $('#trVerify').onclick = () => {
      const acc=$('#trAcc').value.trim(); if(!acc){ $('#fAcc').classList.add('has-error'); return; }
      const t=$('#trTipo').value;
      const nm = t==='diners' ? ('Titular Diners ···'+acc.slice(-4)) : ('Cliente BANRED ···'+acc.slice(-4));
      $('#trVerifiedName').textContent = nm; $('#trVerified').style.display='flex';
      toast({title:'Información verificada', msg:'Titular: '+nm, type:'success'});
    };
    view.querySelectorAll('[data-fav]').forEach(b=> b.onclick=()=>{ benef.value=b.dataset.fav; benef.onchange(); $('#fBenef').classList.remove('has-error'); amount.focus(); });
    amount.oninput = () => { let v=amount.value.replace(/[^\d,]/g,''); amount.value=v; };
    amount.onblur = () => validateAmount();
    function validateAmount() {
      const val=parseFloat(amount.value.replace(',','.'))||0; const max=DB.accounts[0].saldo;
      const f=$('#fAmount');
      if(val<=0){ f.classList.add('has-error'); $('#amtErr').textContent='Ingresa un monto mayor a $0,00.'; return false; }
      if(val>max){ f.classList.add('has-error'); $('#amtErr').textContent='El monto supera tu saldo disponible.'; return false; }
      f.classList.remove('has-error'); return true;
    }
    $('#trForm').onsubmit = (e)=>{
      e.preventDefault(); let ok=true;
      if(!benef.value){ $('#fBenef').classList.add('has-error'); ok=false; } else $('#fBenef').classList.remove('has-error');
      if(!validateAmount()) ok=false;
      let c;
      if(benef.value==='new'){
        const acc=$('#trAcc').value.trim(); if(!acc){ $('#fAcc').classList.add('has-error'); ok=false; }
        const t=$('#trTipo').value;
        const nombre = t==='spi' ? $('#trName').value.trim() : ($('#trVerified').style.display!=='none' ? $('#trVerifiedName').textContent : '');
        const alias=$('#trAlias').value.trim();
        if(!ok) return;
        const label = alias || nombre || 'Nuevo destinatario';
        c={ name:label, bank: t==='diners'?'blu · Diners':(t==='banred'?'Otro banco · BANRED':'Otro banco · SPI'), acc:'••• '+(acc.slice(-4)||'0000'), initials:label.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(), producto:'cuentas' };
        if($('#trFav').checked){ c.fav=true; c.id='c'+Date.now().toString().slice(-5); DB.contacts.push(c); }
      } else {
        if(!ok) return;
        c = DB.contacts.find(x=>x.id===benef.value) || {name:'Destinatario', bank:'—', acc:''};
      }
      confirmTransfer(c, amount.value, $('#trConcept').value);
    };
  }
};

function confirmTransfer(c, amount, concept) {
  const ov = openModal(`
    <div class="modal__head"><h3 class="h3">Confirmar transferencia</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body">
      <div class="row" style="gap:12px;margin-bottom:16px"><span class="avatar">${c.initials||'ND'}</span><div><div style="font-weight:600">${c.name}</div><div class="text-muted" style="font-size:13px">${c.bank} ${c.acc||''}</div></div></div>
      <div class="sum-row"><span class="k">Desde</span><span class="v">Ahorros BLU ···2205</span></div>
      <div class="sum-row"><span class="k">Concepto</span><span class="v">${concept||'—'}</span></div>
      <div class="sum-row"><span class="k">Comisión</span><span class="v text-success">Sin costo</span></div>
      <div class="sum-total"><span class="k">Total a enviar</span><span class="v num">$${amount}</span></div>
      <div class="field mt-6"><label>Token dinámico</label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:40px;text-align:center;font-size:20px;font-weight:700" aria-label="Dígito token">').join('')}</div><span class="hint">Ingresa el código de tu app de seguridad.</span></div>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="doTransfer">Transferir $${amount}</button></div>`, {wide:false});
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  const inputs = ov.querySelectorAll('.control input');
  inputs.forEach((inp,i)=> inp.oninput=()=>{ if(inp.value && inputs[i+1]) inputs[i+1].focus(); });
  // La transferencia queda pendiente de autorización de un perfil Aprobador.
  ov.querySelector('#doTransfer').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); location.hash='#/pendiente-autorizar'; },1200); };
}

function successModal(title, msg, back) {
  const ov = openModal(`
    <div class="modal__body" style="text-align:center;padding-top:32px">
      <div class="state__art" style="margin:0 auto 16px;background:var(--success-bg);color:var(--success)">${icon('checkCircle')}</div>
      <h3 class="h2">${title}</h3>
      <p class="text-muted mt-2">${msg}</p>
      <div class="card card--pad mt-6" style="text-align:left;background:var(--surface-2)">
        <div class="sum-row"><span class="k">Comprobante N°</span><span class="v num">#BLU-${Math.floor(Math.random()*900000+100000)}</span></div>
        <div class="sum-row"><span class="k">Fecha</span><span class="v">01 jul 2026 · ${new Date().toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'})}</span></div>
      </div>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" id="dl">${icon('download')} Comprobante</button><button class="btn btn--primary" id="ok">Finalizar</button></div>`);
  ov.querySelector('#dl').onclick=()=>toast({title:'Comprobante descargado', type:'success'});
  ov.querySelector('#ok').onclick=()=>{ closeModal(ov); if(back) location.hash='#/'+back; };
}

/* Soft token — paso obligatorio del login (usuario + contraseña + token) */
function loginSoftToken() {
  const ov = openModal(`
    <div class="modal__body" style="text-align:center;padding-top:28px">
      <div class="state__art" style="margin:0 auto 14px;background:var(--blu-50);color:var(--primary)">${icon('shield')}</div>
      <h3 class="h3">Token de seguridad</h3>
      <p class="text-muted mt-2" style="max-width:36ch;margin-left:auto;margin-right:auto">Ingresa el código de 6 dígitos de tu <strong>token blu</strong> para completar tu ingreso.</p>
      <div class="row" style="justify-content:center;gap:8px;margin-top:20px" id="otpRow">
        ${[0,1,2,3,4,5].map(()=>'<input class="otp-box" maxlength="1" inputmode="numeric" autocomplete="one-time-code" aria-label="Dígito del token">').join('')}
      </div>
      <div class="error-text" id="otpErr" style="display:none;justify-content:center;margin-top:10px">${icon('alert')} Ingresa los 6 dígitos del token.</div>
      <div class="text-muted" style="font-size:12px;margin-top:12px">¿No lo tienes a mano? <a id="otpResend" style="color:var(--primary);font-weight:600;cursor:pointer">Reenviar código</a> <span id="otpTimer"></span></div>
      <div class="text-muted" style="font-size:11px;margin-top:6px;opacity:.8">Demo: ingresa cualquier código de 6 dígitos.</div>
    </div>
    <div class="modal__foot"><button class="btn btn--ghost" id="otpCancel">Cancelar</button><button class="btn btn--primary" id="otpValidate">Validar e ingresar</button></div>`);
  const boxes = [...ov.querySelectorAll('.otp-box')];
  const err = ov.querySelector('#otpErr');
  boxes.forEach((b,i)=>{
    b.oninput = () => { b.value = b.value.replace(/\D/g,'').slice(0,1); if (b.value && boxes[i+1]) boxes[i+1].focus(); err.style.display='none'; };
    b.onkeydown = (e) => { if (e.key==='Backspace' && !b.value && boxes[i-1]) boxes[i-1].focus(); };
  });
  let t = 30; const tm = ov.querySelector('#otpTimer');
  const iv = setInterval(()=>{ if(!document.body.contains(ov)){ clearInterval(iv); return; } t--; tm.textContent = t>0 ? '· 00:'+String(t).padStart(2,'0') : ''; if(t<=0) clearInterval(iv); }, 1000);
  ov.querySelector('#otpResend').onclick = () => { t=30; toast({title:'Código reenviado', msg:'Revisa tu token blu.', type:'info'}); };
  ov.querySelector('#otpCancel').onclick = () => { clearInterval(iv); closeModal(ov); };
  ov.querySelector('#otpValidate').onclick = (e) => {
    if (boxes.map(b=>b.value).join('').length < 6) { err.style.display='flex'; (boxes.find(b=>!b.value)||boxes[0]).focus(); return; }
    const btn = e.currentTarget; btn.classList.add('is-loading');
    setTimeout(()=>{ clearInterval(iv); closeModal(ov); location.hash='#/inicio'; toast({title:'Bienvenida, '+DB.user.first, msg:'Ingreso verificado con token de seguridad.', type:'success'}); }, 900);
  };
}

/* ---------- PAGO DE SERVICIOS ---------- */
Screens.pagos = {
  title: 'Pagos de servicios',
  render(view) {
    view.innerHTML = `
    <div class="page-head section"><h1>Pago de servicios</h1><p>Tus servicios inscritos y pagos rápidos.</p></div>
    <div class="scroll-x mb-6">${['Todos','Inscritos','Luz','Agua','Internet','TV','Teléfono'].map((t,i)=>`<button class="chip ${i===0?'is-active':''}">${t}</button>`).join('')}</div>
    <div class="grid grid-2">
      ${DB.services.map(s=>{
        const overdue = s.due>0;
        return `<div class="card card--pad card--hover" data-pay="${s.id}"><div class="row between"><span class="prod__ic prod__ic--card">${icon(s.icon)}</span>${overdue?`<span class="badge badge--warning"><span class="dot"></span>Por pagar</span>`:`<span class="badge badge--success"><span class="dot"></span>Al día</span>`}</div>
        <div class="mt-4"><div style="font-weight:600">${s.name}</div><div class="text-muted" style="font-size:13px">${s.cat} · ${s.ref}</div></div>
        <div class="row between mt-4"><div><div class="text-muted" style="font-size:12px">Valor pendiente</div><div class="kpi__value num" style="font-size:22px">${money(s.due)}</div></div>${overdue?`<button class="btn btn--primary btn--sm">Pagar</button>`:`<span class="text-success" style="font-weight:600;font-size:13px">${icon('check')}</span>`}</div></div>`;
      }).join('')}
      <button class="card card--pad card--hover" style="display:flex;align-items:center;justify-content:center;gap:10px;border-style:dashed;color:var(--primary);font-weight:600;min-height:120px" data-modal="addService">${icon('plus')} Inscribir nuevo servicio</button>
    </div>`;

    view.querySelectorAll('[data-pay]').forEach(card=> card.onclick=()=>{ const s=DB.services.find(x=>x.id===card.dataset.pay); if(s.due>0) payServiceModal(s); else toast({title:s.name, msg:'Este servicio está al día.', type:'info'}); });
    view.querySelector('[data-modal="addService"]').onclick=()=>toast({title:'Inscribir servicio', msg:'Selecciona la categoría y número de suministro.', type:'info'});
  }
};
function payServiceModal(s) {
  const ov=openModal(`
    <div class="modal__head"><h3 class="h3">Pagar ${s.cat}</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body">
      <div class="row" style="gap:12px;margin-bottom:8px"><span class="prod__ic prod__ic--card">${icon(s.icon)}</span><div><div style="font-weight:600">${s.name}</div><div class="text-muted" style="font-size:13px">${s.ref}</div></div></div>
      <div class="field mt-4"><label>Pagar desde</label><div class="control">${icon('wallet')}<select><option>Ahorros BLU ···2205 — ${money(DB.accounts[0].saldo)}</option><option>Diners Club ···4417</option></select>${icon('chevronDown')}</div></div>
      <div class="sum-total"><span class="k">Total a pagar</span><span class="v num">${money(s.due)}</span></div>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="payNow">Pagar ${money(s.due)}</button></div>`);
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  ov.querySelector('#payNow').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); successModal('Pago realizado', `Pagaste ${money(s.due)} de ${s.name}.`, 'pagos'); },1100); };
}

/* ---------- PAGO DE TARJETA ---------- */
Screens['pago-tarjeta'] = {
  title: 'Pago de tarjeta',
  render(view) {
    const RATE_M = 0.015; // interés mensual referencial
    const DUE_DAYS = { diners:5, black:8, visa:10, platinum:15, 'diners-add':5 }; // días para vencer (demo)
    let sel = (getParam('id') && DB.cards.find(c=>c.id===getParam('id'))) || DB.cards.find(c=>c.pagoTotal>0) || DB.cards[0];
    let optIdx = 0, otherVal = 0, fromIdx = 0;

    view.innerHTML = `
    ${premiumHead('Pagar tarjeta de crédito', 'Paga tu estado de cuenta y evita intereses.', 'inicio', '', 'Pagos')}
    <div class="grid" style="grid-template-columns:1fr 360px;gap:20px;align-items:start">
      <div class="grid" style="gap:20px">
        <!-- Estado de cuenta -->
        <div class="card card--pad section" id="pcStmt"></div>
        <!-- Datos del pago -->
        <div class="card card--pad section">
          <div class="field" style="margin-bottom:16px"><label>Tarjeta a pagar</label><div class="control">${icon('card')}<select id="pcSelect">${DB.cards.map(c=>`<option value="${c.id}">${c.name} ···${c.last4}${c.pagoTotal>0?` — debes ${money(c.pagoTotal)}`:' — al día'}</option>`).join('')}</select>${icon('chevronDown')}</div></div>
          <div class="field" style="margin-bottom:16px"><label>Pagar desde</label><div class="control" id="pcFromCtl">${icon('wallet')}<select id="pcFrom">${DB.accounts.map((a,i)=>`<option value="${i}">${a.name} ${a.num} — ${money(a.saldo)}</option>`).join('')}</select>${icon('chevronDown')}</div><span class="error-text" id="pcFromErr">${icon('alert')} Saldo insuficiente en la cuenta seleccionada.</span></div>
          <label class="h4" style="display:block;margin-bottom:12px">¿Cuánto quieres pagar?</label>
          <div class="grid" style="gap:10px" id="payOpts" role="radiogroup" aria-label="Monto a pagar"></div>
          <div class="field mt-4" id="otherWrap" style="display:none"><label>Ingresa el valor</label><div class="control"><span class="prefix">$</span><input id="otherVal" inputmode="decimal" placeholder="0,00" aria-label="Otro valor"></div><span class="hint" id="otherHint">Debe ser menor o igual a tu deuda total.</span></div>
          <div class="row" style="gap:8px;align-items:center;margin-top:18px;font-size:13px;color:var(--muted)">${icon('bolt')}<span>El pago se realiza <strong style="color:var(--ink)">ahora</strong>, de forma inmediata a tu tarjeta.</span></div>
        </div>
      </div>

      <!-- Resumen de pago (sticky) -->
      <div class="pay-summary section" id="pcSummary"></div>
    </div>`;

    const daysBadge = (c) => {
      if (c.pagoTotal === 0) return `<span class="badge badge--success"><span class="dot"></span>Al día</span>`;
      const d = DUE_DAYS[c.id] || 5;
      return `<span class="badge ${d<=5?'badge--error':'badge--warning'}"><span class="dot"></span>Vence en ${d} día${d===1?'':'s'}</span>`;
    };
    const amountFor = () => optIdx===0 ? sel.pagoTotal : optIdx===1 ? sel.pagoMin : otherVal;

    function renderStmt() {
      const c = sel;
      $('#pcStmt').innerHTML = `
        <div class="row between wrap" style="gap:16px">
          <div class="row" style="gap:16px;align-items:center">
            <div style="width:110px">${UI.bankCard(c)}</div>
            <div><div class="eyebrow" style="margin:0">Estado de cuenta</div><div class="h3">${c.name}</div><div class="text-muted" style="font-size:13px">···${c.last4} · ${c.principal===false?'adicional':'principal'}</div></div>
          </div>
          ${daysBadge(c)}
        </div>
        <div class="grid grid-3 mt-6" style="gap:12px">
          <div><div class="text-muted" style="font-size:12px">Pago total</div><div class="num" style="font-weight:800;font-size:22px">${money(c.pagoTotal)}</div></div>
          <div><div class="text-muted" style="font-size:12px">Pago mínimo</div><div class="num" style="font-weight:700;font-size:18px">${money(c.pagoMin)}</div></div>
          <div><div class="text-muted" style="font-size:12px">Fecha máxima de pago</div><div style="font-weight:700;font-size:18px">${c.pago}</div></div>
        </div>`;
    }

    function renderOpts() {
      const c = sel;
      const savesInterest = Math.round(c.pagoTotal * RATE_M * 100) / 100;
      const minInterest = Math.round((c.pagoTotal - c.pagoMin) * RATE_M * 100) / 100;
      const opts = [
        { t:'Pago total', a:c.pagoTotal, sub:'Pagas el 100% de tu deuda', badge: c.pagoTotal>0?`<span class="badge badge--success">Evitas ~${money(savesInterest)} de interés</span>`:'' },
        { t:'Pago mínimo', a:c.pagoMin, sub:'Mantienes tu cupo al día', badge: c.pagoMin>0?`<span class="badge badge--warning">Genera ~${money(minInterest)} de interés</span>`:'' },
        { t:'Otro valor', a:null, sub:'Tú decides cuánto abonar', badge:'' },
      ];
      $('#payOpts').innerHTML = opts.map((o,i)=>`<button type="button" class="pay-opt ${i===optIdx?'is-sel':''}" data-opt="${i}" role="radio" aria-checked="${i===optIdx}">
        <span class="pay-opt__radio"></span>
        <span class="pay-opt__body"><span class="pay-opt__title">${o.t} ${o.badge}</span><span class="pay-opt__sub">${o.sub}</span></span>
        <span class="pay-opt__amt num">${o.a!=null?money(o.a):'—'}</span>
      </button>`).join('');
      view.querySelectorAll('#payOpts [data-opt]').forEach(b => b.onclick = () => { optIdx = +b.dataset.opt; $('#otherWrap').style.display = optIdx===2?'block':'none'; if(optIdx===2) setTimeout(()=>$('#otherVal').focus(),50); renderOpts(); renderSummary(); });
    }

    function renderSummary() {
      const c = sel, amt = amountFor(), acc = DB.accounts[fromIdx];
      const insufficient = amt > acc.saldo;
      const overPay = optIdx===2 && c.pagoTotal>0 && otherVal > c.pagoTotal;
      const whenLbl = 'Hoy · inmediato';
      $('#pcFromCtl').classList.toggle('is-invalid', insufficient && amt>0);
      $('#pcFromErr').parentElement.classList.toggle('has-error', insufficient && amt>0);
      const oh = $('#otherHint'); if (oh) { if (overPay) { oh.textContent = `El valor supera tu deuda de ${money(c.pagoTotal)}.`; oh.style.color = 'var(--error)'; } else { oh.textContent = 'Debe ser menor o igual a tu deuda total.'; oh.style.color = ''; } }
      $('#pcSummary').innerHTML = `
      <div class="card card--pad">
        <h3 class="h4 mb-4">Resumen de pago</h3>
        <div class="row" style="gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line-2)">
          <div class="pcard__art" style="width:56px;height:36px;background:${(typeof CARD_GRAD!=='undefined'&&CARD_GRAD[c.variant])||'var(--grad-card)'}"><span class="mini-chip" style="top:7px;left:8px;width:11px;height:8px"></span></div>
          <div><div style="font-weight:600;font-size:14px">${c.name}</div><div class="text-muted" style="font-size:12px">···${c.last4}</div></div>
        </div>
        ${kv('Cuenta origen', acc.name+' '+acc.num)}
        ${kv('Fecha', whenLbl)}
        ${kv('Comisión', '<span class="text-success">Sin costo</span>')}
        <div class="sum-total" style="margin-top:8px"><span class="k">Total a pagar</span><span class="v num">${money(amt)}</span></div>
        <button class="btn btn--primary btn--lg btn--block mt-4" id="payCardBtn" ${(amt<=0||insufficient||overPay)?'disabled':''}>Pagar ${amt>0?money(amt):''}</button>
        <div class="row" style="gap:8px;align-items:flex-start;margin-top:14px;font-size:12px;color:var(--muted)">${icon('shield')}<span>Pago protegido. ¿Quieres olvidarte de pagar? <a data-nav="programados" style="color:var(--primary);font-weight:600">Activa débito automático</a></span></div>
      </div>`;
      $('#payCardBtn').onclick = doPay;
    }

    function doPay() {
      const amt = amountFor();
      $('#payCardBtn').classList.add('is-loading');
      setTimeout(()=>{ $('#payCardBtn').classList.remove('is-loading'); successModal('Pago aplicado', `Pagaste ${money(amt)} a tu ${sel.name}.`, 'inicio'); }, 1000);
    }

    renderStmt(); renderOpts(); renderSummary();
    $('#pcSelect').value = sel.id;
    $('#pcSelect').onchange = (e) => { sel = DB.cards.find(c=>c.id===e.target.value); optIdx=0; otherVal=0; $('#otherWrap').style.display='none'; renderStmt(); renderOpts(); renderSummary(); };
    $('#otherVal').oninput = (e) => { otherVal = parseFloat((e.target.value||'').replace(',','.'))||0; renderSummary(); };
    $('#pcFrom').onchange = (e) => { fromIdx = +e.target.value; renderSummary(); };
  }
};

/* ---------- CONTACTOS ---------- */
Screens.contactos = {
  title: 'Contactos',
  render(view) {
    view.innerHTML = `
    <div class="page-head section"><div class="row between wrap"><div><h1>Contactos</h1><p>Tus destinatarios guardados.</p></div><button class="btn btn--primary btn--sm" data-nav="nuevo-contacto">${icon('plus')} Nuevo contacto</button></div></div>
    <div class="search mb-6" style="width:100%;max-width:420px">${icon('search')}<input placeholder="Buscar contacto…" id="cSearch"></div>
    <div class="list-card"><div class="list-card__body" style="padding-top:16px" id="cList">${renderContacts(DB.contacts)}</div></div>`;
    function wire() {
      view.querySelectorAll('#cList [data-transfer]').forEach(b=> b.onclick=(e)=>{ e.stopPropagation(); location.hash='#/transferencias'; });
      view.querySelectorAll('#cList [data-edit]').forEach(b=> b.onclick=(e)=>{ e.stopPropagation(); const c=DB.contacts.find(x=>x.id===b.dataset.edit); toast({title:'Editar contacto', msg:`Actualiza los datos de ${c.name}.`, type:'info'}); });
      view.querySelectorAll('#cList [data-del]').forEach(b=> b.onclick=(e)=>{ e.stopPropagation(); const c=DB.contacts.find(x=>x.id===b.dataset.del); const ov=openModal(`<div class="modal__head"><h3 class="h3">Eliminar contacto</h3><button class="icon-btn" data-close>${icon('close')}</button></div><div class="modal__body"><p class="text-slate">¿Seguro que quieres eliminar a <strong>${c.name}</strong> de tus contactos?</p></div><div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--danger" id="delDo">Eliminar</button></div>`); ov.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>closeModal(ov)); ov.querySelector('#delDo').onclick=()=>{ const i=DB.contacts.findIndex(x=>x.id===c.id); if(i>=0)DB.contacts.splice(i,1); closeModal(ov); $('#cList').innerHTML = DB.contacts.length?renderContacts(DB.contacts):emptyState('Sin contactos','Agrega tu primer destinatario.','contacts'); wire(); toast({title:'Contacto eliminado',type:'success'}); }; });
    }
    $('#cSearch').oninput=(e)=>{ const q=e.target.value.toLowerCase(); const f=DB.contacts.filter(c=>c.name.toLowerCase().includes(q)||c.bank.toLowerCase().includes(q)); $('#cList').innerHTML = f.length?renderContacts(f):emptyState('Sin resultados','No encontramos contactos con ese nombre.','search'); wire(); };
    wire();
  }
};
function renderContacts(list) { return list.map(c=>`<div class="prod"><span class="avatar">${c.initials}</span><div class="prod__main"><div class="prod__title">${c.name} ${c.fav?icon('star',''):''}</div><div class="prod__sub">${c.bank} · ${c.acc} · <span class="badge badge--neutral" style="padding:1px 8px;font-size:11px">${c.producto==='tarjetas'?'Tarjetas':'Cuentas'}</span></div></div><div class="row" style="gap:4px"><button class="icon-btn" aria-label="Editar contacto" data-edit="${c.id}">${icon('services')}</button><button class="icon-btn" aria-label="Eliminar contacto" data-del="${c.id}" style="color:var(--error)">${icon('close')}</button><button class="btn btn--secondary btn--sm" data-transfer="${c.id}">Transferir</button></div></div>`).join(''); }

/* Nuevo contacto (pantalla propia) */
Screens['nuevo-contacto'] = {
  title: 'Nuevo contacto',
  render(view) {
    view.innerHTML = `
    ${pageHead('Nuevo contacto','Guarda un destinatario para transferir más rápido.','contactos')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      <div class="card card--pad section">
        <div class="field" id="ncNombreF"><label>Nombre / alias <span class="req">*</span></label><div class="control">${icon('user')}<input id="ncNombre" placeholder="Ej. Juan Pérez o 'Proveedor TIA'"></div><span class="error-text">${icon('alert')} Ingresa un nombre o alias.</span></div>
        <div class="field"><label>Producto</label><div class="control">${icon('grid')}<select id="ncProd"><option value="cuentas">Cuentas</option><option value="tarjetas">Tarjetas</option></select>${icon('chevronDown')}</div></div>
        <div class="field"><label>Banco</label><div class="control">${icon('building')}<select><option>blu · Diners</option><option>Banco Pichincha</option><option>Produbanco</option><option>Banco Guayaquil</option><option>Otro (BANRED / SPI)</option></select>${icon('chevronDown')}</div></div>
        <div class="field" id="ncNumF"><label>Número de cuenta <span class="req">*</span></label><div class="control">${icon('wallet')}<input id="ncNum" inputmode="numeric" placeholder="Número de cuenta"></div><span class="error-text">${icon('alert')} Ingresa el número de cuenta.</span></div>
        <label class="row" style="gap:10px;cursor:pointer;align-items:center;margin-top:6px"><input type="checkbox" id="ncFav"><span class="text-slate" style="font-size:13px">Marcar como favorito</span></label>
        <button class="btn btn--primary btn--lg btn--block mt-4" id="ncBtn">Guardar contacto</button>
      </div>
      <aside style="position:sticky;top:calc(var(--topbar-h) + 24px)">${infoBanner('Guarda el producto (cuentas o tarjetas) para identificar rápido a tu destinatario.','contacts')}</aside>
    </div>`;
    ['ncNombre','ncNum'].forEach(id=>{ const e=$('#'+id); e.oninput=()=>e.closest('.field').classList.remove('has-error'); });
    $('#ncBtn').onclick=()=>{
      const n=$('#ncNombre'), num=$('#ncNum'); let ok=true;
      if(!n.value.trim()){ $('#ncNombreF').classList.add('has-error'); ok=false; }
      if(!num.value.trim()){ $('#ncNumF').classList.add('has-error'); ok=false; }
      if(!ok) return;
      const name=n.value.trim();
      DB.contacts.push({ id:'c'+(DB.contacts.length+1)+Date.now().toString().slice(-3), name, bank:'blu · Diners', acc:'••• '+(num.value.trim().slice(-4)||'0000'), initials:name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(), fav:$('#ncFav').checked, producto:$('#ncProd').value });
      successModal('Contacto guardado', `${name} quedó guardado en tus contactos.`, 'contactos');
    };
  }
};

/* ---------- RECOMPENSAS / CLUB ---------- */
Screens.recompensas = {
  title: 'Recompensas',
  render(view) {
    const r = DB.rewards; const pct = Math.round(r.points/(r.points+r.toNext)*100);
    view.innerHTML = `
    <div class="page-head section"><h1>Tus ClubMiles</h1><p>Acumula ClubMiles y canjéalos por lo que quieras.</p></div>
    <div class="grid dash-grid">
      <div class="grid" style="gap:20px">
        <div class="bank-card section" style="aspect-ratio:auto;background:var(--grad-sky)">
          <div class="row between"><div><div class="bank-card__type">Programa</div><div class="bank-card__brand">Club ${r.tier}</div></div>${icon('star','')}</div>
          <div style="margin-top:20px"><div style="font-size:13px;opacity:.85">ClubMiles disponibles</div><div class="num" style="font-size:38px;font-weight:800">${r.points.toLocaleString('es-EC')}</div></div>
          <div style="margin-top:16px"><div class="row between" style="font-size:12px;opacity:.9"><span>Nivel ${r.tier}</span><span>${r.toNext.toLocaleString('es-EC')} ClubMiles para ${r.next}</span></div><div class="progress mt-2" style="background:rgba(255,255,255,.3)"><span style="width:${pct}%;background:#fff"></span></div></div>
        </div>
        <div class="card card--pad section"><h2 class="h4 mb-4">Catálogo de canjes</h2><div class="grid grid-2">${r.catalog.map(c=>`<button class="card card--pad card--hover" data-redeem="${c.id}" style="text-align:left"><span class="prod__ic prod__ic--card">${icon(c.icon)}</span><div class="mt-4" style="font-weight:600">${c.name}</div><div class="text-muted" style="font-size:12px">${c.sub}</div><div class="row between mt-4"><span class="badge badge--info">${c.cost.toLocaleString('es-EC')} ClubMiles</span><span class="prod__chev">${icon('chevron')}</span></div></button>`).join('')}</div></div>
      </div>
      <div class="grid" style="gap:20px">
        <div class="card card--pad section"><div class="kpi"><div class="kpi__label">${icon('cash')} Cashback acumulado</div><div class="kpi__value num" style="font-size:26px">${money(r.cashback)}</div></div><button class="btn btn--secondary btn--block mt-4">Transferir a mi cuenta</button></div>
        <div class="card card--pad section" style="background:var(--blu-50);border-color:var(--blu-100)"><div class="row" style="gap:10px;align-items:flex-start">${icon('sparkles','')}<div><div style="font-weight:600;font-size:14px">Multiplica tus ClubMiles</div><div class="text-muted" style="font-size:13px">Paga con tu Diners Club en supermercados y gana 3x este mes.</div></div></div></div>
      </div>
    </div>`;
    view.querySelectorAll('[data-redeem]').forEach(b=> b.onclick=()=>{ const c=r.catalog.find(x=>x.id===b.dataset.redeem); redeemModal(c); });
  }
};
function redeemModal(c) {
  const ov=openModal(`
    <div class="modal__head"><h3 class="h3">Canjear recompensa</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body" style="text-align:center"><div class="state__art" style="margin:0 auto 12px">${icon(c.icon)}</div><h3 class="h3">${c.name}</h3><p class="text-muted">${c.sub}</p><div class="sum-total mt-6"><span class="k">Costo</span><span class="v num">${c.cost.toLocaleString('es-EC')} ClubMiles</span></div><p class="text-muted mt-2" style="font-size:12px">Saldo tras el canje: ${(DB.rewards.points-c.cost).toLocaleString('es-EC')} ClubMiles</p></div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="doRedeem">Confirmar canje</button></div>`);
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  ov.querySelector('#doRedeem').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); successModal('¡Canje exitoso!', `Canjeaste ${c.name}. Recibirás los detalles por correo.`, 'recompensas'); },1000); };
}

/* ---------- PERFIL ---------- */
Screens.perfil = {
  title: 'Mi perfil',
  render(view) {
    const u=DB.user;
    view.innerHTML = `
    <div class="page-head section"><h1>Mi perfil</h1><p>Datos personales, seguridad y preferencias.</p></div>
    <div class="grid" style="grid-template-columns:300px 1fr;align-items:start">
      <div class="card card--pad section" style="text-align:center"><span class="avatar" style="width:88px;height:88px;font-size:30px;margin:0 auto">${u.initials}</span><h3 class="h3 mt-4">${u.name}</h3><p class="text-muted">${u.role}</p><span class="badge badge--info mt-4">${icon('star')} Club Premium</span><button class="btn btn--secondary btn--block mt-6">Editar foto</button></div>
      <div class="grid" style="gap:20px">
        <div class="card card--pad section"><h2 class="h4 mb-4">Datos de contacto</h2>
          <div class="field"><label>Correo electrónico</label><div class="control">${icon('receipt')}<input value="${u.email}"><span class="badge badge--success" style="flex:none">Verificado</span></div></div>
          <div class="field"><label>Teléfono móvil</label><div class="control">${icon('phone')}<input value="${u.phone}"></div></div>
          <button class="btn btn--primary" id="saveProfile">Guardar cambios</button>
        </div>
        <div class="card card--pad section"><h2 class="h4 mb-4">Seguridad</h2>
          ${[['Autenticación biométrica','fingerprint',true],['Notificaciones de consumos','bell',true],['Token dinámico en pagos','shield',true],['Modo de privacidad de saldos','eyeOff',false]].map((s,i)=>`<div class="row between" style="padding:12px 0;border-bottom:${i<3?'1px solid var(--line-2)':'none'}"><span class="row" style="gap:12px">${icon(s[1])}<span style="font-weight:500">${s[0]}</span></span><label class="switch"><input type="checkbox" ${s[2]?'checked':''}><span class="track"></span></label></div>`).join('')}
          <button class="btn btn--secondary btn--block mt-4" data-nav="cambiar-clave">${icon('lock')} Cambiar contraseña</button>
        </div>
        <div class="card card--pad section"><h2 class="h4 mb-4">Recursos</h2>
          <a class="btn btn--secondary btn--block" href="design-system.html" target="_blank" rel="noopener">${icon('sparkles')} Ver Design System</a>
        </div>
        <button class="btn btn--ghost" style="color:var(--error);justify-content:flex-start" data-nav="logout">${icon('logout')} Cerrar sesión</button>
      </div>
    </div>`;
    $('#saveProfile').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ e.target.classList.remove('is-loading'); toast({title:'Perfil actualizado', msg:'Tus cambios se guardaron correctamente.', type:'success'}); },800); };
  }
};

/* ---------- RECUPERAR ----------
   Este proceso ya no se completa en la web: se hace desde la app blu Empresas
   (donde, al ingresar la cédula, primero se solicita el RUC de la empresa para
   validar que es cliente, y luego se valida que la cédula tenga un usuario
   asociado a ese RUC — lógica que vive del lado de la app, no de este canal). */
Screens.recuperar = {
  title: 'Recuperar acceso', full: true,
  render(view) {
    view.innerHTML = `<div class="auth"><section class="auth__panel" style="grid-column:1/-1"><div class="auth__form" style="text-align:center">
      <a href="#/login" class="row" style="gap:6px;color:var(--primary);font-weight:600;margin-bottom:16px;justify-content:center">${icon('back')} Volver al ingreso</a>
      <div class="state__art" style="margin:0 auto 16px;background:var(--blu-50);color:var(--primary)">${icon('phone')}</div>
      <h2 class="h2">Recupera tu acceso desde la app</h2>
      <p class="text-muted mt-2 mb-6" style="max-width:42ch;margin-left:auto;margin-right:auto">Para tu seguridad, la recuperación de usuario y contraseña se hace desde la app blu Empresas. Escanea el código y sigue los pasos desde ahí.</p>
      <div class="qr-card">${qrPlaceholder(140)}<span>Escanea con tu celular para abrir blu Empresas</span></div>
      <a class="btn btn--primary btn--lg btn--block" href="#/login">Entendido, volver al ingreso</a>
    </div></section></div>`;
  }
};

/* ============================================================
   SHELL + ROUTER
   ============================================================ */
const NAV_GROUPS = [
  { label:'Principal', items:[ ['inicio','home','Inicio'] ] },
  { label:'Productos', items:[ ['tarjetas','card','Tarjetas de crédito'], ['prepago','card','Prepago'], ['cuentas?cat=cuenta','wallet','Cuentas'], ['cuentas?cat=credito','coins','Créditos'], ['cuentas?cat=inversion','chart','Inversiones'], ['ofertas','sparkles','Para ti'] ] },
  { label:'Pagos', items:[ ['transferencias','send','Transferencias'], ['pago-tarjeta','card','Pago de tarjeta'], ['retiro-atm','atm','Retiro sin tarjeta'], ['contactos','contacts','Contactos'] ] },
  { label:'Servicios', items:[ ['bloqueo','lock','Bloqueo de tarjetas'], ['certificados','certificate','Certificados'], ['tributarios','file','Doc. tributarios'] ] },
  { label:'Empresa', items:[ ['caja','store','Ventas'], ['aprobaciones','approve','Aprobaciones'], ['admin-usuarios','users','Admin. usuarios'], ['cash-mng','cash','Cash management'] ] },
  { label:'Más', items:[ ['recompensas','gift','Recompensas Club'], ['perfil','user','Mi perfil'] ] },
];
const BOTTOM = [ ['inicio','home','Inicio'], ['tarjetas','card','Tarjetas'], ['transferencias','send','Enviar'], ['recompensas','gift','Club'], ['perfil','user','Perfil'] ];

/* Antes ⇄ Después: mapa de rutas equivalentes para el toggle de comparación */
const ROUTE_MAP = {
  inicio:'antes-inicio', tarjetas:'antes-tarjetas', cuentas:'antes-cuentas',
  transferencias:'antes-transferencias', pagos:'antes-pagos', 'pago-tarjeta':'antes-pago-tarjeta',
  bloqueo:'antes-bloqueo', 'admin-usuarios':'antes-admin-usuarios', perfil:'antes-perfil',
  recompensas:'antes-recompensas', contactos:'antes-contactos', login:'antes-login',
};
const ROUTE_MAP_REV = Object.fromEntries(Object.entries(ROUTE_MAP).map(([a,b])=>[b,a]));
function legacyEquivalent(route) { return ROUTE_MAP[route] || 'antes-inicio'; }
function newEquivalent(route) { return ROUTE_MAP_REV[route] || 'inicio'; }

function shell(activeRoute, title) {
  const nav = NAV_GROUPS.map(g=>`<div class="nav__group-label">${g.label}</div>${g.items.map(([r,ic,label])=>`<button class="nav__item ${r===activeRoute?'is-active':''}" data-nav="${r}">${icon(ic)}<span>${label}</span></button>`).join('')}`).join('');
  return `
  <a href="#main" class="skip-link">Saltar al contenido</a>
  <div class="app">
    <aside class="sidebar">
      <div class="brand"><div class="brand__mark">b</div><div><div class="brand__name">blu</div><div class="brand__sub">Diners Club · Empresas</div></div></div>
      <nav class="nav" aria-label="Menú principal">${nav}</nav>
      <div class="sidebar__foot"><button class="nav__item" style="color:var(--error)" data-nav="logout">${icon('logout')}<span>Cerrar sesión</span></button></div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Abrir menú">${icon('menu')}</button>
        <div class="topbar__title">${title}</div>
        <div class="topbar__spacer"></div>
        <div class="search">${icon('search')}<input placeholder="Buscar movimientos, servicios…" aria-label="Buscar"></div>
        <button class="icon-btn" id="themeBtn" aria-label="Cambiar tema" title="Modo ${State.theme==='dark'?'claro':'oscuro'}">${icon(State.theme==='dark'?'sun':'moon')}</button>
        <button class="icon-btn notif-dot" aria-label="Notificaciones" id="notifBtn">${icon('bell')}</button>
        <span class="avatar" style="cursor:pointer" data-nav="perfil">${DB.user.initials}</span>
      </header>
      <main class="content" id="main"><div id="view"></div></main>
    </div>
    <nav class="bottom-nav" aria-label="Navegación inferior">${BOTTOM.map(([r,ic,label])=>`<button class="${r===activeRoute?'is-active':''}" data-nav="${r}">${icon(ic)}<span>${label}</span></button>`).join('')}</nav>
  </div>`;
}

const root = () => document.getElementById('root');
function getRoute() { const h=location.hash.replace(/^#\/?/,'').split('?')[0]; return h || 'inicio'; }
function getParam(k) { const q=(location.hash.split('?')[1])||''; return new URLSearchParams(q).get(k); }
function findProduct(id) {
  return DB.cards.find(x=>x.id===id) && {type:'card', item:DB.cards.find(x=>x.id===id)}
    || (DB.prepaid||[]).find(x=>x.id===id) && {type:'prepaid', item:DB.prepaid.find(x=>x.id===id)}
    || DB.accounts.find(x=>x.id===id) && {type:'account', item:DB.accounts.find(x=>x.id===id)}
    || DB.credits.find(x=>x.id===id) && {type:'credit', item:DB.credits.find(x=>x.id===id)}
    || DB.investments.find(x=>x.id===id) && {type:'investment', item:DB.investments.find(x=>x.id===id)}
    || null;
}

function render() {
  const route = getRoute();
  const screen = Screens[route] || Screens.inicio;
  State.route = route;
  routeProgress();

  if (screen.full) {
    root().className='';
    root().innerHTML = `<div id="view"></div>`;
    screen.render($('#view'));
  } else {
    root().innerHTML = shell(route, screen.title);
    screen.render($('#view'));
    const nb=$('#notifBtn'); if(nb) nb.onclick=notifPanel;
    const mb=$('#menuBtn'); if(mb) mb.onclick=mobileMenu;
    const tb=$('#themeBtn'); if(tb) tb.onclick=toggleTheme;
    setupSearch();
  }
  window.scrollTo(0,0);
}

/* ---------- Buscador global (topbar) ---------- */
function searchIndex() {
  const items = [];
  const cat = (typeof CATALOG !== 'undefined') ? CATALOG : [];
  cat.forEach(g => g.items.forEach(([r, ic, label]) => items.push({ type: 'Pantalla', label, route: r, ic })));
  DB.cards.forEach(c => items.push({ type: 'Tarjeta', label: `${c.name} ···${c.last4}`, route: `detalle-producto?id=${c.id}`, ic: 'card' }));
  DB.accounts.forEach(a => items.push({ type: 'Cuenta', label: a.name, route: `detalle-producto?id=${a.id}`, ic: 'wallet' }));
  DB.credits.forEach(c => items.push({ type: 'Crédito', label: c.name, route: `detalle-producto?id=${c.id}`, ic: 'coins' }));
  DB.investments.forEach(i => items.push({ type: 'Inversión', label: i.name, route: `detalle-producto?id=${i.id}`, ic: 'chart' }));
  DB.contacts.forEach(c => items.push({ type: 'Contacto', label: c.name, route: 'transferencias', ic: 'contacts' }));
  return items;
}
function setupSearch() {
  const box = $('.search'); if (!box || box.dataset.wired) return; box.dataset.wired = '1';
  const input = box.querySelector('input');
  let dd, active = -1, results = [];
  const close = () => { if (dd) { dd.remove(); dd = null; } active = -1; };
  const hl = (label, q) => label.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
  const go = (r) => { location.hash = '#/' + r; input.value = ''; close(); input.blur(); };
  function open(q) {
    close();
    dd = el('div', 'search-results');
    dd.setAttribute('role', 'listbox');
    if (!results.length) { dd.innerHTML = `<div class="search-empty">Sin resultados para “${q}”</div>`; box.appendChild(dd); return; }
    dd.innerHTML = results.slice(0, 8).map((r, i) => `<button class="search-item ${i === active ? 'is-active' : ''}" data-i="${i}" role="option"><span class="si-ic">${icon(r.ic)}</span><span class="si-label">${hl(r.label, q)}</span><span class="si-route">${r.type}</span></button>`).join('');
    box.appendChild(dd);
    dd.querySelectorAll('[data-i]').forEach(b => b.onmousedown = (e) => { e.preventDefault(); go(results[+b.dataset.i].route); });
  }
  input.oninput = () => {
    const q = input.value.trim(); if (!q) { close(); return; }
    const ql = q.toLowerCase();
    results = searchIndex().filter(x => x.label.toLowerCase().includes(ql) || x.type.toLowerCase().includes(ql));
    active = results.length ? 0 : -1; open(q);
  };
  input.onkeydown = (e) => {
    if (!dd) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, Math.min(results.length, 8) - 1); open(input.value.trim()); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); open(input.value.trim()); }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[active] || results[0]; if (r) go(r.route); }
    else if (e.key === 'Escape') { input.value = ''; close(); }
  };
  input.onblur = () => setTimeout(close, 150);
}

/* Delegación global de navegación: sobrevive a contenido inyectado async
   (skeletons, carruseles, pasos de wizard). Se registra una sola vez. */
function setupNavDelegation() {
  if (window.__bluNav) return; window.__bluNav = true;
  document.addEventListener('click', (e) => {
    const n = e.target.closest('[data-nav]');
    if (n && n.dataset.nav) { e.preventDefault(); location.hash = '#/' + n.dataset.nav; }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const n = e.target.closest('[data-nav]');
    if (n && n.dataset.nav && (n.getAttribute('role') === 'button' || n.tabIndex === 0)) { e.preventDefault(); location.hash = '#/' + n.dataset.nav; }
  });
}
setupNavDelegation();

function notifPanel() {
  openModal(`<div class="modal__head"><h3 class="h3">Notificaciones</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
  <div class="modal__body">
    ${[['Consumo aprobado','Supermaxi · $84,32 con Diners Club ···4417','store','Hace 2 h'],['Recordatorio de pago','Tu tarjeta vence el 02 ago','alert','Ayer'],['ClubMiles acreditados','+320 ClubMiles por tu consumo','gift','Ayer']].map(n=>`<div class="tx"><span class="tx__ic">${icon(n[2])}</span><div class="tx__main"><div class="tx__title">${n[0]}</div><div class="tx__meta">${n[1]}</div></div><span class="tx__meta">${n[3]}</span></div>`).join('')}
  </div><div class="modal__foot"><button class="btn btn--secondary btn--block" data-close>Cerrar</button></div>`).querySelectorAll('[data-close]').forEach(b=>b.onclick=e=>closeModal(e.currentTarget));
}

function mobileMenu() {
  const nav = NAV_GROUPS.map(g=>`<div class="nav__group-label">${g.label}</div>${g.items.map(([r,ic,label])=>`<button class="nav__item ${r===State.route?'is-active':''}" data-nav="${r}">${icon(ic)}<span>${label}</span></button>`).join('')}`).join('');
  const ov=openModal(`<div class="modal__body" style="padding:16px">${nav}</div>`);
  ov.querySelector('.modal').style.maxWidth='300px';
  ov.querySelectorAll('[data-nav]').forEach(n=> n.onclick=()=>{ location.hash='#/'+n.dataset.nav; closeModal(ov); });
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => { if(!location.hash) location.hash='#/login'; render(); });
