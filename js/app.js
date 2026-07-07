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
    return `<div class="bank-card ${mini?'bank-card--mini':''} ${c.variant?'bank-card--'+c.variant:''}" tabindex="0" role="group" aria-label="Tarjeta ${c.name} terminación ${c.last4}">
      <div class="row between">
        <div><div class="bank-card__brand">BLU</div><div class="bank-card__type">${c.name} · ${c.type}</div></div>
        <div class="bank-card__chip"></div>
      </div>
      <div class="bank-card__number num">${c.number}</div>
      <div class="bank-card__foot">
        <div><small>Cupo disponible</small><strong class="num">${State.masked?'••••••':money(c.disponible)}</strong></div>
        <div style="text-align:right"><small>Vence</small><strong>${c.corte}</strong></div>
      </div>
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
        <div class="brand" style="padding:0"><div class="brand__mark">B</div><div class="brand__name" style="color:#fff">BLU</div></div>
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
          <div class="brand" style="padding-left:0"><div class="brand__mark">B</div><div class="brand__name">BLU</div><span class="badge badge--info" style="margin-left:auto">Empresas</span></div>
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

          <div class="row between mb-6">
            <label class="row" style="gap:8px;cursor:pointer"><span class="switch"><input type="checkbox" checked><span class="track"></span></span><span style="font-size:13px">Recordar usuario</span></label>
            <a href="#/recuperar" style="font-size:13px;font-weight:600;color:var(--primary)">¿Olvidaste tu clave?</a>
          </div>

          <button class="btn btn--primary btn--lg btn--block" type="submit" id="loginBtn">Ingresar</button>
          <p class="text-muted mt-6" style="text-align:center;font-size:13px">¿Tu empresa aún no es cliente? <a href="#/inicio" style="color:var(--primary);font-weight:600">Solicita acceso</a></p>
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
      setTimeout(()=>{ btn.classList.remove('is-loading'); location.hash='#/inicio'; toast({title:'Bienvenida, '+DB.user.first, msg:'Ingreso verificado con token seguro.', type:'success'}); }, 1100);
    };
  }
};

/* ---------- INICIO / DASHBOARD ---------- */
Screens.inicio = {
  title: 'Inicio',
  render(view) {
    const sk = `<div class="grid" style="gap:20px">${UI.skeletonCard()}${UI.skeletonCard()}</div>`;
    withSkeleton(view, sk, build);

    function build(v) {
      const p = moneyParts(DB.net.patrimonio);

      v.innerHTML = `
      <div class="page-head section">
        <div class="row between wrap" style="gap:12px">
          <div><p class="eyebrow">Resumen consolidado</p><h1>Hola, ${DB.user.first}</h1></div>
          <div class="row wrap" style="gap:8px">
            <button class="btn btn--secondary btn--sm" onclick="window.open('presentacion.html','_blank','noopener')">${icon('sparkles')} Ver presentación</button>
            <button class="btn btn--secondary btn--sm" data-nav="recompensas">${icon('gift')} 48.250 puntos Club</button>
          </div>
        </div>
      </div>

      <!-- Posición consolidada + accesos -->
      <div class="card card--pad section mb-6">
        <div class="row wrap" style="gap:10px;align-items:center">
          <span class="eyebrow" style="margin:0">Posición consolidada</span>
          <button class="chip" onclick="toast({title:'Cambiar empresa',msg:'Robles Comercial S.A. · Robles Retail S.A.S.',type:'info'})">${icon('building')} Robles Comercial S.A. ${icon('chevronDown')}</button>
        </div>
        <div class="row" style="gap:8px;align-items:center;margin-top:8px">
          <div class="kpi__value num" id="mainBalance" style="font-size:34px">${State.masked?'••••••':`${p.int}<span class="cents">,${p.dec}</span>`}</div>
          <button class="eye-toggle" id="maskBtn" aria-label="Ocultar saldos">${icon(State.masked?'eyeOff':'eye')}</button>
        </div>
        <div class="row wrap" style="gap:28px;margin-top:14px">
          <div><div class="text-muted" style="font-size:12px">Liquidez disponible</div><div class="num" style="font-weight:700;font-size:18px">${State.masked?'••••':money(DB.net.disponible)}</div></div>
          <div><div class="text-muted" style="font-size:12px">Por aprobar</div><div class="num" style="font-weight:700;font-size:18px">3 · ${money(31232.40)}</div></div>
        </div>
        <div class="qa-grid mt-6">
          <button class="qa" data-nav="transferencias"><span class="qa__ic">${icon('send')}</span><span class="qa__label">Transferir</span></button>
          <button class="qa" data-nav="carga-archivo"><span class="qa__ic">${icon('upload')}</span><span class="qa__label">Pago masivo</span></button>
          <button class="qa" data-nav="aprobaciones" style="position:relative"><span class="qa__ic">${icon('approve')}</span><span class="qa__label">Aprobaciones</span><span class="badge badge--error" style="position:absolute;top:8px;right:12px;padding:2px 7px">3</span></button>
          <button class="qa" data-nav="caja"><span class="qa__ic">${icon('store')}</span><span class="qa__label">Consulta de caja</span></button>
        </div>
      </div>

      <!-- Tus productos (tarjeta con tabs arriba · imágenes grandes) -->
      <div class="card card--pad section mb-6">
        <div class="row between wrap mb-4" style="gap:10px">
          <div class="scroll-x" style="max-width:100%;padding-bottom:0"><div class="prod-tabs prod-tabs--inline" id="prodTabs" role="tablist">
            ${[['tarjeta','Tarjetas'],['cuenta','Cuentas'],['credito','Créditos'],['inversion','Inversiones']].map((t,i)=>`<button class="${i===0?'is-active':''}" data-c="${t[0]}" role="tab" aria-selected="${i===0?'true':'false'}">${t[1]}</button>`).join('')}
          </div></div>
          <a class="row" id="prodSeeAll" style="gap:4px;font-size:13px;font-weight:600;color:var(--primary);cursor:pointer">Ver todo ${icon('chevron')}</a>
        </div>
        <div id="prodXlHost"></div>
        <div id="prodXlExtra" class="mt-4"></div>
      </div>

      <!-- Últimos movimientos (ancho completo, 2 columnas) -->
      <div class="list-card section">
        <div class="list-card__head"><h2 class="h4">Últimos movimientos</h2><a class="btn--ghost" data-nav="tarjetas" style="font-size:13px;font-weight:600;color:var(--primary)">Ver todos</a></div>
        <div class="list-card__body" style="columns:340px 2;column-gap:40px">${DB.movements.map(UI.txRow).join('')}</div>
      </div>`;

      $('#maskBtn').onclick = toggleMask;

      // Tus productos — tarjetas grandes con imagen (estructura app real BLU)
      const coverIcon = { cuenta: 'wallet', credito: 'coins', inversion: 'chart' };
      const prodData  = { tarjeta: DB.cards, cuenta: DB.accounts, credito: DB.credits, inversion: DB.investments };
      const prodNav   = { cuenta: 'cuentas', credito: 'cuentas', inversion: 'cuentas' };
      const detailNav = (it) => `detalle-producto?id=${it.id}`;

      function prodXl(kind, item) {
        if (kind === 'tarjeta') {
          const c = item;
          const badge = c.pagoTotal > 0
            ? `<span class="badge badge--warning"><span class="dot"></span>Vence ${c.pago}</span>`
            : `<span class="badge badge--success">Al día</span>`;
          return `<button class="prod-xl" data-nav="detalle-producto?id=${c.id}" aria-label="Abrir ${c.name}">
            <div class="prod-xl__media">${UI.bankCard(c)}</div>
            <div class="prod-xl__body">
              <div class="row between" style="gap:8px;align-items:flex-start"><div><div class="prod-xl__name">${c.name}</div><div class="prod-xl__id num">•••• ${c.last4}</div></div>${badge}</div>
              <div class="prod-xl__amt num">${State.masked ? '$ ••••••' : money(c.disponible)}</div>
              <div class="prod-xl__sub">Cupo disponible${c.pagoTotal > 0 ? ` · Pago total ${State.masked ? '••••' : money(c.pagoTotal)}` : ''}</div>
            </div>
          </button>`;
        }
        if (kind === 'cuenta') {
          const a = item;
          const amt = State.masked ? '$ ••••••' : money(a.saldo);
          return `<button class="prod-xl" data-nav="${detailNav(a)}" aria-label="Abrir ${a.name}">
            <div class="prod-xl__media"><div class="prod-xl__cover prod-xl__cover--cuenta">
              <div class="row between" style="align-items:flex-start"><span class="prod-xl__cover-brand">BLU</span>${a.tasa ? `<span class="prod-xl__cover-rate">${a.tasa}</span>` : icon('wallet')}</div>
              <div><div class="prod-xl__cover-name">${a.name}</div><div class="prod-xl__cover-id num">${a.num}</div></div>
              <span class="prod-xl__cover-wm" aria-hidden="true">${icon('wallet')}</span>
            </div></div>
            <div class="prod-xl__body">
              <div class="prod-xl__amt num">${amt}</div>
              <div class="prod-xl__sub">Saldo disponible</div>
              ${a.interesMes ? `<div class="prod-acct__pill"><span class="dot"></span><strong class="num">${money(a.interesMes, true)}</strong>&nbsp;interés del mes</div>` : ''}
            </div>
          </button>`;
        }
        const ic = coverIcon[kind];
        const idLine = item.num || item.vence || '';
        let amt, sub;
        if (kind === 'credito'){ amt = money(item.saldo); sub = `Cuota ${money(item.cuota)} · próx. ${item.prox}`; }
        else                   { amt = State.masked ? '$ ••••••' : money(item.monto); sub = `Tasa ${item.tasa} · vence ${item.vence}`; }
        return `<button class="prod-xl" data-nav="${detailNav(item)}" aria-label="Abrir ${item.name}">
          <div class="prod-xl__media"><div class="prod-xl__cover prod-xl__cover--${kind}">
            <div class="row between" style="align-items:flex-start"><span class="prod-xl__cover-brand">BLU</span>${icon(ic)}</div>
            <div><div class="prod-xl__cover-name">${item.name}</div><div class="prod-xl__cover-id num">${idLine}</div></div>
            <span class="prod-xl__cover-wm" aria-hidden="true">${icon(ic)}</span>
          </div></div>
          <div class="prod-xl__body">
            <div class="prod-xl__amt num">${amt}</div>
            <div class="prod-xl__sub">${sub}</div>
          </div>
        </button>`;
      }

      const prodExtra = (kind) => {
        if (kind === 'tarjeta') { const t=DB.cards.reduce((s,c)=>s+c.pagoTotal,0), n=DB.cards.filter(c=>c.pagoTotal>0).length; return `<div class="card card--pad row between" style="gap:14px;align-items:center"><div style="flex:1;min-width:0"><div class="row wrap" style="gap:8px;align-items:center"><span class="text-muted" style="font-size:13px">Total a pagar este mes</span><span class="badge badge--warning"><span class="dot"></span>Próx. 02 ago</span></div><div class="kpi__value num" style="font-size:22px;margin-top:4px">${money(t)}</div><div class="text-muted" style="font-size:12px">${n} tarjetas con saldo pendiente</div></div><button class="btn btn--primary" style="flex-shrink:0" data-nav="pago-tarjeta">Pagar</button></div>`; }
        if (kind === 'cuenta') { const t=DB.accounts.reduce((s,a)=>s+a.saldo,0); return `<div class="card card--pad row between"><div><div class="text-muted" style="font-size:13px">Saldo total en cuentas</div><div class="kpi__value num" style="font-size:22px">${State.masked?'••••':money(t)}</div></div><button class="btn btn--secondary" data-nav="cuentas">Ver cuentas</button></div>`; }
        if (kind === 'credito') { const t=DB.credits.reduce((s,c)=>s+c.saldo,0); return `<div class="card card--pad row between"><div><div class="text-muted" style="font-size:13px">Deuda total</div><div class="kpi__value num" style="font-size:22px">${money(t)}</div></div><button class="btn btn--primary" data-nav="pago-credito">Pagar cuota</button></div>`; }
        const t=DB.investments.reduce((s,i)=>s+i.monto,0); return `<div class="card card--pad row between"><div><div class="text-muted" style="font-size:13px">Total invertido</div><div class="kpi__value num" style="font-size:22px">${State.masked?'••••':money(t)}</div></div><button class="btn btn--secondary" data-nav="sim-credito">Simular</button></div>`;
      };

      let curKind = 'tarjeta';
      function renderProducts(kind) {
        curKind = kind;
        const items = (prodData[kind] || []).map(it => prodXl(kind, it));
        $('#prodXlHost').innerHTML = `<div class="prod-strip">${items.join('')}</div>`;
        $('#prodXlExtra').innerHTML = prodExtra(kind);
      }
      view.querySelectorAll('#prodTabs [data-c]').forEach(b => b.onclick = () => {
        view.querySelectorAll('#prodTabs [data-c]').forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected','false'); });
        b.classList.add('is-active'); b.setAttribute('aria-selected','true'); renderProducts(b.dataset.c);
      });
      $('#prodSeeAll').onclick = () => { location.hash = '#/' + (curKind === 'tarjeta' ? 'tarjetas' : prodNav[curKind]); };
      renderProducts('tarjeta');
    }
  }
};

/* Donut chart (SVG puro) */
function drawDonut(host, data) {
  if(!host) return;
  const size=160, r=58, c=2*Math.PI*r, cx=size/2;
  let off=0;
  const segs = data.map(d=>{ const len=c*d.pct/100; const s=`<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${d.color}" stroke-width="18" stroke-dasharray="${len} ${c-len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cx})" stroke-linecap="butt"><title>${d.cat}: ${d.pct}%</title></circle>`; off+=len; return s; }).join('');
  const total = data.reduce((a,b)=>a+b.val,0);
  host.innerHTML = `<div style="display:flex;justify-content:center"><svg viewBox="0 0 ${size} ${size}" width="180" height="180" role="img" aria-label="Distribución de gastos del mes">
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--bg-2)" stroke-width="18"/>${segs}
    <text x="${cx}" y="${cx-4}" text-anchor="middle" font-size="11" fill="var(--muted)">Total mes</text>
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
  return `<div class="pcard__art" style="background:${CARD_GRAD[c.variant] || CARD_GRAD.diners}"><span class="mini-chip"></span><span class="mini-brand">BLU</span></div>`;
}
function cardRow(c) {
  const usedPct = Math.round(c.usado / c.cupo * 100);
  return `<button class="pcard" data-nav="detalle-producto?id=${c.id}" aria-label="Abrir ${c.name}">
    ${miniCardArt(c)}
    <div class="pcard__body">
      <div class="pcard__name">${c.name}</div>
      <div class="pcard__num">${c.type} · ···${c.last4}</div>
      <div class="pcard__bar"><div class="lbls"><span>Utilizado ${money(c.usado)}</span><span>${usedPct}%</span></div><div class="progress" style="height:6px"><span style="width:${usedPct}%"></span></div></div>
    </div>
    <div class="pcard__value"><div class="pcard__amt num">${State.masked ? '••••' : money(c.disponible)}</div><div class="pcard__lbl">disponible</div></div>
  </button>`;
}
const ACCT_GRAD = {
  account:    'linear-gradient(135deg, #14213F 0%, #26365E 55%, #3A4F80 120%)',
  credit:     'linear-gradient(135deg, #24272F 0%, #3A3F4C 55%, #545B6C 120%)',
  investment: 'linear-gradient(135deg, #1E1B48 0%, #322C82 55%, #463F9C 120%)',
};
function acctRow(item, kind) {
  const cfg = {
    account:    { ic:'wallet', name:item.name, sub:`${item.type} · ${item.num}`,       amt:money(item.saldo), lbl:'saldo',     mask:true },
    credit:     { ic:'coins',  name:item.name, sub:`Crédito · ${item.num}`,             amt:money(item.saldo), lbl:'pendiente', mask:false, bar:{pct:37, l:`Cuota ${item.plazo}`} },
    investment: { ic:'chart',  name:item.name, sub:`Inversión · tasa ${item.tasa}`,     amt:money(item.monto), lbl:'invertido', mask:true },
  }[kind];
  return `<button class="pcard" data-nav="detalle-producto?id=${item.id}" aria-label="Abrir ${cfg.name}">
    <div class="pcard__art pcard__art--ic" style="background:${ACCT_GRAD[kind]};color:#fff"><span class="mini-chip"></span>${icon(cfg.ic)}</div>
    <div class="pcard__body">
      <div class="pcard__name">${cfg.name}</div>
      <div class="pcard__num">${cfg.sub}</div>
      ${cfg.bar ? `<div class="pcard__bar"><div class="lbls"><span>${cfg.bar.l}</span><span>${cfg.bar.pct}%</span></div><div class="progress" style="height:6px"><span style="width:${cfg.bar.pct}%"></span></div></div>` : ''}
    </div>
    <div class="pcard__value"><div class="pcard__amt num">${(cfg.mask && State.masked) ? '••••' : cfg.amt}</div><div class="pcard__lbl">${cfg.lbl}</div></div>
  </button>`;
}
function addProductCard(route, label) {
  return `<button class="pcard" data-nav="${route}" style="border-style:dashed;background:transparent;color:var(--primary);font-weight:600;justify-content:center;min-height:80px">${icon('plus')} ${label}</button>`;
}

Screens.tarjetas = {
  title: 'Mis tarjetas',
  render(view) {
    const cupo = DB.cards.reduce((s,c)=>s+c.cupo,0), disp = DB.cards.reduce((s,c)=>s+c.disponible,0), usado = DB.cards.reduce((s,c)=>s+c.usado,0);
    view.innerHTML = `
    ${premiumHead('Mis tarjetas de crédito', `${DB.cards.length} tarjetas activas`, 'inicio',
      `<button class="btn btn--primary btn--sm" data-nav="onboarding-signature">${icon('plus')} Solicitar tarjeta</button>`, 'Productos')}
    <div class="stat-tiles section mb-6">
      ${statTile('card', 'card', 'Cupo total', State.masked?'••••':money(cupo))}
      ${statTile('wallet', 'navy', 'Disponible', State.masked?'••••':money(disp))}
      ${statTile('coins', 'graphite', 'Utilizado', State.masked?'••••':money(usado))}
    </div>
    <h2 class="h4 mb-4">Tus tarjetas</h2>
    <div class="pcard-grid section mb-6">
      ${DB.cards.map(cardRow).join('')}
      ${addProductCard('onboarding-signature', 'Solicitar nueva tarjeta')}
    </div>
    <div class="list-card section">
      <div class="list-card__head"><h2 class="h4">Movimientos recientes</h2><button class="chip" onclick="toast({title:'Filtros avanzados',msg:'Rango de fechas, montos y categorías.',type:'info'})">${icon('filter')} Filtrar</button></div>
      <div class="list-card__body" style="columns:340px 2;column-gap:40px">${DB.movements.filter(m=>m.card==='Diners Club'||m.card==='Visa BLU').map(UI.txRow).join('')}</div>
    </div>`;
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
  title: 'Mis cuentas',
  render(view) {
    const saldo = DB.accounts.reduce((s,a)=>s+a.saldo,0), credito = DB.credits.reduce((s,c)=>s+c.saldo,0), invertido = DB.investments.reduce((s,i)=>s+i.monto,0);
    const total = DB.accounts.length + DB.credits.length + DB.investments.length;
    view.innerHTML = `
    ${premiumHead('Mis cuentas y créditos', `${total} productos`, 'inicio',
      `<button class="btn btn--primary btn--sm" data-nav="ofertas">${icon('plus')} Abrir producto</button>`, 'Productos')}
    <div class="stat-tiles section mb-6">
      ${statTile('wallet', 'navy', 'Saldo en cuentas', State.masked?'••••':money(saldo))}
      ${statTile('coins', 'graphite', 'Crédito pendiente', money(credito))}
      ${statTile('chart', 'indigo', 'Invertido', State.masked?'••••':money(invertido))}
    </div>
    <div class="section mb-6"><h2 class="h4 mb-4">Cuentas <span class="text-muted" style="font-weight:400">· ${DB.accounts.length}</span></h2>
      <div class="pcard-grid">${DB.accounts.map(a=>acctRow(a,'account')).join('')}${addProductCard('onboarding-blu-plus','Abrir cuenta BLU+')}</div>
    </div>
    <div class="section mb-6"><h2 class="h4 mb-4">Créditos <span class="text-muted" style="font-weight:400">· ${DB.credits.length}</span></h2>
      <div class="pcard-grid">${DB.credits.map(cr=>acctRow(cr,'credit')).join('')}</div>
    </div>
    <div class="section mb-6"><h2 class="h4 mb-4">Inversiones <span class="text-muted" style="font-weight:400">· ${DB.investments.length}</span></h2>
      <div class="pcard-grid">${DB.investments.map(iv=>acctRow(iv,'investment')).join('')}</div>
    </div>
    <div class="list-card section">
      <div class="list-card__head"><h2 class="h4">Movimientos recientes</h2></div>
      <div class="list-card__body" style="columns:340px 2;column-gap:40px">${DB.movements.filter(m=>m.card==='Ahorros').map(UI.txRow).join('')}</div>
    </div>`;
  }
};

/* ---------- TRANSFERENCIAS (flujo con validación + confirmación) ---------- */
Screens.transferencias = {
  title: 'Transferencias',
  render(view) {
    view.innerHTML = `
    <div class="page-head section"><h1>Transferir dinero</h1><p>A cuentas propias, terceros u otros bancos.</p></div>
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

    const benef=$('#trBenef'), amount=$('#trAmount');
    view.querySelectorAll('[data-fav]').forEach(b=> b.onclick=()=>{ benef.value=b.dataset.fav; $('#fBenef').classList.remove('has-error'); amount.focus(); });
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
      if(!ok) return;
      const c = DB.contacts.find(x=>x.id===benef.value) || {name:'Nuevo destinatario', bank:'—', acc:''};
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
  ov.querySelector('#doTransfer').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); successModal('¡Transferencia exitosa!', `Enviaste $${amount} a ${c.name}.`, 'inicio'); },1200); };
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
    let optIdx = 0, otherVal = 0, fromIdx = 0, when = 'hoy', progDate = '';

    view.innerHTML = `
    ${premiumHead('Pagar tarjeta de crédito', 'Paga tu estado de cuenta y evita intereses.', 'inicio', '', 'Pagos')}
    <div class="grid" style="grid-template-columns:1fr 360px;gap:20px;align-items:start">
      <div class="grid" style="gap:20px">
        <!-- Estado de cuenta -->
        <div class="card card--pad section" id="pcStmt"></div>
        <!-- Monto -->
        <div class="card card--pad section">
          <div class="field" style="margin-bottom:16px"><label>Tarjeta a pagar</label><div class="control">${icon('card')}<select id="pcSelect">${DB.cards.map(c=>`<option value="${c.id}">${c.name} ···${c.last4}${c.pagoTotal>0?` — debes ${money(c.pagoTotal)}`:' — al día'}</option>`).join('')}</select>${icon('chevronDown')}</div></div>
          <label class="h4" style="display:block;margin-bottom:12px">¿Cuánto quieres pagar?</label>
          <div class="grid" style="gap:10px" id="payOpts" role="radiogroup" aria-label="Monto a pagar"></div>
          <div class="field mt-4" id="otherWrap" style="display:none"><label>Ingresa el valor</label><div class="control"><span class="prefix">$</span><input id="otherVal" inputmode="decimal" placeholder="0,00" aria-label="Otro valor"></div><span class="hint" id="otherHint">Debe ser menor o igual a tu deuda total.</span></div>
        </div>
        <!-- Origen + fecha -->
        <div class="card card--pad section">
          <div class="field"><label>Pagar desde</label><div class="control" id="pcFromCtl">${icon('wallet')}<select id="pcFrom">${DB.accounts.map((a,i)=>`<option value="${i}">${a.name} ${a.num} — ${money(a.saldo)}</option>`).join('')}</select>${icon('chevronDown')}</div><span class="error-text" id="pcFromErr">${icon('alert')} Saldo insuficiente en la cuenta seleccionada.</span></div>
          <div class="field" style="margin:0"><label>¿Cuándo?</label>
            <div class="segmented" id="pcWhen" style="margin-top:2px"><button class="is-active" data-w="hoy">Ahora</button><button data-w="corte">En la fecha de pago</button><button data-w="prog">Programar</button></div>
            <div id="pcProgWrap" style="display:none;margin-top:12px"><div class="control">${icon('calendar')}<input type="date" id="pcProg"></div></div>
          </div>
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
      const c = sel, usedPct = Math.round(c.usado/c.cupo*100);
      $('#pcStmt').innerHTML = `
        <div class="row between wrap" style="gap:16px">
          <div class="row" style="gap:16px;align-items:center">
            <div style="width:110px">${UI.bankCard(c)}</div>
            <div><div class="eyebrow" style="margin:0">Estado de cuenta</div><div class="h3">${c.name}</div><div class="text-muted" style="font-size:13px">···${c.last4} · corte ${c.corte}</div></div>
          </div>
          ${daysBadge(c)}
        </div>
        <div class="grid grid-3 mt-6" style="gap:12px">
          <div><div class="text-muted" style="font-size:12px">Saldo del estado</div><div class="num" style="font-weight:800;font-size:22px">${money(c.pagoTotal)}</div></div>
          <div><div class="text-muted" style="font-size:12px">Pago mínimo</div><div class="num" style="font-weight:700;font-size:18px">${money(c.pagoMin)}</div></div>
          <div><div class="text-muted" style="font-size:12px">Fecha de pago</div><div style="font-weight:700;font-size:18px">${c.pago}</div></div>
        </div>
        <div class="mt-4"><div class="row between" style="font-size:12px;color:var(--muted);margin-bottom:6px"><span>Cupo utilizado</span><span class="num">${money(c.usado)} / ${money(c.cupo)}</span></div><div class="progress"><span style="width:${usedPct}%"></span></div></div>`;
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
      const whenLbl = when==='hoy' ? 'Hoy · inmediato' : when==='corte' ? `El ${c.pago}` : (progDate ? new Date(progDate+'T00:00').toLocaleDateString('es-EC',{day:'2-digit',month:'short'}) : 'Selecciona fecha');
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
        <button class="btn btn--primary btn--lg btn--block mt-4" id="payCardBtn" ${(amt<=0||insufficient||overPay||(when==='prog'&&!progDate))?'disabled':''}>${when==='hoy'?'Pagar':'Programar'} ${amt>0?money(amt):''}</button>
        <div class="row" style="gap:8px;align-items:flex-start;margin-top:14px;font-size:12px;color:var(--muted)">${icon('shield')}<span>Pago protegido. ¿Quieres olvidarte de pagar? <a data-nav="programados" style="color:var(--primary);font-weight:600">Activa débito automático</a></span></div>
      </div>`;
      $('#payCardBtn').onclick = doPay;
    }

    function doPay() {
      const amt = amountFor();
      $('#payCardBtn').classList.add('is-loading');
      setTimeout(()=>{ $('#payCardBtn').classList.remove('is-loading'); successModal(when==='hoy'?'Pago aplicado':'Pago programado', `${when==='hoy'?'Pagaste':'Programaste'} ${money(amt)} a tu ${sel.name}.`, 'inicio'); }, 1000);
    }

    renderStmt(); renderOpts(); renderSummary();
    $('#pcSelect').value = sel.id;
    $('#pcSelect').onchange = (e) => { sel = DB.cards.find(c=>c.id===e.target.value); optIdx=0; otherVal=0; $('#otherWrap').style.display='none'; renderStmt(); renderOpts(); renderSummary(); };
    $('#otherVal').oninput = (e) => { otherVal = parseFloat((e.target.value||'').replace(',','.'))||0; renderSummary(); };
    $('#pcFrom').onchange = (e) => { fromIdx = +e.target.value; renderSummary(); };
    view.querySelectorAll('#pcWhen [data-w]').forEach(b => b.onclick = () => { view.querySelectorAll('#pcWhen [data-w]').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); when=b.dataset.w; $('#pcProgWrap').style.display = when==='prog'?'block':'none'; renderSummary(); });
    const pd = $('#pcProg'); if (pd) pd.onchange = () => { progDate = pd.value; renderSummary(); };
  }
};

