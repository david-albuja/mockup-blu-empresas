/* BLU Web — Catálogo de pantallas (índice navegable) + Ofertas */

const CATALOG = [
  { g:'Antes · app actual (repo Azure)', items:[ ['antes-login','clock','Login'], ['antes-inicio','clock','Inicio'], ['antes-tarjetas','clock','Tarjetas'], ['antes-cuentas','clock','Cuentas'], ['antes-transferencias','clock','Transferencias'], ['antes-pagos','clock','Pago de servicios'], ['antes-pago-tarjeta','clock','Pago de tarjeta'], ['antes-bloqueo','clock','Bloqueo'], ['antes-contactos','clock','Contactos'], ['antes-recompensas','clock','Recompensas'], ['antes-admin-usuarios','clock','Admin. usuarios'], ['antes-perfil','clock','Perfil'] ] },
  { g:'Acceso', items:[ ['login','lock','Ingreso'], ['registro','user','Registro nuevo usuario'], ['crear-usuario','shield','Crear usuario y clave'], ['recuperar','key','Recuperar contraseña'], ['recuperar-datos','contacts','Recuperar datos de acceso'], ['cambiar-clave','lock','Cambiar contraseña'], ['logout','logout','Cerrar sesión'] ] },
  { g:'Inicio y productos', items:[ ['inicio','home','Inicio / Consolidado'], ['tarjetas','card','Mis tarjetas de crédito'], ['detalle-producto','receipt','Detalle de producto'], ['cuentas','wallet','Cuentas y créditos'], ['activar-tarjeta','card','Activar tarjeta'], ['config-tarjeta','services','Configurar tarjeta'], ['metodos-pago','swap','Métodos de pago preferidos'], ['tarjetas-adicionales','users','Tarjetas adicionales'], ['solicitud-tarjeta','plus','Solicitud de tarjeta'], ['beneficios','gift','Beneficios de cuenta/tarjeta'], ['ofertas','sparkles','Contratar / Ofertas'], ['onboarding-signature','card','Onboarding tarjeta Signature'], ['onboarding-blu-plus','wallet','Onboarding cuenta BLU+'] ] },
  { g:'Financiamiento', items:[ ['diferir','receipt','Diferir consumos'], ['precancelacion','coins','Precancelación de diferidos'], ['avance-facturacion','bolt','Avance de facturación'], ['avance-efectivo','cash','Avance de efectivo'], ['sim-credito','chart','Simulador de crédito'] ] },
  { g:'Pagos', items:[ ['transferencias','send','Transferencias'], ['transferencias-programadas','calendar','Transferencias programadas'], ['pagos','receipt','Pago de servicios'], ['pago-tarjeta','card','Pago de tarjeta'], ['pago-credito','coins','Pago de crédito'], ['retiro-atm','atm','Retiro sin tarjeta'], ['programados','calendar','Pagos programados'], ['servicios-inscritos','services','Servicios inscritos'], ['carga-archivo','upload','Pago por carga de archivo'], ['contactos','contacts','Contactos'], ['mapa','map','Mapa de agencias/ATM'] ] },
  { g:'Servicios', items:[ ['bloqueo','lock','Bloqueo / desbloqueo'], ['aviso-viaje','plane','Aviso de viaje'], ['certificados','certificate','Certificados bancarios'], ['tributarios','file','Documentos tributarios'], ['residencia-fiscal','shield','Residencia fiscal (CRS)'], ['devolucion','store','Devolución de mercadería'], ['contactenos','headset','Contáctenos'], ['asesor-virtual','sparkles','Asesor virtual'] ] },
  { g:'Empresa / Establecimientos', items:[ ['caja','store','Ventas'], ['cash-mng','cash','Cash management'], ['aprobaciones','approve','Aprobaciones'], ['admin-usuarios','users','Administración de usuarios'] ] },
  { g:'Perfil y recompensas', items:[ ['perfil','user','Mi perfil'], ['recompensas','gift','Recompensas Club'] ] },
];

Screens.pantallas = {
  title: 'Todas las pantallas',
  render(view) {
    view.innerHTML = `
    <div class="page-head section"><p class="eyebrow">Mapa del prototipo</p><h1>Todas las pantallas</h1><p>${CATALOG.reduce((a,g)=>a+g.items.length,0)} pantallas navegables · haz clic para abrir cualquiera.</p></div>
    ${CATALOG.map(g=>`<div class="section mb-6"><h2 class="h4 mb-4">${g.g}</h2><div class="grid grid-4">${g.items.map(([r,ic,label])=>`<button class="card card--pad card--hover" data-nav="${r}" style="text-align:left;display:flex;flex-direction:column;gap:10px;min-height:104px"><span class="qa__ic">${icon(ic)}</span><span style="font-weight:600;font-size:13px">${label}</span><span class="text-muted" style="font-size:11px">#/${r}</span></button>`).join('')}</div></div>`).join('')}`;
  }
};

/* Ofertas / Para ti (MyValueOffers) */
Screens.ofertas = {
  title: 'Para ti',
  render(view) {
    const offers = [
      { name:'Tarjeta Diners Club Signature', sub:'Sin costo de emisión el 1er año', tag:'Preaprobada', icon:'card', cta:'Solicitar', route:'onboarding-signature' },
      { name:'Crédito de consumo', sub:'Hasta $30.000 · tasa preferencial', tag:'Para ti', icon:'coins', cta:'Simular', route:'sim-credito' },
      { name:'Cuenta de ahorros BLU+', sub:'Rendimiento 4% anual', tag:'Nuevo', icon:'wallet', cta:'Abrir', route:'onboarding-blu-plus' },
      { name:'Seguro de protección', sub:'Cobertura de compras y viajes', tag:'', icon:'shield', cta:'Conocer' },
    ];
    view.innerHTML = `
    ${pageHead('Para ti','Ofertas y productos personalizados según tu perfil.')}
    <div class="grid grid-2">
      ${offers.map(o=>`<div class="card card--pad card--hover section"><div class="row between"><span class="prod__ic prod__ic--card">${icon(o.icon)}</span>${o.tag?`<span class="badge badge--info">${o.tag}</span>`:''}</div><div class="mt-4"><div class="h4">${o.name}</div><div class="text-muted" style="font-size:13px">${o.sub}</div></div><button class="btn btn--primary btn--block mt-6" ${o.route?`data-nav="${o.route}"`:`data-offer="${o.name}"`}>${o.cta}</button></div>`).join('')}
    </div>`;
    view.querySelectorAll('[data-offer]').forEach(b=> b.onclick=()=> toast({title:'Solicitud iniciada', msg:`${b.dataset.offer}: te contactaremos para continuar.`, type:'success'}));
  }
};
