/* BLU Web — Módulo Productos y Financiamiento */

/* Detalle de producto universal (MyProductDetail) — resuelve por ?id= */
Screens['detalle-producto'] = {
  title: 'Detalle de producto',
  render(view) {
    const id = getParam('id') || 'diners';
    const found = findProduct(id) || { type:'card', item: DB.cards[0] };
    const { type, item: p } = found;
    const usedPct = p.cupo ? Math.round((p.usado||0)/p.cupo*100) : 0;
    const movsBy = (name) => { const f = DB.movements.filter(m=>m.card===name); return (f.length?f:DB.movements.slice(0,5)); };
    /* Movimientos con paginador simple (anterior/siguiente + contador). */
    const movsSection = (name, tabs='') => `<div class="list-card section mt-6">
        <div class="list-card__head"><h2 class="h4">Movimientos</h2><div class="row" style="gap:8px">${tabs}${exportChip('movimientos.xlsx')}</div></div>
        <div class="list-card__body" id="mvRows"></div>
        <div class="row between" style="padding:12px 20px;border-top:1px solid var(--line-2)">
          <span class="text-muted" style="font-size:13px" id="mvInfo"></span>
          <div class="row" style="gap:6px"><button class="btn btn--secondary btn--sm" id="mvPrev">${icon('back')} Anterior</button><button class="btn btn--secondary btn--sm" id="mvNext">Siguiente ${icon('chevron')}</button></div>
        </div>
      </div>`;
    function wireMovs(name) {
      const rowsEl = $('#mvRows'); if (!rowsEl) return;
      const list = movsBy(name); const per = 5; let page = 0;
      const pages = Math.max(1, Math.ceil(list.length / per));
      const draw = () => {
        rowsEl.innerHTML = list.slice(page*per, page*per+per).map(UI.txRow).join('');
        $('#mvInfo').textContent = `Mostrando ${page*per+1}–${Math.min((page+1)*per, list.length)} de ${list.length}`;
        $('#mvPrev').disabled = page===0; $('#mvNext').disabled = page>=pages-1;
      };
      $('#mvPrev').onclick = () => { if (page>0){ page--; draw(); } };
      $('#mvNext').onclick = () => { if (page<pages-1){ page++; draw(); } };
      draw();
    }
    /* Barra de acciones compacta (patrón Revolut/N26): íconos circulares.
       Cada acción: [icono, label, ruta] o [icono, label, '', onclickJS]. */
    const actBar = (acts) => `<div class="card card--pad" style="padding:14px 10px"><div class="act-bar">${acts.map(a=>`<button class="act-bar__btn" ${a[3]?`onclick="${a[3]}"`:`data-nav="${a[2]}"`} aria-label="${a[1]}"><span class="act-bar__ic">${icon(a[0])}</span><span class="act-bar__lbl">${a[1]}</span></button>`).join('')}</div></div>`;

    if (type === 'card') {
      const esAdic = p.principal === false;
      view.innerHTML = `
      ${pageHead(p.name, `${esAdic ? 'Tarjeta adicional' : 'Tarjeta principal'} · ···${p.last4}`, 'inicio', `<button class="btn btn--secondary btn--sm" onclick="toast({title:'Estado de cuenta',msg:'${p.name}: enviado a tu correo.',type:'info'})">${icon('download')} Estado de cuenta</button>`)}
      <div class="grid" style="grid-template-columns:340px 1fr;gap:20px;align-items:start">
        <div class="grid dtl-card" style="gap:16px">
          ${UI.bankCard(p)}
          ${actBar([['receipt','Diferir','diferir'],['services','Configurar','config-tarjeta'],['lock','Bloquear','bloqueo'],['gift','Beneficios','beneficios'],['chart','Spend Analyzer','',"toast({title:'Spend Analyzer',msg:'Analiza tus consumos por categoría y comercio.',type:'info'})"],['certificate','Certificado','certificados'],['plus','Solicitar adicional','onboarding-signature']])}
        </div>
        <div class="grid" style="gap:20px">
          ${panel('Detalle de la tarjeta',
            kv('Tipo', esAdic ? 'Adicional' : 'Principal')
            + kv('Fecha de corte', p.corte || '—')
            + kv('Deuda total', money(p.deudaTotal||0), 1)
            + kv('Pago mínimo', money(p.pagoMin), 1)
            + (p.pagoTotal>0
                ? `<div class="detail-cta"><div><div class="text-muted" style="font-size:13px">Total a pagar · hasta ${p.pago}</div><div class="detail-cta__amt num">${money(p.pagoTotal)}</div></div><button class="btn btn--primary" data-nav="pago-tarjeta">Pagar tarjeta</button></div>`
                : `<div class="detail-cta detail-cta--ok">${icon('shield')}<span>Tu tarjeta está al día. No tienes pagos pendientes este mes.</span></div>`))}
          ${infoBanner('El cupo de crédito es global y compartido entre todas las tarjetas Diners de la empresa; por eso no se muestra un cupo por tarjeta.','card')}
        </div>
      </div>
      ${movsSection(p.name, `<div class="segmented"><button class="is-active">Todos</button><button>Corriente</button><button>Diferidos</button></div>`)}`;
      wireMovs(p.name);
      return;
    }

    if (type === 'prepaid') {
      view.innerHTML = `
      ${pageHead(p.name, `Tarjeta prepago · ···${p.last4}`, 'inicio')}
      <div class="grid" style="grid-template-columns:340px 1fr;gap:20px;align-items:start">
        <div class="grid dtl-card" style="gap:16px">
          ${UI.bankCard(p)}
          ${actBar([['eye','Ver datos','',`toast({title:'Datos de la tarjeta',msg:'${p.name} · ${p.number} · titular ${p.titular||'—'}',type:'info'})`],['eyeOff','Desactivar','',"toast({title:'Tarjeta desactivada',msg:'Podrás activarla cuando quieras.',type:'success'})"],['check','Activar','',"toast({title:'Tarjeta activada',msg:'Lista para usar.',type:'success'})"],['lock','Bloquear','bloqueo']])}
        </div>
        <div class="grid" style="gap:20px">
          ${panel('Detalle de la prepago',
            kv('Titular', p.titular||'—')+kv('Tipo', p.type)+kv('Número', '•••• '+p.last4)+kv('Estado','<span class="badge badge--success"><span class="dot"></span>Activa</span>')
            + `<div class="detail-cta"><div><div class="text-muted" style="font-size:13px">Saldo disponible · recargable</div><div class="detail-cta__amt num">${State.masked?'••••':money(p.saldo)}</div></div><button class="btn btn--primary" data-nav="transferencias">Recargar</button></div>`)}
          ${infoBanner('La tarjeta prepago funciona con saldo cargado, no consume cupo de crédito.','card')}
        </div>
      </div>
      ${movsSection(p.name)}`;
      wireMovs(p.name);
      return;
    }

    if (type === 'account') {
      const rate = p.tasa ? kv('Tasa de interés', `<span class="text-success" style="font-weight:700">${p.tasa}</span>`) : '';
      const estadoCtaJs = `toast({title:'Estado de cuenta',msg:'Generado y enviado a tu correo.',type:'info'})`;
      view.innerHTML = `
      ${pageHead(p.name, `${p.type} · ${p.num}`, 'inicio', `<button class="btn btn--secondary btn--sm" onclick="${estadoCtaJs}">${icon('download')} Estado de cuenta</button>`)}
      <div class="grid" style="grid-template-columns:340px 1fr;gap:20px;align-items:start">
        <div class="grid" style="gap:16px">
          <div class="prod-xl acct-card-plain" style="width:100%">
            <div class="prod-xl__body">
              <span class="prod__ic prod__ic--acct" style="margin:0 auto 8px">${icon('wallet')}</span>
              <div class="prod-xl__name">${p.name}</div>
              <div class="prod-xl__id num">${p.type} · ${p.num}</div>
              <div class="prod-xl__amt num" style="font-size:32px;margin-top:16px">${State.masked?'$ ••••••':money(p.saldo)}</div>
              <div class="prod-xl__sub">Saldo disponible</div>
              ${p.interesMes ? `<div class="acct-interes">${icon('arrowUp')} <strong class="num">${money(p.interesMes, true)}</strong> este mes</div>` : (p.tasa ? `<div class="acct-interes">${icon('arrowUp')} ${p.tasa}</div>` : '')}
            </div>
          </div>
          ${actBar([['send','Transferir','transferencias'],['receipt','Pagar','pagos'],['atm','Retirar','retiro-atm'],['services','Configurar','',"toast({title:'Configurar cuenta',msg:'Alias, alertas y preferencias.',type:'info'})"],['certificate','Certificado','certificados']])}
        </div>
        <div class="grid" style="gap:20px">
          ${panel('Detalle de la cuenta', kv('Tipo de cuenta',p.type)+kv('Número',p.num)+rate+kv('Estado','<span class="badge badge--success"><span class="dot"></span>Activa</span>')
            + (p.interesMes
                ? `<div class="detail-cta"><div><div class="text-muted" style="font-size:13px">Rendimiento este mes · ${p.tasa}</div><div class="detail-cta__amt num" style="color:var(--success)">${money(p.interesMes, true)}</div></div><button class="btn btn--primary" data-nav="transferencias">Transferir</button></div>`
                : `<div class="detail-cta"><div class="text-muted" style="font-size:13px">Mueve tu dinero a otras cuentas o bancos</div><button class="btn btn--primary" data-nav="transferencias">Transferir</button></div>`))}
          ${infoBanner('El retiro sin tarjeta desde cuenta aplica solo para personas naturales con RUC.','atm')}
        </div>
      </div>
      ${movsSection('Ahorros')}`;
      wireMovs('Ahorros');
      return;
    }

    if (type === 'credit') {
      const e = creditEstado(p.estado);
      // CTA: en legal/judicial no hay botón de pago; se debe contactar a Diners.
      const cta = e.consultarDiners
        ? `<div class="detail-cta" style="background:var(--warn-bg,#FEF3E2);color:var(--warn,#B7791F)">${icon('alert')}<span style="font-size:13px;font-weight:600">Crédito ${e.label.toLowerCase()}. Comunícate con Diners para conocer tu deuda total y regularizar.</span></div>`
        : `<div class="detail-cta"><div><div class="text-muted" style="font-size:13px">${e.pagoLabel ? e.pagoLabel : 'Próxima cuota · '+p.prox}</div><div class="detail-cta__amt num">${money(p.cuota)}</div></div>${e.pagable?`<button class="btn btn--primary" data-nav="pago-credito">Pagar ${p.estado==='mora'?'ahora':'cuota'}</button>`:''}</div>`;
      view.innerHTML = `
      ${pageHead(p.name, `Crédito · ${p.num}`, 'inicio')}
      <div class="grid" style="grid-template-columns:340px 1fr;gap:20px;align-items:start">
        <div class="grid" style="gap:16px">
          <div class="card card--pad" style="background:var(--grad-card);color:#fff">
            <div class="row between"><span style="font-size:13px;opacity:.85">Crédito · ${p.num}</span>${icon('coins')}</div>
            <div class="text-white" style="font-size:13px;opacity:.85;margin-top:16px">Saldo pendiente</div>
            <div class="num" style="font-size:32px;font-weight:800">${e.consultarDiners ? 'Consultar' : money(p.saldo)}</div>
            <div style="margin-top:12px"><span class="badge ${e.cls}"><span class="dot"></span>${e.label}</span></div>
          </div>
          ${e.consultarDiners ? actBar([['certificate','Certificado','certificados'],['services','Contactar','contactenos']]) : actBar([['coins','Abonar','precancelacion'],['certificate','Certificado','certificados']])}
        </div>
        <div class="grid" style="gap:20px">
          ${panel('Estado del crédito',
            (e.consultarDiners ? '' : `<div class="progress mb-2"><span style="width:37%"></span></div><div class="text-muted" style="font-size:12px">${p.plazo!=='—'?p.plazo.replace('/',' de ')+' cuotas pagadas':''}</div><div class="divider"></div>`)
            + kv('Estado', `<span class="badge ${e.cls}"><span class="dot"></span>${e.label}</span>`)
            + (p.cuota>0 ? kv('Cuota mensual',money(p.cuota),1) : '')
            + kv('Fecha máxima de pago', p.prox)
            + cta)}
          ${e.consultarDiners ? infoBanner(`Este crédito está ${e.label.toLowerCase()}. El saldo total y las condiciones se gestionan directamente con Diners Club.`,'alert') : infoBanner('Puedes abonar a capital para reducir tu plazo o cuota.','coins')}
        </div>
      </div>
      ${movsSection(p.name)}`;
      wireMovs(p.name);
      return;
    }

    // investment
    view.innerHTML = `
    ${pageHead(p.name, 'Inversión a plazo fijo', 'inicio')}
    <div class="grid" style="grid-template-columns:340px 1fr;gap:20px;align-items:start">
      <div class="grid" style="gap:16px">
        <div class="card card--pad" style="background:var(--grad-card);color:#fff">
          <div class="row between"><span style="font-size:13px;opacity:.85">Inversión · plazo fijo</span>${icon('chart')}</div>
          <div class="text-white" style="font-size:13px;opacity:.85;margin-top:16px">Monto invertido</div>
          <div class="num" style="font-size:32px;font-weight:800">${State.masked?'••••••':money(p.monto)}</div>
          <div style="margin-top:12px"><span class="prod-xl__cover-rate">${p.tasa}</span></div>
        </div>
        ${actBar([['chart','Simular','sim-credito'],['plus','Nueva','ofertas']])}
      </div>
      <div class="grid" style="gap:20px">
        ${panel('Detalle de la inversión', kv('Tasa anual',`<span class="text-success" style="font-weight:700">${p.tasa}</span>`)+kv('Vencimiento',p.vence)+kv('Estado','<span class="badge badge--success"><span class="dot"></span>Vigente</span>')
          + `<div class="detail-cta"><div><div class="text-muted" style="font-size:13px">Rendimiento estimado · ${p.vence}</div><div class="detail-cta__amt num" style="color:var(--success)">${money(p.monto*0.0725)}</div></div><button class="btn btn--primary" data-nav="sim-credito">Simular</button></div>`)}
      </div>
    </div>
    ${movsSection(p.name)}`;
    wireMovs(p.name);
  }
};

