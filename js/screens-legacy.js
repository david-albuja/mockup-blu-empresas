/* ============================================================
   BLU Web — Pantallas "Antes": réplica fiel de la app ACTUAL
   Fuente: repo Azure ec-diners-front-web (master)
   - Login              → pages/_components/FormSignIn (render.js + style.sass)
   - Inicio             → pages/MyProducts (Tengo/Debo + aval + paneles)
   - NavBar             → components/NavBar/style.sass (menú horizontal, sin sidebar)
   - Tarjetas           → pages/MyCreditCards/style.sass (paneles 5px, sombra rgba(76,113,252,.2))
   - Bloqueo            → pages/LockUnlockCards/style.sass (contenedor 560px centrado)
   - Admin. usuarios    → components/Table/style.sass (header lavender, filas cebra)
   Todas las demás (Cuentas, Transferencias, Pagos, Pago tarjeta, Perfil,
   Recompensas, Contactos) siguen el mismo lenguaje visual confirmado arriba
   (paneles blancos, sombra azul suave, radios 5-10px, Roboto, picton-blue).
   Solo visual: los CTA de detalle informan que la funcionalidad vive en el rediseño.
   ============================================================ */

const lgcInfo = () => toast({ title: 'Réplica de la app actual', msg: 'Vista de referencia (repo Azure). Explora la funcionalidad en el rediseño.', type: 'info' });
const lgcLogo = () => `<div class="lgc-logo">${dinersMark(38, '#2E5BFF')}<div class="lgc-logo__text">Diners Club<small>INTERNATIONAL · BLU</small></div></div>`;
const lgcCompare = (to) => `<button class="lgc-compare" data-nav="${to}">${icon('sparkles')} Ver rediseño</button><span class="lgc-flag">Antes · app actual (repo)</span>`;

/* ---- Helpers compartidos por las pantallas "antes" (prefijo lgc para no chocar con app.js) ---- */
const ANTES_MENU = [
  ['antes-inicio', 'Inicio'], ['antes-tarjetas', 'Tarjetas'], ['antes-cuentas', 'Cuentas'],
  ['antes-transferencias', 'Transferencias'], ['antes-pagos', 'Pagos'], ['antes-pago-tarjeta', 'Pago tarjeta'],
  ['antes-bloqueo', 'Bloqueo'], ['antes-contactos', 'Contactos'], ['antes-recompensas', 'Recompensas'],
  ['antes-admin-usuarios', 'Usuarios'], ['antes-perfil', 'Perfil'],
];
const SHADOW = '0 5px 17px 0 rgba(76,113,252,0.2)'; /* $color__box-shadow del repo */
function lgcPanelBox(inner, style = '') { return `<div class="lgc-panel" style="box-shadow:${SHADOW};border-radius:5px;${style}">${inner}</div>`; }
function lgcPanel(title, rows) { return `<div class="lgc-panel-wrapper"><div class="lgc-panel" style="box-shadow:${SHADOW}"><div class="lgc-panel__header">${title}</div><div class="lgc-panel__content">${rows}</div></div></div>`; }
function lgcRow(name, sub, amt, cta = 'Ver') { return `<div class="lgc-row"><div><div class="lgc-row__name">${name}</div>${sub ? `<div class="lgc-row__sub">${sub}</div>` : ''}</div><div class="lgc-row__amt">${amt}</div><button class="lgc-btn-line" data-lgc>${cta}</button></div>`; }
function lgcMeter(segs) { return `<div class="lgc-meter">${segs.map(([w, c]) => `<span style="width:${w}%;background:${c}"></span>`).join('')}</div>`; }
function lgcField(label, inputHtml) { return `<div class="lgc-field"><label>${label}</label><div class="lgc-input">${inputHtml}</div></div>`; }
const lgcInputStyle = 'width:100%;height:42px;border:1px solid rgba(109,114,120,.5);border-radius:5px;padding:0 12px;font:inherit;font-size:14px;color:#4A4A4A;background:#fff';
function lgcSelect(options) { return `<select style="${lgcInputStyle}">${options.map(o => `<option>${o}</option>`).join('')}</select>`; }

