(() => {
  'use strict';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  const when = iso => {
    if (!iso) return 'ჯერ არ გაშვებულა';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.round(diff / 60000);
    if (min < 1) return 'ახლახან';
    if (min < 60) return `${min} წთ წინ`;
    const hours = Math.round(min / 60);
    if (hours < 24) return `${hours} სთ წინ`;
    return new Date(iso).toISOString().slice(0, 10);
  };

  function card(p) {
    const done = p.passed + p.failed;
    const pct = p.total ? Math.round(done / p.total * 100) : 0;
    const w = n => (p.total ? (n / p.total * 100).toFixed(2) : 0) + '%';

    return `<a class="ov-card" href="?project=${encodeURIComponent(p.id)}">
        <header>
          <span class="ov-flag">${esc(p.flag || '•')}</span>
          <span class="ov-title">
            <b>${esc(p.name)}</b>
            <em>${esc(p.nameKa || p.country || '')}</em>
          </span>
          <span class="ov-pct">${pct}%</span>
        </header>
        <div class="progress"><i class="p" style="width:${w(p.passed)}"></i><i class="f" style="width:${w(p.failed)}"></i></div>
        <div class="ov-nums">
          <span><b>${p.total}</b>სულ</span>
          <span class="pass"><b>${p.passed}</b>passed</span>
          <span class="fail"><b>${p.failed}</b>failed</span>
          <span class="idle"><b>${p.untested}</b>not run</span>
        </div>
        <footer>ბოლო ცვლილება: ${esc(when(p.lastRun))}</footer>
      </a>`;
  }

  async function render() {
    const content = document.getElementById('content');
    document.title = 'ყველა პროექტი — Test Cases';

    let projects = [];
    try {
      projects = (await window.CrocoApi.overview()).projects || [];
    } catch (err) {
      content.innerHTML = `<div class="empty"><b>ვერ ჩაიტვირთა</b>${esc(err.message)}</div>`;
      return;
    }

    const sum = projects.reduce((a, p) => ({
      total: a.total + p.total,
      passed: a.passed + p.passed,
      failed: a.failed + p.failed,
      untested: a.untested + p.untested,
    }), { total: 0, passed: 0, failed: 0, untested: 0 });

    const stats = document.getElementById('stats');
    stats.innerHTML = `
      <div class="stat"><b>${projects.length}</b><span>Project</span></div>
      <div class="stat"><b>${sum.total}</b><span>Test case</span></div>
      <div class="stat pass"><b>${sum.passed}</b><span>Passed</span></div>
      <div class="stat fail"><b>${sum.failed}</b><span>Failed</span></div>`;

    const w = n => (sum.total ? (n / sum.total * 100).toFixed(2) : 0) + '%';
    document.getElementById('progress').innerHTML =
      `<i class="p" style="width:${w(sum.passed)}"></i><i class="f" style="width:${w(sum.failed)}"></i>`;
    document.getElementById('progressLegend').innerHTML = `
      <span><i class="p"></i>Passed <b>${sum.passed}</b></span>
      <span><i class="f"></i>Failed <b>${sum.failed}</b></span>
      <span><i class="u"></i>Not run <b>${sum.untested}</b></span>`;

    document.getElementById('tree').innerHTML =
      '<p class="tree-empty">აირჩიე პროექტი ზემოთ, ან დააწკაპე ბარათზე.</p>';
    const foot = document.querySelectorAll('.sidebar-foot span');
    if (foot[0]) foot[0].textContent = `${projects.length} პროექტი`;
    if (foot[1]) foot[1].textContent = 'DB: SQLite';

    content.innerHTML = `
      <header class="page-head">
        <div class="crumbs"><b>Test Case Repository</b></div>
        <h1>ყველა პროექტი <span style="color:var(--text-faint);font-weight:400">· Overview</span></h1>
        <p class="lead">ყველა ქვეყნის პროგრესი ერთად. ბარათზე დაწკაპებით გადახვალ პროექტში.</p>
      </header>
      <div class="ov-grid">${projects.map(card).join('')}</div>`;
  }

  window.CrocoOverview = { render };
})();
