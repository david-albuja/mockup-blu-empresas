/* BLU Web — Módulo Acceso / Onboarding / Seguridad */

/* Registro nuevo usuario (multi-paso) */
Screens['registro'] = {
  title: 'Registro', full: true,
  render(view) {
    const steps=['Identidad','Verificación','Crea tu acceso'];
    let step=0;
    view.innerHTML = `<div class="auth"><aside class="auth__aside"><div class="brand"><div class="brand__mark">b</div><div><div class="brand__name" style="color:#fff">blu</div><div class="brand__sub" style="color:rgba(255,255,255,.7)">Diners Club</div></div></div><div><h1 class="auth__pitch">Únete a blu en 3 pasos.</h1><div class="auth__feats"><div class="auth__feat"><span class="ic">${icon('shield')}</span> 100% digital y seguro</div><div class="auth__feat"><span class="ic">${icon('clock')}</span> Menos de 5 minutos</div></div></div><div style="font-size:12px;color:rgba(255,255,255,.6)">© 2026 Diners Club del Ecuador</div></aside>
    <section class="auth__panel"><div class="auth__form"><a href="#/login" class="row" style="gap:6px;color:var(--primary);font-weight:600;font-size:13px;margin-bottom:16px">${icon('back')} Ya tengo cuenta</a><div class="stepper mb-6" id="regStep"></div><div id="regBody"></div></div></section></div>`;

    function renderStep() {
      $('#regStep').innerHTML = steps.map((s,i)=>`<div class="step ${i===step?'is-active':i<step?'is-done':''}"><span class="bullet">${i<step?icon('check'):i+1}</span></div>${i<steps.length-1?'<span class="bar '+(i<step?'is-done':'')+'"></span>':''}`).join('');
      const bodies=[
        `<h2 class="h2">Verifica tu identidad</h2><p class="text-muted mb-6">Ingresa tus datos personales.</p>
         <div class="field"><label>Tipo y número de documento</label><div class="control">${icon('file')}<input placeholder="Cédula 0102030405" inputmode="numeric"></div></div>
         <div class="field"><label>Fecha de nacimiento</label><div class="control">${icon('calendar')}<input type="date"></div></div>
         <div class="field"><label>Correo electrónico</label><div class="control">${icon('receipt')}<input type="email" placeholder="tu@correo.com"></div></div>`,
        `<h2 class="h2">Verificación</h2><p class="text-muted mb-6">Enviamos un código a tu celular ···4471.</p>
         <div class="field"><label>Código de 6 dígitos</label><div class="control" style="justify-content:center;gap:8px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:44px;text-align:center;font-size:20px;font-weight:700">').join('')}</div></div>
         <button class="btn btn--ghost" style="color:var(--primary)" type="button" onclick="toast({title:'Código reenviado',type:'success'})">Reenviar código</button>`,
        `<h2 class="h2">Crea tu acceso</h2><p class="text-muted mb-6">Define tu usuario y contraseña.</p>
         <div class="field"><label>Usuario</label><div class="control">${icon('user')}<input placeholder="Elige un usuario"></div></div>
         <div class="field"><label>Contraseña</label><div class="control">${icon('lock')}<input type="password" placeholder="••••••••"></div>
           <div class="mt-2" style="display:flex;gap:6px">${[1,2,3,4].map(i=>`<span style="flex:1;height:5px;border-radius:3px;background:${i<=3?'var(--success)':'var(--line)'}"></span>`).join('')}</div><span class="hint">Seguridad: fuerte · 8+ caracteres, mayúscula y número.</span></div>`
      ];
      $('#regBody').innerHTML = `<div class="section">${bodies[step]}<div class="row mt-6" style="gap:12px">${step>0?`<button class="btn btn--secondary" id="regBack" style="flex:1">Atrás</button>`:''}<button class="btn btn--primary" id="regNext" style="flex:2">${step<steps.length-1?'Continuar':'Crear cuenta'}</button></div></div>`;
      const bd=$('#regBack'); if(bd) bd.onclick=()=>{step--;renderStep();};
      $('#regNext').onclick=(e)=>{ if(step<steps.length-1){ step++; renderStep(); } else { e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ location.hash='#/inicio'; toast({title:'¡Cuenta creada!', msg:'Bienvenida a BLU.', type:'success'}); },1100); } };
      const inputs=$('#regBody').querySelectorAll('.control input[maxlength="1"]'); inputs.forEach((i,x)=>i.oninput=()=>{if(i.value&&inputs[x+1])inputs[x+1].focus();});
    }
    renderStep();
  }
};

