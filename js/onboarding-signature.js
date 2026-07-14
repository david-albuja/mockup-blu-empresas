/* BLU Web — Onboarding / Solicitud: Tarjeta Diners Club Signature
   Wizard guiado (7 pasos) + confirmación por token + seguimiento. */

Screens['onboarding-signature'] = {
  title: 'Solicitud Diners Club Signature',
  render(view) {
    const PREAP = 8000, MINL = 1000;
    const S = {
      step: 0,
      done: false,
      data: {
        email: DB.user.email, phone: DB.user.phone,
        ocupacion: '', empresa: '', ingresos: '', antiguedad: '',
        cupo: 6000, corte: '15', formato: 'ambas',
        calle: '', ciudad: 'Quito', referencia: '', entrega: 'domicilio',
        debito: true, terminos: false,
      },
    };
    // Oferta PREAPROBADA a un cliente existente → flujo corto de 3 pasos
    // (patrón de los mejores bancos: sin re-ingreso de datos ni re-evaluación).
    const STEPS = ['Tu oferta','Personaliza','Confirma'];

    /* ---- Tarjeta de vista previa (se actualiza con el cupo) ---- */
    function previewCard() {
      const c = { name:'Diners Club', type:'Signature', number:'5412 •••• •••• ••••', last4:'••••', disponible:S.data.cupo, corte:S.data.corte+' de cada mes' };
      return UI.bankCard(c);
    }

    /* ---- Layout base ---- */
    view.innerHTML = `
    ${pageHead('Solicita tu Diners Club Signature','Completa tu solicitud en pocos minutos.','ofertas')}
    <div class="grid" style="grid-template-columns:1fr 360px;align-items:start;gap:28px">
      <div>
        <div class="ob-steps section" id="obSteps"></div>
        <div id="obForm" class="section" style="margin-top:8px"></div>
      </div>
      <aside style="position:sticky;top:calc(var(--topbar-h) + 24px)" id="obSide"></aside>
    </div>`;

    /* ---- Indicador de pasos ---- */
    function paintSteps() {
      if (S.done) { $('#obSteps').innerHTML=''; return; }
      $('#obSteps').innerHTML = `
      <div class="row between mb-2"><span class="eyebrow">Paso ${S.step+1} de ${STEPS.length}</span><span class="text-muted" style="font-size:12px;font-weight:600">${Math.round((S.step)/(STEPS.length-1)*100)}% completado</span></div>
      <div class="progress mb-4"><span style="width:${(S.step)/(STEPS.length-1)*100}%"></span></div>
      <div class="stepper" style="flex-wrap:wrap;gap:6px 4px">${STEPS.map((s,i)=>`<div class="step ${i===S.step?'is-active':i<S.step?'is-done':''}"><span class="bullet">${i<S.step?icon('check'):i+1}</span><span class="label" style="${i===S.step?'':'display:none'}">${s}</span></div>${i<STEPS.length-1?`<span class="bar ${i<S.step?'is-done':''}"></span>`:''}`).join('')}</div>`;
    }

    /* ---- Resumen lateral ---- */
    function paintSide() {
      if (S.done) { $('#obSide').innerHTML=''; return; }
      const cuota = S.data.cupo * 0.05; // pago mínimo referencial 5%
      $('#obSide').innerHTML = `
      <div class="grid" style="gap:16px">
        ${previewCard()}
        <div class="card card--pad">
          <div class="eyebrow mb-2">Resumen de tu solicitud</div>
          ${kv('Producto','Diners Club Signature')}
          ${kv('Cupo solicitado', money(S.data.cupo), 1)}
          ${kv('Fecha de corte', S.data.corte+' de cada mes')}
          ${kv('Formato', {fisica:'Física', digital:'Digital', ambas:'Física + Digital'}[S.data.formato])}
          <div class="sum-total" style="margin-top:12px"><div><div class="text-muted" style="font-size:12px">Sin costo de emisión</div><div class="v" style="font-size:16px;color:var(--success)">1er año gratis</div></div><span class="badge badge--success"><span class="dot"></span>Preaprobada</span></div>
        </div>
        ${infoBanner('Tus datos viajan cifrados. No se genera ningún cargo hasta que actives tu tarjeta.','shield')}
      </div>`;
    }

    /* ---- Contenido por paso ---- */
    const views = {
      0: () => `
        <div class="card card--pad">
          <div class="row between mb-4"><span class="badge badge--info">${icon('sparkles')} Oferta preaprobada</span><span class="text-muted" style="font-size:13px">Válida hasta 31 jul 2026</span></div>
          <h2 class="h2">Tarjeta Diners Club Signature</h2>
          <p class="text-muted mb-6">Cupo preaprobado de hasta <strong style="color:var(--ink)">${money(PREAP)}</strong>. Sin costo de emisión el primer año.</p>
          <div class="grid grid-2" style="gap:12px">
            ${[['Salas VIP','Aeropuertos del mundo','plane'],['Millas 2x1','En viajes y hoteles','sparkles'],['Cashback 3%','Supermercados y farmacias','cash'],['Seguro de compras','Protección internacional','shield'],['Asistencia 24/7','Médica y en viaje','headset'],['Club de descuentos','2x1 en restaurantes','gift']].map(b=>`<div class="row" style="gap:12px;padding:10px 0"><span class="prod__ic prod__ic--card" style="width:40px;height:40px">${icon(b[2])}</span><div><div style="font-weight:600;font-size:13px">${b[0]}</div><div class="text-muted" style="font-size:12px">${b[1]}</div></div></div>`).join('')}
          </div>
          <label class="row" style="gap:10px;margin-top:16px;cursor:pointer;font-size:13px" class="text-slate"><input type="checkbox" id="obAck" checked><span class="text-slate">Autorizo la consulta de mi historial crediticio para esta solicitud.</span></label>
        </div>`,

      1: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Personaliza tu tarjeta</h2>
          <p class="text-muted mb-6">Ajusta el cupo, la fecha de corte y cómo quieres recibirla.</p>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">Cupo solicitado</label>
          <div class="row between mb-2 mt-2"><span class="text-muted" style="font-size:13px">Mín ${money(MINL)}</span><span class="h2 num" id="obCupoVal">${money(S.data.cupo)}</span><span class="text-muted" style="font-size:13px">Máx ${money(PREAP)}</span></div>
          ${slider('obCupo',MINL,PREAP,S.data.cupo,500)}
          <div class="text-muted mt-2" style="font-size:12px">Puedes solicitar un aumento más adelante desde la app.</div>
          <div class="divider"></div>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">Fecha de corte</label>
          <div class="scroll-x mt-2" id="obCorte">${['5','10','15','20','25'].map(d=>`<button class="chip ${d===S.data.corte?'is-active':''}" data-corte="${d}">${d} de cada mes</button>`).join('')}</div>
          <div class="divider"></div>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">Formato de la tarjeta</label>
          <div class="grid grid-3 mt-2" id="obFormato" style="gap:10px">
            ${[['digital','Digital','bolt','Úsala hoy mismo'],['fisica','Física','card','Llega a tu casa'],['ambas','Ambas','sparkles','Recomendado']].map(f=>`<label class="card card--pad" data-fmt="${f[0]}" style="cursor:pointer;text-align:center;border-color:${f[0]===S.data.formato?'var(--blu-500)':'var(--line)'};box-shadow:${f[0]===S.data.formato?'var(--ring)':'none'}"><span class="qa__ic" style="margin:0 auto">${icon(f[2])}</span><div style="font-weight:600;font-size:13px;margin-top:8px">${f[1]}</div><div class="text-muted" style="font-size:11px">${f[3]}</div></label>`).join('')}
          </div>
          <div class="divider"></div>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">¿Dónde quieres recibirla?</label>
          <div class="grid grid-2 mt-2 mb-4" id="obEntrega" style="gap:10px">
            ${[['domicilio','En mi domicilio','home'],['agencia','Retirar en agencia','store']].map(e=>`<label class="card card--pad" data-ent="${e[0]}" style="cursor:pointer;border-color:${e[0]===S.data.entrega?'var(--blu-500)':'var(--line)'};box-shadow:${e[0]===S.data.entrega?'var(--ring)':'none'}"><div class="row" style="gap:10px">${icon(e[2])}<span style="font-weight:600;font-size:14px">${e[1]}</span></div></label>`).join('')}
          </div>
          <div id="obDir" style="${S.data.entrega==='agencia'?'display:none':''}">
            <div class="field" id="fCalle"><label>Dirección <span class="req">*</span></label><div class="control">${icon('map')}<input id="obCalle" value="${S.data.calle}" placeholder="Calle principal, número, secundaria"></div><span class="error-text">${icon('alert')} Ingresa tu dirección de entrega.</span></div>
            <div class="grid grid-2" style="gap:0 16px">
              <div class="field"><label>Ciudad</label><div class="control">${icon('building')}<select id="obCiudad"><option>Quito</option><option>Guayaquil</option><option>Cuenca</option><option>Ambato</option></select>${icon('chevronDown')}</div></div>
              <div class="field"><label>Referencia</label><div class="control">${icon('info')}<input id="obRef" value="${S.data.referencia}" placeholder="Ej. frente al parque"></div></div>
            </div>
          </div>
          <div class="row" style="gap:10px;padding:12px 0;border-top:1px solid var(--line-2);margin-top:4px"><span class="prod__ic prod__ic--acct" style="width:38px;height:38px">${icon('clock')}</span><div><div style="font-weight:600;font-size:13px">Entrega en 3 a 5 días hábiles</div><div class="text-muted" style="font-size:12px">Tu tarjeta digital estará lista en minutos.</div></div></div>
        </div>`,

      2: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Revisa y confirma</h2>
          <p class="text-muted mb-6">Detectamos que ya eres cliente. Verifica tus datos de contacto y confirma.</p>
          ${kv('Titular', DB.user.name)}
          ${kv('Documento', 'Cédula 171234567-8')}
          <div class="grid grid-2 mt-2" style="gap:0 16px">
            <div class="field"><label>Correo electrónico <span class="req">*</span></label><div class="control">${icon('receipt')}<input id="obEmail" type="email" value="${S.data.email}"></div></div>
            <div class="field"><label>Celular <span class="req">*</span></label><div class="control">${icon('phone')}<input id="obPhone" value="${S.data.phone}"></div></div>
          </div>
          <div class="divider"></div>
          ${kv('Cupo solicitado', money(S.data.cupo), 1)}
          ${kv('Fecha de corte', S.data.corte+' de cada mes')}
          ${kv('Formato', {fisica:'Física', digital:'Digital', ambas:'Física + Digital'}[S.data.formato])}
          ${kv('Entrega', S.data.entrega==='agencia' ? 'Retiro en agencia' : (S.data.calle||'Domicilio registrado'))}
          <div class="card card--pad mt-4" style="background:var(--surface-2)">
            <label class="row" style="gap:10px;cursor:pointer;align-items:flex-start"><input type="checkbox" id="obDebito" ${S.data.debito?'checked':''} style="margin-top:3px"><span><span style="font-weight:600;font-size:13px">Débito automático del pago mínimo</span><span class="text-muted" style="display:block;font-size:12px">Desde tu cuenta Ahorros BLU ···2205 (opcional)</span></span></label>
          </div>
          <label class="row" style="gap:10px;cursor:pointer;align-items:flex-start;margin-top:14px" id="fTerm"><input type="checkbox" id="obTerm" style="margin-top:3px"><span class="text-slate" style="font-size:13px">He leído y acepto el <a href="#/onboarding-signature" onclick="event.preventDefault();openTerms()" style="color:var(--primary);font-weight:600">contrato de tarjeta de crédito</a> y la tabla de costos.</span></label>
          <div id="termErr" style="display:none;color:var(--error);font-size:12px;font-weight:500;margin-top:6px" class="row"><span>${icon('alert')} Debes aceptar los términos para continuar.</span></div>
        </div>`,
    };

    /* ---- Éxito + seguimiento ---- */
    function paintDone() {
      $('#obSteps').innerHTML=''; $('#obSide').innerHTML='';
      const hora = new Date().toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'});
      // Oferta preaprobada: la revisión y aprobación se completan al instante
      const steps=[['Solicitud recibida','Hoy · '+hora,'done'],['En revisión','Validación crediticia completada','done'],['Aprobada','Hoy · '+hora+' · cupo preaprobado','done'],['En camino','Envío a tu domicilio · 3-5 días hábiles','active'],['Entregada','Firma de recepción','pending']];
      $('#obForm').closest('.grid').style.gridTemplateColumns='1fr';
      $('#obForm').innerHTML = `
      <div class="card card--pad" style="max-width:620px;margin:0 auto;text-align:center">
        <div class="state__art" style="margin:0 auto 12px;background:var(--success-bg);color:var(--success)">${icon('checkCircle')}</div>
        <h2 class="h2">¡Tarjeta aprobada!</h2>
        <p class="text-muted mt-2">Tu Diners Club Signature fue aprobada al instante. Solo falta la entrega.</p>
        <div class="card card--pad mt-6" style="text-align:left;background:var(--surface-2)">
          ${kv('N.º de solicitud','#DCS-'+Math.floor(100000+Math.random()*899999))}
          ${kv('Cupo aprobado', money(S.data.cupo), 1)}
          ${kv('Formato', {fisica:'Física', digital:'Digital', ambas:'Física + Digital'}[S.data.formato])}
        </div>
        <div style="text-align:left;margin-top:24px">
          <div class="eyebrow mb-4">Seguimiento de tu tarjeta</div>
          <div style="position:relative;padding-left:8px">
            ${steps.map((st,i)=>`<div class="row" style="gap:14px;align-items:flex-start;padding-bottom:${i<steps.length-1?'20px':'0'};position:relative">
              <div style="display:flex;flex-direction:column;align-items:center;flex:none">
                <span style="width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:${st[2]==='done'?'var(--success)':st[2]==='active'?'var(--blu-600)':'var(--bg-2)'};color:${st[2]==='pending'?'var(--muted)':'#fff'};box-shadow:${st[2]==='active'?'var(--ring)':'none'}">${st[2]==='done'?icon('check'):st[2]==='active'?icon('clock'):i+1}</span>
                ${i<steps.length-1?`<span style="width:2px;flex:1;min-height:20px;background:${st[2]==='done'?'var(--success)':'var(--line)'};margin-top:2px"></span>`:''}
              </div>
              <div style="padding-top:3px"><div style="font-weight:600;font-size:14px;color:${st[2]==='pending'?'var(--muted)':'var(--ink)'}">${st[0]}</div><div class="text-muted" style="font-size:12px">${st[1]}</div></div>
            </div>`).join('')}
          </div>
        </div>
        ${(S.data.formato!=='fisica') ? `<div class="card card--pad mt-6" style="background:var(--blu-50);border-color:var(--blu-100);text-align:left"><div class="row between wrap" style="gap:10px"><div class="row" style="gap:10px">${icon('bolt')}<div><div style="font-weight:600;font-size:13px">Tu tarjeta digital ya está lista</div><div class="text-muted" style="font-size:12px">Úsala para compras en línea desde ahora.</div></div></div><button class="btn btn--primary btn--sm" data-nav="tarjetas">Ver tarjeta digital</button></div></div>`:''}
        <div class="row mt-6" style="gap:12px"><button class="btn btn--secondary" style="flex:1" data-nav="inicio">Ir al inicio</button><button class="btn btn--primary" style="flex:1" onclick="toast({title:'Notificaciones activadas',msg:'Te avisaremos por cada avance.',type:'success'})">${icon('bell')} Recibir avisos</button></div>
      </div>`;
      view.querySelectorAll('[data-nav]').forEach(n=> n.onclick=()=>location.hash='#/'+n.dataset.nav);
    }

    /* ---- Navegación de pasos ---- */
    function persist() {
      const g=(id)=>{const e=$('#'+id);return e?e.value:undefined;};
      // Paso 1 (Personaliza + entrega): dirección
      if(S.step===1){ if(g('obCalle')!==undefined)S.data.calle=g('obCalle'); if(g('obCiudad')!==undefined)S.data.ciudad=g('obCiudad'); if(g('obRef')!==undefined)S.data.referencia=g('obRef'); }
      // Paso 2 (Confirma): datos de contacto
      if(S.step===2){ if(g('obEmail')!==undefined)S.data.email=g('obEmail'); if(g('obPhone')!==undefined)S.data.phone=g('obPhone'); }
    }
    function validate() {
      // Solo se valida la dirección si eligió entrega a domicilio
      if(S.step===1 && S.data.entrega==='domicilio'){ const c=$('#obCalle'); if(c && !c.value.trim()){$('#fCalle').classList.add('has-error');return false;} }
      return true;
    }

    function paintForm() {
      $('#obForm').innerHTML = views[S.step]() + navButtons();
      wireStep();
      paintSteps(); paintSide();
      $('#obForm').scrollIntoView({behavior:'smooth', block:'start'});
    }
    function navButtons() {
      const last = S.step===STEPS.length-1;
      return `<div class="row mt-4" style="gap:12px">${S.step>0?`<button class="btn btn--secondary" id="obBack" style="flex:1">${icon('back')} Atrás</button>`:`<button class="btn btn--secondary" id="obCancel" style="flex:1">Cancelar</button>`}<button class="btn btn--primary" id="obNext" style="flex:2">${S.step===0?'Iniciar solicitud':last?'Confirmar solicitud':'Continuar'}</button></div>`;
    }
    function wireStep() {
      const back=$('#obBack'); if(back) back.onclick=()=>{ persist(); S.step--; paintForm(); };
      const cancel=$('#obCancel'); if(cancel) cancel.onclick=()=> location.hash='#/ofertas';
      // Paso 1: personaliza (cupo, corte, formato) + entrega
      if(S.step===1){
        const sl=$('#obCupo'); if(sl) sl.oninput=()=>{ S.data.cupo=+sl.value; $('#obCupoVal').textContent=money(S.data.cupo); paintSide(); };
        view.querySelectorAll('#obCorte [data-corte]').forEach(b=>b.onclick=()=>{ view.querySelectorAll('#obCorte .chip').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); S.data.corte=b.dataset.corte; paintSide(); });
        view.querySelectorAll('#obFormato [data-fmt]').forEach(l=>l.onclick=()=>{ S.data.formato=l.dataset.fmt; view.querySelectorAll('#obFormato [data-fmt]').forEach(x=>{x.style.borderColor='var(--line)';x.style.boxShadow='none';}); l.style.borderColor='var(--blu-500)'; l.style.boxShadow='var(--ring)'; paintSide(); });
        view.querySelectorAll('#obEntrega [data-ent]').forEach(l=>l.onclick=()=>{ S.data.entrega=l.dataset.ent; view.querySelectorAll('#obEntrega [data-ent]').forEach(x=>{x.style.borderColor='var(--line)';x.style.boxShadow='none';}); l.style.borderColor='var(--blu-500)'; l.style.boxShadow='var(--ring)'; $('#obDir').style.display = l.dataset.ent==='agencia'?'none':'block'; });
        const c=$('#obCalle'); if(c) c.oninput=()=>$('#fCalle').classList.remove('has-error');
      }
      // Paso 2: confirma (débito, términos)
      if(S.step===2){ const t=$('#obTerm'); if(t) t.onchange=()=>{S.data.terminos=t.checked;$('#termErr').style.display='none';}; const d=$('#obDebito'); if(d) d.onchange=()=>S.data.debito=d.checked; }

      $('#obNext').onclick=(e)=>{
        persist();
        if(!validate()) return;
        if(S.step===STEPS.length-1){
          if(!$('#obTerm').checked){ $('#termErr').style.display='flex'; return; }
          // confirmación por token
          confirmSignature(S, ()=>{ S.done=true; paintDone(); });
          return;
        }
        S.step++; paintForm();
      };
    }

    paintForm();
  }
};

