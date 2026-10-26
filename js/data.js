/* PreHaRM dashboard prototype - DUMMY DATA ONLY.
   Edit this file to change ward name, update time, band cut-offs and risk values. */
const PREHARM = {
  ward: '[Ward name]',
  userName: 'Julie Hartmann',
  // Wards a NUM can choose after signing in (demo values)
  wards: ['General Surgery A', 'General Surgery B', 'General Surgery C'],
  // Dates, day names and the "last updated" time are worked out from the
  // viewer's current date and time when the page opens (see setDates below).
  updatedMinsAgo: 3, // "Last updated" = page opened minus this many minutes
  dataLagMins: 5,    // "data to" = last updated minus this many minutes
  refresh: '[interval TBC]',

  // Band cut-offs (%) - placeholders to be agreed with NUMs
  // Users can change these with the sliders at the bottom of each page;
  // their choice is kept in their own browser only.
  lowMax: 15,   // below this = Low (default)
  highMin: 30,  // this and above = High (default)

  harms: [
    { id: 'falls', label: 'Falls' },
    { id: 'med', label: 'Medication errors' },
    { id: 'aggr', label: 'Occupational violence' }
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

  // Sample risk % by [shift][weekday], weekday order Mon..Sun.
  // Each real date picks up the value for its weekday, so weekends stay higher.
  week: {
    falls: [[18, 20, 16, 15, 17, 22, 24], [24, 28, 22, 20, 23, 27, 29], [38, 42, 33, 30, 34, 40, 44]],
    med:   [[12, 14, 11, 10, 12, 15, 16], [16, 19, 15, 14, 15, 18, 20], [22, 26, 20, 18, 21, 25, 27]],
    aggr:  [[6, 7, 5, 5, 6, 9, 10], [14, 16, 12, 11, 13, 19, 21], [31, 35, 27, 25, 29, 42, 46]]
  },
  // Forecast range (+/- percentage points) widens with days from today. Illustrative only.
  spread: function (d) { return 2 + d * 2.5; },
  gridDays: 7,  // weekly grid: today + 6 days
  chartDays: 8  // forecast chart: today to the same weekday next week
};

// Work out real dates from today
(function setDates(P) {
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = (d) => pad(d.getHours()) + ':' + pad(d.getMinutes());
  const now = new Date();
  const upd = new Date(now.getTime() - P.updatedMinsAgo * 60000);
  P.lastUpdated = hhmm(upd);
  P.dataTo = hhmm(new Date(upd.getTime() - P.dataLagMins * 60000));

  const short = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const long = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  P.wd = []; P.days = []; P.daysLong = []; P.dates = []; P.chartLabels = []; P.isWeekend = [];
  for (let i = 0; i < P.chartDays; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const w = (d.getDay() + 6) % 7; // Monday = 0
    P.wd.push(w);
    P.days.push(short[w]);
    P.daysLong.push(long[w]);
    P.dates.push(d.getDate() + ' ' + mShort[d.getMonth()]);
    P.chartLabels.push(short[w] + ' ' + d.getDate());
    P.isWeekend.push(w >= 5);
    if (i === 0) P.todayLabel = long[w] + ' ' + d.getDate() + ' ' + mLong[d.getMonth()];
  }
  P.weekLabel = P.dates[0] + ' – ' + P.dates[P.gridDays - 1];
})(PREHARM);

// Sample risk for harm h, shift s, i days from today
PREHARM.riskAt = function (h, s, i) {
  return this.week[h][s][this.wd[i]] + (i >= 7 ? 1 : 0);
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

/* Editable risk bands */
PREHARM.defaultBands = { lowMax: PREHARM.lowMax, highMin: PREHARM.highMin };
(function loadBands() {
  try {
    const b = JSON.parse(localStorage.getItem('preharmBands') || 'null');
    if (b && b.lowMax >= 1 && b.highMin > b.lowMax && b.highMin <= 90) { PREHARM.lowMax = b.lowMax; PREHARM.highMin = b.highMin; }
  } catch (e) {}
})();
function saveBands() {
  try { localStorage.setItem('preharmBands', JSON.stringify({ lowMax: PREHARM.lowMax, highMin: PREHARM.highMin })); } catch (e) {}
}

function mountBandControls(n, onChange) {
  n.innerHTML = '';
  const panel = el('section', { class: 'bands', 'aria-label': 'Risk band thresholds' });
  const head = el('div', { class: 'bands-head' }, [
    el('h2', { text: 'Risk bands' }),
    el('span', { class: 'muted', style: 'font-size:13px', text: 'Drag to set where Medium and High begin. Saved in this browser only.' })
  ]);
  const preview = el('div', { class: 'band-preview', 'aria-hidden': 'true' });
  const keys = el('div', { class: 'band-keys' });

  const mkSlider = (id, label) => {
    const out = el('output', { for: id, class: 'band-val' });
    const input = el('input', { type: 'range', id: id, min: '1', max: '90', step: '1' });
    const wrap = el('div', { class: 'band-ctrl' }, [
      el('label', { for: id }, [label, ' ', out]),
      input
    ]);
    return { wrap, input, out };
  };
  const med = mkSlider('band-med', 'Medium starts at');
  const high = mkSlider('band-high', 'High starts at');
  const reset = el('button', { type: 'button', class: 'pill', text: 'Reset to ' + PREHARM.defaultBands.lowMax + '% / ' + PREHARM.defaultBands.highMin + '%' });

  const paint = () => {
    const lo = PREHARM.lowMax, hi = PREHARM.highMin, max = 90;
    med.input.value = lo; high.input.value = hi;
    med.out.textContent = lo + '%'; high.out.textContent = hi + '%';
    preview.innerHTML = '';
    preview.appendChild(el('span', { class: 'b-low', style: 'width:' + (lo / max * 100) + '%' }));
    preview.appendChild(el('span', { class: 'b-med', style: 'width:' + ((hi - lo) / max * 100) + '%' }));
    preview.appendChild(el('span', { class: 'b-high', style: 'width:' + ((max - hi) / max * 100) + '%' }));
    keys.innerHTML = '';
    [['b-low', 'Low: under ' + lo + '%'], ['b-med', 'Medium: ' + lo + '–' + (hi - 1) + '%'], ['b-high', 'High: ' + hi + '% and above']]
      .forEach(([c, t]) => keys.appendChild(el('span', {}, [el('i', { class: c, 'aria-hidden': 'true' }), t])));
  };
  const apply = (changed) => {
    let lo = Number(med.input.value), hi = Number(high.input.value);
    if (lo >= hi) { if (changed === 'med') hi = Math.min(90, lo + 1); else lo = Math.max(1, hi - 1); }
    if (lo >= hi) lo = hi - 1;
    PREHARM.lowMax = lo; PREHARM.highMin = hi;
    paint(); saveBands(); if (onChange) onChange();
  };
  med.input.addEventListener('input', () => apply('med'));
  high.input.addEventListener('input', () => apply('high'));
  reset.addEventListener('click', () => {
    PREHARM.lowMax = PREHARM.defaultBands.lowMax; PREHARM.highMin = PREHARM.defaultBands.highMin;
    paint(); saveBands(); if (onChange) onChange();
  });

  panel.appendChild(head);
  panel.appendChild(el('div', { class: 'band-row' }, [med.wrap, high.wrap, reset]));
  panel.appendChild(preview);
  panel.appendChild(keys);
  n.appendChild(panel);
  n.appendChild(el('p', { class: 'note', text: 'Prototype with dummy data. Default cut-offs are placeholders to be agreed with NUMs.' }));
  paint();
}

function fillCommon(onBandsChange) {
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
  document.querySelectorAll('[data-legend]').forEach((n) => mountBandControls(n, onBandsChange));
}
