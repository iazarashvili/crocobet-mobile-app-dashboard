(() => {
  'use strict';

  const root = document.getElementById('modalRoot');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  const I_TRASH = '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13"/></svg>';
  const I_PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  let closeHandler = null;

  function close() {
    root.innerHTML = '';
    if (closeHandler) { document.removeEventListener('keydown', closeHandler); closeHandler = null; }
  }

  function open({ title, body, submitLabel, onSubmit, onDelete, deleteLabel }) {
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal" role="dialog" aria-modal="true">
          <header class="modal-head">
            <h2>${esc(title)}</h2>
            <button class="icon-btn" data-close title="Close">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </header>
          <form class="modal-body" novalidate>${body}</form>
          <footer class="modal-foot">
            <span class="modal-error" hidden></span>
            ${onDelete ? `<button type="button" class="btn danger" data-delete>${I_TRASH}${esc(deleteLabel || 'Delete')}</button>` : ''}
            <span class="spacer"></span>
            <button type="button" class="btn" data-close>Cancel</button>
            <button type="button" class="btn primary" data-submit>${esc(submitLabel || 'Save')}</button>
          </footer>
        </div>
      </div>`;

    const modal = root.querySelector('.modal');
    const form = modal.querySelector('form');
    const errorBox = modal.querySelector('.modal-error');

    const showError = message => {
      errorBox.textContent = message;
      errorBox.hidden = !message;
    };

    const busy = on => {
      modal.classList.toggle('is-busy', on);
      modal.querySelectorAll('button').forEach(b => { b.disabled = on; });
    };

    const submit = async () => {
      showError('');
      busy(true);
      try {
        await onSubmit(new FormData(form), form);
        close();
        await window.CrocoReload();
      } catch (err) {
        busy(false);
        showError(err.message || String(err));
      }
    };

    modal.addEventListener('click', async e => {
      if (e.target.closest('[data-close]')) return close();
      if (e.target.closest('[data-submit]')) return submit();
      if (e.target.closest('[data-delete]')) {
        if (!confirm('Delete for real? This cannot be undone.')) return;
        busy(true);
        try {
          await onDelete();
          close();
          await window.CrocoReload();
        } catch (err) {
          busy(false);
          showError(err.message || String(err));
        }
      }
    });

    root.querySelector('.modal-backdrop').addEventListener('mousedown', e => {
      if (e.target.classList.contains('modal-backdrop')) close();
    });

    form.addEventListener('submit', e => { e.preventDefault(); submit(); });

    closeHandler = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
    };
    document.addEventListener('keydown', closeHandler);

    const first = form.querySelector('input, textarea, select');
    if (first) first.focus();
    return modal;
  }

  const field = (label, name, value, opts = {}) => `
    <label class="f">
      <span>${esc(label)}${opts.required ? ' <i>*</i>' : ''}</span>
      ${opts.textarea
        ? `<textarea name="${name}" rows="${opts.rows || 2}" placeholder="${esc(opts.placeholder || '')}">${esc(value)}</textarea>`
        : `<input name="${name}" value="${esc(value)}" placeholder="${esc(opts.placeholder || '')}"${opts.readonly ? ' readonly' : ''}>`}
      ${opts.hint ? `<em>${esc(opts.hint)}</em>` : ''}
    </label>`;

  /* ---------- steps repeater ---------- */
  const stepRow = (step, i) => `
    <tr class="step-row">
      <td class="s-n">${i + 1}</td>
      <td><textarea name="action" rows="2" placeholder="What the tester does">${esc(step.action || '')}</textarea></td>
      <td><textarea name="expected" rows="2" placeholder="What should happen">${esc(step.expected || '')}</textarea></td>
      <td class="s-act">
        <button type="button" class="icon-btn" data-step-up title="Move up"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
        <button type="button" class="icon-btn" data-step-down title="Move down"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg></button>
        <button type="button" class="icon-btn danger" data-step-remove title="Delete">${I_TRASH}</button>
      </td>
    </tr>`;

  function wireSteps(modal) {
    const tbody = modal.querySelector('.steps-edit tbody');
    const renumber = () => [...tbody.querySelectorAll('.step-row')].forEach((tr, i) => {
      tr.querySelector('.s-n').textContent = i + 1;
    });

    modal.querySelector('[data-step-add]').addEventListener('click', () => {
      tbody.insertAdjacentHTML('beforeend', stepRow({}, tbody.children.length));
      renumber();
      tbody.lastElementChild.querySelector('textarea').focus();
    });

    tbody.addEventListener('click', e => {
      const row = e.target.closest('.step-row');
      if (!row) return;
      if (e.target.closest('[data-step-remove]')) {
        if (tbody.children.length === 1) return;
        row.remove();
      } else if (e.target.closest('[data-step-up]') && row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
      } else if (e.target.closest('[data-step-down]') && row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
      } else return;
      renumber();
    });
  }

  const readSteps = form => {
    const actions = form.querySelectorAll('.step-row textarea[name="action"]');
    const expected = form.querySelectorAll('.step-row textarea[name="expected"]');
    return [...actions].map((a, i) => ({
      action: a.value.trim(),
      expected: (expected[i] ? expected[i].value : '').trim(),
    })).filter(s => s.action || s.expected);
  };

  const groupOptions = selected => {
    const state = window.CrocoState;
    return state.suites.map(s =>
      `<optgroup label="${esc(s.name)}">` +
      s.groups.map(g => `<option value="${esc(g.id)}"${g.id === selected ? ' selected' : ''}>${esc(g.name)}</option>`).join('') +
      '</optgroup>').join('');
  };

  /* ---------- public forms ---------- */
  const api = () => window.CrocoApi;
  const project = () => window.CrocoState.projectId;

  function caseForm(existing, groupId) {
    const state = window.CrocoState;
    if (!state.suites.some(s => s.groups.length)) {
      alert('Create a suite and a group first.');
      return;
    }
    const c = existing || { ref: '', title: '', tags: [], steps: [{ action: '', expected: '' }], precondition: '' };
    const target = groupId || c.groupId || state.suites.find(s => s.groups.length).groups[0].id;

    const modal = open({
      title: existing ? `Edit case — ${c.ref}` : 'New case',
      submitLabel: existing ? 'Save' : 'Create',
      deleteLabel: 'Delete case',
      body: `
        <div class="f-grid">
          ${field('ID / Ref', 'ref', c.ref, { required: true, placeholder: 'FAV2-123 or PL-7' })}
          <label class="f">
            <span>Group <i>*</i></span>
            <select name="groupId">${groupOptions(target)}</select>
          </label>
        </div>
        ${field('Title', 'title', c.title, { required: true, textarea: true, rows: 2 })}
        ${field('Tags', 'tags', (c.tags || []).join(', '), { placeholder: 'FAV-SMOKE, login-feat', hint: 'Comma-separated' })}
        ${field('Precondition', 'precondition', c.precondition || '', { textarea: true, rows: 2, hint: 'Empty = the group precondition applies' })}
        <div class="steps-edit">
          <div class="steps-head">
            <span>Steps <i>*</i></span>
            <button type="button" class="btn ghost small" data-step-add>${I_PLUS} Step</button>
          </div>
          <table>
            <thead><tr><th>#</th><th>Step</th><th>Expected result</th><th></th></tr></thead>
            <tbody>${(c.steps.length ? c.steps : [{}]).map(stepRow).join('')}</tbody>
          </table>
        </div>`,
      onSubmit: async (data, form) => {
        const payload = {
          ref: data.get('ref').trim(),
          title: data.get('title').trim(),
          tags: data.get('tags').split(',').map(t => t.trim()).filter(Boolean),
          precondition: data.get('precondition').trim(),
          groupId: data.get('groupId'),
          steps: readSteps(form),
        };
        if (existing) await api().call(`api/cases?kind=case&id=${existing.id}`, 'PUT', payload);
        else await api().call(`api/cases?kind=case&project=${encodeURIComponent(project())}`, 'POST', payload);
      },
      onDelete: existing
        ? () => api().call(`api/cases?kind=case&id=${existing.id}`, 'DELETE')
        : null,
    });

    wireSteps(modal);
  }

  function suiteForm(existing) {
    const s = existing || { id: '', name: '', summary: '', icon: '' };
    open({
      title: existing ? `Suite — ${s.name}` : 'New suite',
      submitLabel: existing ? 'Save' : 'Create',
      deleteLabel: 'Delete suite (with its groups and cases)',
      body: `
        ${field('Name', 'name', s.name, { required: true, placeholder: 'Authorization' })}
        ${field('Description', 'summary', s.summary || '', { textarea: true, rows: 2 })}
        ${existing ? field('ID', 'id', s.id, { readonly: true }) : ''}`,
      onSubmit: async data => {
        const payload = {
          name: data.get('name').trim(),
          summary: data.get('summary').trim(),
        };
        if (existing) await api().call(`api/cases?kind=suite&project=${encodeURIComponent(project())}&id=${encodeURIComponent(s.id)}`, 'PUT', payload);
        else await api().call(`api/cases?kind=suite&project=${encodeURIComponent(project())}`, 'POST', payload);
      },
      onDelete: existing
        ? () => api().call(`api/cases?kind=suite&project=${encodeURIComponent(project())}&id=${encodeURIComponent(s.id)}`, 'DELETE')
        : null,
    });
  }

  function groupForm(existing) {
    const state = window.CrocoState;
    if (!state.suites.length) { alert('Create a suite first.'); return; }

    const g = existing || { id: '', name: '', file: '', precondition: '' };
    const suiteOf = existing
      ? (state.suites.find(s => s.groups.some(x => x.id === existing.id)) || state.suites[0]).id
      : state.suiteId || state.suites[0].id;

    open({
      title: existing ? `Group — ${g.name}` : 'New group',
      submitLabel: existing ? 'Save' : 'Create',
      deleteLabel: 'Delete group (with its cases)',
      body: `
        <label class="f">
          <span>Suite <i>*</i></span>
          <select name="suiteId">
            ${state.suites.map(s => `<option value="${esc(s.id)}"${s.id === suiteOf ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}
          </select>
        </label>
        ${field('Name', 'name', g.name, { required: true, placeholder: 'Login with SMS code' })}
        ${field('File', 'file', g.file || '', { placeholder: 'tests/authorization/login_test.dart' })}
        ${field('Precondition', 'precondition', g.precondition || '', { textarea: true, rows: 2, hint: 'Applies to every case in the group' })}`,
      onSubmit: async data => {
        const payload = {
          suiteId: data.get('suiteId'),
          name: data.get('name').trim(),
          file: data.get('file').trim(),
          precondition: data.get('precondition').trim(),
        };
        if (existing) await api().call(`api/cases?kind=group&project=${encodeURIComponent(project())}&id=${encodeURIComponent(g.id)}`, 'PUT', payload);
        else await api().call(`api/cases?kind=group&project=${encodeURIComponent(project())}`, 'POST', payload);
      },
      onDelete: existing
        ? () => api().call(`api/cases?kind=group&project=${encodeURIComponent(project())}&id=${encodeURIComponent(g.id)}`, 'DELETE')
        : null,
    });
  }

  function projectForm() {
    open({
      title: 'New project',
      submitLabel: 'Create',
      body: `
        <div class="f-grid">
          ${field('ID', 'id', '', { required: true, placeholder: 'crocobet-pl', hint: 'Lowercase letters and hyphens' })}
          ${field('Flag', 'flag', '', { placeholder: '🇵🇱' })}
        </div>
        ${field('Name', 'name', '', { required: true, placeholder: 'Crocobet Poland' })}
        <div class="f-grid">
          ${field('Country', 'country', '', { placeholder: 'PL' })}
          ${field('Platform', 'platform', '', { placeholder: 'Android' })}
        </div>`,
      onSubmit: async data => {
        const id = data.get('id').trim();
        await api().call('api/projects', 'POST', {
          id,
          name: data.get('name').trim(),
          country: data.get('country').trim(),
          flag: data.get('flag').trim(),
          platform: data.get('platform').trim(),
          framework: 'Patrol + Page Object Model',
        });
        const url = new URL(location.href);
        url.searchParams.set('project', id);
        location.href = url.toString();
        await new Promise(() => {});
      },
    });
  }

  window.CaseEditor = { case: caseForm, suite: suiteForm, group: groupForm, project: projectForm, close };
})();