/* Activar tarjeta */
Screens['activar-tarjeta'] = {
  title: 'Activar tarjeta',
  render(view) {
    view.innerHTML = `
    ${pageHead('Activar tarjeta','Ingresa los datos para activar tu nueva tarjeta.','tarjetas')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="field"><label>Selecciona la tarjeta <span class="req">*</span></label><div class="control">${icon('card')}<select><option>Diners Club ···4417 (Inactiva)</option></select>${icon('chevronDown')}</div></div>
        <div class="field"><label>Últimos 4 dígitos <span class="req">*</span></label><div class="control">${icon('lock')}<input inputmode="numeric" maxlength="4" placeholder="4417"></div></div>
        <div class="field"><label>Fecha de expiración <span class="req">*</span></label><div class="control">${icon('calendar')}<input placeholder="MM/AA" maxlength="5"></div></div>
        <div class="field"><label>Crea tu clave de 4 dígitos <span class="req">*</span></label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:44px;text-align:center;font-size:20px;font-weight:700">').join('')}</div><span class="hint">Evita secuencias como 1234 o fechas.</span></div>
        <button class="btn btn--primary btn--lg btn--block" id="actBtn">Activar tarjeta</button>`)}
      ${infoBanner('Tu clave viaja cifrada y nunca se almacena en texto plano. La validaremos con tu token de seguridad.')}
    </div>`;
    const inputs=view.querySelectorAll('.control input[maxlength="1"]'); inputs.forEach((i,x)=>i.oninput=()=>{if(i.value&&inputs[x+1])inputs[x+1].focus();});
    $('#actBtn').onclick=(e)=>{e.currentTarget.classList.add('is-loading');setTimeout(()=>{e.target.classList.remove('is-loading');successModal('Tarjeta activada','Tu Diners Club ···4417 ya está lista para usar.','tarjetas');},1000);};
  }
};

/* Configurar tarjeta */
Screens['config-tarjeta'] = {
  title: 'Configurar tarjeta',
  render(view) {
    const cards = DB.cards;
    const S = {}; cards.forEach(c => S[c.id] = { ecCard:true, ecOnline:true, ecAtm:true, exCard:true, exOnline:false, exAtm:false, notify:true, security:true, limit:1500 });
    let selId = (getParam('id') && cards.find(c=>c.id===getParam('id'))?.id) || cards[0].id;
    const cardOf = id => cards.find(c => c.id === id);
    const grad = v => (typeof CARD_GRAD !== 'undefined' ? CARD_GRAD[v] : null) || 'var(--grad-card)';

    view.innerHTML = `
    ${pageHead('Configurar tarjeta','Controla canales, límites y alertas de cada tarjeta.','tarjetas')}
    <div class="grid" style="grid-template-columns:360px 1fr;gap:20px;align-items:start">
      <div><div class="eyebrow mb-2">Tus tarjetas</div><div id="cfgList" class="grid" style="gap:10px"></div></div>
      <div id="cfgPanel" style="position:sticky;top:calc(var(--topbar-h) + 24px)"></div>
    </div>`;

    function row(c) {
      const active = c.id === selId;
      return `<button class="pcard" data-cfg="${c.id}" style="padding:12px 14px${active ? ';border-color:var(--blu-500);box-shadow:0 0 0 1px var(--blu-500)' : ''}">
        <div class="pcard__art" style="width:56px;height:36px;background:${grad(c.variant)}"><span class="mini-chip" style="top:7px;left:8px;width:11px;height:8px"></span></div>
        <div class="pcard__body"><div class="pcard__name" style="font-size:13px">${c.name}</div><div class="pcard__num">···${c.last4}</div></div>
        ${icon('chevron')}
      </button>`;
    }
    function renderList() {
      $('#cfgList').innerHTML = cards.map(row).join('');
      view.querySelectorAll('[data-cfg]').forEach(b => b.onclick = () => { selId = b.dataset.cfg; renderList(); renderPanel(); });
    }
    function ctl(id, key, label, sub, ic, locked) {
      return `<div class="row between" style="padding:14px 0;border-bottom:1px solid var(--line-2)"><span class="row" style="gap:12px">${icon(ic)}<div><div style="font-weight:500;font-size:14px">${label}${locked?' <span class="text-muted" style="font-size:11px;font-weight:600">· Obligatorio</span>':''}</div><div class="text-muted" style="font-size:12px">${sub}</div></div></span><label class="switch"><input type="checkbox" data-ctl="${key}" ${S[id][key]?'checked':''} ${locked?'checked disabled':''}><span class="track"></span></label></div>`;
    }
    function renderPanel() {
      const c = cardOf(selId), s = S[selId];
      $('#cfgPanel').innerHTML = `
      <div class="card card--pad section">
        <div class="row" style="gap:14px;align-items:center;margin-bottom:8px">
          <div class="pcard__art" style="width:74px;height:48px;background:${grad(c.variant)}"><span class="mini-chip"></span><span class="mini-brand">blu</span></div>
          <div><div class="h4">${c.name}</div><div class="text-muted" style="font-size:13px">${c.type} · ···${c.last4}</div></div>
          <span class="badge badge--success" style="margin-left:auto"><span class="dot"></span>Activa</span>
        </div>
        <div class="mt-6"><div class="eyebrow mb-2">Uso en Ecuador</div>
          ${ctl(c.id,'ecCard','Con la tarjeta','Compras presenciales en el país','card')}
          ${ctl(c.id,'ecOnline','Por internet','Pagos en comercios en línea','bolt')}
          ${ctl(c.id,'ecAtm','Cajero automático','Retiros y avances en ATM','atm')}
        </div>
        <div class="mt-6"><div class="eyebrow mb-2">Uso fuera de Ecuador</div>
          ${ctl(c.id,'exCard','Con la tarjeta','Compras presenciales en el exterior','card')}
          ${ctl(c.id,'exOnline','Por internet','Pagos internacionales en línea','bolt')}
          ${ctl(c.id,'exAtm','Cajero automático','Retiros en ATM en el exterior','atm')}
        </div>
        <div class="mt-6"><div class="eyebrow mb-2">Límite de consumo diario</div>
          <div class="field" style="margin:0"><div class="control">${icon('coins')}<span class="prefix">$</span><input id="cfgLim" inputmode="decimal" value="${s.limit}" aria-label="Límite de consumo diario"></div><span class="hint">Monto máximo permitido por día.</span></div>
        </div>
        <div class="mt-6"><div class="eyebrow mb-2">Alertas</div>
          ${ctl(c.id,'notify','Notificar cada consumo','Push y correo en tiempo real','bell',true)}
          ${ctl(c.id,'security','Alertas de seguridad','Consumos inusuales o riesgo','shield',true)}
        </div>
        <button class="btn btn--secondary btn--block mt-6" data-pin>${icon('lock')} Cambiar PIN</button>
      </div>`;
      wirePanel();
    }
    function wirePanel() {
      const s = S[selId];
      const lim = $('#cfgLim'); if (lim) lim.oninput = () => { s.limit = parseFloat((lim.value||'').replace(',','.')) || 0; };
      view.querySelectorAll('#cfgPanel [data-ctl]').forEach(t => t.onchange = () => { s[t.dataset.ctl] = t.checked; toast({ title: 'Preferencia actualizada', type: 'success' }); });
      const pin = $('#cfgPanel [data-pin]');
      if (pin) pin.onclick = () => {
        const c = cardOf(selId);
        const ov = openModal(`<div class="modal__head"><h3 class="h3">Cambiar PIN</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
          <div class="modal__body"><p class="text-slate">Define un nuevo PIN de 4 dígitos para <strong>${c.name} ···${c.last4}</strong>.</p>
          <div class="field mt-4"><label>Nuevo PIN</label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" type="password" style="width:44px;text-align:center;font-size:20px;font-weight:700">').join('')}</div><span class="hint">Evita secuencias como 1234 o fechas.</span></div></div>
          <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="pinDo">Guardar PIN</button></div>`);
        const inp = ov.querySelectorAll('.control input'); inp.forEach((i,x)=> i.oninput=()=>{ if(i.value && inp[x+1]) inp[x+1].focus(); });
        ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(ov));
        ov.querySelector('#pinDo').onclick = (e) => { e.currentTarget.classList.add('is-loading'); setTimeout(() => { closeModal(ov); toast({ title: 'PIN actualizado', msg: `${c.name} ···${c.last4}`, type: 'success' }); }, 800); };
      };
    }
    renderList(); renderPanel();
  }
};

/* Métodos de pago preferidos */
Screens['metodos-pago'] = {
  title: 'Métodos de pago',
  render(view) {
    view.innerHTML = `
    ${pageHead('Métodos de pago preferidos','Ordena cómo se debitan tus pagos automáticos.','cuentas')}
    ${panel('Prioridad de débito', `
      ${[['Cuenta de Ahorros BLU ···2205','wallet','1'],['Diners Club ···4417','card','2'],['Cuenta Corriente ···7781','wallet','3']].map(m=>`<div class="prod"><span class="badge badge--info" style="width:26px;justify-content:center">${m[2]}</span><span class="prod__ic prod__ic--card">${icon(m[1])}</span><div class="prod__main"><div class="prod__title">${m[0]}</div><div class="prod__sub">Toca para reordenar</div></div><span class="prod__chev">${icon('swap')}</span></div>`).join('')}
      <button class="btn btn--primary mt-4" onclick="toast({title:'Prioridad guardada',type:'success'})">Guardar orden</button>`)}`;
  }
};

/* Tarjetas adicionales */
Screens['tarjetas-adicionales'] = {
  title: 'Tarjetas adicionales',
  render(view) {
    view.innerHTML = `
    ${pageHead('Tarjetas adicionales','Administra las tarjetas de tus beneficiarios.','tarjetas', `<button class="btn btn--primary btn--sm" data-nav="solicitud-tarjeta">${icon('plus')} Nueva adicional</button>`)}
    <div class="grid grid-2">
      ${[['Andrés Robles','···5521','$800','active'],['Sofía Robles','···5522','$500','active']].map(a=>`<div class="card card--pad card--hover"><div class="row between"><span class="avatar">${a[0].split(' ').map(x=>x[0]).join('')}</span><span class="badge badge--success"><span class="dot"></span>Activa</span></div><div class="mt-4"><div class="h4">${a[0]}</div><div class="text-muted" style="font-size:13px">Diners Club ${a[1]}</div></div><div class="row between mt-4"><div><div class="text-muted" style="font-size:12px">Cupo asignado</div><div class="num" style="font-weight:700">${a[2]}</div></div><button class="btn btn--secondary btn--sm" data-nav="config-tarjeta">Gestionar</button></div></div>`).join('')}
    </div>`;
  }
};

/* Solicitud de tarjeta (adicional / nueva) */
Screens['solicitud-tarjeta'] = {
  title: 'Solicitud de tarjeta',
  render(view) {
    view.innerHTML = `
    ${pageHead('Solicitar tarjeta adicional','Completa los datos del beneficiario.','tarjetas-adicionales')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="grid grid-2" style="gap:12px 16px">
          <div class="field" style="margin:0"><label>Nombres <span class="req">*</span></label><div class="control">${icon('user')}<input placeholder="Nombres"></div></div>
          <div class="field" style="margin:0"><label>Apellidos <span class="req">*</span></label><div class="control">${icon('user')}<input placeholder="Apellidos"></div></div>
        </div>
        <div class="field mt-4"><label>Cédula <span class="req">*</span></label><div class="control">${icon('file')}<input inputmode="numeric" placeholder="0102030405"></div></div>
        <div class="grid grid-2" style="gap:12px 16px">
          <div class="field" style="margin:0"><label>Celular <span class="req">*</span></label><div class="control">${icon('phone')}<input inputmode="numeric" placeholder="099 000 0000"></div></div>
          <div class="field" style="margin:0"><label>Correo electrónico <span class="req">*</span></label><div class="control">${icon('receipt')}<input type="email" placeholder="correo@empresa.com"></div></div>
        </div>
        <div class="field mt-4"><label>Cupo a asignar</label><div class="control">${icon('coins')}<span class="prefix">$</span><input id="cupoInput" inputmode="decimal" value="500" placeholder="0,00"></div><span class="hint">Del cupo disponible ${money(DB.cards[0].disponible)}.</span></div>
        <button class="btn btn--primary btn--lg btn--block" id="solBtn">Enviar solicitud</button>`)}
      ${infoBanner('La emisión toma de 3 a 5 días hábiles. Recibirás la tarjeta en tu dirección registrada.','clock')}
    </div>`;
    $('#solBtn').onclick=(e)=>{e.currentTarget.classList.add('is-loading');setTimeout(()=>{e.target.classList.remove('is-loading');successModal('Solicitud enviada','Revisaremos tu solicitud y te avisaremos por correo.','tarjetas-adicionales');},1000);};
  }
};

