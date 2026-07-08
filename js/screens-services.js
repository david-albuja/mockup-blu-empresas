/* BLU Web — Módulo Servicios */

/* Bloqueo / desbloqueo de tarjetas — master-detail con controles (Azure: crédito/débito) */
Screens['bloqueo'] = {
  title: 'Bloqueo de tarjetas',
  render(view) {
    const credit = DB.cards.map(c => ({ id:c.id, name:c.name, last4:c.last4, variant:c.variant, kind:'Crédito' }));
    const debit = [
      { id:'deb-2205', name:'Débito BLU', last4:'2205', variant:'diners', kind:'Débito' },
      { id:'deb-7781', name:'Débito Corriente', last4:'7781', variant:'indigo', kind:'Débito' },
    ];
    const all = [...credit, ...debit];
    const S = {}; all.forEach(c => S[c.id] = { frozen:false, online:true, abroad:true, atm:true, reported:false });
    let selId = credit[0].id;
    const cardOf = id => all.find(c => c.id === id);
    const grad = v => CARD_GRAD[v] || CARD_GRAD.diners;

    view.innerHTML = `
    ${pageHead('Bloqueo y desbloqueo','Congela o reactiva tus tarjetas y controla sus canales.','inicio')}
    <div class="grid" style="grid-template-columns:360px 1fr;gap:20px;align-items:start" id="blkWrap">
      <div class="grid" style="gap:20px">
        <div><div class="eyebrow mb-2">Tarjetas de crédito</div><div id="blkCredit" class="grid" style="gap:10px"></div></div>
        <div><div class="eyebrow mb-2">Tarjetas de débito</div><div id="blkDebit" class="grid" style="gap:10px"></div></div>
      </div>
      <div id="blkPanel" style="position:sticky;top:calc(var(--topbar-h) + 24px)"></div>
    </div>`;

    function stBadge(id) {
      const s = S[id];
      if (s.reported) return `<span class="badge badge--error"><span class="dot"></span>Reportada</span>`;
      return s.frozen ? `<span class="badge badge--warning"><span class="dot"></span>Congelada</span>` : `<span class="badge badge--success"><span class="dot"></span>Activa</span>`;
    }
    function row(c) {
      const active = c.id === selId;
      return `<button class="pcard" data-blk="${c.id}" style="padding:12px 14px${active ? ';border-color:var(--blu-500);box-shadow:0 0 0 1px var(--blu-500)' : ''}">
        <div class="pcard__art" style="width:56px;height:36px;background:${grad(c.variant)}"><span class="mini-chip" style="top:7px;left:8px;width:11px;height:8px"></span></div>
        <div class="pcard__body"><div class="pcard__name" style="font-size:13px">${c.name}</div><div class="pcard__num">···${c.last4}</div></div>
        ${stBadge(c.id)}
      </button>`;
    }
    function renderList() {
      $('#blkCredit').innerHTML = credit.map(row).join('');
      $('#blkDebit').innerHTML = debit.map(row).join('');
      view.querySelectorAll('[data-blk]').forEach(b => b.onclick = () => { selId = b.dataset.blk; renderList(); renderPanel(); });
    }
    function ctlRow(id, key, label, sub, ic) {
      return `<div class="row between" style="padding:14px 0;border-bottom:1px solid var(--line-2)"><span class="row" style="gap:12px">${icon(ic)}<div><div style="font-weight:500;font-size:14px">${label}</div><div class="text-muted" style="font-size:12px">${sub}</div></div></span><label class="switch"><input type="checkbox" data-ctl="${key}" ${S[id][key]?'checked':''} ${S[id].reported?'disabled':''}><span class="track"></span></label></div>`;
    }
    function renderPanel() {
      const c = cardOf(selId), s = S[selId];
      $('#blkPanel').innerHTML = `
      <div class="card card--pad section">
        <div class="row" style="gap:14px;align-items:center">
          <div class="pcard__art" style="width:74px;height:48px;background:${grad(c.variant)}"><span class="mini-chip"></span><span class="mini-brand">blu</span></div>
          <div><div class="h4">${c.name}</div><div class="text-muted" style="font-size:13px">${c.kind} · ···${c.last4}</div></div>
          <span style="margin-left:auto">${stBadge(c.id)}</span>
        </div>
        ${s.reported ? `<div class="mt-4">${infoBanner('Esta tarjeta fue reportada y está en proceso de reposición (3-5 días hábiles).','clock')}</div>` : `
        <div class="card card--pad mt-6" style="background:var(--surface-2)">
          <div class="row between"><span class="row" style="gap:12px">${icon('lock')}<div><div style="font-weight:600">Congelar tarjeta</div><div class="text-muted" style="font-size:12px">Bloqueo temporal, reversible al instante</div></div></span><label class="switch"><input type="checkbox" data-ctl="frozen" ${s.frozen?'checked':''}><span class="track"></span></label></div>
        </div>
        <div class="mt-4">
          <div class="eyebrow mb-2">Controles de la tarjeta</div>
          ${ctlRow(c.id,'online','Compras por internet','Pagos en comercios en línea','bolt')}
          ${ctlRow(c.id,'abroad','Compras en el exterior','Consumos fuera del país','plane')}
          ${ctlRow(c.id,'atm','Retiros en cajero','Avances y retiros en ATM','atm')}
        </div>
        <button class="btn btn--ghost btn--block mt-6" style="color:var(--error);justify-content:center;border:1px solid var(--error-bg)" data-report>${icon('alert')} Reportar robo o pérdida</button>`}
      </div>`;
      wirePanel();
    }
    function wirePanel() {
      const s = S[selId], c = cardOf(selId);
      const frozen = $('#blkPanel [data-ctl="frozen"]');
      if (frozen) frozen.onchange = () => { s.frozen = frozen.checked; toast({ title: s.frozen ? 'Tarjeta congelada' : 'Tarjeta reactivada', msg: `${c.name} ···${c.last4}`, type: 'success' }); renderList(); renderPanel(); };
      view.querySelectorAll('#blkPanel [data-ctl]:not([data-ctl="frozen"])').forEach(t => t.onchange = () => { s[t.dataset.ctl] = t.checked; toast({ title: 'Preferencia actualizada', type: 'success' }); });
      const rep = $('#blkPanel [data-report]');
      if (rep) rep.onclick = () => {
        const ov = openModal(`<div class="modal__head"><h3 class="h3">Reportar tarjeta</h3><button class="icon-btn" data-close>${icon('close')}</button></div><div class="modal__body"><div class="state__art" style="margin:0 auto 12px;background:var(--error-bg);color:var(--error)">${icon('alert')}</div><p class="text-slate" style="text-align:center">Bloquearás <strong>${c.name} ···${c.last4}</strong> de forma <strong>definitiva</strong> y solicitaremos una reposición. Esta acción no se puede deshacer.</p></div><div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--danger" id="confRep">Reportar y reponer</button></div>`);
        ov.querySelectorAll('[data-close]').forEach(x => x.onclick = () => closeModal(ov));
        ov.querySelector('#confRep').onclick = (e) => { e.currentTarget.classList.add('is-loading'); setTimeout(() => { closeModal(ov); s.reported = true; renderList(); renderPanel(); toast({ title: 'Tarjeta reportada', msg: 'Emitiremos una nueva en 3-5 días hábiles.', type: 'success' }); }, 900); };
      };
    }
    renderList(); renderPanel();
  }
};

