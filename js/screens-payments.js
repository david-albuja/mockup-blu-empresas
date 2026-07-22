/* BLU Web — Módulo Pagos y Cajeros */

/* Retiro sin tarjeta + clave ATM */
Screens['retiro-atm'] = {
  title: 'Retiro sin tarjeta',
  render(view) {
    view.innerHTML = `
    ${pageHead('Retiro sin tarjeta','Genera un código y recíbelo en tu teléfono para retirar en cajeros BLU.','inicio')}
    <div class="grid" style="grid-template-columns:1fr 360px;align-items:start">
      ${panel('', `
        <div class="field"><label>Cuenta origen <span class="req">*</span></label><div class="control">${icon('wallet')}<select><option>Ahorros BLU ···2205 — ${money(DB.accounts[0].saldo)}</option></select>${icon('chevronDown')}</div></div>
        <div class="field"><label>Monto a retirar <span class="req">*</span></label><div class="scroll-x">${[20,40,60,100,200].map((m,i)=>`<button class="chip ${i===2?'is-active':''}" data-amt="${m}">$${m}</button>`).join('')}</div></div>
        <div class="field"><label>Otro monto</label><div class="control"><span class="prefix">$</span><input inputmode="decimal" placeholder="0,00"></div><span class="hint">Múltiplos de $10 · máximo $300 por retiro.</span></div>
        <div class="field" id="atmPhoneF"><label>Teléfono para recibir el código <span class="req">*</span></label><div class="control">${icon('phone')}<input id="atmPhone" inputmode="numeric" value="${DB.user.phone}"></div><span class="error-text">${icon('alert')} Ingresa un teléfono válido.</span></div>
        <div class="row" style="gap:8px;align-items:flex-start;margin:4px 0 14px;font-size:12px;color:var(--muted)">${icon('info')}<span>El código de retiro tiene una validez de <strong style="color:var(--ink)">4 horas</strong> y se envía por SMS al número indicado.</span></div>
        <button class="btn btn--primary btn--lg btn--block" id="atmBtn">${icon('key')} Generar código de retiro</button>`)}
      <aside style="position:sticky;top:calc(var(--topbar-h) + 24px)">
        ${infoBanner('El retiro sin tarjeta está disponible únicamente para el dueño de la empresa (no aplica a perfiles Administrador).','shield')}
      </aside>
    </div>`;
    let amt=60;
    view.querySelectorAll('[data-amt]').forEach(b=>b.onclick=()=>{view.querySelectorAll('[data-amt]').forEach(x=>x.classList.remove('is-active'));b.classList.add('is-active');amt=+b.dataset.amt;});
    $('#atmPhone').oninput=()=>$('#atmPhoneF').classList.remove('has-error');
    $('#atmBtn').onclick=()=>{
      const ph=$('#atmPhone'); if(!ph.value.trim()){ $('#atmPhoneF').classList.add('has-error'); return; }
      const ov = openModal(`<div class="modal__head"><h3 class="h3">Verifica tu identidad</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
        <div class="modal__body"><p class="text-slate">Ingresa el código de un solo uso (OTP) que enviamos a tu teléfono <strong>${ph.value.trim()}</strong> para generar el retiro de <strong>$${amt}.00</strong>.</p>
        <div class="field mt-4"><label>Código OTP</label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:40px;text-align:center;font-size:20px;font-weight:700" aria-label="Dígito OTP">').join('')}</div><span class="hint">El código de retiro será válido por 4 horas.</span></div></div>
        <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="atmOtp">Generar código</button></div>`);
      const inp=ov.querySelectorAll('.control input'); inp.forEach((i,x)=>i.oninput=()=>{ if(i.value&&inp[x+1]) inp[x+1].focus(); });
      ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
      ov.querySelector('#atmOtp').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); toast({title:'Código enviado',msg:`Enviamos el código de retiro de $${amt}.00 a ${ph.value.trim()}. Válido por 4 horas.`,type:'success'}); },1000); };
    };
  }
};

