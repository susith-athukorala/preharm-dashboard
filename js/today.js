(function () {
  const P = PREHARM;
  let harm = 'all';
  const tabs = [{ id: 'all', label: 'All harms' }].concat(P.harms);

  function render() {
    // Harm selector
    const pills = document.getElementById('harm-pills');
    pills.querySelectorAll('button').forEach((b) => b.remove());
    tabs.forEach((t) => pills.appendChild(el('button', {
      type: 'button', class: 'pill', 'aria-pressed': String(t.id === harm), text: t.label,
      onclick: () => { harm = t.id; render(); }
    })));
    const harmLabel = tabs.find((t) => t.id === harm).label.toLowerCase();
    document.getElementById('driver-head').textContent = 'What is driving the risk (' + harmLabel + ')';

    // Rows
    const body = document.getElementById('shift-rows');
    body.innerHTML = '';
    const alerts = [];
    P.shifts.forEach((sh, s) => {
      const t = P.today[s];
      const row = el('div', { class: 'srow' });
      row.appendChild(el('div', {}, [el('span', { class: 'sname', text: sh.name }), el('span', { class: 'stime', text: sh.time })]));

      P.harms.forEach((h) => {
        const v = P.week[h.id][s][0];
        const b = bandOf(v);
        if (v >= P.highMin) alerts.push(sh.name + ' · ' + h.label + ' ' + v + '%');
        row.appendChild(el('button', {
          type: 'button', class: 'risk ' + b.cls + (harm === h.id ? ' sel' : ''),
          'aria-label': sh.name + ' shift, ' + h.label + ' risk ' + v + ' percent, ' + b.label + '. Show drivers.',
          onclick: () => { harm = h.id; render(); }
        }, [el('span', { class: 'v', text: v + '%' }), el('span', { class: 'b', text: b.label })]));
      });

      // Staff mix (counts)
      const sbar = el('div', { class: 'bar', 'aria-hidden': 'true' });
      P.staffTypes.filter((d) => t.staff[d.k] > 0).forEach((d) =>
        sbar.appendChild(el('span', { style: 'width:' + (t.staff[d.k] / P.maxStaff * 100) + '%;background:' + d.c })));
      const skeys = el('div', { class: 'keys' });
      let total = 0;
      P.staffTypes.forEach((d) => {
        total += t.staff[d.k];
        skeys.appendChild(el('span', {}, [el('i', { class: 'sw', style: 'background:' + d.c }), d.label + ' ' + t.staff[d.k]]));
      });
      skeys.appendChild(el('span', { style: 'font-weight:600', text: '= ' + total + ' staff' }));
      row.appendChild(el('div', {}, [sbar, skeys]));

      // Contribution
      const parts = t.contrib[harm];
      const staffPct = parts.reduce((a, b) => a + b, 0);
      const cbar = el('div', { class: 'bar', 'aria-hidden': 'true' });
      P.staffFactors.forEach((f, i) => { if (parts[i] > 0) cbar.appendChild(el('span', { style: 'width:' + parts[i] + '%;background:' + f.c })); });
      cbar.appendChild(el('span', { style: 'width:' + (100 - staffPct) + '%;background:#D3D8DF' }));
      const ckeys = el('div', { class: 'keys' }, [el('span', { style: 'font-weight:600', text: 'Staff ' + staffPct + '%:' })]);
      P.staffFactors.forEach((f, i) => { if (parts[i] > 0) ckeys.appendChild(el('span', {}, [el('i', { class: 'sw', style: 'background:' + f.c }), f.label + ' ' + parts[i] + '%'])); });
      ckeys.appendChild(el('span', { class: 'muted', text: 'Patient factors ' + (100 - staffPct) + '%' }));
      row.appendChild(el('div', {}, [cbar, ckeys]));

      body.appendChild(row);
    });

    // Attention strip
    const att = document.getElementById('alerts');
    att.innerHTML = '';
    if (alerts.length) alerts.forEach((a) => att.appendChild(el('span', { class: 'alert', text: a })));
    else att.appendChild(el('span', { class: 'muted', text: 'No harm risk is in the high band today.' }));
  }

  fillCommon();
  document.getElementById('today-label').textContent = 'Today, ' + P.todayLabel;
  render();
})();
