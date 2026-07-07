/* BLU Web — Datos simulados (mock). Sin backend.
   Reflejan la lógica de negocio real: productos, tarjetas, cuentas, movimientos. */
const DB = {
  user: { name: 'María Fernanda Robles', first: 'María Fernanda', role: 'Cliente Diners Club', initials: 'MR', email: 'm.robles@email.com', phone: '099 812 4471' },

  net: { patrimonio: 8412.55, disponible: 15680.00, deuda: 2340.18, ahorroMes: 620.00 },

  cards: [
    { id: 'diners', name: 'Diners Club', type: 'Internacional', variant: 'diners', last4: '4417', number: '5412 •••• •••• 4417', cupo: 12000, disponible: 9659.82, usado: 2340.18, corte: '15 jul', pago: '02 ago', pagoMin: 210.40, pagoTotal: 2340.18, status: 'active' },
    { id: 'black', name: 'Mastercard Black', type: 'World Elite', variant: 'black', last4: '2051', number: '5301 •••• •••• 2051', cupo: 20000, disponible: 14200, usado: 5800, corte: '18 jul', pago: '05 ago', pagoMin: 480.00, pagoTotal: 5800.00, status: 'active' },
    { id: 'visa', name: 'Visa BLU', type: 'Signature', variant: 'indigo', last4: '8890', number: '4023 •••• •••• 8890', cupo: 6000, disponible: 6000, usado: 0, corte: '20 jul', pago: '07 ago', pagoMin: 0, pagoTotal: 0, status: 'active' },
    { id: 'platinum', name: 'Diners Club Platinum', type: 'Rewards', variant: 'teal', last4: '3376', number: '5488 •••• •••• 3376', cupo: 8000, disponible: 7120.50, usado: 879.50, corte: '25 jul', pago: '12 ago', pagoMin: 88.00, pagoTotal: 879.50, status: 'active' },
    { id: 'diners-add', name: 'Diners Club Adicional', type: 'Andrés Robles', variant: 'diners', last4: '5521', number: '5412 •••• •••• 5521', cupo: 800, disponible: 640.00, usado: 160.00, corte: '15 jul', pago: '02 ago', pagoMin: 20.00, pagoTotal: 160.00, status: 'active' },
  ],
  accounts: [
    { id: 'ahorro', name: 'Cuenta de Ahorros BLU', type: 'Ahorros', num: '••• 2205', saldo: 12580.40, disponible: 12580.40, tasa: '4,5% anual', interesMes: 46.32, interesAnio: 512.80 },
    { id: 'corriente', name: 'Cuenta Corriente', type: 'Corriente', num: '••• 7781', saldo: 3099.60, disponible: 3099.60 },
    { id: 'programado', name: 'Ahorro Programado', type: 'Meta de ahorro', num: '••• 6640', saldo: 2400.00, disponible: 2400.00, tasa: '5,25% anual', interesMes: 10.44, interesAnio: 118.20 },
    { id: 'usd', name: 'Cuenta en Dólares', type: 'Ahorros USD', num: '••• 9014', saldo: 5820.75, disponible: 5820.75, tasa: '3,1% anual', interesMes: 14.87, interesAnio: 162.40 },
  ],
  credits: [
    { id: 'auto', name: 'Crédito Automotriz', num: '••• 0091', saldo: 2340.18, cuota: 312.55, plazo: '18/48', prox: '05 ago' },
  ],
  investments: [
    { id: 'dpf', name: 'Depósito a Plazo Fijo', monto: 5000, tasa: '7.25%', vence: '12 dic 2026' },
    { id: 'dpf2', name: 'Depósito a Plazo 90 días', monto: 8000, tasa: '6.80%', vence: '20 sep 2026' },
    { id: 'fondo', name: 'Fondo de Inversión BLU', monto: 3200, tasa: '6.10%', vence: 'Sin plazo fijo' },
  ],

  movements: [
    { id: 1, merchant: 'Supermaxi', cat: 'Supermercado', date: 'Hoy · 14:20', amount: -84.32, icon: 'store', card: 'Diners Club' },
    { id: 2, merchant: 'Transferencia recibida', cat: 'Juan P.', date: 'Hoy · 09:12', amount: 250.00, icon: 'transfer', card: 'Ahorros' },
    { id: 3, merchant: 'Netflix', cat: 'Suscripción', date: 'Ayer · 22:01', amount: -13.99, icon: 'bolt', card: 'Diners Club' },
    { id: 4, merchant: 'Primax', cat: 'Combustible', date: 'Ayer · 18:45', amount: -40.00, icon: 'store', card: 'Visa BLU' },
    { id: 5, merchant: 'Pago servicio · EEQ', cat: 'Luz eléctrica', date: '12 jul', amount: -46.70, icon: 'bolt', card: 'Ahorros' },
    { id: 6, merchant: 'Farmacias Cruz Azul', cat: 'Salud', date: '11 jul', amount: -22.15, icon: 'store', card: 'Diners Club' },
    { id: 7, merchant: 'Uber', cat: 'Movilidad', date: '10 jul', amount: -8.40, icon: 'store', card: 'Visa BLU' },
    { id: 8, merchant: 'Depósito nómina', cat: 'Ingreso', date: '05 jul', amount: 1850.00, icon: 'cash', card: 'Ahorros' },
  ],

  spend: [ { cat: 'Supermercado', pct: 34, val: 420.5, color: '#4C71FC' }, { cat: 'Servicios', pct: 22, val: 272.0, color: '#32C5FF' }, { cat: 'Combustible', pct: 18, val: 222.0, color: '#2C55F5' }, { cat: 'Salud', pct: 14, val: 173.0, color: '#44AAFF' }, { cat: 'Otros', pct: 12, val: 148.0, color: '#B9C8FF' } ],

  contacts: [
    { id: 'c1', name: 'Juan Pérez', bank: 'Banco Pichincha', acc: '••• 4521', initials: 'JP', fav: true },
    { id: 'c2', name: 'Ana Molina', bank: 'BLU · Ahorros', acc: '••• 8830', initials: 'AM', fav: true },
    { id: 'c3', name: 'Carlos Vega', bank: 'Produbanco', acc: '••• 1174', initials: 'CV', fav: false },
    { id: 'c4', name: 'Lucía Torres', bank: 'BLU · Ahorros', acc: '••• 9902', initials: 'LT', fav: false },
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