/* Mapa de agencias / ATM */
Screens['mapa'] = {
  title: 'Mapa de agencias',
  render(view) {
    const pts=[['Agencia Quicentro','Av. Naciones Unidas','1,2 km','store'],['Cajero BLU · Scala','C.C. Scala Shopping','2,4 km','atm'],['Agencia El Recreo','Av. Maldonado','3,1 km','store'],['Cajero BLU · Quicentro Sur','Quicentro Sur','4,0 km','atm']];
    view.innerHTML = `
    ${pageHead('Agencias y cajeros','Encuentra el punto BLU más cercano.','inicio')}
    <div class="grid" style="grid-template-columns:1fr 380px;align-items:start">
      <div class="card section" style="overflow:hidden;min-height:440px;position:relative;background:linear-gradient(135deg,#dfe7fb,#eef2fb)">
        <svg viewBox="0 0 600 440" width="100%" height="100%" style="display:block" aria-label="Mapa esquemático">
          <rect width="600" height="440" fill="var(--bg-2)"/>
          ${[80,200,320,440].map(y=>`<line x1="0" y1="${y}" x2="600" y2="${y}" stroke="var(--line)" stroke-width="2"/>`).join('')}
          ${[120,260,400,540].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="440" stroke="var(--line)" stroke-width="2"/>`).join('')}
          <path d="M40 400 Q200 300 300 240 T560 60" fill="none" stroke="var(--blu-300)" stroke-width="6" stroke-linecap="round"/>
          ${[[150,160],[300,240],[420,120],[500,320]].map((p,i)=>`<g><circle cx="${p[0]}" cy="${p[1]}" r="16" fill="var(--blu-600)" opacity=".15"/><circle cx="${p[0]}" cy="${p[1]}" r="7" fill="var(--blu-600)"/></g>`).join('')}
        </svg>
        <div class="search" style="position:absolute;top:16px;left:16px;right:16px;width:auto;max-width:none">${icon('search')}<input placeholder="Buscar dirección o agencia…"></div>
      </div>
      <div class="grid" style="gap:12px">
        <div class="scroll-x">${['Todos','Agencias','Cajeros','Abiertos ahora'].map((t,i)=>`<button class="chip ${i===0?'is-active':''}">${t}</button>`).join('')}</div>
        ${pts.map(p=>`<div class="card card--pad card--hover row" style="gap:14px"><span class="prod__ic ${p[3]==='atm'?'prod__ic--card':'prod__ic--acct'}">${icon(p[3])}</span><div class="prod__main"><div class="prod__title">${p[0]}</div><div class="prod__sub">${p[1]}</div></div><div style="text-align:right"><div class="num" style="font-weight:700;font-size:13px">${p[2]}</div><span class="badge badge--success" style="margin-top:4px"><span class="dot"></span>Abierto</span></div></div>`).join('')}
      </div>
    </div>`;
  }
};

/* Transferencias programadas */
Screens['transferencias-programadas'] = {
  title: 'Transferencias programadas',
  render(view) {
    view.innerHTML = `
    ${pageHead('Transferencias programadas','Automatiza tus envíos recurrentes.','transferencias', `<button class="btn btn--primary btn--sm" onclick="toast({title:'Nueva programación',msg:'Define beneficiario, monto y frecuencia.',type:'info'})">${icon('plus')} Programar</button>`)}
    <div class="list-card"><div class="list-card__body" style="padding-top:16px">
      ${[['Ana Molina','Mensual · día 5','$300,00','Activa'],['Arriendo Depto.','Mensual · día 1','$450,00','Activa'],['Ahorro programado','Semanal · lunes','$50,00','Pausada']].map(t=>`<div class="prod"><span class="prod__ic prod__ic--card">${icon('calendar')}</span><div class="prod__main"><div class="prod__title">${t[0]}</div><div class="prod__sub">${t[1]}</div></div><div style="text-align:right"><div class="num" style="font-weight:700">${t[2]}</div><span class="badge ${t[3]==='Activa'?'badge--success':'badge--neutral'}" style="margin-top:4px"><span class="dot"></span>${t[3]}</span></div><label class="switch" style="margin-left:12px"><input type="checkbox" ${t[3]==='Activa'?'checked':''}><span class="track"></span></label></div>`).join('')}
    </div></div>`;
  }
};

/* Pagos programados (servicios) */
Screens['programados'] = {
  title: 'Pagos programados',
  render(view) {
    view.innerHTML = `
    ${pageHead('Pagos programados','Servicios y facturas en automático.','pagos', `<button class="btn btn--primary btn--sm" data-nav="servicios-inscritos">${icon('plus')} Nuevo</button>`)}
    <div class="segmented mb-6"><button class="is-active">Servicios</button><button data-nav="transferencias-programadas">Transferencias</button></div>
    <div class="list-card"><div class="list-card__body" style="padding-top:16px">
      ${[['Empresa Eléctrica Quito','Cada mes · al vencimiento','~$46','bolt'],['Internet Netlife','Día 10 de cada mes','$32,90','bolt'],['DirecTV','Día 15 de cada mes','$29,90','services']].map(s=>`<div class="prod"><span class="prod__ic prod__ic--card">${icon(s[3])}</span><div class="prod__main"><div class="prod__title">${s[0]}</div><div class="prod__sub">${s[1]}</div></div><div class="prod__amt num">${s[2]}</div><button class="icon-btn" style="margin-left:8px" onclick="toast({title:'Programación',msg:'Editar o eliminar.',type:'info'})">${icon('services')}</button></div>`).join('')}
    </div></div>`;
  }
};

/* Servicios inscritos */
Screens['servicios-inscritos'] = {
  title: 'Servicios inscritos',
  render(view) {
    view.innerHTML = `
    ${pageHead('Servicios inscritos','Administra tus servicios guardados.','pagos', `<button class="btn btn--primary btn--sm" onclick="toast({title:'Inscribir servicio',msg:'Elige categoría y n.º de suministro.',type:'info'})">${icon('plus')} Inscribir</button>`)}
    <div class="grid grid-2">
      ${DB.services.map(s=>`<div class="card card--pad card--hover"><div class="row between"><span class="prod__ic prod__ic--card">${icon(s.icon)}</span><span class="badge badge--info">${s.cat}</span></div><div class="mt-4"><div class="h4">${s.name}</div><div class="text-muted" style="font-size:13px">${s.ref}</div></div><div class="row mt-4" style="gap:8px"><button class="btn btn--secondary btn--sm" data-nav="pagos" style="flex:1">Pagar</button><button class="btn btn--ghost btn--sm" onclick="toast({title:'Servicio eliminado',type:'info'})">Quitar</button></div></div>`).join('')}
    </div>`;
  }
};

/* Pago de crédito */
Screens['pago-credito'] = {
  title: 'Pago de crédito',
  render(view) {
    const cr = (getParam('id') && DB.credits.find(c=>c.id===getParam('id'))) || DB.credits.find(c=>c.estado==='mora') || DB.credits[0];
    view.innerHTML = `
    ${pageHead('Pago de crédito','Paga la cuota de tu crédito.','cuentas')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="field"><label>Crédito</label><div class="control">${icon('coins')}<select><option>${cr.name} ${cr.num}</option></select>${icon('chevronDown')}</div></div>
        <label class="h4" style="display:block;margin:8px 0">Cuota a pagar</label>
        <div class="card card--pad" style="display:flex;justify-content:space-between;align-items:center;border-color:var(--blu-500);margin-bottom:10px"><span class="row" style="gap:12px">${icon('receipt')}<span style="font-weight:600">Cuota del mes</span></span><span class="num" style="font-weight:700">${money(cr.cuota)}</span></div>
        <div class="field mt-4"><label>Pagar desde</label><div class="control">${icon('wallet')}<select>${DB.accounts.map(a=>`<option>${a.name} ${a.num}</option>`).join('')}</select>${icon('chevronDown')}</div></div>
        <div class="row" style="gap:8px;align-items:flex-start;margin:14px 0;font-size:12px;color:var(--muted)">${icon('shield')}<span>El pago quedará <strong style="color:var(--ink)">pendiente de autorizar</strong> por un perfil Aprobador.</span></div>
        <button class="btn btn--primary btn--lg btn--block" data-nav="pendiente-autorizar">Pagar ${money(cr.cuota)}</button>`)}
      ${panel('Estado del crédito', kv('Saldo pendiente',money(cr.saldo),1)+kv('Cuota',cr.plazo)+kv('Próximo pago',cr.prox)+`<div class="progress mt-4"><span style="width:37%"></span></div><div class="text-muted mt-2" style="font-size:12px">${cr.plazo!=='—'?cr.plazo.replace('/',' de ')+' cuotas pagadas':''}</div>`)}
    </div>`;
  }
};