/* Beneficios */
Screens['beneficios'] = {
  title: 'Beneficios',
  render(view) {
    const b=[['Salas VIP','Aeropuertos','plane'],['Seguro de viaje','Cobertura internacional','shield'],['2x1 restaurantes','Club de descuentos','gift'],['Cashback 3%','Supermercados','cash'],['Asistencia 24/7','Médica y vial','headset'],['Millas','Aerolíneas aliadas','sparkles']];
    view.innerHTML = `
    ${pageHead('Beneficios de tu tarjeta','Todo lo que tu Diners Club incluye.','tarjetas')}
    <div class="grid grid-3">${b.map(x=>`<div class="card card--pad card--hover section"><span class="qa__ic">${icon(x[2])}</span><div class="h4 mt-4">${x[0]}</div><div class="text-muted" style="font-size:13px">${x[1]}</div></div>`).join('')}</div>`;
  }
};

/* Diferir consumos (Novations) */
Screens['diferir'] = {
  title: 'Diferir consumos',
  render(view) {
    const cons=[['Almacenes TIA','$420,00','12 jul'],['Tecnología XPC','$899,90','10 jul'],['Viajes TotalTravel','$1.240,00','08 jul']];
    view.innerHTML = `
    ${pageHead('Diferir consumos','Convierte tus compras corrientes a cuotas.','tarjetas')}
    <div class="grid" style="grid-template-columns:1fr 360px;align-items:start">
      <div class="list-card"><div class="list-card__head"><h2 class="h4">Consumos elegibles</h2></div><div class="list-card__body">
        ${cons.map((c,i)=>`<label class="prod" style="cursor:pointer"><input type="radio" name="cons" ${i===0?'checked':''} data-amt="${c[1]}"><span class="prod__ic prod__ic--card">${icon('store')}</span><div class="prod__main"><div class="prod__title">${c[0]}</div><div class="prod__sub">${c[2]}</div></div><div class="prod__amt num">${c[1]}</div></label>`).join('')}
      </div></div>
      ${panel('Simulación', `
        <div class="field"><label>Plazo</label><div class="row wrap" style="gap:8px">${[3,6,9,12,18,24].map((p,i)=>`<button class="chip ${i===3?'is-active':''}" data-plazo="${p}">${p} meses</button>`).join('')}</div></div>
        <div class="sum-row"><span class="k">Monto a diferir</span><span class="v num" id="dfMonto">$420,00</span></div>
        <div class="sum-row"><span class="k">Tasa anual</span><span class="v">15,90%</span></div>
        <div class="sum-total"><div><div class="text-muted" style="font-size:12px">Cuota mensual (12m)</div><div class="v num" id="dfCuota">$38,20</div></div><button class="btn btn--primary" id="dfBtn">Diferir</button></div>`)}
    </div>`;
    let amt=420, plazo=12;
    function recalc(){ const cuota=(amt*(1+0.159*plazo/12))/plazo; $('#dfMonto').textContent='$'+amt.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); $('#dfCuota').textContent='$'+cuota.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); }
    view.querySelectorAll('[data-amt]').forEach(r=>r.onchange=()=>{amt=parseFloat(r.dataset.amt.replace(/[$.]/g,'').replace(',','.'));recalc();});
    view.querySelectorAll('[data-plazo]').forEach(b=>b.onclick=()=>{view.querySelectorAll('[data-plazo]').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');plazo=+b.dataset.plazo;recalc();});
    $('#dfBtn').onclick=()=>successModal('Consumo diferido',`Tu compra quedó diferida a ${plazo} meses.`,'tarjetas');
  }
};