/* Shell horizontal (NavBar real: logo | perfil arriba, menú centrado debajo, sin sidebar) */
function legacyShell(active, title, body, headerAction = '') {
  return `
  <div class="lgc">
    <header class="lgc-topbar">${lgcLogo()}
      <div class="row" style="gap:14px;align-items:center">
        <button class="icon-btn" data-lgc aria-label="Notificaciones" style="color:#6D7278">${icon('bell')}</button>
        <div class="lgc-profile" data-lgc><span class="lgc-avatar">MR</span> María Fernanda ${icon('chevronDown')}</div>
      </div>
    </header>
    <nav class="lgc-menu">${ANTES_MENU.map(([r, l]) => `<button class="${r === active ? 'act' : ''}" data-nav="${r}">${l}</button>`).join('')}</nav>
    <main class="lgc-main">
      <div class="row between wrap" style="margin-bottom:20px;gap:12px"><h1 class="lgc-h1" style="margin-bottom:0">${title}</h1>${headerAction}</div>
      ${body}
    </main>
    ${lgcCompare(newEquivalent(active))}
  </div>`;
}

/* ---------- LOGIN actual (FormSignIn) ---------- */
Screens['antes-login'] = {
  title: 'Login — app actual', full: true,
  render(view) {
    view.innerHTML = `
    <div class="lgc-login-page">
      <div class="lgc-login-card">
        <div class="lgc-login-body">
          <div class="lgc-login-logo">${lgcLogo()}</div>
          <span class="lgc-login-title">¡Bienvenido!</span>
          <form id="lgcForm">
            <div class="lgc-field"><label for="lgcUser">Usuario</label>
              <div class="lgc-input"><input id="lgcUser" placeholder="Ingresa tu usuario" maxlength="20"></div></div>
            <div class="lgc-field"><label for="lgcPass">Contraseña</label>
              <div class="lgc-input"><input id="lgcPass" type="password" placeholder="Ingresa tu contraseña" maxlength="20">
                <button type="button" class="eye" id="lgcEye" aria-label="Mostrar contraseña">${icon('eye')}</button></div></div>
            <button class="lgc-btn-primary" type="submit" id="lgcSubmit" disabled>Ingresar</button>
          </form>
          <div class="lgc-forget"><button class="lgc-link" type="button" id="lgcForget">¿Olvidaste tu contraseña?</button></div>
        </div>
        <div class="lgc-login-footer">
          <div><button type="button" id="lgcCreate">Crear cuenta</button></div>
          <div><button type="button" id="lgcHelp">Ayuda</button></div>
        </div>
      </div>
      ${lgcCompare('login')}
    </div>`;

    const u = $('#lgcUser'), p = $('#lgcPass'), s = $('#lgcSubmit');
    // Fiel al repo: el botón queda DISABLED hasta que ambos campos tengan valor
    const check = () => { s.disabled = !(u.value.trim() && p.value.trim()); };
    u.oninput = check; p.oninput = check;
    $('#lgcEye').onclick = (e) => { const show = p.type === 'password'; p.type = show ? 'text' : 'password'; e.currentTarget.innerHTML = icon(show ? 'eyeOff' : 'eye'); };
    $('#lgcForm').onsubmit = (e) => { e.preventDefault(); location.hash = '#/antes-inicio'; };
    ['lgcForget', 'lgcCreate', 'lgcHelp'].forEach(id => { $('#' + id).onclick = lgcInfo; });
  }
};