/* Aviso de viaje */
Screens['aviso-viaje'] = {
  title: 'Aviso de viaje',
  render(view) {
    view.innerHTML = `
    ${pageHead('Aviso de viaje','Evita bloqueos por consumos en el exterior.','inicio')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="field"><label>Destino <span class="req">*</span></label><div class="control">${icon('plane')}<select><option>Estados Unidos</option><option>España</option><option>Colombia</option><option>México</option><option>Otro país</option></select>${icon('chevronDown')}</div></div>
        <div class="grid grid-2" style="gap:16px">
          <div class="field" style="margin:0"><label>Desde <span class="req">*</span></label><div class="control">${icon('calendar')}<input type="date"></div></div>
          <div class="field" style="margin:0"><label>Hasta <span class="req">*</span></label><div class="control">${icon('calendar')}<input type="date"></div></div>
        </div>
        <div class="field mt-4"><label>Tarjetas a notificar</label>
          ${DB.cards.map((c,i)=>`<label class="row between" style="padding:12px 0;border-bottom:1px solid var(--line-2);cursor:pointer"><span class="row" style="gap:10px">${icon('card')}<span>${c.name} ···${c.last4}</span></span><input type="checkbox" ${i===0?'checked':''}></label>`).join('')}
        </div>
        <button class="btn btn--primary btn--lg btn--block mt-2" onclick="successModal('Aviso registrado','Tus tarjetas funcionarán sin problemas en tu destino.','inicio')">Registrar aviso de viaje</button>`)}
      ${infoBanner('Registra tu viaje al menos 24 horas antes. Podrás editarlo o cancelarlo cuando quieras.','clock')}
    </div>`;
  }
};

/* Certificados bancarios */
Screens['certificados'] = {
  title: 'Certificados',
  render(view) {
    const certs=[['Certificado de cuenta','Saldos y estado de tu cuenta','wallet'],['Certificado de tarjeta','Cupo y comportamiento','card'],['Certificado de no adeudo','Sin obligaciones pendientes','check'],['Referencia bancaria','Para trámites y visas','certificate']];
    view.innerHTML = `
    ${pageHead('Certificados bancarios','Genera y descarga tus certificados al instante.','inicio')}
    <div class="grid grid-2">
      ${certs.map(c=>`<div class="card card--pad card--hover section row between"><div class="row" style="gap:14px"><span class="prod__ic prod__ic--acct">${icon(c[2])}</span><div><div class="h4">${c[0]}</div><div class="text-muted" style="font-size:13px">${c[1]}</div></div></div><button class="btn btn--secondary btn--sm" data-cert="${c[0]}">${icon('download')} Generar</button></div>`).join('')}
    </div>
    ${infoBanner('Los certificados tienen validez oficial y se envían en PDF a tu correo registrado. Algunos pueden tener costo.','info')}`;
    view.querySelectorAll('[data-cert]').forEach(b=> b.onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ e.target.classList.remove('is-loading'); toast({title:'Certificado generado', msg:`${b.dataset.cert} enviado a tu correo.`, type:'success'}); },900); });
  }
};

/* Documentos tributarios */
Screens['tributarios'] = {
  title: 'Documentos tributarios',
  render(view) {
    view.innerHTML = `
    ${pageHead('Documentos tributarios','Comprobantes y retenciones para el SRI.','inicio')}
    <div class="scroll-x mb-6">${['2026','2025','2024'].map((y,i)=>`<button class="chip ${i===0?'is-active':''}">${y}</button>`).join('')}</div>
    <div class="list-card"><div class="list-card__body" style="padding-top:8px">
      ${[['Comprobante de retención','Junio 2026','file'],['Certificado de intereses','2025','file'],['Anexo gastos personales','2025','file'],['Estado de cuenta anual','2025','receipt']].map(d=>`<div class="prod"><span class="prod__ic prod__ic--credit">${icon(d[2])}</span><div class="prod__main"><div class="prod__title">${d[0]}</div><div class="prod__sub">${d[1]}</div></div><button class="btn btn--ghost btn--sm" onclick="toast({title:'Descargando…',type:'info'})">${icon('download')} PDF</button></div>`).join('')}
    </div></div>`;
  }
};

/* Residencia fiscal (CRS) */
Screens['residencia-fiscal'] = {
  title: 'Residencia fiscal',
  render(view) {
    view.innerHTML = `
    ${pageHead('Residencia fiscal (CRS)','Declaración de residencia fiscal internacional.','inicio')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="stepper mb-6"><div class="step is-active"><span class="bullet">1</span><span class="label">Declaración</span></div><span class="bar"></span><div class="step"><span class="bullet">2</span><span class="label">Confirmar</span></div></div>
        <div class="field"><label>¿Eres residente fiscal solo en Ecuador? <span class="req">*</span></label>
          <div class="grid grid-2" style="gap:12px"><label class="card card--pad" style="cursor:pointer;text-align:center;border-color:var(--blu-500)"><input type="radio" name="crs" checked hidden><span style="font-weight:600">Sí, solo Ecuador</span></label><label class="card card--pad" style="cursor:pointer;text-align:center"><input type="radio" name="crs" hidden><span style="font-weight:600">No, otro país</span></label></div>
        </div>
        <div class="field mt-4"><label>Número de identificación fiscal (RUC/Cédula)</label><div class="control">${icon('file')}<input value="1712345678" ></div></div>
        <label class="row" style="gap:10px;cursor:pointer;margin:12px 0"><input type="checkbox" checked><span style="font-size:13px" class="text-slate">Declaro que la información es verídica conforme al estándar CRS.</span></label>
        <button class="btn btn--primary btn--lg btn--block" onclick="successModal('Declaración enviada','Registramos tu residencia fiscal correctamente.','inicio')">Enviar declaración</button>`)}
      ${infoBanner('El CRS (Common Reporting Standard) es un estándar internacional de intercambio de información tributaria.','info')}
    </div>`;
  }
};

