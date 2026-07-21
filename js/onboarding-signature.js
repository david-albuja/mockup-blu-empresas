/* BLU Web — Onboarding / Solicitud: Tarjeta Diners Club Signature
   Wizard guiado (7 pasos) + confirmación por token + seguimiento. */

Screens['onboarding-signature'] = {
  title: 'Solicitud de tarjeta adicional',
  render(view) {
    // Catálogo de tarjetas adicionales preaprobadas sobre la tarjeta principal.
    const CATALOG = [
      { id:'signature', name:'Diners Club Signature', tipo:'Signature', preap:8000, min:1000, variant:'diners', benef:'Salas VIP · Millas 2x1 · Cashback 3%' },
      { id:'black',     name:'Mastercard Black',      tipo:'World Elite', preap:12000, min:2000, variant:'black',  benef:'Concierge 24/7 · Seguros premium' },
      { id:'visa',      name:'Visa Signature',        tipo:'Signature', preap:6000, min:1000, variant:'indigo', benef:'Protección de compras · Cashback' },
    ];
    const S = {
      step: 0,
      done: false,
      data: {
        producto: 'signature',
        adicNombre: '', adicCedula: '', adicCelular: '', adicCorreo: '',
        cupo: 6000, corte: '15',
        calle: '', ciudad: 'Quito', referencia: '',
        debito: true, terminos: false,
      },
    };
    const getProd = () => CATALOG.find(p => p.id === S.data.producto) || CATALOG[0];
    const STEPS = ['Elige tarjeta','Personaliza','Confirma'];

    /* ---- Tarjeta de vista previa (según producto elegido) ---- */
    function previewCard() {
      const p = getProd();
      const c = { name:p.name, type:p.tipo, variant:p.variant, number:'5412 •••• •••• ••••', last4:'••••', disponible:S.data.cupo };
      return UI.bankCard(c);
    }

    /* ---- Layout base ---- */
    view.innerHTML = `
    ${pageHead('Solicita tu tarjeta adicional','Elige la tarjeta y asígnala a un colaborador.','ofertas')}
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
      const p = getProd();
      $('#obSide').innerHTML = `
      <div class="grid" style="gap:16px">
        ${previewCard()}
        <div class="card card--pad">
          <div class="eyebrow mb-2">Resumen de tu solicitud</div>
          ${kv('Producto', p.name)}
          ${kv('Adicional para', S.data.adicNombre || '—')}
          ${kv('Cupo solicitado', money(S.data.cupo), 1)}
          ${kv('Fecha de corte', S.data.corte+' de cada mes')}
          ${kv('Formato', 'Física')}
          <div class="sum-total" style="margin-top:12px"><div><div class="text-muted" style="font-size:12px">Sin costo de emisión</div><div class="v" style="font-size:16px;color:var(--success)">1er año gratis</div></div><span class="badge badge--success"><span class="dot"></span>Preaprobada</span></div>
        </div>
        ${infoBanner('Tus datos viajan cifrados. No se genera ningún cargo hasta que actives tu tarjeta.','shield')}
      </div>`;
    }

    /* ---- Contenido por paso ---- */
    const views = {
      0: () => `
        <div class="card card--pad">
          <div class="row between mb-4"><span class="badge badge--info">${icon('sparkles')} Preaprobadas para ti</span><span class="text-muted" style="font-size:13px">Válidas hasta 31 jul 2026</span></div>
          <h2 class="h3 mb-2">Elige la tarjeta adicional</h2>
          <p class="text-muted mb-6">Catálogo de tarjetas preaprobadas sobre tu tarjeta principal.</p>
          <div class="grid" style="gap:12px" id="obCatalog" role="radiogroup" aria-label="Tarjeta adicional">
            ${CATALOG.map(p=>`<button type="button" class="pay-opt ${p.id===S.data.producto?'is-sel':''}" data-prod="${p.id}" role="radio" aria-checked="${p.id===S.data.producto}">
              <span class="pay-opt__radio"></span>
              <span class="pay-opt__body"><span class="pay-opt__title">${p.name}</span><span class="pay-opt__sub">${p.tipo} · ${p.benef}</span></span>
              <span class="pay-opt__amt num" style="font-size:13px;text-align:right">Cupo hasta<br>${money(p.preap)}</span>
            </button>`).join('')}
          </div>
          <label class="row" style="gap:10px;margin-top:16px;cursor:pointer;font-size:13px"><input type="checkbox" id="obAck" checked><span class="text-slate">Autorizo la consulta del historial crediticio para esta solicitud.</span></label>
        </div>`,

      1: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Personaliza tu tarjeta adicional</h2>
          <p class="text-muted mb-6">Datos de la persona a la que se le asignará la adicional.</p>
          <div class="field"><label>Nombre completo <span class="req">*</span></label><div class="control">${icon('user')}<input id="obNombre" value="${S.data.adicNombre}" placeholder="Nombre y apellidos"></div><span class="error-text">${icon('alert')} Ingresa el nombre completo.</span></div>
          <div class="grid grid-2" style="gap:0 16px">
            <div class="field" id="fCed"><label>Cédula <span class="req">*</span></label><div class="control">${icon('file')}<input id="obCedula" value="${S.data.adicCedula}" inputmode="numeric" placeholder="0102030405"></div><span class="error-text">${icon('alert')} Ingresa la cédula.</span></div>
            <div class="field"><label>Celular <span class="req">*</span></label><div class="control">${icon('phone')}<input id="obCelular" value="${S.data.adicCelular}" inputmode="numeric" placeholder="099 000 0000"></div></div>
          </div>
          <div class="field"><label>Correo electrónico <span class="req">*</span></label><div class="control">${icon('receipt')}<input id="obCorreo" type="email" value="${S.data.adicCorreo}" placeholder="correo@empresa.com"></div></div>
          <div class="divider"></div>
          <div class="field"><label>Cupo a asignar</label><div class="control">${icon('coins')}<span class="prefix">$</span><input id="obCupo" inputmode="decimal" value="${S.data.cupo}" placeholder="0,00" aria-label="Cupo a asignar"></div><span class="hint">Entre ${money(getProd().min)} y ${money(getProd().preap)} (cupo preaprobado).</span></div>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">Fecha de corte</label>
          <div class="scroll-x mt-2" id="obCorte">${['5','10','15','20','25'].map(d=>`<button class="chip ${d===S.data.corte?'is-active':''}" data-corte="${d}">${d} de cada mes</button>`).join('')}</div>
          <div class="divider"></div>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">Dirección de entrega</label>
          <div class="mt-2">
            <div class="field" id="fCalle"><label>Dirección <span class="req">*</span></label><div class="control">${icon('map')}<input id="obCalle" value="${S.data.calle}" placeholder="Calle principal, número, secundaria"></div><span class="error-text">${icon('alert')} Ingresa la dirección de entrega.</span></div>
            <div class="grid grid-2" style="gap:0 16px">
              <div class="field"><label>Ciudad</label><div class="control">${icon('building')}<select id="obCiudad"><option>Quito</option><option>Guayaquil</option><option>Cuenca</option><option>Ambato</option></select>${icon('chevronDown')}</div></div>
              <div class="field"><label>Referencia</label><div class="control">${icon('info')}<input id="obRef" value="${S.data.referencia}" placeholder="Ej. edificio, piso, oficina"></div></div>
            </div>
          </div>
          <div class="row" style="gap:10px;padding:12px 0;border-top:1px solid var(--line-2);margin-top:4px"><span class="prod__ic prod__ic--acct" style="width:38px;height:38px">${icon('clock')}</span><div><div style="font-weight:600;font-size:13px">Entrega en 3 a 5 días hábiles</div><div class="text-muted" style="font-size:12px">La tarjeta física llega a la dirección indicada.</div></div></div>
        </div>`,

      2: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Revisa y confirma</h2>
          <p class="text-muted mb-6">Verifica los datos de la tarjeta adicional antes de enviar la solicitud.</p>
          ${kv('Tarjeta', getProd().name)}
          ${kv('Adicional para', S.data.adicNombre || '—')}
          ${kv('Cédula', S.data.adicCedula || '—')}
          ${kv('Celular', S.data.adicCelular || '—')}
          ${kv('Correo', S.data.adicCorreo || '—')}
          <div class="divider"></div>
          ${kv('Cupo a asignar', money(S.data.cupo), 1)}
          ${kv('Fecha de corte', S.data.corte+' de cada mes')}
          ${kv('Formato', 'Física')}
          ${kv('Entrega', S.data.calle || 'Dirección registrada')}
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
      // Seguimiento de la tarjeta adicional
      const steps=[['Por embozar','Hoy · '+hora,'done'],['Pendiente de distribución','En preparación','active'],['En proceso de entrega','Courier · 3-5 días hábiles','pending'],['Entregada','Firma de recepción','pending'],['Tarjeta activa','Lista para usar','pending']];
      $('#obForm').closest('.grid').style.gridTemplateColumns='1fr';
      $('#obForm').innerHTML = `
      <div class="card card--pad" style="max-width:620px;margin:0 auto;text-align:center">
        <div class="state__art" style="margin:0 auto 12px;background:var(--success-bg);color:var(--success)">${icon('checkCircle')}</div>
        <h2 class="h2">¡Tarjeta aprobada!</h2>
        <p class="text-muted mt-2">La tarjeta adicional para ${S.data.adicNombre||'tu colaborador'} fue aprobada. Solo falta la entrega.</p>
        <div class="card card--pad mt-6" style="text-align:left;background:var(--surface-2)">
          ${kv('N.º de solicitud','#ADC-'+Math.floor(100000+Math.random()*899999))}
          ${kv('Tarjeta', getProd().name)}
          ${kv('Adicional para', S.data.adicNombre || '—')}
          ${kv('Cupo aprobado', money(S.data.cupo), 1)}
          ${kv('Formato', 'Física')}
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
        <div class="row mt-6" style="gap:12px"><button class="btn btn--secondary" style="flex:1" data-nav="inicio">Ir al inicio</button><button class="btn btn--primary" style="flex:1" data-nav="tarjetas">Ver mis tarjetas</button></div>
      </div>`;
      view.querySelectorAll('[data-nav]').forEach(n=> n.onclick=()=>location.hash='#/'+n.dataset.nav);
    }

    /* ---- Navegación de pasos ---- */
    function persist() {
      const g=(id)=>{const e=$('#'+id);return e?e.value:undefined;};
      if(S.step===1){
        if(g('obNombre')!==undefined)S.data.adicNombre=g('obNombre');
        if(g('obCedula')!==undefined)S.data.adicCedula=g('obCedula');
        if(g('obCelular')!==undefined)S.data.adicCelular=g('obCelular');
        if(g('obCorreo')!==undefined)S.data.adicCorreo=g('obCorreo');
        if(g('obCupo')!==undefined)S.data.cupo=parseFloat((g('obCupo')||'').replace(',','.'))||S.data.cupo;
        if(g('obCalle')!==undefined)S.data.calle=g('obCalle');
        if(g('obCiudad')!==undefined)S.data.ciudad=g('obCiudad');
        if(g('obRef')!==undefined)S.data.referencia=g('obRef');
      }
    }
    function validate() {
      if(S.step===1){
        let ok=true;
        const n=$('#obNombre'); if(n && !n.value.trim()){ n.closest('.field').classList.add('has-error'); ok=false; }
        const ced=$('#obCedula'); if(ced && !ced.value.trim()){ $('#fCed').classList.add('has-error'); ok=false; }
        const c=$('#obCalle'); if(c && !c.value.trim()){ $('#fCalle').classList.add('has-error'); ok=false; }
        return ok;
      }
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
      return `<div class="row mt-4" style="gap:12px">${S.step>0?`<button class="btn btn--secondary" id="obBack" style="flex:1">${icon('back')} Atrás</button>`:`<button class="btn btn--secondary" id="obCancel" style="flex:1">Cancelar</button>`}<button class="btn btn--primary" id="obNext" style="flex:2">${S.step===0?'Continuar':last?'Confirmar solicitud':'Continuar'}</button></div>`;
    }
    function wireStep() {
      const back=$('#obBack'); if(back) back.onclick=()=>{ persist(); S.step--; paintForm(); };
      const cancel=$('#obCancel'); if(cancel) cancel.onclick=()=> location.hash='#/ofertas';
      // Paso 0: catálogo de tarjetas preaprobadas
      if(S.step===0){
        view.querySelectorAll('#obCatalog [data-prod]').forEach(b=>b.onclick=()=>{ S.data.producto=b.dataset.prod; const p=getProd(); S.data.cupo=Math.min(S.data.cupo||p.min, p.preap); view.querySelectorAll('#obCatalog [data-prod]').forEach(x=>{x.classList.remove('is-sel');x.setAttribute('aria-checked','false');}); b.classList.add('is-sel'); b.setAttribute('aria-checked','true'); paintSide(); });
      }
      // Paso 1: datos del adicional + cupo + corte + dirección
      if(S.step===1){
        const cu=$('#obCupo'); if(cu) cu.oninput=()=>{ S.data.cupo=parseFloat((cu.value||'').replace(',','.'))||0; paintSide(); };
        ['obNombre','obCedula','obCelular','obCorreo'].forEach(id=>{ const e=$('#'+id); if(e) e.oninput=()=>{ e.closest('.field').classList.remove('has-error'); paintSide(); }; });
        view.querySelectorAll('#obCorte [data-corte]').forEach(b=>b.onclick=()=>{ view.querySelectorAll('#obCorte .chip').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); S.data.corte=b.dataset.corte; paintSide(); });
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
      <p class="text-slate">Ingresa el código de tu app de seguridad para enviar tu solicitud de <strong>tarjeta adicional</strong> por ${money(S.data.cupo)}.</p>
      <div class="field mt-4"><label>Token dinámico</label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:40px;text-align:center;font-size:20px;font-weight:700" aria-label="Dígito token">').join('')}</div><span class="hint">Código de 6 dígitos.</span></div>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="obConfirm">Enviar solicitud</button></div>`);
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
  const inputs=ov.querySelectorAll('.control input'); inputs.forEach((inp,i)=>inp.oninput=()=>{ if(inp.value&&inputs[i+1]) inputs[i+1].focus(); });
  ov.querySelector('#obConfirm').onclick=(e)=>{ e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); onOk(); toast({title:'Solicitud enviada',msg:'Tu tarjeta adicional está en revisión.',type:'success'}); }, 1200); };
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
