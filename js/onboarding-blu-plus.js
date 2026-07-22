/* BLU Web — Onboarding: Cuenta de ahorros BLU+ (estilo Revolut Vaults / N26 Spaces)
   Apertura 100% digital con meta de ahorro, redondeo y aporte recurrente. */

Screens['onboarding-blu-plus'] = {
  title: 'Abrir cuenta',
  render(view) {
    // Catálogo de cuentas preaprobadas
    const CATALOG = [
      { id:'ahorro-blu', name:'Cuenta de Ahorros BLU+', sub:'Rendimiento 4% anual · sin costo', tasa:'4% anual' },
      { id:'corriente', name:'Cuenta Corriente', sub:'Para operar tu negocio', tasa:'—' },
      { id:'dolares', name:'Cuenta en Dólares', sub:'Ahorra en USD · 3,1% anual', tasa:'3,1% anual' },
    ];
    // Cliente Diners existente → aparece el paso "Primer depósito" (origen interno).
    const esCliente = DB.accounts.length > 0;
    const S = {
      step: 0, done: false,
      data: { producto:'ahorro-blu', nombre:'Mi cuenta de ahorro', montoObjetivo: 5000, initial: 100,
        source: 'Cuenta de Ahorros BLU ···2205', terms: false },
    };
    const getProd = () => CATALOG.find(p => p.id === S.data.producto) || CATALOG[0];
    // El paso "Primer depósito" (2) solo aparece si ya eres cliente Diners.
    const STEPS = esCliente ? ['Tu cuenta', 'Cuenta de ahorro', 'Primer depósito', 'Revisión'] : ['Tu cuenta', 'Cuenta de ahorro', 'Revisión'];

    view.innerHTML = `
    ${pageHead('Abre tu cuenta', 'Elige tu cuenta preaprobada y ábrela en minutos.', 'ofertas')}
    <div class="grid" style="grid-template-columns:1fr 360px;align-items:start;gap:28px">
      <div><div class="section" id="obSteps"></div><div id="obForm" class="section" style="margin-top:8px"></div></div>
      <aside style="position:sticky;top:calc(var(--topbar-h) + 24px)" id="obSide"></aside>
    </div>`;

    function paintSteps() {
      if (S.done) { $('#obSteps').innerHTML = ''; return; }
      $('#obSteps').innerHTML = `
      <div class="row between mb-2"><span class="eyebrow">Paso ${S.step+1} de ${STEPS.length}</span><span class="text-muted" style="font-size:12px;font-weight:600">${Math.round(S.step/(STEPS.length-1)*100)}%</span></div>
      <div class="progress mb-4"><span style="width:${S.step/(STEPS.length-1)*100}%"></span></div>
      <div class="stepper" style="flex-wrap:wrap;gap:6px 4px">${STEPS.map((s,i)=>`<div class="step ${i===S.step?'is-active':i<S.step?'is-done':''}"><span class="bullet">${i<S.step?icon('check'):i+1}</span><span class="label" style="${i===S.step?'':'display:none'}">${s}</span></div>${i<STEPS.length-1?`<span class="bar ${i<S.step?'is-done':''}"></span>`:''}`).join('')}</div>`;
    }

    // Vista previa estilo Home (sin imagen de tarjeta ni cuadro de resumen)
    function paintSide() {
      if (S.done) { $('#obSide').innerHTML = ''; return; }
      const p = getProd();
      $('#obSide').innerHTML = `
      <div class="grid" style="gap:16px">
        <div class="prod-xl acct-card-plain" style="width:100%">
          <div class="prod-xl__body">
            <span class="prod__ic prod__ic--acct" style="margin:0 auto 8px">${icon('wallet')}</span>
            <div class="prod-xl__name">${p.name}</div>
            <div class="prod-xl__id num">Nueva cuenta${p.tasa!=='—'?' · '+p.tasa:''}</div>
            <div class="prod-xl__amt num" style="font-size:32px;margin-top:16px">${money(S.data.initial)}</div>
            <div class="prod-xl__sub">Depósito inicial</div>
          </div>
        </div>
        ${infoBanner('Tu dinero está siempre disponible. Sin monto mínimo ni comisiones de mantenimiento.','shield')}
      </div>`;
    }

    // Paso índice → clave lógica (para saltar "Primer depósito" si no es cliente)
    const stepKey = () => STEPS[S.step];

    function viewFor(key) {
      if (key === 'Tu cuenta') return `
        <div class="card card--pad">
          <div class="row between mb-4"><span class="badge badge--info">${icon('sparkles')} Preaprobadas para ti</span><span class="text-muted" style="font-size:13px">Apertura en 2 minutos</span></div>
          <h2 class="h3 mb-2">Elige tu cuenta</h2>
          <p class="text-muted mb-6">Catálogo de cuentas preaprobadas para tu empresa.</p>
          <div class="grid" style="gap:12px" id="obCatalog" role="radiogroup" aria-label="Cuenta a abrir">
            ${CATALOG.map(p=>`<button type="button" class="pay-opt ${p.id===S.data.producto?'is-sel':''}" data-prod="${p.id}" role="radio" aria-checked="${p.id===S.data.producto}"><span class="pay-opt__radio"></span><span class="pay-opt__body"><span class="pay-opt__title">${p.name}</span><span class="pay-opt__sub">${p.sub}</span></span><span class="pay-opt__amt num" style="font-size:13px">${p.tasa}</span></button>`).join('')}
          </div>
          <label class="row" style="gap:10px;margin-top:16px;cursor:pointer"><input type="checkbox" id="obAck" checked><span class="text-slate" style="font-size:13px">Acepto que se verifique mi identidad para abrir la cuenta.</span></label>
        </div>`;
      if (key === 'Cuenta de ahorro') return `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Tu cuenta de ahorro</h2>
          <p class="text-muted mb-6">Dale un nombre a tu cuenta de ahorro.</p>
          <div class="field"><label>Nombre de la cuenta</label><div class="control">${icon('star')}<input id="obNombre" value="${S.data.nombre}" maxlength="28" placeholder="Ej. Ahorro operativo"></div></div>
          <div class="field"><label>Monto objetivo (opcional)</label><div class="control">${icon('coins')}<span class="prefix">$</span><input id="obTarget" inputmode="decimal" value="${S.data.montoObjetivo}" placeholder="0,00"></div><span class="hint">Un monto de referencia para tu cuenta de ahorro.</span></div>
        </div>`;
      if (key === 'Primer depósito') return `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Fondea tu cuenta</h2>
          <p class="text-muted mb-6">Haz tu primer depósito desde una de tus cuentas.</p>
          <div class="field"><label>Depósito inicial</label><div class="control">${icon('coins')}<span class="prefix">$</span><input id="obInitial" inputmode="decimal" value="${S.data.initial}"></div><span class="hint">Desde $0. Puedes empezar con lo que quieras.</span></div>
          <div class="field"><label>Cuenta de origen del depósito</label><div class="control">${icon('wallet')}<select id="obSource">${DB.accounts.map(a=>`<option>${a.name} ${a.num} — ${money(a.saldo)}</option>`).join('')}</select>${icon('chevronDown')}</div></div>
        </div>`;
      // Revisión
      return `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Revisa y confirma</h2>
          <p class="text-muted mb-6">Todo listo para abrir tu cuenta.</p>
          ${kv('Titular', DB.user.name)}
          ${kv('Producto', getProd().name)}
          ${kv('Nombre de la cuenta', S.data.nombre)}
          ${esCliente ? kv('Origen del depósito', S.data.source) : ''}
          <label class="row" style="gap:10px;cursor:pointer;align-items:flex-start;margin-top:14px" id="fTerm"><input type="checkbox" id="obTerm" style="margin-top:3px"><span class="text-slate" style="font-size:13px">Acepto el <a href="#/onboarding-blu-plus" onclick="event.preventDefault();openTermsPlus()" style="color:var(--primary);font-weight:600">contrato de la cuenta de ahorros</a> y la tabla de costos.</span></label>
          <div id="termErr" style="display:none;color:var(--error);font-size:12px;font-weight:500;margin-top:6px" class="row"><span>${icon('alert')} Debes aceptar los términos para continuar.</span></div>
        </div>`;
    }

    function paintDone() {
      $('#obSteps').innerHTML = ''; $('#obSide').innerHTML = '';
      $('#obForm').closest('.grid').style.gridTemplateColumns = '1fr';
      $('#obForm').innerHTML = `
      <div class="card card--pad" style="max-width:600px;margin:0 auto;text-align:center">
        <div class="state__art" style="margin:0 auto 12px;background:var(--success-bg);color:var(--success)">${icon('checkCircle')}</div>
        <h2 class="h2">¡Tu cuenta está lista!</h2>
        <p class="text-muted mt-2">Abriste tu <strong>${getProd().name}</strong>.</p>
        <div class="prod-xl acct-card-plain" style="width:100%;max-width:300px;margin:24px auto 0">
          <div class="prod-xl__body">
            <span class="prod__ic prod__ic--acct" style="margin:0 auto 8px">${icon('wallet')}</span>
            <div class="prod-xl__name">${S.data.nombre}</div>
            <div class="prod-xl__id num">${getProd().name} · ···${1000+Math.floor(Math.random()*8999)}</div>
            <div class="prod-xl__amt num" style="font-size:32px;margin-top:16px">${money(S.data.initial)}</div>
            <div class="prod-xl__sub">Saldo disponible</div>
          </div>
        </div>
        <div class="row mt-6" style="gap:12px"><button class="btn btn--secondary" style="flex:1" data-nav="inicio">Ir al inicio</button><button class="btn btn--primary" style="flex:1" data-nav="cuentas?cat=cuenta">Ver mis cuentas</button></div>
      </div>`;
      view.querySelectorAll('[data-nav]').forEach(n => n.onclick = () => location.hash = '#/' + n.dataset.nav);
    }

    function persist() {
      const g = id => { const e = $('#' + id); return e ? e.value : undefined; };
      const key = stepKey();
      if (key === 'Cuenta de ahorro') { if (g('obNombre') !== undefined) S.data.nombre = g('obNombre') || 'Mi cuenta de ahorro'; const mv=parseFloat((g('obTarget')||'').replace(',','.')); if(!isNaN(mv)) S.data.montoObjetivo=mv; }
      if (key === 'Primer depósito') { const iv = parseFloat((g('obInitial')||'').replace(',','.')); if (!isNaN(iv)) S.data.initial = iv; if (g('obSource') !== undefined) S.data.source = g('obSource').split(' — ')[0]; }
    }

    function paintForm() {
      $('#obForm').innerHTML = viewFor(stepKey()) + navButtons();
      wireStep(); paintSteps(); paintSide();
      $('#obForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function navButtons() {
      const last = S.step === STEPS.length - 1;
      return `<div class="row mt-4" style="gap:12px">${S.step>0?`<button class="btn btn--secondary" id="obBack" style="flex:1">${icon('back')} Atrás</button>`:`<button class="btn btn--secondary" id="obCancel" style="flex:1">Cancelar</button>`}<button class="btn btn--primary" id="obNext" style="flex:2">${S.step===0?'Continuar':last?'Confirmar apertura':'Continuar'}</button></div>`;
    }
    function wireStep() {
      const back = $('#obBack'); if (back) back.onclick = () => { persist(); S.step--; paintForm(); };
      const cancel = $('#obCancel'); if (cancel) cancel.onclick = () => location.hash = '#/ofertas';
      const key = stepKey();
      if (key === 'Tu cuenta') {
        view.querySelectorAll('#obCatalog [data-prod]').forEach(b => b.onclick = () => { S.data.producto = b.dataset.prod; view.querySelectorAll('#obCatalog [data-prod]').forEach(x=>{x.classList.remove('is-sel');x.setAttribute('aria-checked','false');}); b.classList.add('is-sel'); b.setAttribute('aria-checked','true'); paintSide(); });
      }
      if (key === 'Cuenta de ahorro') {
        const g = $('#obNombre'); if (g) g.oninput = () => { S.data.nombre = g.value; };
      }
      if (key === 'Primer depósito') {
        const ini = $('#obInitial'); if (ini) ini.oninput = () => { const v = parseFloat(ini.value.replace(',','.')); S.data.initial = isNaN(v)?0:v; paintSide(); };
      }
      if (key === 'Revisión') { const t = $('#obTerm'); if (t) t.onchange = () => { S.data.terms = t.checked; $('#termErr').style.display = 'none'; }; }
      $('#obNext').onclick = () => {
        persist();
        if (stepKey() === 'Revisión') {
          if (!$('#obTerm').checked) { $('#termErr').style.display = 'flex'; return; }
          confirmPlus(S, () => { S.done = true; paintDone(); });
          return;
        }
        S.step++; paintForm();
      };
    }
    paintForm();
  }
};

function confirmPlus(S, onOk) {
  const ov = openModal(`
    <div class="modal__head"><h3 class="h3">Confirmar apertura</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body">
      <p class="text-slate">Confirma con tu token para abrir tu <strong>Cuenta BLU+</strong> y depositar ${money(S.data.initial)}.</p>
      <div class="field mt-4"><label>Token dinámico</label><div class="control" style="justify-content:center;gap:10px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:40px;text-align:center;font-size:20px;font-weight:700" aria-label="Dígito token">').join('')}</div></div>
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="plusDo">Abrir cuenta</button></div>`);
  ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(ov));
  const inputs = ov.querySelectorAll('.control input'); inputs.forEach((inp,i) => inp.oninput = () => { if (inp.value && inputs[i+1]) inputs[i+1].focus(); });
  ov.querySelector('#plusDo').onclick = (e) => { e.currentTarget.classList.add('is-loading'); setTimeout(() => { closeModal(ov); onOk(); toast({ title: 'Cuenta BLU+ creada', msg: 'Empieza a ahorrar hoy.', type: 'success' }); }, 1100); };
}