/* ---------- CONTACTOS ---------- */
Screens.contactos = {
  title: 'Contactos',
  render(view) {
    view.innerHTML = `
    <div class="page-head section"><div class="row between wrap"><div><h1>Contactos</h1><p>Tus destinatarios guardados.</p></div><button class="btn btn--primary btn--sm" data-modal="add">${icon('plus')} Nuevo contacto</button></div></div>
    <div class="search mb-6" style="width:100%;max-width:420px">${icon('search')}<input placeholder="Buscar contacto…" id="cSearch"></div>
    <div class="list-card"><div class="list-card__body" style="padding-top:16px" id="cList">${renderContacts(DB.contacts)}</div></div>`;
    $('#cSearch').oninput=(e)=>{ const q=e.target.value.toLowerCase(); const f=DB.contacts.filter(c=>c.name.toLowerCase().includes(q)||c.bank.toLowerCase().includes(q)); $('#cList').innerHTML = f.length?renderContacts(f):emptyState('Sin resultados','No encontramos contactos con ese nombre.','search'); };
    view.querySelector('[data-modal="add"]').onclick=()=>toast({title:'Nuevo contacto', msg:'Ingresa nombre, banco y número de cuenta.', type:'info'});
    view.querySelectorAll('.prod').forEach(p=> p.onclick=()=> location.hash='#/transferencias');
  }
};
function renderContacts(list) { return list.map(c=>`<div class="prod"><span class="avatar">${c.initials}</span><div class="prod__main"><div class="prod__title">${c.name} ${c.fav?icon('star',''):''}</div><div class="prod__sub">${c.bank} · ${c.acc}</div></div><button class="btn btn--secondary btn--sm">Transferir</button></div>`).join(''); }

