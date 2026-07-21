/* BLU Web — Módulo Empresa / Establecimientos */

/* Datos simulados del comercio (adquirencia) */
const MERCHANT = {
  branches: ['Todos los locales', 'Local Centro Histórico', 'Local Quicentro Norte', 'Local Cumbayá'],
  kpis: { ventas: 12480.50, tx: 148, ticket: 84.33, comision: 187.21, neto: 12293.29, deltaVentas: 12.4, deltaTx: 8 },
  hourly: [ {h:'08:00', v:320}, {h:'10:00', v:640}, {h:'11:00', v:820}, {h:'12:00', v:1180}, {h:'13:00', v:1040}, {h:'14:00', v:980}, {h:'16:00', v:1420}, {h:'18:00', v:1650}, {h:'20:00', v:1240}, {h:'21:00', v:610} ],
  brands: [ {n:'Visa', v:5820, pct:47, color:'#2C55F5'}, {n:'Mastercard', v:3640, pct:29, color:'#32C5FF'}, {n:'Diners Club', v:2100, pct:17, color:'#4C71FC'}, {n:'Amex', v:920, pct:7, color:'#B9C8FF'} ],
  terminals: [ {n:'POS-01', d:'Caja principal', v:6820, tx:82}, {n:'POS-02', d:'Caja 2', v:3960, tx:41}, {n:'Link de pago', d:'E-commerce', v:1700, tx:25} ],
  settlement: { next:'03 jul 2026', amount:11980.20, account:'Cuenta Corriente ···7781', batch:'#LOTE-2287', pending:2 },
  weekly: [ {h:'Lun', v:9800.40}, {h:'Mar', v:11200.30}, {h:'Mié', v:8760.20}, {h:'Jue', v:12480.50}, {h:'Vie', v:10540.80}, {h:'Sáb', v:13320.90}, {h:'Dom', v:13537.10} ],
  monthly: [ {h:'Sem 1', v:68200.10}, {h:'Sem 2', v:74650.30}, {h:'Sem 3', v:71360.15}, {h:'Sem 4', v:98270.20} ],
  // Adquirencia: totales del periodo (homologados con Home)
  pagosRecibidos: 96320.06,   // ya depositados
  porCobrar: 81200.00,        // pendiente de pago (por liquidar)
  periodo: '04 jun – 04 jul 2026',
  // Vista de desglose por canal (tab Transacciones)
  channels: ['POS', 'Botón de pago', 'Pagos recurrentes', 'Redes sociales'],
  channelStates: ['Pagados', 'Por pagar', 'Rechazados', 'Procesados', 'Diferidos'],
  brandTx: [
    { n:'Diners Club', notas:3, notasMonto:1000 },
    { n:'Visa',        notas:2, notasMonto:1000 },
    { n:'Mastercard',  notas:1, notasMonto:1000 },
  ],
  tx: [
    ['#00184','14:20','Visa','1123','POS-01','Corriente','Aprobado',120.50],
    ['#00183','13:58','Diners Club','4417','POS-01','Diferido 3m','Aprobado',84.32],
    ['#00182','13:31','Mastercard','9021','Link de pago','Corriente','Rechazado',45.00],
    ['#00181','12:47','Diners Club','7788','POS-02','Corriente','Aprobado',260.00],
    ['#00180','11:22','Visa','3355','POS-01','Diferido 6m','Aprobado',18.90],
    ['#00179','10:58','Amex','2201','POS-02','Corriente','Aprobado',312.40],
    ['#00178','10:12','Mastercard','8890','Link de pago','Corriente','Anulado',56.70],
    ['#00177','09:44','Visa','1123','POS-01','Corriente','Aprobado',74.25],
    ['#00176','09:15','Diners Club','4417','POS-02','Diferido 3m','Aprobado',540.00],
    ['#00175','08:39','Visa','6612','POS-01','Corriente','Aprobado',22.10],
  ],
};

/* Desglose por canal (tab Transacciones) — datos deterministas por marca/canal/estado.
   Cada celda = { recaps, valor }. Sin Math.random para no romper el resume del harness. */
function channelData(brandName) {
  const seed = brandName.length;
  return MERCHANT.channels.map((ch, ci) => {
    const cells = {};
    MERCHANT.channelStates.forEach((st, si) => {
      const recaps = 2 + ((ci * 3 + si * 2 + seed) % 4);        // 2–5
      const valor = 250000 + ((ci * 7 + si * 5 + seed) % 6) * 130000; // 250k–1.0M
      cells[st] = { recaps, valor };
    });
    return { canal: ch, cells };
  });
}