function openTermsPlus() {
  const ov = openModal(`
    <div class="modal__head"><h3 class="h3">Contrato Cuenta BLU+</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
    <div class="modal__body" style="max-height:60vh;overflow:auto">
      ${['Rendimiento del 4% anual calculado sobre el saldo diario y acreditado mensualmente.','Sin monto mínimo de apertura ni saldo mínimo de mantenimiento.','Sin comisión de mantenimiento ni de apertura.','Tu dinero está disponible para retiro en cualquier momento.','El redondeo automático debita la diferencia de tus compras hacia tu meta.','Cuenta protegida por el seguro de depósitos vigente.'].map(t=>`<div class="row" style="gap:10px;padding:8px 0;align-items:flex-start">${icon('checkCircle')}<span class="text-slate" style="font-size:13px">${t}</span></div>`).join('')}
    </div>
    <div class="modal__foot"><button class="btn btn--secondary" data-close>Cerrar</button><button class="btn btn--primary" id="acceptPlus">Aceptar y continuar</button></div>`, { wide: true });
  ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(ov));
  ov.querySelector('#acceptPlus').onclick = () => { const t = $('#obTerm'); if (t) { t.checked = true; t.dispatchEvent(new Event('change')); } const err = $('#termErr'); if (err) err.style.display = 'none'; closeModal(ov); };
}