/* ---------- RECOMPENSAS / CLUB ---------- */
Screens.recompensas = {
  title: 'Recompensas',
  render(view) {
    const r = DB.rewards; const pct = Math.round(r.points/(r.points+r.toNext)*100);
    view.innerHTML = `
    <div class="page-head section"><h1>Recompensas Club</h1><p>Acumula puntos y canjéalos por lo que quieras.</p></div>
    <div class="grid dash-grid">
      <div class="grid" style="gap:20px">
        <div class="bank-card section" style="aspect-ratio:auto;background:var(--grad-sky)">
          <div class="row between"><div><div class="bank-card__type">Programa</div><div class="bank-card__brand">Club ${r.tier}</div></div>${icon('star','')}</div>
          <div style="margin-top:20px"><div style="font-size:13px;opacity:.85">Puntos disponibles</div><div class="num" style="font-size:38px;font-weight:800">${r.points.toLocaleString('es-EC')}</div></div>
          <div style="margin-top:16px"><div class="row between" style="font-size:12px;opacity:.9"><span>Nivel ${r.tier}</span><span>${r.toNext.toLocaleString('es-EC')} pts para ${r.next}</span></div><div class="progress mt-2" style="background:rgba(255,255,255,.3)"><span style="width:${pct}%;background:#fff"></span></div></div>
        </div>
        <div class="card card--pad section"><h2 class="h4 mb-4">Catálogo de canjes</h2><div class="grid grid-2">${r.catalog.map(c=>`<button class="card card--pad card--hover" data-redeem="${c.id}" style="text-align:left"><span class="prod__ic prod__ic--card">${icon(c.icon)}</span><div class="mt-4" style="font-weight:600">${c.name}</div><div class="text-muted" style="font-size:12px">${c.sub}</div><div class="row between mt-4"><span class="badge badge--info">${c.cost.toLocaleString('es-EC')} pts</span><span class="prod__chev">${icon('chevron')}</span></div></button>`).join('')}</div></div>
      </div>
      <div class="grid" style="gap:20px">
        <div class="card card--pad section"><div class="kpi"><div class="kpi__label">${icon('cash')} Cashback acumulado</div><div class="kpi__value num" style="font-size:26px">${money(r.cashback)}</div></div><button class="btn btn--secondary btn--block mt-4">Transferir a mi cuenta</button></div>
        <div class="card card--pad section" style="background:var(--blu-50);border-color:var(--blu-100)"><div class="row" style="gap:10px;align-items:flex-start">${icon('sparkles','')}<div><div style="font-weight:600;font-size:14px">Multiplica tus puntos</div><div class="text-muted" style="font-size:13px">Paga con tu Diners Club en supermercados y gana 3x este mes.</div></div></div></div>
      </div>
    </div>`;
    view.querySelectorAll('[data-redeem]').forEach(b=> b.onclick=()=>{ const c=r.catalog.find(x=>x.id===b.dataset.redeem); redeemModal(c); });
  }
};
function redeemModal(c) {
  const ov=openModal(`
    <div class="modal__head"><h3 class="h3">Canjear recompensa</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body" style="text-align:center"><div class="state__art" style="margin:0 auto 12px">${icon(c.icon)}</div><h3 class="h3">${c.name}</h3><p class="text-muted">${c.sub}</p><div class="sum-total mt-6"><span class="k">Costo</span><span class="v num">${c.cost.toLocaleString('es-EC')} pts</span></div><p class="text-muted mt-2" style="font-size:12px">Saldo tras el canje: ${(DB.rewards.points-c.cost).toLocaleString('es-EC')} pts</p></div>
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
        <button class="btn btn--ghost" style="color:var(--error);justify-content:flex-start" data-nav="logout">${icon('logout')} Cerrar sesión</button>
      </div>
    </div>`;
    $('#saveProfile').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ e.target.classList.remove('is-loading'); toast({title:'Perfil actualizado', msg:'Tus cambios se guardaron correctamente.', type:'success'}); },800); };
  }
};