/* Gráfico de área (ventas por hora) — SVG, con tooltip por punto */
function drawArea(host, data) {
  if (!host) return;
  const w = 640, h = 220, pad = { l: 8, r: 8, t: 16, b: 26 };
  const max = Math.max(...data.map(d => d.v)) * 1.15;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const x = i => pad.l + (i / (data.length - 1)) * iw;
  const y = v => pad.t + ih - (v / max) * ih;
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.v).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(data.length-1).toFixed(1)} ${pad.t+ih} L ${x(0).toFixed(1)} ${pad.t+ih} Z`;
  const grid = [0.25,0.5,0.75,1].map(g => `<line x1="${pad.l}" x2="${w-pad.r}" y1="${pad.t+ih*g}" y2="${pad.t+ih*g}" stroke="var(--line-2)" stroke-width="1"/>`).join('');
  const dots = data.map((d,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(d.v).toFixed(1)}" r="10" fill="transparent"><title>${d.h} · $${d.v.toLocaleString('es-EC')}</title></circle><circle cx="${x(i).toFixed(1)}" cy="${y(d.v).toFixed(1)}" r="3.5" fill="var(--blu-600)"/>`).join('');
  const labels = data.filter((_,i)=>i%2===0).map((d,i)=>`<text x="${x(i*2)}" y="${h-6}" text-anchor="middle" font-size="10" fill="var(--muted)">${d.h.slice(0,5)}</text>`).join('');
  host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Ventas por hora del día">
    <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--blu-500)" stop-opacity=".28"/><stop offset="1" stop-color="var(--blu-500)" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#areaG)"/><path d="${line}" fill="none" stroke="var(--blu-600)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}${labels}
  </svg>`;
}

/* Gráfico de barras comparativo (Pagos recibidos vs Pendiente de pago) */
function drawPagosBars(host, items) {
  if (!host) return;
  const fmt = n => '$' + n.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const max = Math.max(...items.map(i => i.v)) * 1.1 || 1;
  host.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px">${items.map(it => `
    <div>
      <div class="row between" style="margin-bottom:6px"><span class="row" style="gap:8px;font-size:13px;font-weight:600"><span style="width:10px;height:10px;border-radius:3px;background:${it.color}"></span>${it.label}</span><span class="num" style="font-weight:700;font-size:13px">${fmt(it.v)}</span></div>
      <div style="height:14px;background:var(--bg-2);border-radius:var(--r-full);overflow:hidden"><span style="display:block;height:100%;width:${(it.v/max*100).toFixed(1)}%;background:${it.color};border-radius:var(--r-full);transition:width var(--dur-3) var(--ease-out)"></span></div>
    </div>`).join('')}</div>`;
}

