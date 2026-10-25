(function () {
  const P = PREHARM;
  const state = { harm: 'max', day: 0, shift: 2 };
  const tabs = [{ id: 'max', label: 'Highest of three' }].concat(P.harms);
  const harmName = (id) => P.harms.find((h) => h.id === id).label;

  const valOf = (h, s, d) => h === 'max'
    ? Math.max(P.week.falls[s][d], P.week.med[s][d], P.week.aggr[s][d])
    : P.week[h][s][d];
  const topHarm = (s, d) => P.harms.reduce((best, h) => (P.week[h.id][s][d] > P.week[best][s][d] ? h.id : best), 'falls');

  function render() {
    const harmLabel = tabs.find((t) => t.id === state.harm).label;

    // Selector
    const pills = document.getElementById('harm-pills');
    pills.querySelectorAll('button').forEach((b) => b.remove());
    tabs.forEach((t) => pills.appendChild(el('button', {
      type: 'button', class: 'pill', 'aria-pressed': String(t.id === state.harm), text: t.label,
      onclick: () => { state.harm = t.id; render(); }
    })));
    document.getElementById('grid-title').textContent = 'Risk across the week · ' + harmLabel;

    // Grid
    const g = document.getElementById('wgrid');
    g.innerHTML = '';
    g.appendChild(el('span'));
    P.days.forEach((n, i) => g.appendChild(el('div', { class: 'dayhead' + (i === 0 ? ' today' : i >= 5 ? ' weekend' : '') },
      [el('strong', { text: i === 0 ? n + ' · Today' : n }), el('small', { text: P.dates[i] })])));
    P.shifts.forEach((sh, s) => {
      g.appendChild(el('div', { style: 'display:flex;flex-direction:column;justify-content:center;padding:0 4px' },
        [el('span', { style: 'font-size:16px;font-weight:600', text: sh.name }), el('span', { class: 'stime', text: sh.time })]));
      P.days.forEach((n, d) => {
        const v = valOf(state.harm, s, d);
        const b = bandOf(v);
        g.appendChild(el('button', {
          type: 'button', class: 'cell ' + b.cls + (state.day === d && state.shift === s ? ' sel' : ''),
          'aria-label': P.daysLong[d] + ' ' + sh.name + ' shift, ' + harmLabel + ' ' + v + ' percent, ' + b.label,
          onclick: () => { state.day = d; state.shift = s; render(); }
        }, [el('span', { class: 'v', text: v + '%' }), el('span', { class: 'b', text: state.harm === 'max' ? harmName(topHarm(s, d)) : b.label })]));
      });
    });
    document.getElementById('grid-note').textContent = (state.harm === 'max'
      ? 'Each cell shows the highest of the three harm risks and names that harm.'
      : 'Each cell shows the predicted ' + harmLabel.toLowerCase() + ' risk.') + ' Select a cell to see its detail and the forecast for that shift below.';

    renderChart(harmLabel);
    renderDetail();
  }

  function renderChart(harmLabel) {
    const s = state.shift;
    const W = 720, H = 280, pL = 44, pR = 40, pT = 14, pB = 36, yMax = 60;
    const x = (i) => pL + i * (W - pL - pR) / 6;
    const y = (v) => pT + (1 - Math.max(0, Math.min(yMax, v)) / yMax) * (H - pT - pB);
    const vals = P.days.map((n, d) => valOf(state.harm, s, d));
    const up = vals.map((v, d) => v + P.spread(d));
    const dn = vals.map((v, d) => Math.max(0, v - P.spread(d)));
    const path = (a) => a.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const band = path(up) + ' ' + dn.slice().reverse().map((v, j) => 'L' + x(6 - j).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ') + ' Z';
    const zone = (a, b, c) => '<rect x="' + pL + '" y="' + y(b) + '" width="' + (W - pL - pR) + '" height="' + (y(a) - y(b)) + '" fill="' + c + '"/>';
    let svg = zone(0, P.lowMax, '#E2F3E7') + zone(P.lowMax, P.highMin, '#FFF0D1') + zone(P.highMin, yMax, '#FBE1DF');
    [0, 15, 30, 45, 60].forEach((t) => {
      svg += '<line class="grid" x1="' + pL + '" x2="' + (W - pR) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>';
      svg += '<text x="' + (pL - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + '%</text>';
    });
    svg += '<path class="band" d="' + band + '"/><path class="edge" d="' + path(up) + '"/><path class="edge" d="' + path(dn) + '"/><path class="line" d="' + path(vals) + '"/>';
    vals.forEach((v, d) => {
      svg += '<circle class="pt' + (d === state.day ? ' sel' : '') + '" cx="' + x(d) + '" cy="' + y(v) + '" r="' + (d === state.day ? 6 : 4) + '"/>';
      svg += '<text x="' + x(d) + '" y="' + (H - 12) + '" text-anchor="middle">' + P.days[d] + '</text>';
    });
    const w = P.spread(6);
    svg += '<text class="pm" x="' + (x(6) + 6) + '" y="' + (y(up[6]) + 4) + '">+' + w + '</text>';
    svg += '<text class="pm" x="' + (x(6) + 6) + '" y="' + (y(dn[6]) + 4) + '">−' + w + '</text>';
    const node = document.getElementById('forecast');
    node.innerHTML = svg;
    node.setAttribute('aria-label', 'Forecast for ' + P.shifts[s].name + ' shift, ' + harmLabel + ', Monday ' + vals[0] + ' percent to Sunday ' + vals[6] + ' percent, range plus or minus ' + w + ' points by Sunday');
    document.getElementById('chart-title').textContent = 'Forecast · ' + P.shifts[s].name + ' shift · ' + harmLabel;
  }

  function renderDetail() {
    const s = state.shift, d = state.day, w = P.spread(d);
    document.getElementById('detail-title').textContent = P.daysLong[d] + ' ' + P.dates[d] + ' · ' + P.shifts[s].name;
    const box = document.getElementById('detail-boxes');
    box.innerHTML = '';
    P.harms.forEach((h) => {
      const v = P.week[h.id][s][d];
      const b = bandOf(v);
      box.appendChild(el('div', { class: 'dbox ' + b.cls }, [
        el('div', { class: 'top' }, [el('span', { text: h.label }), el('span', { style: 'font-size:12px', text: b.label })]),
        el('span', { class: 'v', text: v + '%' }),
        el('span', { class: 'r', text: 'Likely range ' + Math.max(0, Math.round(v - w)) + '–' + Math.round(v + w) + '%' })
      ]));
    });
    document.getElementById('open-today').hidden = d !== 0;
  }

  fillCommon();
  document.getElementById('week-label').textContent = 'Week ahead, ' + P.weekLabel;
  render();
})();