/* ---------- RECUPERAR (estado simple) ---------- */
Screens.recuperar = {
  title: 'Recuperar acceso', full: true,
  render(view) {
    view.innerHTML = `<div class="auth"><section class="auth__panel" style="grid-column:1/-1"><form class="auth__form"><a href="#/login" class="row" style="gap:6px;color:var(--primary);font-weight:600;margin-bottom:16px">${icon('back')} Volver</a><h2 class="h2">Recuperar contraseña</h2><p class="text-muted mb-6">Te enviaremos un código para restablecerla.</p><div class="field"><label>Usuario o cédula</label><div class="control">${icon('user')}<input placeholder="Ingresa tu usuario"></div></div><button class="btn btn--primary btn--lg btn--block" type="button" onclick="toast({title:'Código enviado',msg:'Revisa tu correo y SMS.',type:'success'})">Enviar código</button></form></section></div>`;
  }
};

/* ============================================================
   SHELL + ROUTER
   ============================================================ */
const NAV_GROUPS = [
  { label:'Principal', items:[ ['inicio','home','Inicio'], ['pantallas','grid','Todas las pantallas'] ] },
  { label:'Productos', items:[ ['tarjetas','card','Tarjetas de crédito'], ['cuentas','wallet','Cuentas y créditos'], ['ofertas','sparkles','Contratar / Ofertas'] ] },
  { label:'Pagos', items:[ ['transferencias','send','Transferencias'], ['pagos','receipt','Pago de servicios'], ['pago-tarjeta','card','Pago de tarjeta'], ['retiro-atm','atm','Retiro sin tarjeta'], ['programados','calendar','Programados'], ['contactos','contacts','Contactos'], ['mapa','map','Mapa de agencias'] ] },
  { label:'Servicios', items:[ ['bloqueo','lock','Bloqueo de tarjetas'], ['aviso-viaje','plane','Aviso de viaje'], ['certificados','certificate','Certificados'], ['tributarios','file','Doc. tributarios'], ['residencia-fiscal','shield','Residencia fiscal'], ['contactenos','headset','Contáctenos'] ] },
  { label:'Empresa', items:[ ['caja','store','Consulta de caja'], ['aprobaciones','approve','Aprobaciones'], ['admin-usuarios','users','Admin. usuarios'], ['cash-mng','cash','Cash management'] ] },
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
      <div class="brand"><div class="brand__mark">B</div><div><div class="brand__name">BLU</div><div class="brand__sub">Diners Club · Empresas</div></div></div>
      <nav class="nav" aria-label="Menú principal">${nav}</nav>
      <div class="sidebar__foot"><div class="user-chip" data-nav="perfil"><span class="avatar">${DB.user.initials}</span><div><div class="user-chip__name">${DB.user.first}</div><div class="user-chip__role">${DB.user.role}</div></div></div></div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Abrir menú">${icon('menu')}</button>
        <div class="topbar__title">${title}</div>
        <div class="topbar__spacer"></div>
        <div class="search">${icon('search')}<input placeholder="Buscar movimientos, servicios…" aria-label="Buscar"></div>
        <button class="btn btn--secondary btn--sm" data-nav="${legacyEquivalent(activeRoute)}" title="Ver cómo es hoy esta pantalla en la app actual (repo Azure)" style="min-height:38px">${icon('clock')} Ver app actual</button>
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
    ${[['Consumo aprobado','Supermaxi · $84,32 con Diners Club ···4417','store','Hace 2 h'],['Recordatorio de pago','Tu tarjeta vence el 02 ago','alert','Ayer'],['Puntos acreditados','+320 pts Club por tu consumo','gift','Ayer']].map(n=>`<div class="tx"><span class="tx__ic">${icon(n[2])}</span><div class="tx__main"><div class="tx__title">${n[0]}</div><div class="tx__meta">${n[1]}</div></div><span class="tx__meta">${n[3]}</span></div>`).join('')}
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