/* ---------- INICIO actual (MyProducts) ---------- */
Screens['antes-inicio'] = {
  title: 'Inicio — app actual', full: true,
  render(view) {
    const tengo = DB.accounts.reduce((s, a) => s + a.saldo, 0) + DB.investments.reduce((s, i) => s + i.monto, 0);
    const debo = DB.cards.reduce((s, c) => s + c.pagoTotal, 0) + DB.credits.reduce((s, c) => s + c.saldo, 0);
    const fecha = new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });

    const body = `
      <div class="lgc-amounts">
        <div class="lgc-amt">
          <div class="lgc-amt__label">Tengo ${icon('info')}</div>
          <div class="lgc-amt__value">${money(tengo)}</div>
          ${lgcMeter([[55, '#4C71FC'], [28, '#32C5FF'], [17, '#44AAFF']])}
        </div>
        <div class="lgc-amt--btn"><button class="lgc-toggle" id="lgcToggle" aria-label="Ver detalle">${icon('chevron')}</button></div>
        <div class="lgc-amt">
          <div class="lgc-amt__label">Debo ${icon('info')}</div>
          <div class="lgc-amt__value">${money(debo)}</div>
          ${lgcMeter([[70, '#D0161F'], [30, '#F6B420']])}
        </div>
      </div>

      <div class="lgc-detail" id="lgcDetail">
        <div class="lgc-detail__col lgc-detail__col--have">
          ${lgcPanelBox(`<div class="lgc-panel__header">Lo que tengo</div><div class="lgc-panel__content">
            ${lgcRow('Cuentas', DB.accounts.length + ' productos', money(DB.accounts.reduce((s, a) => s + a.saldo, 0)))}
            ${lgcRow('Inversiones', DB.investments.length + ' productos', money(DB.investments.reduce((s, i) => s + i.monto, 0)))}
          </div>`)}
        </div>
        <div class="lgc-detail__col lgc-detail__col--debt">
          ${lgcPanelBox(`<div class="lgc-panel__header">Lo que debo</div><div class="lgc-panel__content">
            ${lgcRow('Tarjetas de crédito', DB.cards.length + ' tarjetas', money(DB.cards.reduce((s, c) => s + c.pagoTotal, 0)))}
            ${lgcRow('Créditos', '1 producto', money(DB.credits[0].saldo))}
          </div>`)}
        </div>
      </div>

      <div class="lgc-aval">
        <div class="lgc-amt__label" style="justify-content:center">Patrimonio ${icon('info')}</div>
        <div class="lgc-aval__value">${money(tengo - debo)}</div>
        <div class="lgc-aval__date">Última actualización: ${fecha}</div>
      </div>

      <div class="lgc-cards">
        <div class="lgc-cards__title">Mis productos</div>
        ${lgcPanel('Tarjetas de crédito', DB.cards.slice(0, 2).map(c => lgcRow(c.name, '···' + c.last4 + ' · Disponible', money(c.disponible))).join(''))}
        ${lgcPanel('Cuentas', DB.accounts.slice(0, 2).map(a => lgcRow(a.name, a.num, money(a.saldo))).join(''))}
        ${lgcPanel('Créditos', lgcRow(DB.credits[0].name, '··· 0091 · Saldo pendiente', money(DB.credits[0].saldo)))}
        ${lgcPanel('Inversiones', DB.investments.slice(0, 2).map(i => lgcRow(i.name, 'Tasa ' + i.tasa, money(i.monto))).join(''))}
        ${lgcPanel('Contratar', `<div class="lgc-row"><div><div class="lgc-row__name">Tarjeta Diners Club Signature</div><div class="lgc-row__sub">Solicítala 100% en línea</div></div><button class="lgc-btn-line" data-lgc>Lo quiero</button></div>`)}
      </div>`;

    view.innerHTML = legacyShell('antes-inicio', 'Hola, ' + DB.user.first, body);
    const tg = $('#lgcToggle'), dt = $('#lgcDetail');
    tg.onclick = () => { const open = dt.classList.toggle('open'); tg.classList.toggle('open', open); };
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- TARJETAS actual (MyCreditCards) ---------- */
Screens['antes-tarjetas'] = {
  title: 'Tarjetas — app actual', full: true,
  render(view) {
    const body = `
      <div class="row" style="align-items:flex-start;gap:40px;flex-wrap:wrap">
        <div style="max-width:696px;flex:2;min-width:280px">
          ${DB.cards.map(c => {
            const pct = Math.round(c.usado / c.cupo * 100);
            return lgcPanelBox(`
              <div style="padding:20px">
                <div class="row between" style="margin-bottom:14px"><div class="row" style="gap:10px">${icon('card', '')}<span style="font-weight:500;font-size:16px">${c.name} ···${c.last4}</span></div><button class="lgc-btn-line" data-lgc>Movimientos</button></div>
                ${lgcRow('Disponible', '', money(c.disponible), 'Detalle')}
                ${lgcRow('Saldo actual', 'Pago mínimo ' + money(c.pagoMin), money(c.pagoTotal), 'Pagar')}
                ${lgcRow('Fecha de pago', '', c.pago, 'Detalle')}
                <div style="margin-top:6px">${lgcMeter([[pct, '#4C71FC'], [100 - pct, '#d8d8d8']])}</div>
              </div>`, 'margin-bottom:20px');
          }).join('')}
        </div>
        <div style="max-width:200px;width:100%">
          ${lgcPanelBox(`<div style="padding:20px;text-align:center"><div style="font-weight:500;margin-bottom:10px">Tarjeta Diners Club Signature</div><div style="font-size:12px;color:#6D7278;margin-bottom:15px">Cupo preaprobado</div><div style="font-weight:700;font-size:18px;margin-bottom:15px">$8.000,00</div><button class="lgc-btn-line" data-lgc>Lo quiero</button></div>`)}
        </div>
      </div>`;
    const action = `<button class="lgc-btn-line" data-lgc style="min-width:150px">${icon('plus')} Solicitar tarjeta</button>`;
    view.innerHTML = legacyShell('antes-tarjetas', 'Mis tarjetas de crédito', body, action);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- CUENTAS actual ---------- */
Screens['antes-cuentas'] = {
  title: 'Cuentas — app actual', full: true,
  render(view) {
    const body = `<div class="lgc-cards">
      ${lgcPanel('Cuentas', DB.accounts.map(a => lgcRow(a.name, a.type + ' · ' + a.num, money(a.saldo))).join(''))}
      ${lgcPanel('Créditos', DB.credits.map(c => lgcRow(c.name, 'Cuota ' + c.plazo, money(c.saldo))).join(''))}
      ${lgcPanel('Inversiones', DB.investments.map(i => lgcRow(i.name, 'Tasa ' + i.tasa, money(i.monto))).join(''))}
    </div>`;
    view.innerHTML = legacyShell('antes-cuentas', 'Mis cuentas y créditos', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- TRANSFERENCIAS actual ---------- */
Screens['antes-transferencias'] = {
  title: 'Transferencias — app actual', full: true,
  render(view) {
    const body = lgcPanelBox(`<div style="padding:24px;max-width:480px">
      ${lgcField('Cuenta origen', lgcSelect(DB.accounts.map(a => a.name + ' ' + a.num)))}
      ${lgcField('Destinatario', lgcSelect(DB.contacts.map(c => c.name + ' — ' + c.bank)))}
      ${lgcField('Monto', `<input style="${lgcInputStyle}" placeholder="$0,00">`)}
      ${lgcField('Concepto (opcional)', `<input style="${lgcInputStyle}" placeholder="Ej. Pago arriendo">`)}
      <button class="lgc-btn-primary" data-lgc>Transferir</button>
    </div>`);
    view.innerHTML = legacyShell('antes-transferencias', 'Transferir dinero', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- PAGO DE SERVICIOS actual ---------- */
Screens['antes-pagos'] = {
  title: 'Pagos — app actual', full: true,
  render(view) {
    const body = lgcPanelBox(`<div style="border-radius:5px;overflow:hidden">
      ${DB.services.map((s, i) => `<div class="lgc-row" style="padding:14px 20px;background:${i % 2 ? 'rgba(236,240,255,.4)' : '#fff'};margin:0">
        <div><div class="lgc-row__name">${s.name}</div><div class="lgc-row__sub">${s.ref}</div></div>
        <div class="lgc-row__amt">${money(s.due)}</div>
        <button class="lgc-btn-line" data-lgc>${s.due > 0 ? 'Pagar' : 'Al día'}</button>
      </div>`).join('')}
    </div>`);
    view.innerHTML = legacyShell('antes-pagos', 'Pago de servicios', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- PAGO DE TARJETA actual ---------- */
Screens['antes-pago-tarjeta'] = {
  title: 'Pago de tarjeta — app actual', full: true,
  render(view) {
    const c = DB.cards[0];
    const body = lgcPanelBox(`<div style="padding:24px;max-width:480px">
      ${lgcField('Tarjeta', lgcSelect(DB.cards.map(x => x.name + ' ···' + x.last4)))}
      <div class="lgc-field"><label>Valor a pagar</label>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;color:#4A4A4A">
          <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="radio" name="lgcpt" checked> Pago total (${money(c.pagoTotal)})</label>
          <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="radio" name="lgcpt"> Pago mínimo (${money(c.pagoMin)})</label>
          <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="radio" name="lgcpt"> Otro valor</label>
        </div>
      </div>
      <button class="lgc-btn-primary" data-lgc style="margin-top:6px">Pagar</button>
    </div>`);
    view.innerHTML = legacyShell('antes-pago-tarjeta', 'Pago de tarjeta de crédito', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- BLOQUEO actual (LockUnlockCards: contenedor 560px centrado) ---------- */
Screens['antes-bloqueo'] = {
  title: 'Bloqueo — app actual', full: true,
  render(view) {
    const body = `
      <div style="width:560px;max-width:100%;margin:0 auto">
        <p style="color:#6D7278;font-size:13px;line-height:21px;margin-bottom:25px">Selecciona la tarjeta que deseas bloquear o desbloquear temporalmente.</p>
        ${DB.cards.map(c => lgcPanelBox(`<div style="padding:16px 20px;display:flex;align-items:center;gap:14px">
          <span style="color:#4C71FC">${icon('card')}</span>
          <div style="flex:1"><div style="font-weight:500">${c.name} ···${c.last4}</div><div style="font-size:12px;color:#6D7278;padding-top:6px">Activa</div></div>
          <input type="checkbox" data-lgc style="width:18px;height:18px;cursor:pointer">
        </div>`, 'margin-bottom:14px')).join('')}
      </div>`;
    view.innerHTML = legacyShell('antes-bloqueo', 'Bloqueo y desbloqueo de tarjetas', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- ADMIN. USUARIOS actual (Table: header lavender, filas cebra) ---------- */
Screens['antes-admin-usuarios'] = {
  title: 'Usuarios — app actual', full: true,
  render(view) {
    const USERS = [
      ['Carlos Aguirre', 'Administrador', 'carlos@robles.com', 'active'],
      ['Diana Ruiz', 'Aprobador', 'diana@robles.com', 'active'],
      ['Pedro Lima', 'Operador', 'pedro@robles.com', 'active'],
      ['Marta Solís', 'Consulta', 'marta@robles.com', 'inactive'],
    ];
    const body = lgcPanelBox(`<div style="border-radius:5px;overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr style="background:#ECF0FF;height:50px">
          ${['Usuario', 'Rol', 'Correo', 'Estado', ''].map(h => `<th style="text-align:left;padding:0 14px;border-bottom:1px solid rgba(109,114,120,.15);font-weight:700;font-size:16px">${h}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${USERS.map((u, i) => `<tr style="height:50px;background:${i % 2 ? 'rgba(236,240,255,.4)' : '#fff'}">
            <td style="padding:0 14px">${u[0]}</td><td style="padding:0 14px">${u[1]}</td>
            <td style="padding:0 14px;color:#6D7278">${u[2]}</td>
            <td style="padding:0 14px">${u[3] === 'active' ? 'Activo' : 'Inactivo'}</td>
            <td style="padding:0 14px"><button class="lgc-btn-line" data-lgc>Editar</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`);
    const action = `<button class="lgc-btn-line" data-lgc style="min-width:150px">${icon('plus')} Crear usuario</button>`;
    view.innerHTML = legacyShell('antes-admin-usuarios', 'Administración de usuarios', body, action);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- PERFIL actual ---------- */
Screens['antes-perfil'] = {
  title: 'Perfil — app actual', full: true,
  render(view) {
    const body = lgcPanelBox(`<div style="padding:24px;max-width:480px">
      ${lgcField('Nombre', `<input style="${lgcInputStyle}" value="${DB.user.name}" disabled>`)}
      ${lgcField('Correo electrónico', `<input style="${lgcInputStyle}" value="${DB.user.email}">`)}
      ${lgcField('Teléfono', `<input style="${lgcInputStyle}" value="${DB.user.phone}">`)}
      <button class="lgc-btn-primary" data-lgc>Guardar</button>
    </div>`);
    view.innerHTML = legacyShell('antes-perfil', 'Mi perfil', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- RECOMPENSAS actual ---------- */
Screens['antes-recompensas'] = {
  title: 'Recompensas — app actual', full: true,
  render(view) {
    const body = lgcPanelBox(`<div style="padding:24px;max-width:480px;text-align:center">
      <div style="font-size:13px;color:#6D7278">Puntos disponibles</div>
      <div style="font-size:32px;font-weight:700;margin:10px 0;color:#4A4A4A">${DB.rewards.points.toLocaleString('es-EC')}</div>
      <button class="lgc-btn-line" data-lgc>Ver catálogo de canjes</button>
    </div>`);
    view.innerHTML = legacyShell('antes-recompensas', 'Recompensas Club', body);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};

/* ---------- CONTACTOS actual ---------- */
Screens['antes-contactos'] = {
  title: 'Contactos — app actual', full: true,
  render(view) {
    const body = lgcPanelBox(`<div style="border-radius:5px;overflow:hidden">
      ${DB.contacts.map((c, i) => `<div class="lgc-row" style="padding:12px 20px;margin:0;background:${i % 2 ? 'rgba(236,240,255,.4)' : '#fff'}">
        <div><div class="lgc-row__name">${c.name}</div><div class="lgc-row__sub">${c.bank} · ${c.acc}</div></div>
        <button class="lgc-btn-line" data-lgc>Transferir</button>
      </div>`).join('')}
    </div>`);
    const action = `<button class="lgc-btn-line" data-lgc style="min-width:150px">${icon('plus')} Nuevo contacto</button>`;
    view.innerHTML = legacyShell('antes-contactos', 'Contactos', body, action);
    view.querySelectorAll('[data-lgc]').forEach(b => b.onclick = lgcInfo);
  }
};