/* Precancelación de diferidos */
Screens['precancelacion'] = {
  title: 'Precancelación',
  render(view) {
    view.innerHTML = `
    ${pageHead('Precancelar diferidos','Paga por adelantado y ahorra en intereses.','tarjetas')}
    <div class="grid" style="grid-template-columns:1fr 360px;align-items:start">
      <div class="list-card"><div class="list-card__head"><h2 class="h4">Diferidos activos</h2></div><div class="list-card__body">
        ${[['Viajes TotalTravel','8/12 cuotas','$620,00'],['Tecnología XPC','3/6 cuotas','$450,00']].map((d,i)=>`<label class="prod" style="cursor:pointer"><input type="radio" name="dif" ${i===0?'checked':''}><span class="prod__ic prod__ic--credit">${icon('coins')}</span><div class="prod__main"><div class="prod__title">${d[0]}</div><div class="prod__sub">${d[1]}</div></div><div class="prod__amt num">${d[2]}</div></label>`).join('')}
      </div></div>
      ${panel('Detalle de precancelación', kv('Saldo pendiente','$620,00',1)+`<div class="sum-row"><span class="k">Intereses no devengados</span><span class="v num text-success">− $34,80</span></div>`+`<div class="sum-total"><span class="k">Total a pagar hoy</span><span class="v num">$585,20</span></div><button class="btn btn--primary btn--block mt-4" onclick="successModal('Precancelación exitosa','Ahorraste $34,80 en intereses.','tarjetas')">Precancelar</button>`)}
    </div>`;
  }
};