/* Modal de confirmación con token */
function confirmSignature(S, onOk) {
  const ov = openModal(`
    <div class="modal__head"><h3 class="h3">Confirma tu solicitud</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body">
      <p class="text-slate">Ingresa el código de tu app de seguridad para enviar tu solicitud de <strong>Diners Club Signature</strong> por ${money(S.data.cupo)}.</p>
      <div class="field mt-4"><label>Token dinámico</label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:40px;text-align:center;font-size:20px;font-weight:700" aria-label="Dígito token">').join('')}</div><span class="hint">Código de 6 dígitos.</span></div>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="obConfirm">Enviar solicitud</button></div>`);
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  const inputs=ov.querySelectorAll('.control input'); inputs.forEach((inp,i)=>inp.oninput=()=>{ if(inp.value&&inputs[i+1]) inputs[i+1].focus(); });
  ov.querySelector('#obConfirm').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); onOk(); toast({title:'Solicitud enviada',msg:'Tu Diners Club Signature está en revisión.',type:'success'}); }, 1200); };
}

/* Modal de términos y condiciones */
function openTerms() {
  const ov = openModal(`
    <div class="modal__head"><h3 class="h3">Contrato de tarjeta</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body" style="max-height:60vh;overflow:auto">
      <h4 class="h4 mb-2">Diners Club Signature — Términos</h4>
      ${['Tasa de interés efectiva anual referencial vigente según la tabla del BCE.','Sin costo de emisión ni renovación durante el primer año.','Comisión por avance de efectivo según tarifario publicado.','El cupo asignado está sujeto a evaluación crediticia final.','El pago mínimo se calcula sobre el saldo del estado de cuenta.','Puedes cancelar la tarjeta sin penalidad dentro de los primeros 30 días.'].map(t=>`<div class="row" style="gap:10px;padding:8px 0;align-items:flex-start">${icon('checkCircle')}<span class="text-slate" style="font-size:13px">${t}</span></div>`).join('')}
      <p class="text-muted mt-4" style="font-size:12px">Documento resumido para fines del prototipo. El contrato legal completo se entrega en formato PDF antes de la activación.</p>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cerrar</button><button class="btn btn--primary" id="acceptTerms">Aceptar y continuar</button></div>`, {wide:true});
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  ov.querySelector('#acceptTerms').onclick=()=>{ const t=$('#obTerm'); if(t){t.checked=true;t.dispatchEvent(new Event('change'));} const err=$('#termErr'); if(err) err.style.display='none'; closeModal(ov); };
}