/* Pantalla genérica: operación pendiente de autorizar (solo el perfil Aprobador la autoriza) */
Screens['pendiente-autorizar'] = {
  title: 'Pendiente de autorizar', full: false,
  render(view) {
    view.innerHTML = `
    <div class="section" style="max-width:560px;margin:0 auto;padding-top:24px">
      <div class="card card--pad" style="text-align:center">
        <div class="state__art" style="margin:0 auto 12px;background:var(--warning-bg);color:var(--warning)">${icon('clock')}</div>
        <h2 class="h2">Pendiente de autorizar</h2>
        <p class="text-muted mt-2">Tu operación se registró y quedó <strong>pendiente de autorización</strong>. Un usuario con perfil <strong>Aprobador</strong> debe autorizarla para que se ejecute.</p>
        <div class="card card--pad mt-6" style="text-align:left;background:var(--surface-2)">
          ${kv('N.º de operación','#OP-'+Math.floor(100000+Math.random()*899999))}
          ${kv('Estado','<span class="badge badge--warning"><span class="dot"></span>Pendiente de autorizar</span>')}
          ${kv('Autoriza','Perfil Aprobador')}
        </div>
        <div class="row mt-6" style="gap:12px"><button class="btn btn--secondary" style="flex:1" data-nav="inicio">Ir al inicio</button><button class="btn btn--primary" style="flex:1" data-nav="aprobaciones">Ver aprobaciones</button></div>
      </div>
    </div>`;
  }
};