/* Avance de facturación */
Screens['avance-facturacion'] = {
  title: 'Avance de facturación',
  render(view) {
    view.innerHTML = `
    ${pageHead('Avance de facturación','Adelanta tu cupo disponible a tu cuenta.','tarjetas')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="field"><label>Monto a solicitar</label><div class="control"><span class="prefix">$</span><input id="avMonto" inputmode="decimal" placeholder="0,00" value="500,00"></div><span class="hint">Cupo disponible: ${money(DB.cards[0].disponible)}</span></div>
        <div class="field"><label>Acreditar en</label><div class="control">${icon('wallet')}<select><option>Ahorros BLU ···2205</option></select>${icon('chevronDown')}</div></div>
        <div class="field"><label>Plazo</label><div class="scroll-x">${[3,6,9,12].map((p,i)=>`<button class="chip ${i===1?'is-active':''}">${p} meses</button>`).join('')}</div></div>
        <button class="btn btn--primary btn--lg btn--block" onclick="successModal('Avance acreditado','$500,00 fueron acreditados a tu cuenta de ahorros.','cuentas')">Solicitar avance</button>`)}
      ${panel('Resumen', kv('Monto','$500,00',1)+kv('Tasa','16,40%')+kv('Plazo','6 meses')+kv('Cuota estimada','$88,90',1))}
    </div>`;
  }
};

/* Avance de efectivo + simulador */
Screens['avance-efectivo'] = {
  title: 'Avance de efectivo',
  render(view) {
    view.innerHTML = `
    ${pageHead('Avance de efectivo','Simula y solicita efectivo con tu tarjeta.','tarjetas')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('Simulador', `
        <div class="row between mb-2"><span class="text-muted">Monto</span><span class="h3 num" id="aeVal">$300</span></div>
        ${slider('aeSlider',50,2000,300,50)}
        <div class="row between mt-2" style="font-size:12px;color:var(--muted)"><span>$50</span><span>$2.000</span></div>
        <div class="field mt-6"><label>Plazo</label><div class="scroll-x" id="aePlazo">${[1,3,6,12].map((p,i)=>`<button class="chip ${i===1?'is-active':''}" data-p="${p}">${p===1?'1 mes':p+' meses'}</button>`).join('')}</div></div>
        <button class="btn btn--primary btn--lg btn--block mt-2" onclick="successModal('Avance solicitado','Recibirás el efectivo disponible en cajeros BLU.','tarjetas')">Solicitar avance</button>`)}
      ${panel('Resultado', kv('Monto','<span id="aeR1">$300,00</span>',1)+kv('Interés','16,90%')+kv('Cuota mensual','<span id="aeR2">$104,20</span>',1)+kv('Total a pagar','<span id="aeR3">$312,60</span>',1))}
    </div>`;
    let m=300,p=3;
    function calc(){ const total=m*(1+0.169*p/12); const cuota=total/p; $('#aeVal').textContent='$'+m.toLocaleString('es-EC'); $('#aeR1').textContent='$'+m.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); $('#aeR2').textContent='$'+cuota.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); $('#aeR3').textContent='$'+total.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); }
    $('#aeSlider').oninput=(e)=>{m=+e.target.value;calc();};
    view.querySelectorAll('#aePlazo [data-p]').forEach(b=>b.onclick=()=>{view.querySelectorAll('#aePlazo .chip').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');p=+b.dataset.p;calc();});
  }
};

/* Simulador de crédito */
Screens['sim-credito'] = {
  title: 'Simulador de crédito',
  render(view) {
    view.innerHTML = `
    ${pageHead('Simulador de crédito','Calcula tu cuota antes de solicitar.','cuentas')}
    <div class="grid" style="grid-template-columns:1fr 360px;align-items:start">
      ${panel('Personaliza tu crédito', `
        <div class="row between mb-2"><span class="text-muted">Monto del crédito</span><span class="h3 num" id="scVal">$10.000</span></div>
        ${slider('scMonto',1000,30000,10000,500)}
        <div class="field mt-6"><label>Plazo (meses)</label><div class="scroll-x" id="scPlazo">${[12,24,36,48,60].map((p,i)=>`<button class="chip ${i===2?'is-active':''}" data-p="${p}">${p}</button>`).join('')}</div></div>
        <div class="field"><label>Destino</label><div class="control">${icon('sparkles')}<select><option>Libre inversión</option><option>Vehículo</option><option>Vivienda</option><option>Educación</option></select>${icon('chevronDown')}</div></div>
        <button class="btn btn--primary btn--lg btn--block" onclick="successModal('Solicitud en revisión','Un asesor validará tu crédito preaprobado.','cuentas')">Solicitar crédito</button>`)}
      <div class="card card--pad section" style="background:var(--grad-sky);color:#fff">
        <div style="font-size:13px;opacity:.9">Cuota mensual estimada</div>
        <div class="num" style="font-size:36px;font-weight:800" id="scCuota">$312,00</div>
        <div class="divider" style="background:rgba(255,255,255,.25)"></div>
        <div class="row between" style="font-size:13px;opacity:.95"><span>Tasa anual</span><span class="num">11,20%</span></div>
        <div class="row between mt-2" style="font-size:13px;opacity:.95"><span>Total a pagar</span><span class="num" id="scTotal">$11.232,00</span></div>
        <div class="row between mt-2" style="font-size:13px;opacity:.95"><span>Plazo</span><span id="scP">36 meses</span></div>
      </div>
    </div>`;
    let m=10000,p=36,r=0.112;
    function calc(){ const i=r/12; const cuota=m*i/(1-Math.pow(1+i,-p)); const total=cuota*p; $('#scVal').textContent='$'+m.toLocaleString('es-EC'); $('#scCuota').textContent='$'+cuota.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); $('#scTotal').textContent='$'+total.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2}); $('#scP').textContent=p+' meses'; }
    $('#scMonto').oninput=(e)=>{m=+e.target.value;calc();};
    view.querySelectorAll('#scPlazo [data-p]').forEach(b=>b.onclick=()=>{view.querySelectorAll('#scPlazo .chip').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');p=+b.dataset.p;calc();});
    calc();
  }
};
