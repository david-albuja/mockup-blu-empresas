/* BLU Web — Onboarding: Cuenta de ahorros BLU+ (estilo Revolut Vaults / N26 Spaces)
   Apertura 100% digital con meta de ahorro, redondeo y aporte recurrente. */

Screens['onboarding-blu-plus'] = {
  title: 'Abrir cuenta BLU+',
  render(view) {
    const S = {
      step: 0, done: false,
      data: { goalName: 'Mi meta de ahorro', target: 5000, deadline: '', initial: 100,
        source: 'Cuenta de Ahorros BLU ···2205', roundup: true, recurring: 'mensual', recurringAmt: 50, terms: false },
    };
    const STEPS = ['Tu cuenta', 'Tu meta', 'Primer depósito', 'Revisión'];
    const RATE = 0.04;

    view.innerHTML = `
    ${pageHead('Abre tu Cuenta de Ahorros BLU+', 'Ahorra con propósito y gana 4% anual.', 'ofertas')}
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

    function paintSide() {
      if (S.done) { $('#obSide').innerHTML = ''; return; }
      const yearGain = S.data.target * RATE;
      return $('#obSide').innerHTML = `
      <div class="grid" style="gap:16px">
        <div class="acct-card acct-card--acct" style="cursor:default;min-height:180px">
          <div class="acct-card__top"><span class="ic">${icon('wallet')}</span><span class="badge badge--glass">BLU+ · 4% anual</span></div>
          <div><div class="acct-card__label">${S.data.goalName || 'Cuenta BLU+'}</div><div class="acct-card__amt num">${money(S.data.initial)}</div>
            <div style="margin-top:12px"><div class="row between" style="font-size:11px;opacity:.85"><span>Meta ${money(S.data.target)}</span><span>${Math.min(100,Math.round(S.data.initial/S.data.target*100))}%</span></div>
            <div class="progress mt-2" style="background:rgba(255,255,255,.28)"><span style="width:${Math.min(100,S.data.initial/S.data.target*100)}%;background:#fff"></span></div></div>
          </div>
        </div>
        <div class="card card--pad">
          <div class="eyebrow mb-2">Resumen</div>
          ${kv('Producto','Cuenta de Ahorros BLU+')}
          ${kv('Meta', money(S.data.target), 1)}
          ${kv('Depósito inicial', money(S.data.initial), 1)}
          ${kv('Aporte', S.data.recurring==='no'?'Sin aporte':`${money(S.data.recurringAmt)} / ${S.data.recurring}`)}
          <div class="sum-total" style="margin-top:12px"><div><div class="text-muted" style="font-size:12px">Ganas al año (4%)</div><div class="v" style="font-size:16px;color:var(--success)">+ ${money(yearGain)}</div></div><span class="badge badge--success"><span class="dot"></span>Sin costo</span></div>
        </div>
        ${infoBanner('Tu dinero está siempre disponible. Sin monto mínimo ni comisiones de mantenimiento.','shield')}
      </div>`;
    }

    const views = {
      0: () => `
        <div class="card card--pad">
          <div class="row between mb-4"><span class="badge badge--info">${icon('sparkles')} Nuevo producto</span><span class="text-muted" style="font-size:13px">Apertura en 2 minutos</span></div>
          <h2 class="h2">Cuenta de Ahorros BLU+</h2>
          <p class="text-muted mb-6">Ahorra para tus metas y gana <strong style="color:var(--ink)">4% de rendimiento anual</strong>, con tu dinero siempre disponible.</p>
          <div class="grid grid-2" style="gap:12px">
            ${[['4% anual','Rendimiento sobre tu saldo','coins'],['Sin costo','Ni mantenimiento ni mínimos','check'],['Metas de ahorro','Organiza por objetivos','star'],['Redondeo','Ahorra en cada compra','sparkles']].map(b=>`<div class="row" style="gap:12px;padding:10px 0"><span class="prod__ic prod__ic--acct" style="width:40px;height:40px">${icon(b[2])}</span><div><div style="font-weight:600;font-size:13px">${b[0]}</div><div class="text-muted" style="font-size:12px">${b[1]}</div></div></div>`).join('')}
          </div>
          <label class="row" style="gap:10px;margin-top:16px;cursor:pointer"><input type="checkbox" id="obAck" checked><span class="text-slate" style="font-size:13px">Acepto que se verifique mi identidad para abrir la cuenta.</span></label>
        </div>`,

      1: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">¿Para qué estás ahorrando?</h2>
          <p class="text-muted mb-6">Dale un nombre y una meta a tu cuenta (podrás cambiarlo luego).</p>
          <div class="field"><label>Nombre de tu meta</label><div class="control">${icon('star')}<input id="obGoal" value="${S.data.goalName}" maxlength="28" placeholder="Ej. Viaje, Fondo de emergencia"></div></div>
          <label style="font-size:13px;font-weight:600;color:var(--slate)">Monto objetivo</label>
          <div class="row between mb-2 mt-2"><span class="text-muted" style="font-size:13px">$500</span><span class="h3 num" id="obTargetVal">${money(S.data.target)}</span><span class="text-muted" style="font-size:13px">$50.000</span></div>
          ${slider('obTarget',500,50000,S.data.target,500)}
          <div class="field mt-6"><label>Fecha objetivo (opcional)</label><div class="control">${icon('calendar')}<input type="date" id="obDeadline"></div><span class="hint">Te ayudamos a calcular cuánto ahorrar cada mes.</span></div>
        </div>`,

      2: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Fondea tu cuenta</h2>
          <p class="text-muted mb-6">Haz tu primer depósito y automatiza tu ahorro.</p>
          <div class="field"><label>Depósito inicial</label><div class="control"><span class="prefix">$</span><input id="obInitial" inputmode="decimal" value="${S.data.initial}"></div><span class="hint">Desde $0. Puedes empezar con lo que quieras.</span></div>
          <div class="field"><label>Desde</label><div class="control">${icon('wallet')}<select id="obSource"><option>Cuenta de Ahorros BLU ···2205 — ${money(DB.accounts[0].saldo)}</option><option>Cuenta Corriente ···7781 — ${money(DB.accounts[1].saldo)}</option></select>${icon('chevronDown')}</div></div>
          <div class="card card--pad mt-4" style="background:var(--surface-2)">
            <label class="row between" style="cursor:pointer;align-items:flex-start"><span class="row" style="gap:10px">${icon('sparkles')}<span><span style="font-weight:600;font-size:14px">Redondeo automático</span><span class="text-muted" style="display:block;font-size:12px">Redondea tus compras y ahorra la diferencia</span></span></span><label class="switch"><input type="checkbox" id="obRound" ${S.data.roundup?'checked':''}><span class="track"></span></label></label>
          </div>
          <div class="field mt-4"><label>Aporte recurrente</label><div class="scroll-x" id="obRec">${[['no','Sin aporte'],['semanal','Semanal'],['mensual','Mensual']].map(r=>`<button class="chip ${r[0]===S.data.recurring?'is-active':''}" data-rec="${r[0]}">${r[1]}</button>`).join('')}</div></div>
          <div class="field" id="obRecAmtWrap" style="${S.data.recurring==='no'?'display:none':''}"><label>Monto del aporte</label><div class="control"><span class="prefix">$</span><input id="obRecAmt" inputmode="decimal" value="${S.data.recurringAmt}"></div></div>
        </div>`,

      3: () => `
        <div class="card card--pad">
          <h2 class="h3 mb-2">Revisa y confirma</h2>
          <p class="text-muted mb-6">Todo listo para abrir tu cuenta BLU+.</p>
          ${kv('Titular', DB.user.name)}
          ${kv('Meta', S.data.goalName)}
          ${kv('Monto objetivo', money(S.data.target), 1)}
          ${kv('Depósito inicial', money(S.data.initial), 1)}
          ${kv('Origen', S.data.source)}
          ${kv('Redondeo automático', S.data.roundup ? 'Activado' : 'Desactivado')}
          ${kv('Aporte recurrente', S.data.recurring==='no'?'Sin aporte':`${money(S.data.recurringAmt)} / ${S.data.recurring}`)}
          ${kv('Rendimiento', '4% anual')}
          <label class="row" style="gap:10px;cursor:pointer;align-items:flex-start;margin-top:14px" id="fTerm"><input type="checkbox" id="obTerm" style="margin-top:3px"><span class="text-slate" style="font-size:13px">Acepto el <a href="#/onboarding-blu-plus" onclick="event.preventDefault();openTermsPlus()" style="color:var(--primary);font-weight:600">contrato de la cuenta de ahorros</a> y la tabla de costos.</span></label>
          <div id="termErr" style="display:none;color:var(--error);font-size:12px;font-weight:500;margin-top:6px" class="row"><span>${icon('alert')} Debes aceptar los términos para continuar.</span></div>
        </div>`,
    };

    function paintDone() {
      $('#obSteps').innerHTML = ''; $('#obSide').innerHTML = '';
      $('#obForm').closest('.grid').style.gridTemplateColumns = '1fr';
      const pct = Math.min(100, Math.round(S.data.initial / S.data.target * 100));
      $('#obForm').innerHTML = `
      <div class="card card--pad" style="max-width:600px;margin:0 auto;text-align:center">
        <div class="state__art" style="margin:0 auto 12px;background:var(--success-bg);color:var(--success)">${icon('checkCircle')}</div>
        <h2 class="h2">¡Tu cuenta BLU+ está lista!</h2>
        <p class="text-muted mt-2">Empezaste a ahorrar para <strong>${S.data.goalName}</strong>.</p>
        <div class="acct-card acct-card--acct" style="cursor:default;text-align:left;margin-top:24px">
          <div class="acct-card__top"><span class="ic">${icon('wallet')}</span><span class="badge badge--glass">BLU+ ···${Math.floor(1000+Math.random()*8999)}</span></div>
          <div><div class="acct-card__label">${S.data.goalName}</div><div class="acct-card__amt num">${money(S.data.initial)}</div>
            <div style="margin-top:12px"><div class="row between" style="font-size:11px;opacity:.85"><span>Meta ${money(S.data.target)}</span><span>${pct}%</span></div><div class="progress mt-2" style="background:rgba(255,255,255,.28)"><span style="width:${pct}%;background:#fff"></span></div></div>
          </div>
        </div>
        ${S.data.recurring!=='no' ? `<div class="card card--pad mt-4" style="background:var(--blu-50);border-color:var(--blu-100);text-align:left"><div class="row" style="gap:10px">${icon('calendar')}<div><div style="font-weight:600;font-size:13px">Aporte automático activado</div><div class="text-muted" style="font-size:12px">${money(S.data.recurringAmt)} cada ${S.data.recurring==='semanal'?'semana':'mes'} desde tu cuenta.</div></div></div></div>`:''}
        <div class="row mt-6" style="gap:12px"><button class="btn btn--secondary" style="flex:1" data-nav="cuentas">Ver mis cuentas</button><button class="btn btn--primary" style="flex:1" data-nav="cuentas">Aportar ahora</button></div>
      </div>`;
      view.querySelectorAll('[data-nav]').forEach(n => n.onclick = () => location.hash = '#/' + n.dataset.nav);
    }

    function persist() {
      const g = id => { const e = $('#' + id); return e ? e.value : undefined; };
      if (S.step === 1) { if (g('obGoal') !== undefined) S.data.goalName = g('obGoal') || 'Mi meta de ahorro'; if (g('obDeadline') !== undefined) S.data.deadline = g('obDeadline'); }
      if (S.step === 2) { const iv = parseFloat((g('obInitial')||'').replace(',','.')); if (!isNaN(iv)) S.data.initial = iv; if (g('obSource') !== undefined) S.data.source = g('obSource').split(' — ')[0]; const rc = $('#obRound'); if (rc) S.data.roundup = rc.checked; const ra = parseFloat((g('obRecAmt')||'').replace(',','.')); if (!isNaN(ra)) S.data.recurringAmt = ra; }
    }
    function validate() {
      if (S.step === 2) { const f = $('#obForm').querySelector('.field'); if (S.data.initial < 0) return false; }
      return true;
    }

    function paintForm() {
      $('#obForm').innerHTML = views[S.step]() + navButtons();
      wireStep(); paintSteps(); paintSide();
      $('#obForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function navButtons() {
      const last = S.step === STEPS.length - 1;
      return `<div class="row mt-4" style="gap:12px">${S.step>0?`<button class="btn btn--secondary" id="obBack" style="flex:1">${icon('back')} Atrás</button>`:`<button class="btn btn--secondary" id="obCancel" style="flex:1">Cancelar</button>`}<button class="btn btn--primary" id="obNext" style="flex:2">${S.step===0?'Abrir mi cuenta':last?'Confirmar apertura':'Continuar'}</button></div>`;
    }
    function wireStep() {
      const back = $('#obBack'); if (back) back.onclick = () => { persist(); S.step--; paintForm(); };
      const cancel = $('#obCancel'); if (cancel) cancel.onclick = () => location.hash = '#/ofertas';
      if (S.step === 1) {
        const g = $('#obGoal'); if (g) g.oninput = () => { S.data.goalName = g.value; paintSide(); };
        const sl = $('#obTarget'); if (sl) sl.oninput = () => { S.data.target = +sl.value; $('#obTargetVal').textContent = money(S.data.target); paintSide(); };
      }
      if (S.step === 2) {
        const ini = $('#obInitial'); if (ini) ini.oninput = () => { const v = parseFloat(ini.value.replace(',','.')); S.data.initial = isNaN(v)?0:v; paintSide(); };
        view.querySelectorAll('#obRec [data-rec]').forEach(b => b.onclick = () => { view.querySelectorAll('#obRec .chip').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); S.data.recurring = b.dataset.rec; $('#obRecAmtWrap').style.display = b.dataset.rec==='no'?'none':''; paintSide(); });
        const rc = $('#obRound'); if (rc) rc.onchange = () => { S.data.roundup = rc.checked; };
        const ra = $('#obRecAmt'); if (ra) ra.oninput = () => { const v=parseFloat(ra.value.replace(',','.')); S.data.recurringAmt = isNaN(v)?0:v; paintSide(); };
      }
      if (S.step === 3) { const t = $('#obTerm'); if (t) t.onchange = () => { S.data.terms = t.checked; $('#termErr').style.display = 'none'; }; }
      $('#obNext').onclick = () => {
        persist();
        if (!validate()) return;
        if (S.step === 3) {
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