/* Devolución de mercadería */
Screens['devolucion'] = {
  title: 'Devolución de mercadería',
  render(view) {
    view.innerHTML = `
    ${pageHead('Devolución de mercadería','Solicita la reversión de un consumo.','inicio')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="field"><label>Consumo a devolver <span class="req">*</span></label><div class="control">${icon('store')}<select><option>Almacenes TIA · $84,32 · 12 jul</option><option>Tecnología XPC · $899,90 · 10 jul</option></select>${icon('chevronDown')}</div></div>
        <div class="field"><label>Motivo <span class="req">*</span></label><div class="control">${icon('receipt')}<select><option>Producto defectuoso</option><option>No recibí el producto</option><option>Cobro duplicado</option><option>Otro</option></select>${icon('chevronDown')}</div></div>
        <div class="field"><label>Detalle</label><div class="control" style="height:auto;align-items:flex-start;padding:14px"><textarea rows="3" style="border:none;outline:none;background:none;width:100%;resize:vertical;font-family:inherit;font-size:16px" placeholder="Describe lo ocurrido…"></textarea></div></div>
        <button class="btn btn--primary btn--lg btn--block" onclick="successModal('Solicitud registrada','Caso #DEV-2026. Resolveremos en 2-5 días hábiles.','inicio')">Enviar solicitud</button>`)}
      ${infoBanner('Adjunta evidencia si la tienes. El comercio tiene derecho a réplica dentro del proceso.','info')}
    </div>`;
  }
};

/* Contáctenos */
Screens['contactenos'] = {
  title: 'Contáctenos',
  render(view) {
    view.innerHTML = `
    ${pageHead('Contáctenos','Estamos para ayudarte 24/7.','perfil')}
    <div class="grid grid-3 mb-6">
      ${[['Chat con asesor','Respuesta inmediata','headset','asesor-virtual'],['WhatsApp BLU','099 000 0000','phone',''],['Llámanos','1800-DINERS','phone','']].map(c=>`<button class="card card--pad card--hover section" data-nav="${c[3]}" style="text-align:left"><span class="qa__ic">${icon(c[2])}</span><div class="h4 mt-4">${c[0]}</div><div class="text-muted" style="font-size:13px">${c[1]}</div></button>`).join('')}
    </div>
    ${panel('Escríbenos', `
      <div class="grid grid-2" style="gap:16px"><div class="field" style="margin:0"><label>Asunto</label><div class="control">${icon('receipt')}<select><option>Consulta general</option><option>Reclamo</option><option>Sugerencia</option></select>${icon('chevronDown')}</div></div><div class="field" style="margin:0"><label>Producto</label><div class="control">${icon('card')}<select><option>Tarjeta de crédito</option><option>Cuenta</option><option>App</option></select>${icon('chevronDown')}</div></div></div>
      <div class="field mt-4"><label>Mensaje</label><div class="control" style="height:auto;align-items:flex-start;padding:14px"><textarea rows="4" style="border:none;outline:none;background:none;width:100%;resize:vertical;font-family:inherit;font-size:16px" placeholder="¿En qué podemos ayudarte?"></textarea></div></div>
      <button class="btn btn--primary" onclick="toast({title:'Mensaje enviado',msg:'Te responderemos en menos de 24h.',type:'success'})">Enviar mensaje</button>`)}`;
  }
};

/* Asesor virtual */
Screens['asesor-virtual'] = {
  title: 'Asesor virtual',
  render(view) {
    view.innerHTML = `
    ${pageHead('Asesor virtual','Resuelve tus dudas al instante.','contactenos')}
    <div class="card section" style="max-width:640px;margin:0 auto;overflow:hidden">
      <div class="row" style="gap:12px;padding:16px 20px;border-bottom:1px solid var(--line-2)"><span class="avatar" style="background:var(--grad-sky)">${icon('sparkles')}</span><div><div style="font-weight:700">BLU Asistente</div><div class="text-success" style="font-size:12px;font-weight:600">● En línea</div></div></div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:12px;min-height:320px;background:var(--surface-2)" id="chat">
        <div style="align-self:flex-start;max-width:78%;background:var(--surface);border:1px solid var(--line-2);padding:12px 14px;border-radius:4px 16px 16px 16px">¡Hola ${DB.user.first}! Soy tu asistente BLU. ¿En qué te ayudo hoy?</div>
        <div class="scroll-x">${['¿Cuál es mi cupo?','Pagar mi tarjeta','Reportar consumo','Aviso de viaje'].map(q=>`<button class="chip" data-q="${q}">${q}</button>`).join('')}</div>
      </div>
      <div class="row" style="gap:10px;padding:14px 16px;border-top:1px solid var(--line-2)"><div class="control" style="flex:1;height:46px">${icon('sparkles')}<input id="chatIn" placeholder="Escribe tu mensaje…"></div><button class="icon-btn" style="background:var(--blu-600);color:#fff;width:46px;height:46px" id="chatSend">${icon('send')}</button></div>
    </div>`;
    const chat=$('#chat');
    function push(text, me){ const b=el('div','', text); b.style.cssText=`align-self:${me?'flex-end':'flex-start'};max-width:78%;padding:12px 14px;border-radius:${me?'16px 4px 16px 16px':'4px 16px 16px 16px'};background:${me?'var(--blu-600)':'var(--surface)'};color:${me?'#fff':'inherit'};${me?'':'border:1px solid var(--line-2)'}`; chat.appendChild(b); chat.scrollTop=chat.scrollHeight; }
    function ask(q){ push(q,true); setTimeout(()=>{ const a={'¿Cuál es mi cupo?':`Tu cupo disponible en Diners Club es ${money(DB.cards[0].disponible)} de ${money(DB.cards[0].cupo)}.`,'Pagar mi tarjeta':'Puedo llevarte a Pago de tarjeta. Tu pago total es '+money(DB.cards[0].pagoTotal)+'.','Reportar consumo':'Cuéntame qué consumo no reconoces y lo gestionamos.','Aviso de viaje':'Con gusto. ¿A qué país viajas y en qué fechas?'}[q]||'Entendido, lo reviso por ti. ¿Algo más?'; push(a,false); },700); }
    view.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>ask(b.dataset.q));
    $('#chatSend').onclick=()=>{ const v=$('#chatIn').value.trim(); if(v){ ask(v); $('#chatIn').value=''; } };
    $('#chatIn').addEventListener('keydown',e=>{ if(e.key==='Enter') $('#chatSend').click(); });
  }
};
