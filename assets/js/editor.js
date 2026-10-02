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
            <button class="icon-btn" data-close title="დახურვა">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </header>
          <form class="modal-body" novalidate>${body}</form>
          <footer class="modal-foot">
            <span class="modal-error" hidden></span>
            ${onDelete ? `<button type="button" class="btn danger" data-delete>${I_TRASH}${esc(deleteLabel || 'წაშლა')}</button>` : ''}
            <span class="spacer"></span>
            <button type="button" class="btn" data-close>გაუქმება</button>
            <button type="button" class="btn primary" data-submit>${esc(submitLabel || 'შენახვა')}</button>
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
        if (!confirm('ნამდვილად წაიშალოს? ეს ქმედება შეუქცევადია.')) return;
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
      <td><textarea name="action" rows="2" placeholder="რას აკეთებს ტესტერი">${esc(step.action || '')}</textarea></td>
      <td><textarea name="expected" rows="2" placeholder="რა უნდა მოხდეს">${esc(step.expected || '')}</textarea></td>
      <td class="s-act">
        <button type="button" class="icon-btn" data-step-up title="ზემოთ"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
        <button type="button" class="icon-btn" data-step-down title="ქვემოთ"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg></button>
        <button type="button" class="icon-btn danger" data-step-remove title="წაშლა">${I_TRASH}</button>
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
      alert('ჯერ შექმენი სუიტა და ჯგუფი.');
      return;
    }
    const c = existing || { ref: '', title: '', tags: [], steps: [{ action: '', expected: '' }], precondition: '' };
    const target = groupId || c.groupId || state.suites.find(s => s.groups.length).groups[0].id;

    const modal = open({
      title: existing ? `ქეისის რედაქტირება — ${c.ref}` : 'ახალი ქეისი',
      submitLabel: existing ? 'შენახვა' : 'შექმნა',
      deleteLabel: 'ქეისის წაშლა',
      body: `
        <div class="f-grid">
          ${field('ID / Ref', 'ref', c.ref, { required: true, placeholder: 'FAV2-123 ან PL-7' })}
          <label class="f">
            <span>ჯგუფი <i>*</i></span>
            <select name="groupId">${groupOptions(target)}</select>
          </label>
        </div>
        ${field('სათაური', 'title', c.title, { required: true, textarea: true, rows: 2 })}
        ${field('ტეგები', 'tags', (c.tags || []).join(', '), { placeholder: 'FAV-SMOKE, login-feat', hint: 'მძიმით გამოყოფილი' })}
        ${field('Precondition', 'precondition', c.precondition || '', { textarea: true, rows: 2, hint: 'ცარიელი = ჯგუფის precondition მოქმედებს' })}
        <div class="steps-edit">
          <div class="steps-head">
            <span>ნაბიჯები <i>*</i></span>
            <button type="button" class="btn ghost small" data-step-add>${I_PLUS} ნაბიჯი</button>
          </div>
          <table>
            <thead><tr><th>#</th><th>ნაბიჯი / Step</th><th>მოსალოდნელი შედეგი</th><th></th></tr></thead>
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
    const s = existing || { id: '', name: '', nameKa: '', summary: '', icon: '' };
    open({
      title: existing ? `სუიტა — ${s.name}` : 'ახალი სუიტა',
      submitLabel: existing ? 'შენახვა' : 'შექმნა',
      deleteLabel: 'სუიტის წაშლა (ჯგუფებითა და ქეისებით)',
      body: `
        ${field('სახელი', 'name', s.name, { required: true, placeholder: 'Authorization' })}
        ${field('სახელი ქართულად', 'nameKa', s.nameKa || '', { placeholder: 'ავტორიზაცია' })}
        ${field('აღწერა', 'summary', s.summary || '', { textarea: true, rows: 2 })}
        ${existing ? field('ID', 'id', s.id, { readonly: true }) : ''}`,
      onSubmit: async data => {
        const payload = {
          name: data.get('name').trim(),
          nameKa: data.get('nameKa').trim(),
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
    if (!state.suites.length) { alert('ჯერ შექმენი სუიტა.'); return; }

    const g = existing || { id: '', name: '', file: '', precondition: '' };
    const suiteOf = existing
      ? (state.suites.find(s => s.groups.some(x => x.id === existing.id)) || state.suites[0]).id
      : state.suiteId || state.suites[0].id;

    open({
      title: existing ? `ჯგუფი — ${g.name}` : 'ახალი ჯგუფი',
      submitLabel: existing ? 'შენახვა' : 'შექმნა',
      deleteLabel: 'ჯგუფის წაშლა (ქეისებით)',
      body: `
        <label class="f">
          <span>სუიტა <i>*</i></span>
          <select name="suiteId">
            ${state.suites.map(s => `<option value="${esc(s.id)}"${s.id === suiteOf ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}
          </select>
        </label>
        ${field('სახელი', 'name', g.name, { required: true, placeholder: 'Login with SMS code' })}
        ${field('ფაილი', 'file', g.file || '', { placeholder: 'tests/authorization/login_test.dart' })}
        ${field('Precondition', 'precondition', g.precondition || '', { textarea: true, rows: 2, hint: 'ჯგუფის ყველა ქეისზე გავრცელდება' })}`,
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
      title: 'ახალი პროექტი',
      submitLabel: 'შექმნა',
      body: `
        <div class="f-grid">
          ${field('ID', 'id', '', { required: true, placeholder: 'crocobet-pl', hint: 'პატარა ასოები და დეფისი' })}
          ${field('დროშა', 'flag', '', { placeholder: '🇵🇱' })}
        </div>
        ${field('სახელი', 'name', '', { required: true, placeholder: 'Crocobet Poland' })}
        ${field('სახელი ქართულად', 'nameKa', '', { placeholder: 'კროკობეთ პოლონეთი' })}
        <div class="f-grid">
          ${field('ქვეყანა', 'country', '', { placeholder: 'PL' })}
          ${field('პლატფორმა', 'platform', '', { placeholder: 'Android' })}
        </div>`,
      onSubmit: async data => {
        const id = data.get('id').trim();
        await api().call('api/projects', 'POST', {
          id,
          name: data.get('name').trim(),
          nameKa: data.get('nameKa').trim(),
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
