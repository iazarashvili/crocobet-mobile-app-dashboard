(() => {
  'use strict';

  const el = {
    tree: document.getElementById('tree'),
    content: document.getElementById('content'),
    stats: document.getElementById('stats'),
    progress: document.getElementById('progress'),
    legend: document.getElementById('progressLegend'),
    storageWarn: document.getElementById('storageWarn'),
    search: document.getElementById('search'),
    chips: document.getElementById('filterChips'),
    theme: document.getElementById('themeToggle'),
    expandAll: document.getElementById('expandAll'),
    collapseAll: document.getElementById('collapseAll'),
    projectBtn: document.getElementById('projectBtn'),
    projectName: document.getElementById('projectName'),
    projectMenu: document.getElementById('projectMenu'),
    brandMark: document.getElementById('brandMark'),
    addSuite: document.getElementById('addSuite'),
    addGroup: document.getElementById('addGroup'),
    foot: document.querySelectorAll('.sidebar-foot span'),
  };

  const OVERVIEW = '__overview__';
  const LAST_KEY = 'croco-tc-project';

  const state = {
    projects: [],
    projectId: null,
    project: null,
    suites: [],
    allCases: [],
    statuses: {},
    suiteId: null,
    groupId: null,
    filter: 'all',
    query: '',
    open: new Set(),
    openSuites: new Set(),
    scrollTop: false,
  };

  const CARET = '<svg class="caret" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
  const I_PASS = '<svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5 10-11"/></svg>';
  const I_FAIL = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const I_CLEAR = '<svg viewBox="0 0 24 24"><path d="M4.5 12.5a7.5 7.5 0 112.6 5.7"/><path d="M4 8v4.5h4.5"/></svg>';
  const I_EDIT = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.1 2.1 0 00-3-3L5 17v3z"/><path d="M14.5 6.5l3 3"/></svg>';
  const I_PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const isSmoke = c => (c.tags || []).includes('FAV-SMOKE');

  function banner(message) {
    if (!message) { el.storageWarn.hidden = true; return; }
    el.storageWarn.querySelector('span').innerHTML = message;
    el.storageWarn.hidden = false;
  }

  /* ---------- api ---------- */
  const api = {
    async call(path, method, payload) {
      const res = await fetch(path, {
        method: method || 'GET',
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.ok === false) throw new Error(body.error || `${method || 'GET'} ${res.status}`);
      return body;
    },
    projects: () => api.call('api/projects'),
    tree: id => api.call(`api/projects?id=${encodeURIComponent(id)}&tree=1`),
    statuses: id => api.call(`api/statuses?project=${encodeURIComponent(id)}`),
    setStatus: (id, ref, status) => api.call(`api/statuses?project=${encodeURIComponent(id)}`, 'PUT', { ref, status }),
    overview: () => api.call('api/overview'),
  };
  window.CrocoApi = api;

  /* ---------- status mirror ---------- */
  const mirrorKey = () => `croco-tc-status:${state.projectId}`;
  const mirror = map => { try { localStorage.setItem(mirrorKey(), JSON.stringify(map)); } catch (_) {} };

  const statusOf = ref => {
    const entry = state.statuses[ref];
    return entry ? entry.status : 'untested';
  };

  function setStatus(ref, value) {
    if (value === 'untested') delete state.statuses[ref];
    else state.statuses[ref] = { status: value, at: new Date().toISOString() };
    mirror(state.statuses);
    api.setStatus(state.projectId, ref, value)
      .then(() => banner(null))
      .catch(() => banner('სერვერზე ჩაწერა ვერ მოხერხდა — ცვლილება მხოლოდ ამ ბრაუზერშია. გადატვირთე გვერდი, როცა სერვერი დაბრუნდება.'));
  }

  /* ---------- filtering ---------- */
  function matchesFilter(c) {
    if (state.filter === 'smoke') return isSmoke(c);
    if (['passed', 'failed', 'untested'].includes(state.filter)) return statusOf(c.ref) === state.filter;
    return true;
  }

  function matchesQuery(c) {
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    return [
      c.ref, c.title, (c.tags || []).join(' '), c.precondition || '',
      ...(c.steps || []).flatMap(s => [s.action, s.expected]),
    ].join(' ').toLowerCase().includes(q);
  }

  const visibleCases = g => g.cases.filter(c => matchesFilter(c) && matchesQuery(c));

  function highlight(text) {
    const t = esc(text);
    if (!state.query) return t;
    const q = state.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return t.replace(new RegExp(q, 'gi'), m => `<mark>${m}</mark>`);
  }

  const tally = () => {
    const t = { passed: 0, failed: 0, untested: 0 };
    state.allCases.forEach(c => t[statusOf(c.ref)]++);
    return t;
  };

  /* ---------- project picker ---------- */
  function renderProjectPicker() {
    const current = state.projectId === OVERVIEW
      ? { flag: '◎', name: 'ყველა პროექტი' }
      : state.project || { flag: '', name: '…' };

    el.projectName.innerHTML = `<span class="flag">${esc(current.flag || '')}</span>${esc(current.name)}`;
    el.brandMark.textContent = state.projectId === OVERVIEW ? '◎' : (current.country || current.name || 'C').slice(0, 1).toUpperCase();

    const rows = state.projects.map(p => `
      <button class="project-row${p.id === state.projectId ? ' is-active' : ''}" data-project="${esc(p.id)}" role="option">
        <span class="flag">${esc(p.flag || '')}</span>
        <span class="p-name">${esc(p.name)}</span>
        <span class="p-count">${p.cases}</span>
      </button>`).join('');

    el.projectMenu.innerHTML = `
      <button class="project-row${state.projectId === OVERVIEW ? ' is-active' : ''}" data-project="${OVERVIEW}" role="option">
        <span class="flag">◎</span><span class="p-name">ყველა პროექტი</span>
        <span class="p-count">${state.projects.length}</span>
      </button>
      <div class="project-sep"></div>
      ${rows}
      <div class="project-sep"></div>
      <button class="project-row add" data-project="__new__" role="option">
        <span class="flag">${I_PLUS}</span><span class="p-name">ახალი პროექტი</span>
      </button>`;
  }

  function goToProject(id) {
    const url = new URL(location.href);
    url.searchParams.set('project', id);
    try { localStorage.setItem(LAST_KEY, id); } catch (_) {}
    location.href = url.toString();
  }

  /* ---------- stats ---------- */
  function renderStats() {
    const t = tally();
    const total = state.allCases.length;
    const groups = state.suites.reduce((n, s) => n + s.groups.length, 0);

    el.stats.innerHTML = `
      <div class="stat"><b>${total}</b><span>Test case</span></div>
      <div class="stat"><b>${state.suites.length} / ${groups}</b><span>Suite / Group</span></div>
      <div class="stat pass"><b>${t.passed}</b><span>Passed</span></div>
      <div class="stat fail"><b>${t.failed}</b><span>Failed</span></div>`;

    const pct = n => (total ? (n / total * 100).toFixed(2) : 0) + '%';
    el.progress.innerHTML = `<i class="p" style="width:${pct(t.passed)}"></i><i class="f" style="width:${pct(t.failed)}"></i>`;
    el.legend.innerHTML = `
      <span><i class="p"></i>Passed <b>${t.passed}</b></span>
      <span><i class="f"></i>Failed <b>${t.failed}</b></span>
      <span><i class="u"></i>Not run <b>${t.untested}</b></span>`;
  }

  /* ---------- tree ---------- */
  function renderTree() {
    el.tree.innerHTML = state.suites.map(s => {
      const groups = s.groups.map(g => {
        const n = visibleCases(g).length;
        const active = state.suiteId === s.id && state.groupId === g.id;
        return `<button class="tree-group${active ? ' is-active' : ''}" data-suite="${esc(s.id)}" data-group="${esc(g.id)}">
            <span class="g-label">${esc(g.name)}</span><span class="g-count">${n}</span>
          </button>`;
      }).join('');

      const total = s.groups.reduce((n, g) => n + visibleCases(g).length, 0);
      const open = state.openSuites.has(s.id) || (state.query && total > 0);
      return `<div class="tree-suite${open ? ' open' : ''}" data-suite="${esc(s.id)}">
          <button data-toggle-suite="${esc(s.id)}">
            ${CARET}<span class="label">${esc(s.name)}</span><span class="count">${total}</span>
          </button>
          <div class="tree-groups">
            <button class="tree-group${state.suiteId === s.id && !state.groupId ? ' is-active' : ''}" data-suite="${esc(s.id)}" data-group="">
              <span class="g-label">All Suites</span><span class="g-count">${total}</span>
            </button>
            ${groups}
          </div>
        </div>`;
    }).join('') || '<p class="tree-empty">სუიტა ჯერ არ არის — დაამატე ქვემოთ.</p>';
  }

  /* ---------- content ---------- */
  function statusControl(ref) {
    const st = statusOf(ref);
    return `<span class="status-ctl" role="group" aria-label="status">
        <button type="button" data-set="passed" class="${st === 'passed' ? 'on' : ''}" title="Passed">${I_PASS}<span>Pass</span></button>
        <button type="button" data-set="failed" class="${st === 'failed' ? 'on' : ''}" title="Failed">${I_FAIL}<span>Fail</span></button>
        <button type="button" data-set="untested" class="clear" title="Not run"${st === 'untested' ? ' hidden' : ''}>${I_CLEAR}</button>
      </span>`;
  }

  const statusClass = ref => {
    const st = statusOf(ref);
    return st === 'passed' ? ' is-passed' : st === 'failed' ? ' is-failed' : '';
  };

  function caseCard(c) {
    const open = state.open.has(c.ref) || (state.query && state.query.length > 1);
    const tags = (c.tags || []).map(t => {
      const k = t === 'FAV-SMOKE' ? ' smoke' : t === 'FAV-BUG' ? ' bug' : t === 'FAILED-TEST' ? ' failing' : '';
      return `<span class="tag${k}">${esc(t)}</span>`;
    }).join('');

    const rows = (c.steps || []).map((s, i) => `
      <tr><td class="c-n">${i + 1}</td><td class="c-act">${highlight(s.action)}</td><td class="c-exp">${highlight(s.expected)}</td></tr>`).join('');

    const pre = c.precondition ? `<div class="case-precond"><b>Precondition:</b> ${highlight(c.precondition)}</div>` : '';

    return `<article class="case${open ? ' open' : ''}${statusClass(c.ref)}" data-case="${esc(c.ref)}" data-case-id="${c.id}">
        <div class="case-row">
          <button class="case-head" data-toggle-case="${esc(c.ref)}">
            ${CARET}
            <span class="case-id">${esc(c.ref)}</span>
            <span class="case-main">
              <span class="case-title">${highlight(c.title)}</span>
              <span class="case-tags">${tags}</span>
            </span>
            <span class="case-steps-n">${(c.steps || []).length} step</span>
          </button>
          <button class="icon-btn" data-edit-case="${c.id}" title="რედაქტირება">${I_EDIT}</button>
          ${statusControl(c.ref)}
        </div>
        <div class="case-body">
          ${pre}
          <table class="steps">
            <thead><tr><th>#</th><th>ნაბიჯი / Step</th><th>მოსალოდნელი შედეგი / Expected result</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </article>`;
  }

  function groupBlock(g) {
    const cases = visibleCases(g);
    const pre = g.precondition ? `<div class="precond"><strong>Precondition:</strong> ${highlight(g.precondition)}</div>` : '';
    const body = cases.length
      ? `<div class="cases">${cases.map(caseCard).join('')}</div>`
      : `<p class="group-empty">ამ ფილტრით ქეისი არ არის.</p>`;

    return `<section class="group-block" data-group="${esc(g.id)}">
        <h2>${esc(g.name)} <span class="n">${cases.length}</span>
          <span class="group-actions">
            <button class="icon-btn" data-add-case="${esc(g.id)}" title="ახალი ქეისი">${I_PLUS}</button>
            <button class="icon-btn" data-edit-group="${esc(g.id)}" title="ჯგუფის რედაქტირება">${I_EDIT}</button>
          </span>
        </h2>
        <p class="group-file">${esc(g.file)}</p>
        ${pre}
        ${body}
      </section>`;
  }

  function renderContent() {
    const suite = state.suites.find(s => s.id === state.suiteId) || state.suites[0];
    if (!suite) {
      el.content.innerHTML = `<div class="empty"><b>ცარიელი პროექტი</b>დაამატე სუიტა და ჯგუფი მარცხნივ, შემდეგ ქეისები.</div>`;
      return;
    }

    const groups = state.groupId ? suite.groups.filter(g => g.id === state.groupId) : suite.groups;
    const shown = groups.reduce((n, g) => n + visibleCases(g).length, 0);
    const totalSuite = suite.groups.reduce((n, g) => n + g.cases.length, 0);

    const t = { passed: 0, failed: 0, untested: 0 };
    suite.groups.forEach(g => g.cases.forEach(c => t[statusOf(c.ref)]++));

    const head = `<header class="page-head">
        <div class="crumbs">
          <b>${esc(state.project.name)}</b>
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <b>${esc(suite.name)}</b>
          ${state.groupId ? `<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg><b>${esc(groups[0] ? groups[0].name : '')}</b>` : ''}
        </div>
        <h1>${esc(suite.nameKa)} <span style="color:var(--text-faint);font-weight:400">· ${esc(suite.name)}</span>
          <button class="icon-btn" data-edit-suite="${esc(suite.id)}" title="სუიტის რედაქტირება">${I_EDIT}</button>
        </h1>
        <p class="lead">${esc(suite.summary)}</p>
        <div class="meta-row">
          <span class="meta-pill"><em>cases</em> ${shown} / ${totalSuite}</span>
          <span class="meta-pill"><em>passed</em> ${t.passed}</span>
          <span class="meta-pill"><em>failed</em> ${t.failed}</span>
          <span class="meta-pill"><em>not run</em> ${t.untested}</span>
          <span class="meta-pill"><em>platform</em> ${esc(state.project.platform || '—')}</span>
        </div>
      </header>`;

    const body = groups.length
      ? groups.map(groupBlock).join('')
      : `<div class="empty"><b>ჯგუფი არ არის</b>დაამატე ჯგუფი მარცხნივ.</div>`;

    el.content.innerHTML = head + body;
    if (state.scrollTop) {
      state.scrollTop = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function render() {
    renderTree();
    renderContent();
    renderStats();
  }
  window.CrocoRender = render;

  /* ---------- data loading ---------- */
  async function loadProject(id) {
    const [tree, statuses] = await Promise.all([api.tree(id), api.statuses(id)]);
    state.project = tree.project;
    state.suites = tree.suites;
    state.statuses = statuses.statuses || {};
    state.allCases = [];
    state.suites.forEach(s => s.groups.forEach(g => g.cases.forEach(c => state.allCases.push(c))));
    mirror(state.statuses);

    if (!state.suiteId || !state.suites.some(s => s.id === state.suiteId)) {
      state.suiteId = state.suites.length ? state.suites[0].id : null;
      state.groupId = null;
    }
    if (state.suiteId) state.openSuites.add(state.suiteId);

    el.foot[0].textContent = `${state.allCases.length} test case`;
    el.foot[1].textContent = 'DB: SQLite';
    document.title = `${state.project.name} — Test Cases`;
  }
  window.CrocoReload = async () => { await loadProject(state.projectId); render(); };

  const findCase = id => state.allCases.find(c => String(c.id) === String(id));
  const findGroup = id => {
    for (const s of state.suites) {
      const g = s.groups.find(x => x.id === id);
      if (g) return g;
    }
    return null;
  };
  window.CrocoState = state;

  /* ---------- events ---------- */
  el.projectBtn.addEventListener('click', () => {
    const open = el.projectMenu.hidden;
    el.projectMenu.hidden = !open;
    el.projectBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.project-picker')) {
      el.projectMenu.hidden = true;
      el.projectBtn.setAttribute('aria-expanded', 'false');
    }
  });

  el.projectMenu.addEventListener('click', e => {
    const row = e.target.closest('[data-project]');
    if (!row) return;
    const id = row.dataset.project;
    if (id === '__new__') {
      el.projectMenu.hidden = true;
      window.CaseEditor.project();
      return;
    }
    goToProject(id);
  });

  el.tree.addEventListener('click', e => {
    const groupBtn = e.target.closest('.tree-group');
    const suiteBtn = e.target.closest('[data-toggle-suite]');

    if (groupBtn) {
      state.suiteId = groupBtn.dataset.suite;
      state.groupId = groupBtn.dataset.group || null;
      state.openSuites.add(state.suiteId);
      state.scrollTop = true;
      render();
      return;
    }
    if (suiteBtn) {
      const id = suiteBtn.dataset.toggleSuite;
      if (state.openSuites.has(id) && state.suiteId === id) state.openSuites.delete(id);
      else {
        state.openSuites.add(id);
        state.suiteId = id;
        state.groupId = null;
        state.scrollTop = true;
      }
      render();
    }
  });

  el.content.addEventListener('click', e => {
    const setBtn = e.target.closest('[data-set]');
    if (setBtn) {
      const card = setBtn.closest('.case');
      const ref = card.dataset.case;
      const next = setBtn.dataset.set === statusOf(ref) ? 'untested' : setBtn.dataset.set;
      setStatus(ref, next);

      if (['passed', 'failed', 'untested'].includes(state.filter)) { render(); return; }
      card.classList.remove('is-passed', 'is-failed');
      if (next !== 'untested') card.classList.add(next === 'passed' ? 'is-passed' : 'is-failed');
      card.querySelector('.status-ctl').outerHTML = statusControl(ref);
      renderStats();
      renderTree();
      updateSuiteMeta();
      return;
    }

    const edit = e.target.closest('[data-edit-case]');
    if (edit) return window.CaseEditor.case(findCase(edit.dataset.editCase));

    const add = e.target.closest('[data-add-case]');
    if (add) return window.CaseEditor.case(null, add.dataset.addCase);

    const editGroup = e.target.closest('[data-edit-group]');
    if (editGroup) return window.CaseEditor.group(findGroup(editGroup.dataset.editGroup));

    const editSuite = e.target.closest('[data-edit-suite]');
    if (editSuite) return window.CaseEditor.suite(state.suites.find(s => s.id === editSuite.dataset.editSuite));

    const toggle = e.target.closest('[data-toggle-case]');
    if (!toggle) return;
    const card = toggle.closest('.case');
    const nowOpen = !card.classList.contains('open');
    card.classList.toggle('open', nowOpen);
    if (nowOpen) state.open.add(toggle.dataset.toggleCase); else state.open.delete(toggle.dataset.toggleCase);
  });

  function updateSuiteMeta() {
    const suite = state.suites.find(s => s.id === state.suiteId);
    if (!suite) return;
    const t = { passed: 0, failed: 0, untested: 0 };
    suite.groups.forEach(g => g.cases.forEach(c => t[statusOf(c.ref)]++));
    const pills = el.content.querySelectorAll('.meta-pill');
    if (pills[1]) pills[1].innerHTML = `<em>passed</em> ${t.passed}`;
    if (pills[2]) pills[2].innerHTML = `<em>failed</em> ${t.failed}`;
    if (pills[3]) pills[3].innerHTML = `<em>not run</em> ${t.untested}`;
  }

  el.addSuite.addEventListener('click', () => window.CaseEditor.suite(null));
  el.addGroup.addEventListener('click', () => window.CaseEditor.group(null));

  el.chips.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    [...el.chips.children].forEach(c => c.classList.toggle('is-active', c === chip));
    render();
  });

  let t;
  el.search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.query = el.search.value.trim();
      if (state.query && state.suites.length) {
        const hasHit = state.suites.find(s => s.id === state.suiteId);
        if (hasHit && !hasHit.groups.some(g => visibleCases(g).length)) {
          const other = state.suites.find(s => s.groups.some(g => visibleCases(g).length));
          if (other) { state.suiteId = other.id; state.groupId = null; }
        }
      }
      render();
    }, 120);
  });

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== el.search && !document.querySelector('.modal')) {
      e.preventDefault();
      el.search.focus();
    }
    if (e.key === 'Escape' && document.activeElement === el.search) {
      el.search.value = '';
      state.query = '';
      el.search.blur();
      render();
    }
  });

  el.expandAll.addEventListener('click', () => {
    el.content.querySelectorAll('.case').forEach(card => {
      card.classList.add('open');
      state.open.add(card.dataset.case);
    });
  });

  el.collapseAll.addEventListener('click', () => {
    el.content.querySelectorAll('.case').forEach(card => card.classList.remove('open'));
    state.open.clear();
  });

  /* ---------- theme ---------- */
  const savedTheme = (() => { try { return localStorage.getItem('croco-tc-theme'); } catch (_) { return null; } })();
  document.documentElement.dataset.theme =
    savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  el.theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('croco-tc-theme', next); } catch (_) {}
  });

  /* ---------- boot ---------- */
  function fatal(message, hint) {
    document.querySelector('.layout').innerHTML =
      `<div class="fatal"><h1>${esc(message)}</h1><p>${hint || ''}</p></div>`;
  }

  (async () => {
    let listed;
    try {
      listed = await api.projects();
    } catch (_) {
      return fatal('სერვერი მიუწვდომელია', 'ქეისები ბაზაშია, ამიტომ აპს სერვერი სჭირდება.<br>გაუშვი <code>npm start</code> და გახსენი <code>http://localhost:8787</code>.');
    }

    state.projects = listed.projects || [];
    if (!state.projects.length) {
      return fatal('პროექტი ჯერ არ არის', 'გაუშვი <code>node scripts/seed-from-data.js</code> ან დაამატე პროექტი API-ით.');
    }

    const params = new URLSearchParams(location.search);
    const saved = (() => { try { return localStorage.getItem(LAST_KEY); } catch (_) { return null; } })();
    const wanted = params.get('project') || saved;
    const known = id => id === OVERVIEW || state.projects.some(p => p.id === id);
    state.projectId = known(wanted) ? wanted : state.projects[0].id;
    try { localStorage.setItem(LAST_KEY, state.projectId); } catch (_) {}

    renderProjectPicker();

    if (state.projectId === OVERVIEW) {
      document.body.classList.add('overview-mode');
      return window.CrocoOverview.render();
    }

    try {
      await loadProject(state.projectId);
    } catch (err) {
      return fatal('პროექტი ვერ ჩაიტვირთა', esc(err.message));
    }
    renderProjectPicker();
    render();
  })();
})();
