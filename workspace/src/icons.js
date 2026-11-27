// ================= Icons =================
function ic(p){ return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'; }
var LOGO='<svg width="24" height="24" viewBox="0 0 100 100" aria-hidden="true"><path d="M71.2 36.8 A30 30 0 1 1 28.8 36.8" fill="none" stroke="#DA1F34" stroke-width="17"/><path d="M37.3 30.8 A30 30 0 0 1 62.7 30.8" fill="none" stroke="#DA1F34" stroke-width="17"/></svg>';
var ICON={
  cursor:ic('<path d="M5 3l14 7-6 2-2 6z"/>'), eye:ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'), wallet:ic('<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M16 12.5h2M3 10h18"/>'),
  plus:ic('<path d="M12 5v14M5 12h14"/>'), play:ic('<path d="M8 5l11 7-11 7z"/>'),
  upload:ic('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>'), check:ic('<path d="M20 6L9 17l-5-5"/>'),
  back:ic('<path d="M15 6l-6 6 6 6"/>'), down:ic('<path d="M6 9l6 6 6-6"/>'), x:ic('<path d="M6 6l12 12M18 6L6 18"/>'),
  ext:ic('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>'),
  mega:ic('<path d="M3 10v4h4l6 4V6L7 10H3z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>'),
  moon:ic('<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>'), sun:ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
  users:ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>'),
  swap:ic('<path d="M7 7h13l-4-4M17 17H4l4 4"/>'), folder:ic('<path d="M3 6h6l2 2h10v11H3z"/>'),
  drive:ic('<path d="M8 3h8l6 11-4 7H6l-4-7z"/><path d="M8 3l6 11H2M16 3l-6 11 4 7"/>'),
  dots:ic('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  cal:ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  pin:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true" style="width:16px;height:16px;vertical-align:-3px"><path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/></svg>',
  search:ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  key:ic('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
  cam:ic('<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-3v8l-5-3"/>'),
  spark:ic('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'),
  globe:ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'),
  arrow:ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  send:ic('<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>'),
  chat:ic('<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>'),
  download:ic('<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>'),
  lock:ic('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  up:ic('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  sheet:ic('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>'),
  link:ic('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>')
};
