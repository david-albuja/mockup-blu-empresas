/* BLU Web — Iconografía coherente (stroke 1.8, viewBox 24, línea única)
   Set propio inspirado en Lucide/Material Symbols. Sin emojis. */
const ICONS = {
  home:      '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1z"/>',
  card:      '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9.5h18"/><path d="M7 15h4"/>',
  wallet:    '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"/><path d="M3 7.5V17a2 2 0 0 0 2 2h14a1.5 1.5 0 0 0 1.5-1.5V11a1.5 1.5 0 0 0-1.5-1.5H5A2 2 0 0 1 3 7.5z"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  coins:     '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.66 2.69 3 6 3"/><path d="M3 12v5c0 1.66 2.69 3 6 3"/><ellipse cx="15" cy="14" rx="6" ry="3"/><path d="M21 14v5c0 1.66-2.69 3-6 3"/>',
  chart:     '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  transfer:  '<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>',
  send:      '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  services:  '<path d="M12 3v2"/><path d="m18.36 5.64-1.42 1.42"/><path d="M21 12h-2"/><path d="M5 12H3"/><path d="m7.06 7.06-1.42-1.42"/><circle cx="12" cy="12" r="4"/><path d="M12 16v5"/>',
  bolt:      '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  receipt:   '<path d="M5 3v18l2-1.2L9 21l2-1.2L13 21l2-1.2L17 21l2-1.2V3l-2 1.2L15 3l-2 1.2L11 3 9 4.2 7 3z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  atm:       '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 20h10"/><path d="M9 8h6v4H9z"/>',
  contacts:  '<circle cx="9" cy="8" r="3.2"/><path d="M4 20a5 5 0 0 1 10 0"/><path d="M16 4a3 3 0 0 1 0 6"/><path d="M18 20a5 5 0 0 0-3-4.6"/>',
  lock:      '<rect x="4.5" y="10" width="15" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3"/>',
  shield:    '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  plane:     '<path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.7.7 0 0 0-.7 1.2l6 3.5-2.6 2.6-2.1-.4a.6.6 0 0 0-.6 1l2 2 2 2a.6.6 0 0 0 1-.6l-.4-2.1 2.6-2.6 3.5 6a.7.7 0 0 0 1.2-.7z"/>',
  certificate:'<path d="M5 3h11l3 3v9H5z"/><path d="M9 19v3l2-1.5L13 22v-3"/><path d="M8 8h8M8 11h5"/>',
  file:      '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/><path d="M9 13h6M9 17h4"/>',
  gift:      '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M4 12v9h16v-9"/><path d="M12 8v13"/><path d="M12 8S9 3 6.5 5 8 8 12 8zM12 8s3-5 5.5-3S16 8 12 8z"/>',
  star:      '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  user:      '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users:     '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.4"/><path d="M22 20a6.5 6.5 0 0 0-4-6"/>',
  headset:   '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a5 5 0 0 1-5 4h-2"/>',
  bell:      '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  search:    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>',
  chevron:   '<path d="m9 6 6 6-6 6"/>',
  chevronDown:'<path d="m6 9 6 6 6-6"/>',
  back:      '<path d="m15 6-6 6 6 6"/>',
  eye:       '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:    '<path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.4 5.3A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.3 4M6.2 6.2A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 3-.5"/>',
  check:     '<path d="m5 12 5 5L20 7"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  alert:     '<path d="M12 3 2 20h20z"/><path d="M12 9v5"/><circle cx="12" cy="17.2" r=".6" fill="currentColor" stroke="none"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".7" fill="currentColor" stroke="none"/>',
  close:     '<path d="M6 6 18 18M18 6 6 18"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  menu:      '<path d="M4 7h16M4 12h16M4 17h16"/>',
  copy:      '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download:  '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/>',
  filter:    '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  calendar:  '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  logout:    '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 12h10"/><path d="m16 8 4 4-4 4"/>',
  arrowUp:   '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  phone:     '<path d="M5 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  store:     '<path d="M4 10v9h16v-9"/><path d="M3 6h18l-1 4H4z"/><path d="M9 19v-5h6v5"/>',
  cash:      '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v6M18 9v6"/>',
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  fingerprint:'<path d="M12 4a7 7 0 0 0-7 7v2"/><path d="M12 8a3 3 0 0 0-3 3v3a5 5 0 0 0 .6 2.4"/><path d="M12 11v4a8 8 0 0 0 .8 3.5"/><path d="M15 11v4"/><path d="M19 11a7 7 0 0 0-2-4.9"/>',
  sparkles:  '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
  moon:      '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z"/>',
  sun:       '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.5 3.5M20.5 20.5 19 19M19 5l1.5-1.5M3.5 20.5 5 19"/>',
  grid:      '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
  map:       '<path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6z"/><path d="M9 3v15M15 6v15"/>',
  building:  '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/>',
  key:       '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8-8"/><path d="m16 4 3 3M15 8l2 2"/>',
  approve:   '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  upload:    '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 21h16"/>',
  swap:      '<path d="M7 4v13"/><path d="m3 8 4-4 4 4"/><path d="M17 20V7"/><path d="m13 16 4 4 4-4"/>',
};
function icon(name, cls) {
  const p = ICONS[name] || ICONS.info;
  return `<svg class="${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* Marca Diners Club (círculo con barra) — inspirada en el logo real */
function dinersMark(size = 40, fill = '#2E5BFF') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true" style="flex:none">
    <circle cx="24" cy="24" r="21.5" fill="${fill}"/>
    <circle cx="24" cy="24" r="22.5" fill="none" stroke="#fff" stroke-width="1.6"/>
    <rect x="13" y="21" width="22" height="6" rx="3" fill="#fff"/>
  </svg>`;
}
/* Wordmark "blu" en minúscula (identidad de marca) */
function bluWord(cls = '') { return `<span class="blu-word ${cls}">blu</span>`; }