/* Pago masivo por carga de archivo */
Screens['carga-archivo'] = {
  title: 'Pago masivo',
  render(view) {
    let tipo = 'directa';
    view.innerHTML = `
    ${pageHead('Pago masivo por carga de archivo','Procesa pagos de nómina, proveedores y servicios.','inicio')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label>Tipo de transferencia</label><div class="control">${icon('swap')}<select id="pmTipo"><option value="directa">Directa</option><option value="interbancaria">Interbancaria</option></select>${icon('chevronDown')}</div></div>
          <div class="field"><label>Categoría</label><div class="control">${icon('grid')}<select><option>Nómina</option><option>Proveedor</option><option>Servicio</option></select>${icon('chevronDown')}</div></div>
        </div>
        <div class="field"><label>Cuenta de origen</label><div class="control">${icon('wallet')}<select>${DB.accounts.map(a=>`<option>${a.name} ${a.num} — ${money(a.saldo)}</option>`).join('')}</select>${icon('chevronDown')}</div></div>
        <div class="grid grid-2" style="gap:0 16px">
          <div class="field"><label>Fecha de pago</label><div class="control">${icon('calendar')}<input type="date"></div></div>
          <div class="field"><label>Descripción</label><div class="control">${icon('info')}<input placeholder="Ej. Nómina julio 2026"></div></div>
        </div>
        <div class="divider"></div>
        <label style="font-size:13px;font-weight:600;color:var(--slate)">Formato para la carga</label>
        <div class="row wrap mt-2 mb-4" style="gap:10px">
          <button class="btn btn--secondary btn--sm" onclick="toast({title:'Instructivo',msg:'Guía de llenado del archivo.',type:'info'})">${icon('file')} Instructivo</button>
          <button class="btn btn--secondary btn--sm" id="pmPlantilla" onclick="toast({title:'Plantilla descargada',msg:'Formato para pago directo.',type:'success'})">${icon('download')} Formato (plantilla)</button>
        </div>
        <label style="font-size:13px;font-weight:600;color:var(--slate)">Carga de archivo</label>
        <label id="drop" style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:36px;border:2px dashed var(--blu-200);border-radius:var(--r-md);background:var(--surface-2);cursor:pointer;text-align:center;margin:6px 0 8px">${icon('upload','')}<span style="font-weight:600;color:var(--primary)">Arrastra tu archivo o haz clic</span><span class="text-muted" style="font-size:12px" id="pmFmt">Formato para pago directo · máx. 5 MB</span><input type="file" hidden id="file"></label>
        <button class="btn btn--primary btn--lg btn--block mt-4" id="pmFin">Finalizar</button>`)}
      ${panel('Últimas cargas', [['nomina_jul.csv','Aprobado','$18.200'],['prov_070.txt','Pendiente','$6.360']].map(x=>`<div class="prod" style="padding:12px 0"><span class="prod__ic prod__ic--card">${icon('file')}</span><div class="prod__main"><div class="prod__title" style="font-size:13px">${x[0]}</div><div class="prod__sub">${x[2]}</div></div><span class="badge ${x[1]==='Aprobado'?'badge--success':'badge--warning'}"><span class="dot"></span>${x[1]}</span></div>`).join(''))}
    </div>`;
    const drop=$('#drop'); if(drop){ drop.querySelector('#file').onchange=(e)=>{ if(e.target.files[0]) toast({title:'Archivo seleccionado',msg:e.target.files[0].name,type:'success'}); }; }
    $('#pmTipo').onchange = (e) => { tipo = e.target.value; $('#pmFmt').textContent = `Formato para pago ${tipo==='directa'?'directo':'interbancario'} · máx. 5 MB`; };
    $('#pmFin').onclick = () => { $('#pmFin').classList.add('is-loading'); setTimeout(()=>{ toast({title:'Pago masivo cargado',msg:'Registros validados. Quedó pendiente de autorizar.',type:'success'}); location.hash='#/inicio'; }, 900); };
  }
};
