/* BLU Web — Datos simulados (mock). Sin backend.
   Reflejan la lógica de negocio real: productos, tarjetas, cuentas, movimientos. */
const DB = {
  user: { name: 'María Fernanda Robles', first: 'María Fernanda', role: 'Cliente Diners Club', initials: 'MR', email: 'm.robles@email.com', phone: '099 812 4471' },

  // Empresa activa (multiempresa): el nombre encabeza el Home, como en la banca líder.
  empresa: { name: 'Robles Comercial S.A.', ruc: '1791234567001', otras: ['Robles Retail S.A.S.'] },

  // Resumen de ventas (adquirencia) que encabeza el Home en vez de la posición consolidada.
  ventasResumen: {
    porCobrar: 81200.00,      fechaCobro: 'Balance al 14 jul 2026',
    pagosRecibidos: 96320.06, periodo: '14 jun – 14 jul 2026',
    ventasMes: 128480.50,     crecimiento: 12.4,
  },

  // Posición consolidada: activo = lo que la empresa TIENE (cuentas + inversiones);
  // pasivo = lo que DEBE (tarjetas de crédito + créditos). Cupo Diners es GLOBAL.
  net: {
    activo: 40100.75,          // cuentas + inversiones
    pasivo: 21419.86,          // deuda tarjetas + créditos
    deudaTarjetas: 9179.68,    // suma de pago total de tarjetas
    cupoGlobal: 40000,         // cupo de crédito global (compartido entre todas las tarjetas)
    cupoGlobalDisp: 30820.32,  // cupo global disponible
  },

  // El cupo es GLOBAL (Diners) — no se muestra cupo por tarjeta. Cada tarjeta tiene
  // pago total, pago mínimo y fecha máxima de pago propios. "principal" separa
  // las tarjetas principales de la empresa de las adicionales.
  cards: [
    { id: 'diners', name: 'Diners Club', type: 'Internacional', variant: 'diners', principal: true, last4: '4417', number: '5412 •••• •••• 4417', corte: '18 jul', pago: '02 ago', pagoMin: 210.40, pagoTotal: 2340.18, deudaTotal: 12480.50, status: 'active' },
    { id: 'black', name: 'Mastercard Black', type: 'World Elite', variant: 'black', principal: true, last4: '2051', number: '5301 •••• •••• 2051', corte: '20 jul', pago: '05 ago', pagoMin: 480.00, pagoTotal: 5800.00, deudaTotal: 24800.00, status: 'active', movTotal: 247 },
    { id: 'visa', name: 'Visa blu', type: 'Adicional · Signature', variant: 'indigo', principal: false, titular: 'Carla Robles', last4: '8890', number: '4023 •••• •••• 8890', corte: '22 jul', pago: '07 ago', pagoMin: 0, pagoTotal: 0, deudaTotal: 0, status: 'active' },
    { id: 'platinum', name: 'Diners Club Platinum', type: 'Adicional · Rewards', variant: 'teal', principal: false, titular: 'Luis Robles', last4: '3376', number: '5488 •••• •••• 3376', corte: '27 jul', pago: '12 ago', pagoMin: 88.00, pagoTotal: 879.50, deudaTotal: 4200.00, status: 'active' },
    { id: 'diners-add', name: 'Diners Club', type: 'Adicional', variant: 'diners', principal: false, last4: '5521', number: '5412 •••• •••• 5521', corte: '18 jul', pago: '02 ago', pagoMin: 20.00, pagoTotal: 160.00, deudaTotal: 980.00, status: 'active', titular: 'Andrés Robles' },
  ],
  // Tarjetas prepago (producto aparte, sin cupo de crédito — funciona con saldo)
  prepaid: [
    { id: 'prep1', name: 'blu Prepago', type: 'Prepago empresarial', variant: 'indigo', titular: 'Mario Salazar', last4: '7742', number: '4211 •••• •••• 7742', saldo: 1250.00, status: 'active' },
    { id: 'prep2', name: 'blu Prepago Viáticos', type: 'Prepago · Ventas', variant: 'teal', titular: 'Diana Cevallos', last4: '3388', number: '4211 •••• •••• 3388', saldo: 480.30, status: 'active' },
  ],
  accounts: [
    { id: 'ahorro', name: 'Cuenta de Ahorros blu', type: 'Ahorros', num: '••• 2205', saldo: 12580.40, disponible: 12580.40, tasa: '4,5% anual', interesMes: 46.32, interesAnio: 512.80, movTotal: 312 },
    { id: 'corriente', name: 'Cuenta Corriente', type: 'Corriente', num: '••• 7781', saldo: 3099.60, disponible: 3099.60 },
    { id: 'programado', name: 'Ahorro Programado', type: 'Meta de ahorro', num: '••• 6640', saldo: 2400.00, disponible: 2400.00, tasa: '5,25% anual', interesMes: 10.44, interesAnio: 118.20 },
    { id: 'usd', name: 'Cuenta en Dólares', type: 'Ahorros USD', num: '••• 9014', saldo: 5820.75, disponible: 5820.75, tasa: '3,1% anual', interesMes: 14.87, interesAnio: 162.40 },
    { id: 'cancelada', name: 'Cuenta de Ahorros (cerrada)', type: 'Ahorros', num: '••• 4108', saldo: 218.45, disponible: 218.45, estado: 'cancelada' },
  ],
  // estado: 'al-dia' | 'mora' | 'legal' | 'judicial'.
  // En mora/legal/judicial la fecha máxima es "Inmediato" y (legal/judicial) el saldo
  // total se consulta con Diners.
  credits: [
    { id: 'auto', name: 'Crédito Automotriz', num: '••• 0091', saldo: 2340.18, cuota: 312.55, plazo: '18/48', prox: '05 ago', estado: 'al-dia', capitalOtorgado: 6000, capitalPagado: 3659.82, tasaNominal: '11.20%', tasaEfectiva: '11.83%', desembolso: '05 feb 2025', fin: '05 ago 2027', deudaFecha: 2372.40 },
    { id: 'consumo', name: 'Crédito de Consumo', num: '••• 3320', saldo: 1890.00, cuota: 156.20, plazo: '9/24', prox: 'Inmediato', estado: 'mora', capitalOtorgado: 4000, capitalPagado: 2110.00, tasaNominal: '15.20%', tasaEfectiva: '16.30%', desembolso: '10 nov 2025', fin: '10 nov 2027', deudaFecha: 1946.20 },
    { id: 'capital', name: 'Crédito Capital de Trabajo', num: '••• 7781', saldo: 8420.00, cuota: 640.00, plazo: '22/36', prox: 'Inmediato', estado: 'legal', capitalOtorgado: 20000, capitalPagado: 11580.00, tasaNominal: '9.80%', tasaEfectiva: '10.25%', desembolso: '01 mar 2024', fin: '01 mar 2027', deudaFecha: 8620.00 },
    { id: 'comercial', name: 'Crédito Comercial', num: '••• 5566', saldo: 15600.00, cuota: 0, plazo: '—', prox: 'Inmediato', estado: 'judicial', capitalOtorgado: 30000, capitalPagado: 14400.00, tasaNominal: '9.50%', tasaEfectiva: '9.95%', desembolso: '01 ene 2023', fin: '01 ene 2026', deudaFecha: 15600.00 },
  ],
  investments: [
    { id: 'dpf', name: 'Depósito a Plazo Fijo', tipo: 'Depósito a plazo fijo', last4: '3391', monto: 5000, tasa: '7.25%', interesGanado: 181.25, interesMes: 30.21, plazoDias: 180, emision: '15 jun 2026', pagoInteres: 'Al vencimiento', beneficiario: 'Robles Comercial S.A.', montoFinal: 5181.25, retencion: 3.62, estadoInv: 'vigente', vence: '12 dic 2026' },
    { id: 'dpf2', name: 'Depósito a Plazo 90 días', tipo: 'Depósito a plazo fijo', last4: '7204', monto: 8000, tasa: '6.80%', interesGanado: 136.00, interesMes: 45.33, plazoDias: 90, emision: '22 jun 2026', pagoInteres: 'Al vencimiento', beneficiario: 'Robles Comercial S.A.', montoFinal: 8136.00, retencion: 2.72, estadoInv: 'vigente', vence: '20 sep 2026' },
    { id: 'fondo', name: 'Fondo de Inversión blu', tipo: 'Fondo de inversión', last4: '5518', monto: 3200, tasa: '6.10%', interesGanado: 48.80, interesMes: 16.27, plazoDias: 0, emision: '01 may 2026', pagoInteres: 'Mensual', beneficiario: 'Robles Comercial S.A.', montoFinal: 3248.80, retencion: 0.98, estadoInv: 'vigente', vence: 'Sin plazo fijo' },
  ],

  movements: [
    { id: 1, merchant: 'Supermaxi', cat: 'Supermercado', date: 'Hoy · 14:20', amount: -84.32, icon: 'store', card: 'Diners Club' },
    { id: 2, merchant: 'Transferencia recibida', cat: 'Juan P.', date: 'Hoy · 09:12', amount: 250.00, icon: 'transfer', card: 'Ahorros' },
    { id: 3, merchant: 'Netflix', cat: 'Suscripción', date: 'Ayer · 22:01', amount: -13.99, icon: 'bolt', card: 'Diners Club' },
    { id: 4, merchant: 'Primax', cat: 'Combustible', date: 'Ayer · 18:45', amount: -40.00, icon: 'store', card: 'Visa blu' },
    { id: 5, merchant: 'Pago servicio · EEQ', cat: 'Luz eléctrica', date: '12 jul', amount: -46.70, icon: 'bolt', card: 'Ahorros' },
    { id: 6, merchant: 'Farmacias Cruz Azul', cat: 'Salud', date: '11 jul', amount: -22.15, icon: 'store', card: 'Diners Club' },
    { id: 7, merchant: 'Uber', cat: 'Movilidad', date: '10 jul', amount: -8.40, icon: 'store', card: 'Visa blu' },
    { id: 8, merchant: 'Depósito nómina', cat: 'Ingreso', date: '05 jul', amount: 1850.00, icon: 'cash', card: 'Ahorros' },
  ],

  spend: [ { cat: 'Supermercado', pct: 34, val: 420.5, color: '#4C71FC' }, { cat: 'Servicios', pct: 22, val: 272.0, color: '#32C5FF' }, { cat: 'Combustible', pct: 18, val: 222.0, color: '#2C55F5' }, { cat: 'Salud', pct: 14, val: 173.0, color: '#44AAFF' }, { cat: 'Otros', pct: 12, val: 148.0, color: '#B9C8FF' } ],

  contacts: [
    { id: 'c1', name: 'Juan Pérez', bank: 'Banco Pichincha', acc: '••• 4521', initials: 'JP', fav: true, producto: 'cuentas' },
    { id: 'c2', name: 'Ana Molina', bank: 'blu · Ahorros', acc: '••• 8830', initials: 'AM', fav: true, producto: 'cuentas' },
    { id: 'c3', name: 'Carlos Vega', bank: 'Produbanco', acc: '••• 1174', initials: 'CV', fav: false, producto: 'tarjetas' },
    { id: 'c4', name: 'Lucía Torres', bank: 'blu · Ahorros', acc: '••• 9902', initials: 'LT', fav: false, producto: 'cuentas' },
  ],

  services: [
    { id: 'luz', name: 'Empresa Eléctrica Quito', cat: 'Luz', icon: 'bolt', due: 46.70, ref: 'Suministro 8841002' },
    { id: 'agua', name: 'Agua Potable EPMAPS', cat: 'Agua', icon: 'services', due: 18.20, ref: 'Cuenta 55201' },
    { id: 'net', name: 'Internet Netlife', cat: 'Internet', icon: 'bolt', due: 32.90, ref: 'Contrato 77120' },
    { id: 'tv', name: 'DirecTV', cat: 'TV', icon: 'services', due: 0, ref: 'Tarjeta 99341' },
  ],

  rewards: { points: 48250, tier: 'Club Premium', next: 'Diamante', toNext: 6750, cashback: 128.40,
    catalog: [
      { id: 'r1', name: 'Millas LATAM', cost: 5000, sub: '2.500 millas', icon: 'plane' },
      { id: 'r2', name: 'Gift Card Supermaxi', cost: 3000, sub: 'USD 25', icon: 'gift' },
      { id: 'r3', name: 'Cashback a tu cuenta', cost: 2000, sub: 'USD 20', icon: 'cash' },
      { id: 'r4', name: 'Netflix 1 mes', cost: 1500, sub: 'Suscripción', icon: 'sparkles' },
    ] },
};

const money = (n, sign) => {
  const s = (n < 0 ? '-' : (sign && n > 0 ? '+' : '')) + '$' + Math.abs(n).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return s;
};
const moneyParts = (n) => {
  const [int, dec] = Math.abs(n).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(',');
  return { int: '$' + int, dec: dec };
};