/* Crear usuario y clave — por seguridad se hace desde la app blu Empresas */
Screens['crear-usuario'] = {
  title: 'Crear usuario', full: true,
  render(view) {
    view.innerHTML = `<div class="auth"><section class="auth__panel" style="grid-column:1/-1"><div class="auth__form" style="text-align:center">
      <a href="#/login" class="row" style="gap:6px;color:var(--primary);font-weight:600;margin-bottom:16px;justify-content:center">${icon('back')} Volver al ingreso</a>
      <div class="state__art" style="margin:0 auto 16px;background:var(--blu-50);color:var(--primary)">${icon('shield')}</div>
      <h2 class="h2">Crea tu usuario desde la app</h2>
      <p class="text-muted mt-2 mb-6" style="max-width:42ch;margin-left:auto;margin-right:auto">Para tu seguridad, la creación de usuario y contraseña se hace desde la app blu Empresas. Escanea el código y sigue los pasos desde ahí.</p>
      <div class="qr-card">${qrPlaceholder(140)}<span>Escanea con tu celular para abrir blu Empresas</span></div>
      <a class="btn btn--primary btn--lg btn--block" href="#/login">Entendido, volver al ingreso</a>
    </div></section></div>`;
  }
};

/* Recuperar datos de acceso */
Screens['recuperar-datos'] = {
  title: 'Recuperar datos', full: true,
  render(view) {
    view.innerHTML = `<div class="auth"><section class="auth__panel" style="grid-column:1/-1"><form class="auth__form"><a href="#/login" class="row" style="gap:6px;color:var(--primary);font-weight:600;font-size:13px;margin-bottom:16px">${icon('back')} Volver</a><h2 class="h2">Recuperar tu usuario</h2><p class="text-muted mb-6">Verifica tu identidad para recuperar tu usuario.</p>
      <div class="field"><label>Número de documento</label><div class="control">${icon('file')}<input placeholder="Cédula" inputmode="numeric"></div></div>
      <div class="field"><label>Correo o celular registrado</label><div class="control">${icon('phone')}<input placeholder="Correo o teléfono"></div></div>
      <button class="btn btn--primary btn--lg btn--block" type="button" onclick="toast({title:'Datos enviados',msg:'Revisa tu correo y SMS.',type:'success'})">Recuperar acceso</button></form></section></div>`;
  }
};

/* Cambiar contraseña (dentro del shell, desde perfil) */
Screens['cambiar-clave'] = {
  title: 'Cambiar contraseña',
  render(view) {
    view.innerHTML = `
    ${pageHead('Cambiar contraseña','Mantén tu cuenta protegida.','perfil')}
    <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
      ${panel('', `
        <div class="field"><label>Contraseña actual <span class="req">*</span></label><div class="control">${icon('lock')}<input type="password" placeholder="••••••••"></div></div>
        <div class="field"><label>Nueva contraseña <span class="req">*</span></label><div class="control">${icon('lock')}<input type="password" id="np" placeholder="••••••••"></div><div class="mt-2" style="display:flex;gap:6px" id="strength">${[1,2,3,4].map(()=>`<span style="flex:1;height:5px;border-radius:3px;background:var(--line)"></span>`).join('')}</div></div>
        <div class="field"><label>Confirmar nueva contraseña <span class="req">*</span></label><div class="control">${icon('lock')}<input type="password" placeholder="••••••••"></div></div>
        <button class="btn btn--primary btn--lg btn--block" onclick="successModal('Contraseña actualizada','Tu nueva contraseña ya está activa.','perfil')">Actualizar contraseña</button>`)}
      ${panel('Tu contraseña debe tener', `${[['8+ caracteres'],['Una mayúscula y minúscula'],['Un número'],['Un carácter especial']].map(r=>`<div class="row" style="gap:10px;padding:8px 0">${icon('checkCircle')}<span class="text-slate">${r[0]}</span></div>`).join('')}`)}
    </div>`;
    const np=$('#np'); if(np) np.oninput=()=>{ const v=np.value; let s=0; if(v.length>=8)s++; if(/[A-Z]/.test(v))s++; if(/[0-9]/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++; const bars=$('#strength').children; const col=['var(--error)','var(--warning)','var(--warning)','var(--success)']; [...bars].forEach((b,i)=>b.style.background=i<s?col[s-1]:'var(--line)'); };
  }
};

/* Cierre de sesión */
Screens['logout'] = {
  title: 'Cerrar sesión', full: true,
  render(view) {
    view.innerHTML = `<div class="auth"><section class="auth__panel" style="grid-column:1/-1"><div class="auth__form" style="text-align:center"><div class="state__art" style="margin:0 auto 16px">${icon('logout')}</div><h2 class="h2">¿Cerrar sesión?</h2><p class="text-muted mt-2 mb-6">Tu sesión se cerrará de forma segura en este dispositivo.</p><button class="btn btn--primary btn--lg btn--block" onclick="location.hash='#/login';toast({title:'Sesión cerrada',type:'info'})">Cerrar sesión</button><button class="btn btn--ghost btn--block mt-2" onclick="history.back()">Cancelar</button></div></section></div>`;
  }
};
