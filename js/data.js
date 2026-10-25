/* PreHaRM dashboard prototype - DUMMY DATA ONLY.
   Edit this file to change ward name, update time, band cut-offs and risk values. */
const PREHARM = {
  ward: '[Ward name]',
  userName: '[NUM name]',
  // Wards a NUM can choose after signing in (demo values)
  wards: ['[Ward A]', '[Ward B]', '[Ward C]'],
  todayLabel: 'Monday 26 October',
  weekLabel: '26 Oct – 1 Nov',
  lastUpdated: '06:30',
  dataTo: '06:25',
  refresh: '[interval TBC]',

  // Band cut-offs (%) - placeholders to be agreed with NUMs
  lowMax: 15,   // below this = Low
  highMin: 30,  // this and above = High

  harms: [
    { id: 'falls', label: 'Falls' },
    { id: 'med', label: 'Medication errors' },
    { id: 'aggr', label: 'Aggression' }
  ],
  shifts: [
    { name: 'Early', time: '07:00 – 15:30' },
    { name: 'Late', time: '13:00 – 21:30' },
    { name: 'Night', time: '21:00 – 07:30' }
  ],
  staffTypes: [
    { k: 'RN', label: 'RN', c: '#1F4E79' },
    { k: 'EN', label: 'EN', c: '#3D7DBF' },
    { k: 'AIN', label: 'AIN/PCA', c: '#8DB8E2' },
    { k: 'AG', label: 'Agency', c: '#C9661A' }
  ],
  maxStaff: 10, // headcount that fills the whole staff bar
  staffFactors: [
    { label: 'Skill mix', c: '#0E5A57' },
    { label: 'Inexperience', c: '#2B8A84' },
    { label: 'Agency use', c: '#C9661A' },
    { label: 'Short numbers', c: '#7CC3BD' }
  ],

  // Today: staff on each shift and % contribution of each staff factor
  // (order: skill mix, inexperience, agency use, short numbers); remainder = patient factors
  today: [
    { staff: { RN: 6, EN: 2, AIN: 2, AG: 0 },
      contrib: { all: [10, 12, 0, 8], falls: [8, 10, 0, 10], med: [12, 16, 0, 4], aggr: [6, 6, 0, 6] } },
    { staff: { RN: 5, EN: 2, AIN: 2, AG: 1 },
      contrib: { all: [14, 12, 8, 14], falls: [12, 10, 6, 16], med: [16, 18, 8, 8], aggr: [10, 8, 10, 12] } },
    { staff: { RN: 3, EN: 1, AIN: 1, AG: 2 },
      contrib: { all: [18, 10, 20, 20], falls: [16, 8, 18, 26], med: [20, 14, 22, 10], aggr: [14, 8, 22, 26] } }
  ],

  // Week: predicted risk % [shift][day], Mon..Sun. Day 0 = today.
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daysLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dates: ['26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov'],
  week: {
    falls: [[18, 20, 16, 15, 17, 22, 24], [24, 28, 22, 20, 23, 27, 29], [38, 42, 33, 30, 34, 40, 44]],
    med:   [[12, 14, 11, 10, 12, 15, 16], [16, 19, 15, 14, 15, 18, 20], [22, 26, 20, 18, 21, 25, 27]],
    aggr:  [[6, 7, 5, 5, 6, 9, 10], [14, 16, 12, 11, 13, 19, 21], [31, 35, 27, 25, 29, 42, 46]]
  },
  // Forecast range (+/- percentage points) widens with days from today. Illustrative only.
  spread: function (d) { return 2 + d * 2.5; }
};

function bandOf(v) {
  if (v >= PREHARM.highMin) return { label: 'High', cls: 'b-high' };
  if (v >= PREHARM.lowMax) return { label: 'Medium', cls: 'b-med' };
  return { label: 'Low', cls: 'b-low' };
}

function el(tag, attrs, children) {
  const n = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'text') n.textContent = v;
    else if (k === 'style') n.setAttribute('style', v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  });
  (children || []).forEach((c) => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return n;
}

/* Demo sign-in session: nothing is checked or sent anywhere; the chosen ward is kept
   in this browser tab only (sessionStorage). */
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('preharmDemoSession') || 'null'); } catch (e) { return undefined; }
}
function setSession(obj) {
  try { if (obj) sessionStorage.setItem('preharmDemoSession', JSON.stringify(obj)); else sessionStorage.removeItem('preharmDemoSession'); } catch (e) {}
}
function requireSession() {
  const s = getSession();
  if (s === null) { window.location.replace('index.html'); return null; } // not signed in
  return s || { name: PREHARM.userName, ward: PREHARM.ward };              // storage blocked: carry on
}

function fillCommon() {
  const sess = requireSession();
  if (!sess) return;
  PREHARM.ward = sess.ward;
  document.querySelectorAll('[data-ward]').forEach((n) => (n.textContent = PREHARM.ward));
  document.querySelectorAll('[data-who]').forEach((n) => {
    n.innerHTML = '';
    const initials = (sess.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2) || 'NU').toUpperCase();
    n.appendChild(el('span', { class: 'avatar', 'aria-hidden': 'true', text: initials }));
    n.appendChild(el('div', {}, [el('strong', { text: 'Signed in as ' + sess.name }), el('small', { text: 'Nurse Unit Manager · ' + sess.ward })]));
    n.appendChild(el('a', { href: 'index.html', text: 'Sign out', onclick: () => setSession(null) }));
  });
  document.querySelectorAll('[data-updated]').forEach((n) => (n.textContent = 'Last updated ' + PREHARM.lastUpdated));
  document.querySelectorAll('[data-refresh]').forEach((n) => (n.textContent = 'Refreshes every ' + PREHARM.refresh + ' · data to ' + PREHARM.dataTo));
  document.querySelectorAll('[data-legend]').forEach((n) => {
    n.innerHTML = '';
    const lo = PREHARM.lowMax, hi = PREHARM.highMin;
    [['b-low', 'Low: under ' + lo + '%'], ['b-med', 'Medium: ' + lo + '–' + (hi - 1) + '%'], ['b-high', 'High: ' + hi + '% and above']]
      .forEach(([c, t]) => n.appendChild(el('span', {}, [el('i', { class: c, 'aria-hidden': 'true' }), t])));
    n.appendChild(el('span', { text: 'Prototype with dummy data. Band cut-offs are placeholders to be agreed with NUMs.' }));
  });
}