/* Ventas — dashboard de comercios / adquirencia (antes "Consulta de caja") */
Screens['caja'] = {
  title: 'Ventas',
  render(view) {
    const M = MERCHANT, k = M.kpis;
    let tab = 'resumen';
    const filters = { local: 'all', rango: 'mes', estado: 'all', marca: 'all' };

    const fmt = n => '$' + n.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Filtros funcionales: establecimiento y rango escalan todos los montos.
    const LOCAL_F = { all: 1, 'Local Centro Histórico': 0.42, 'Local Quicentro Norte': 0.33, 'Local Cumbayá': 0.25 };
    const RANGO = { mes: { f: 1, label: M.periodo }, '7d': { f: 0.34, label: 'Últimos 7 días' }, hoy: { f: 0.10, label: 'Hoy · 14 jul 2026' } };
    function scaled() {
      const f = (LOCAL_F[filters.local] ?? 0.3) * RANGO[filters.rango].f;
      const ventas = k.ventas * f, tx = Math.max(1, Math.round(k.tx * f));
      return {
        f, ventas, tx, ticket: ventas / tx, comision: k.comision * f,
        pagos: M.pagosRecibidos * f, porCobrar: M.porCobrar * f,
        deltaTx: Math.round(k.deltaTx * f),
        periodo: RANGO[filters.rango].label,
        localLabel: filters.local === 'all' ? 'Todos los locales' : filters.local,
      };
    }

    view.innerHTML = `
    <div class="page-head section">
      <a class="row" style="gap:6px;color:var(--primary);font-weight:600;font-size:13px;margin-bottom:10px;cursor:pointer" data-nav="inicio">${icon('back')} Volver</a>
      <div class="row between wrap" style="gap:12px">
        <div><p class="eyebrow">Comercios · Adquirencia</p><h1>Mira tus ventas</h1><p class="text-muted" style="font-size:13px;margin-top:4px">Para ver la información al día, primero haz el cierre de tu POS · Actualizado hasta hoy, 14:20</p></div>
        <div class="row wrap" style="gap:8px;align-items:center">
          <button class="btn btn--secondary btn--sm" onclick="toast({title:'Exportando',msg:'Se descargará un CSV con las transacciones.',type:'info'})">${icon('download')} Exportar</button>
          <div class="segmented" id="cjTabs" role="tablist"><button class="is-active" data-t="resumen" role="tab">Resumen</button><button data-t="transacciones" role="tab">Transacciones</button></div>
        </div>
      </div>
      <!-- Filtros -->
      <div class="cj-filters mt-4">
        <div class="control" style="height:42px"><span class="text-muted" style="font-size:12px;white-space:nowrap">Establecimiento</span><select id="cjBranch" aria-label="Establecimiento">${M.branches.map((b,i)=>`<option value="${i===0?'all':b}">${i===0?'Todos (11)':b}</option>`).join('')}</select>${icon('chevronDown')}</div>
        <div class="control" style="height:42px"><span class="text-muted" style="font-size:12px;white-space:nowrap">Fecha</span><select id="cjFecha" aria-label="Rango de fechas"><option value="mes">Este periodo · ${M.periodo}</option><option value="7d">Últimos 7 días</option><option value="hoy">Hoy · 14 jul</option></select>${icon('calendar')}</div>
        <div class="control" style="height:42px"><span class="text-muted" style="font-size:12px;white-space:nowrap">Estado</span><select id="cjEstado" aria-label="Estado"><option value="all">Todos</option>${M.channelStates.map(s=>`<option>${s}</option>`).join('')}</select>${icon('chevronDown')}</div>
        <div class="control" style="height:42px"><span class="text-muted" style="font-size:12px;white-space:nowrap">Marca / tipo</span><select id="cjMarca" aria-label="Marca o tipo"><option value="all">Todas</option>${M.brandTx.map(b=>`<option>${b.n}</option>`).join('')}</select>${icon('chevronDown')}</div>
        <div class="row" style="gap:6px">
          <button class="icon-btn cj-dl" aria-label="Descargar Excel" onclick="toast({title:'Descargando',msg:'Reporte en Excel.',type:'info'})">${icon('download')}</button>
          <button class="icon-btn cj-dl" aria-label="Descargar PDF" onclick="toast({title:'Descargando',msg:'Reporte en PDF.',type:'info'})">${icon('file')}</button>
        </div>
      </div>
    </div>
    <div id="cjBody"></div>`;

    /* ---- Tab Resumen ---- */
    function resumen() {
      const sc = scaled();
      const kpis = [
        ['Ventas', fmt(sc.ventas), 'arrowUp', `+${k.deltaVentas}% vs. periodo anterior`, 'success'],
        ['Ventas realizadas', sc.tx, 'receipt', `+${sc.deltaTx} vs. periodo anterior`, 'info'],
        ['Ticket promedio', fmt(sc.ticket), 'chart', 'por venta', 'muted'],
        ['Comisión', fmt(sc.comision), 'coins', 'Descarga los reportes para ver el detalle', 'muted'],
        ['Pendiente de pago', fmt(sc.porCobrar), 'wallet', 'por liquidar', 'muted'],
      ];
      return `
      <div class="grid section mb-6" style="grid-template-columns:repeat(5,1fr);gap:16px">
        ${kpis.map(x=>`<div class="card card--pad"><div class="kpi"><div class="kpi__label">${icon(x[2])} ${x[0]}</div><div class="kpi__value num" style="font-size:22px">${x[1]}</div><div class="kpi__delta ${x[4]==='success'?'text-success':'text-muted'}" style="font-size:12px">${x[3]}</div></div></div>`).join('')}
      </div>
      <div class="grid dash-grid">
        <div class="grid" style="gap:20px">
          <div class="card card--pad section">
            <div class="row between mb-4"><div><h2 class="h4">Ventas por hora</h2><span class="text-muted" style="font-size:12px">${sc.localLabel} · ${sc.periodo}</span></div><span class="badge badge--info">${fmt(sc.ventas)}</span></div>
            <div id="cjArea"></div>
          </div>
          <div class="card card--pad section">
            <div class="mb-4"><h2 class="h4">Liquidación del periodo</h2><span class="text-muted" style="font-size:12px">Comparativo: recibido vs. pendiente de pago</span></div>
            <div id="cjPagos"></div>
          </div>
        </div>
        <div class="grid" style="gap:20px">
          <div class="card card--pad section" style="background:var(--grad-card);color:#fff">
            <div class="row between"><span style="font-size:13px;opacity:.9">Pagos recibidos</span>${icon('wallet')}</div>
            <div class="num" style="font-size:30px;font-weight:800;margin-top:8px">${fmt(sc.pagos)}</div>
            <div style="font-size:13px;opacity:.9">${sc.localLabel} · ${sc.periodo}</div>
            <div class="divider" style="background:rgba(255,255,255,.25)"></div>
            <div class="row between" style="font-size:13px;opacity:.95"><span>Cuenta destino</span><span>${M.settlement.account}</span></div>
            <div class="row between mt-2" style="font-size:13px;opacity:.95"><span>Próximo depósito</span><span class="num">${M.settlement.next}</span></div>
            <button class="btn btn--secondary btn--block mt-4" style="background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.3)" onclick="toast({title:'Liquidaciones',msg:'Historial de depósitos y lotes.',type:'info'})">Ver liquidaciones</button>
          </div>
          <div class="card card--pad section">
            <h2 class="h4 mb-4">Ventas por marca</h2>
            <div id="cjBrands"></div>
            <div class="mt-4">${M.brands.map(b=>`<div class="row between" style="padding:6px 0"><span class="row" style="gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${b.color}"></span>${b.n}</span><span class="num" style="font-weight:600">${fmt(b.v*sc.f)} · ${b.pct}%</span></div>`).join('')}</div>
          </div>
        </div>
      </div>`;
    }

    /* ---- Tab Transacciones: desglose por canal y marca (con filtros aplicados) ---- */
    function channelTable(brand, f) {
      const rows = channelData(brand.n);
      const states = filters.estado === 'all' ? M.channelStates : [filters.estado];
      const totals = {};
      states.forEach(st => totals[st] = rows.reduce((s,r)=>s+r.cells[st].valor*f, 0));
      const cell = c => `<td class="num"><div class="cj-cell-meta">Recaps: ${c.recaps} · Valor: 15</div><div style="font-weight:700">${fmt(c.valor*f)}</div></td>`;
      return `
      <div class="card card--pad section mb-6">
        <div class="row between wrap mb-4" style="gap:10px">
          <div><h2 class="h4">${brand.n}</h2><p class="text-muted" style="font-size:12px;margin-top:2px">Para el periodo seleccionado existen ${brand.notas} notas de débito por anticipos de facturación por un monto de ${fmt(brand.notasMonto*f)}.</p></div>
          <button class="btn btn--secondary btn--sm" onclick="toast({title:'Comprobantes virtuales',msg:'${brand.n}: se generará el archivo.',type:'info'})">${icon('receipt')} Comprobantes virtuales</button>
        </div>
        <div style="overflow-x:auto"><table class="tbl cj-channel">
          <thead><tr><th>Canal</th>${states.map(s=>`<th class="num">${s}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map(r=>`<tr><td style="font-weight:600">${r.canal}</td>${states.map(st=>cell(r.cells[st])).join('')}</tr>`).join('')}
            <tr class="cj-total"><td style="font-weight:800">Total:</td>${states.map(st=>`<td class="num" style="font-weight:800">${fmt(totals[st])}</td>`).join('')}</tr>
          </tbody>
        </table></div>
      </div>`;
    }
    function transacciones() {
      const sc = scaled();
      const brands = M.brandTx.filter(b => filters.marca === 'all' || b.n === filters.marca);
      if (!brands.length) return emptyState('Sin resultados', 'No hay marcas que coincidan con el filtro.', 'search');
      const chips = [];
      if (filters.local !== 'all') chips.push(scaled().localLabel);
      if (filters.rango !== 'mes') chips.push(scaled().periodo);
      if (filters.estado !== 'all') chips.push('Estado: ' + filters.estado);
      const summary = chips.length ? `<p class="text-muted section" style="font-size:12px;margin-bottom:8px">Filtros aplicados: ${chips.join(' · ')}</p>` : '';
      return summary + brands.map(b => channelTable(b, sc.f)).join('');
    }

    function mount() {
      const body = $('#cjBody');
      const sc = scaled();
      if (tab === 'resumen') {
        body.innerHTML = resumen();
        drawArea($('#cjArea'), M.hourly.map(d=>({ ...d, v: d.v * sc.f })));
        drawPagosBars($('#cjPagos'), [
          { label:'Pagos recibidos', v:sc.pagos, color:'var(--success)' },
          { label:'Pendiente de pago', v:sc.porCobrar, color:'var(--primary)' },
        ]);
        drawDonut($('#cjBrands'), M.brands.map(b=>({cat:b.n, pct:b.pct, val:b.v*sc.f, color:b.color})), 'Total ventas');
      } else {
        body.innerHTML = transacciones();
      }
    }
    function syncTabs() { view.querySelectorAll('#cjTabs [data-t]').forEach(b=> b.classList.toggle('is-active', b.dataset.t===tab)); }

    view.querySelectorAll('#cjTabs [data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; syncTabs(); mount(); });
    $('#cjBranch').onchange = (e) => { filters.local = e.target.value; mount(); };
    $('#cjFecha').onchange  = (e) => { filters.rango = e.target.value; mount(); };
    $('#cjEstado').onchange = (e) => { filters.estado = e.target.value; if (tab === 'transacciones') mount(); };
    $('#cjMarca').onchange  = (e) => { filters.marca = e.target.value; if (tab === 'transacciones') mount(); };

    mount();
  }
};

/* Cash management */
Screens['cash-mng'] = {
  title: 'Cash management',
  render(view) {
    view.innerHTML = `
    ${premiumHead('Cash management','Posición de liquidez y flujos de tu empresa.','inicio','','Empresa')}
    <div class="grid grid-4 mb-6">
      ${[['Saldo consolidado','$248.500','wallet'],['Ingresos hoy','$32.100','arrowDown'],['Egresos hoy','$18.640','arrowUp'],['Por aprobar','7','approve']].map(k=>`<div class="card card--pad section"><div class="kpi"><div class="kpi__label">${icon(k[2])} ${k[0]}</div><div class="kpi__value num" style="font-size:22px">${k[1]}</div></div></div>`).join('')}
    </div>
    <div class="grid dash-grid">
      <div class="card card--pad section">
        <div class="row between wrap mb-2" style="gap:10px">
          <div><h2 class="h4">Flujo de caja</h2><span class="text-muted" style="font-size:12px" id="cfSub">Últimos 7 días</span></div>
          <div class="segmented" id="cfRange"><button class="is-active" data-r="semana">Semana</button><button data-r="mes">Mes</button></div>
        </div>
        <div class="row wrap" style="gap:16px;margin-bottom:6px">
          <span class="row" style="gap:6px;font-size:12px;color:var(--slate)"><span style="width:10px;height:10px;border-radius:3px;background:#2C55F5"></span>Ingresos</span>
          <span class="row" style="gap:6px;font-size:12px;color:var(--slate)"><span style="width:10px;height:10px;border-radius:3px;background:#C2CADF"></span>Egresos</span>
          <span class="row" style="gap:6px;font-size:12px;font-weight:700;margin-left:auto" id="cfNet"></span>
        </div>
        <div id="bars"></div>
      </div>
      <div class="grid" style="gap:20px">
        <div class="list-card section"><div class="list-card__head"><h2 class="h4">Cuentas</h2></div><div class="list-card__body">${[['Operativa ···4410','$182.300'],['Nómina ···9921','$44.200'],['Recaudo ···1180','$22.000']].map(a=>`<div class="prod" style="padding:12px 0"><span class="prod__ic prod__ic--acct">${icon('wallet')}</span><div class="prod__main"><div class="prod__title" style="font-size:13px">${a[0]}</div></div><div class="prod__amt num">${a[1]}</div></div>`).join('')}</div></div>
        ${panel('Acciones', `<div class="grid grid-2" style="gap:10px"><button class="qa" data-nav="carga-archivo"><span class="qa__ic">${icon('upload')}</span><span class="qa__label">Pago masivo</span></button><button class="qa" data-nav="aprobaciones"><span class="qa__ic">${icon('approve')}</span><span class="qa__label">Aprobar</span></button></div>`)}
      </div>
    </div>`;
    drawBars($('#bars'));
    view.querySelectorAll('#cfRange [data-r]').forEach(b => b.onclick = () => {
      view.querySelectorAll('#cfRange [data-r]').forEach(x=>x.classList.remove('is-active'));
      b.classList.add('is-active');
      drawBars($('#bars'), CASH_FLOW[b.dataset.r]);
    });
  }
};
/* Datos de flujo de caja (miles USD): ingresos vs egresos por rango */
const CASH_FLOW = {
  semana: { sub:'Últimos 7 días', labels:['L','M','X','J','V','S','D'], inn:[24.2,32.1,18.4,38.6,26.3,34.0,22.5], out:[15.8,21.4,12.1,26.9,18.2,22.7,14.3] },
  mes:    { sub:'Últimas 4 semanas', labels:['Sem 1','Sem 2','Sem 3','Sem 4'], inn:[142.5,168.2,155.9,181.4], out:[98.3,120.6,104.2,131.8] },
};
/* Gráfico de flujo de caja: barras agrupadas ingresos/egresos con ejes, grilla y valores */
function drawBars(host, d = CASH_FLOW.semana){
  if(!host) return;
  const w=560, h=230, padL=44, padB=26, padT=18, iw=w-padL-10, ih=h-padT-padB;
  const n=d.labels.length, max=Math.ceil(Math.max(...d.inn, ...d.out)*1.15/10)*10;
  const groupW=iw/n, bw=Math.min(22, groupW*0.28), gapIn=4;
  const y=v=>padT+ih-(v/max)*ih;
  const fmtK=v=>'$'+(v>=1000?(v/1000).toFixed(1)+'M':Math.round(v)+'k');
  // grilla + eje Y con escala
  const ticks=[0,.25,.5,.75,1].map(t=>{const val=max*t, yy=y(val);
    return `<line x1="${padL}" x2="${w-8}" y1="${yy}" y2="${yy}" stroke="var(--line-2)" stroke-width="1"/><text x="${padL-8}" y="${yy+4}" text-anchor="end" font-size="10" fill="var(--muted)">${fmtK(val)}</text>`;}).join('');
  const bars=d.labels.map((lb,i)=>{
    const cx=padL+groupW*i+groupW/2;
    const xi=cx-bw-gapIn/2, xo=cx+gapIn/2;
    const hi=ih*(d.inn[i]/max), ho=ih*(d.out[i]/max);
    return `<g>
      <rect x="${xi}" y="${y(d.inn[i])}" width="${bw}" height="${hi}" rx="5" fill="url(#cfIn)"><title>${lb} · Ingresos: ${fmtK(d.inn[i])}</title></rect>
      <rect x="${xo}" y="${y(d.out[i])}" width="${bw}" height="${ho}" rx="5" fill="#C2CADF"><title>${lb} · Egresos: ${fmtK(d.out[i])}</title></rect>
      <text x="${xi+bw/2}" y="${y(d.inn[i])-5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--slate)">${fmtK(d.inn[i])}</text>
      <text x="${cx}" y="${h-6}" text-anchor="middle" font-size="11" fill="var(--muted)">${lb}</text>
    </g>`;}).join('');
  const totIn=d.inn.reduce((a,b)=>a+b,0), totOut=d.out.reduce((a,b)=>a+b,0), net=totIn-totOut;
  const netEl=document.querySelector('#cfNet'); if(netEl) netEl.innerHTML=`<span class="text-muted" style="font-weight:400">Neto</span> <span class="num" style="color:var(--success)">+${fmtK(net)}</span>`;
  const subEl=document.querySelector('#cfSub'); if(subEl) subEl.textContent=d.sub;
  host.innerHTML=`<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Flujo de caja: ingresos ${fmtK(totIn)}, egresos ${fmtK(totOut)}, neto +${fmtK(net)}">
    <defs><linearGradient id="cfIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C55F5"/><stop offset="1" stop-color="#4C71FC"/></linearGradient></defs>
    ${ticks}<line x1="${padL}" x2="${w-8}" y1="${y(0)}" y2="${y(0)}" stroke="var(--line)" stroke-width="1.5"/>${bars}
  </svg>`;
}

/* Aprobaciones */
Screens['aprobaciones'] = {
  title: 'Aprobaciones',
  render(view) {
    const items=[['Pago nómina julio','128 registros · $24.560,00','Alta','upload'],['Transferencia a proveedor','Distribuidora XYZ · $6.360,00','Media','send'],['Pago de servicios','EEQ + Agua · $312,40','Baja','receipt']];
    view.innerHTML = `
    ${premiumHead('Aprobaciones','Autoriza operaciones pendientes de tu empresa.','inicio','','Empresa')}
    <div class="scroll-x mb-6">${['Pendientes (3)','Aprobadas','Rechazadas'].map((t,i)=>`<button class="chip ${i===0?'is-active':''}">${t}</button>`).join('')}</div>
    <div class="grid" style="gap:16px" id="apprList">
      ${items.map((it,idx)=>`<div class="card card--pad section row between wrap" data-appr="${idx}" style="gap:16px"><div class="row" style="gap:14px"><span class="prod__ic prod__ic--card">${icon(it[3])}</span><div><div class="h4">${it[0]}</div><div class="text-muted" style="font-size:13px">${it[1]}</div></div></div><div class="row" style="gap:10px"><span class="badge ${it[2]==='Alta'?'badge--error':it[2]==='Media'?'badge--warning':'badge--neutral'}">Prioridad ${it[2]}</span><button class="btn btn--secondary btn--sm" data-rej="${idx}">Rechazar</button><button class="btn btn--primary btn--sm" data-app="${idx}">${icon('check')} Aprobar</button></div></div>`).join('')}
    </div>`;
    function resolve(idx,ok){ const card=view.querySelector(`[data-appr="${idx}"]`); card.style.transition='opacity .3s, transform .3s'; card.style.opacity='0'; card.style.transform='translateX(20px)'; setTimeout(()=>{ card.remove(); if(!view.querySelector('[data-appr]')) $('#apprList').innerHTML=emptyState('Todo aprobado','No tienes operaciones pendientes.','check'); },300); toast({title:ok?'Operación aprobada':'Operación rechazada', type:ok?'success':'info'}); }
    view.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>{ const ov=openModal(`<div class="modal__head"><h3 class="h3">Confirmar aprobación</h3><button class="icon-btn" data-close>${icon('close')}</button></div><div class="modal__body"><p class="text-slate">Autorizarás esta operación con tu token de seguridad.</p><div class="field mt-4"><label>Token</label><div class="control" style="justify-content:center;gap:8px">${[0,0,0,0,0,0].map(()=>'<input maxlength="1" inputmode="numeric" style="width:38px;text-align:center;font-size:18px;font-weight:700">').join('')}</div></div></div><div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="ca">Aprobar</button></div>`); ov.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>closeModal(ov)); ov.querySelector('#ca').onclick=(e)=>{e.currentTarget.classList.add('is-loading');setTimeout(()=>{closeModal(ov);resolve(b.dataset.app,true);},800);}; });
    view.querySelectorAll('[data-rej]').forEach(b=>b.onclick=()=>resolve(b.dataset.rej,false));
  }
};

/* Administración de usuarios */
Screens['admin-usuarios'] = {
  title: 'Admin. usuarios',
  render(view) {
    const USERS = [
      { name:'Carlos Aguirre', email:'carlos@robles.com', role:'Administrador', limit:'Sin límite', last:'Hoy · 09:12', mfa:true, status:'active' },
      { name:'Diana Ruiz', email:'diana@robles.com', role:'Aprobador', limit:'$50.000', last:'Ayer · 17:40', mfa:true, status:'active' },
      { name:'Pedro Lima', email:'pedro@robles.com', role:'Operador', limit:'$10.000', last:'Hace 3 días', mfa:false, status:'active' },
      { name:'Marta Solís', email:'marta@robles.com', role:'Consulta', limit:'—', last:'Hace 2 semanas', mfa:true, status:'inactive' },
      { name:'Luis Vera', email:'luis@robles.com', role:'Operador', limit:'$10.000', last:'Invitación enviada', mfa:false, status:'pending' },
    ];
    const ROLES = [
      { name:'Administrador', color:'info', desc:'Control total de la empresa', perms:['Gestión de usuarios y roles','Aprobar operaciones','Crear pagos y transferencias','Configurar límites','Ver reportes'] },
      { name:'Aprobador', color:'success', desc:'Autoriza operaciones (segunda firma)', perms:['Aprobar / rechazar operaciones','Crear pagos','Ver reportes'] },
      { name:'Operador', color:'warning', desc:'Crea operaciones para aprobación', perms:['Crear pagos y transferencias','Cargar archivos','Ver saldos'] },
      { name:'Consulta', color:'neutral', desc:'Solo lectura', perms:['Ver saldos y movimientos','Descargar reportes'] },
    ];
    const roleBadge = r => `<span class="badge badge--${ROLES.find(x=>x.name===r)?.color||'neutral'}">${r}</span>`;
    const stBadge = s => s==='active' ? `<span class="badge badge--success"><span class="dot"></span>Activo</span>` : s==='pending' ? `<span class="badge badge--warning"><span class="dot"></span>Pendiente</span>` : `<span class="badge badge--neutral"><span class="dot"></span>Inactivo</span>`;
    let tab = 'usuarios';

    view.innerHTML = `
    ${premiumHead('Administración de usuarios','Gestiona accesos, roles y límites de tu empresa.','perfil', `<button class="btn btn--primary btn--sm" id="uaNew">${icon('plus')} Crear usuario</button>`, 'Empresa')}
    <div class="stat-tiles section mb-6">
      ${statTile('users','navy','Usuarios activos', USERS.filter(u=>u.status==='active').length)}
      ${statTile('clock','graphite','Invitaciones pendientes', USERS.filter(u=>u.status==='pending').length)}
      ${statTile('shield','indigo','Roles configurados', ROLES.length)}
    </div>
    <div class="segmented section mb-6" id="uaTabs"><button class="is-active" data-t="usuarios">Usuarios</button><button data-t="roles">Roles y permisos</button></div>
    <div id="uaBody"></div>`;

    function usuarios() {
      return `<div class="list-card section">
        <div class="list-card__head"><h2 class="h4">Usuarios · ${USERS.length}</h2><div class="control" style="height:40px;width:240px">${icon('search')}<input placeholder="Buscar usuario" id="uaSearch"></div></div>
        <div style="padding:0 12px 12px;overflow-x:auto"><table class="tbl"><thead><tr><th>Usuario</th><th>Rol</th><th>Cupo de aprobación</th><th>Último acceso</th><th>2FA</th><th>Estado</th><th></th></tr></thead><tbody id="uaRows">
          ${USERS.map(u=>`<tr>
            <td><div class="row" style="gap:10px"><span class="avatar" style="width:34px;height:34px;font-size:12px">${u.name.split(' ').map(x=>x[0]).join('')}</span><div><div style="font-weight:600">${u.name}</div><div class="text-muted" style="font-size:12px">${u.email}</div></div></div></td>
            <td>${roleBadge(u.role)}</td>
            <td class="num" style="font-weight:600">${u.limit}</td>
            <td class="text-muted">${u.last}</td>
            <td>${u.mfa ? `<span class="badge badge--success">${icon('check')} Activo</span>` : `<span class="badge badge--warning">Sin 2FA</span>`}</td>
            <td>${stBadge(u.status)}</td>
            <td class="num"><div class="row" style="gap:2px;justify-content:flex-end"><button class="icon-btn" aria-label="Editar" onclick="toast({title:'Editar ${u.name}',msg:'Rol, cupo y permisos.',type:'info'})">${icon('services')}</button><button class="icon-btn" aria-label="Bloquear" style="color:var(--error)" onclick="toast({title:'Acceso bloqueado',msg:'${u.name} ya no puede ingresar.',type:'info'})">${icon('lock')}</button></div></td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>`;
    }
    function roles() {
      return `<div class="grid grid-2 section">
        ${ROLES.map(r=>`<div class="card card--pad"><div class="row between mb-2"><h3 class="h4">${r.name}</h3><span class="badge badge--${r.color}">${USERS.filter(u=>u.role===r.name).length} usuarios</span></div><p class="text-muted" style="font-size:13px">${r.desc}</p><div class="mt-4">${r.perms.map(p=>`<div class="row" style="gap:10px;padding:6px 0"><span style="color:var(--success)">${icon('check')}</span><span class="text-slate" style="font-size:13px">${p}</span></div>`).join('')}</div></div>`).join('')}
      </div>
      ${infoBanner('Toda operación creada por un Operador requiere la aprobación de un Aprobador o Administrador (esquema de doble firma).','shield')}`;
    }
    function mount() {
      $('#uaBody').innerHTML = tab === 'usuarios' ? usuarios() : roles();
      const s = $('#uaSearch');
      if (s) s.oninput = () => { const q = s.value.toLowerCase(); view.querySelectorAll('#uaRows tr').forEach((tr,i) => tr.style.display = (USERS[i].name+USERS[i].email+USERS[i].role).toLowerCase().includes(q) ? '' : 'none'); };
    }
    view.querySelectorAll('#uaTabs [data-t]').forEach(b => b.onclick = () => { view.querySelectorAll('#uaTabs [data-t]').forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); tab = b.dataset.t; mount(); });
    $('#uaNew').onclick = () => {
      const ov = openModal(`<div class="modal__head"><h3 class="h3">Crear usuario</h3><button class="icon-btn" data-close>${icon('close')}</button></div>
        <div class="modal__body">
          <div class="grid grid-2" style="gap:0 16px"><div class="field" style="margin:0"><label>Nombres</label><div class="control">${icon('user')}<input placeholder="Nombres"></div></div><div class="field" style="margin:0"><label>Apellidos</label><div class="control">${icon('user')}<input placeholder="Apellidos"></div></div></div>
          <div class="field mt-4"><label>Correo corporativo</label><div class="control">${icon('receipt')}<input type="email" placeholder="usuario@robles.com"></div></div>
          <div class="grid grid-2" style="gap:0 16px"><div class="field" style="margin:0"><label>Rol</label><div class="control">${icon('shield')}<select>${ROLES.map(r=>`<option>${r.name}</option>`).join('')}</select>${icon('chevronDown')}</div></div><div class="field" style="margin:0"><label>Cupo de aprobación</label><div class="control"><span class="prefix">$</span><input inputmode="decimal" placeholder="10.000"></div></div></div>
          ${infoBanner('El usuario recibirá una invitación por correo para configurar su clave y 2FA.','info')}
        </div>
        <div class="modal__foot"><button class="btn btn--secondary" data-close>Cancelar</button><button class="btn btn--primary" id="uaSend">Enviar invitación</button></div>`, { wide:true });
      ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(ov));
      ov.querySelector('#uaSend').onclick = (e) => { e.currentTarget.classList.add('is-loading'); setTimeout(()=>{ closeModal(ov); toast({title:'Invitación enviada', msg:'El usuario recibirá el correo de activación.', type:'success'}); },900); };
    };
    mount();
  }
};
