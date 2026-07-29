// Meandle Wizard Prototype v1 — client-only state manager
// Persists demo state in localStorage under a single key.
// Emits DOM events so components can update.

const STORAGE_KEY = 'meandle-wizard-prototype-v1';

type WizardState = {
  version: 1;
  updatedAt: string;
  campaign: {
    priceConfirmed?: '25' | '30';
    industryNo1?: 'kept-unverified' | 'removed' | 'unset';
    mustFixResolved: string[];
    reviewedFindings: string[];
    approvalItemsSent?: string[];
  };
  meaning: Record<string, { status: string; note?: string }>;
  approval: {
    itemDecisions: Record<string, 'approved' | 'change-requested' | 'pending'>;
    changeReasons: Record<string, string>;
  };
  publication: {
    mismatch: boolean;
    resolvedAs?: 'new-version' | 'external-approval' | null;
  };
  observation: {
    protocol?: 'baseline' | 'no-comparison';
    protocolConfirmedAt?: string;
  };
  reportInternalVisible: boolean;
};

const DEFAULT_STATE: WizardState = {
  version: 1,
  updatedAt: '',
  campaign: {
    mustFixResolved: [],
    reviewedFindings: [],
    approvalItemsSent: [],
  },
  meaning: {},
  approval: {
    itemDecisions: {},
    changeReasons: {},
  },
  publication: {
    mismatch: false,
    resolvedAs: null,
  },
  observation: {},
  reportInternalVisible: true,
};

function loadState(): WizardState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) return { ...DEFAULT_STATE, ...parsed };
    return { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: WizardState) {
  if (typeof window === 'undefined') return;
  try {
    state.updatedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveIndicator('saved');
    document.dispatchEvent(new CustomEvent('wizard:state', { detail: state }));
  } catch {
    setSaveIndicator('offline');
  }
}

function setSaveIndicator(state: 'saved' | 'saving' | 'offline') {
  document.querySelectorAll<HTMLElement>('[data-wp-save]').forEach((el) => {
    el.setAttribute('data-state', state);
    const label = el.querySelector<HTMLElement>('.wp-save__label');
    if (!label) return;
    if (state === 'saved') {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      label.textContent = `このブラウザに保存 ${hh}:${mm}`;
    } else if (state === 'saving') {
      label.textContent = '保存中…';
    } else {
      label.textContent = '接続復旧後に保存します';
    }
  });
}

function resetState() {
  if (typeof window === 'undefined') return;
  const confirmed = window.confirm(
    'このブラウザに保存されたデモ状態を削除します。よろしいですか？'
  );
  if (!confirmed) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
}

function bindResetButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-wp-reset]').forEach((btn) => {
    btn.addEventListener('click', resetState);
  });
}

function bindStateSwitcher() {
  const url = new URL(window.location.href);
  const initial = url.searchParams.get('demoState') || 'normal';
  document.querySelectorAll<HTMLSelectElement>('[data-wp-state-switcher]').forEach((sel) => {
    sel.value = initial;
    sel.addEventListener('change', () => {
      const next = new URL(window.location.href);
      if (sel.value === 'normal') {
        next.searchParams.delete('demoState');
      } else {
        next.searchParams.set('demoState', sel.value);
      }
      window.location.href = next.toString();
    });
  });
  applyStateScenario(initial);
}

function applyStateScenario(scenario: string) {
  const body = document.body;
  body.setAttribute('data-demo-state', scenario);
  document
    .querySelectorAll<HTMLElement>('[data-when-state]')
    .forEach((el) => {
      const target = el.getAttribute('data-when-state') || '';
      el.hidden = target !== scenario;
    });
  document
    .querySelectorAll<HTMLElement>('[data-hide-when-state]')
    .forEach((el) => {
      const target = el.getAttribute('data-hide-when-state') || '';
      const matches = target.split(',').map((s) => s.trim()).includes(scenario);
      el.hidden = matches;
    });
}

function bindResolveButtons() {
  const state = loadState();
  document
    .querySelectorAll<HTMLButtonElement>('[data-wp-resolve-finding]')
    .forEach((btn) => {
      const id = btn.getAttribute('data-wp-resolve-finding') || '';
      if (state.campaign.mustFixResolved.includes(id)) {
        btn.textContent = '対応済みに戻す';
        btn.classList.add('wp-btn--secondary');
      }
      btn.addEventListener('click', () => {
        setSaveIndicator('saving');
        const s = loadState();
        const list = s.campaign.mustFixResolved;
        if (list.includes(id)) {
          s.campaign.mustFixResolved = list.filter((x) => x !== id);
        } else {
          s.campaign.mustFixResolved = [...list, id];
        }
        saveState(s);
        window.setTimeout(() => window.location.reload(), 200);
      });
    });
}

function bindPriceButtons() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-wp-confirm-price]')
    .forEach((btn) => {
      const price = btn.getAttribute('data-wp-confirm-price') as '25' | '30';
      btn.addEventListener('click', () => {
        setSaveIndicator('saving');
        const s = loadState();
        s.campaign.priceConfirmed = price;
        saveState(s);
        window.setTimeout(() => window.location.reload(), 200);
      });
    });
}

function bindApprovalButtons() {
  document
    .querySelectorAll<HTMLElement>('[data-wp-approval-item]')
    .forEach((card) => {
      const itemId = card.getAttribute('data-wp-approval-item') || '';
      const approveBtn = card.querySelector<HTMLButtonElement>('[data-wp-approve]');
      const changeBtn = card.querySelector<HTMLButtonElement>('[data-wp-request-change]');
      const changeSubmit = card.querySelector<HTMLButtonElement>('[data-wp-submit-change]');
      const changeCancel = card.querySelector<HTMLButtonElement>('[data-wp-cancel-change]');
      const changeTextarea = card.querySelector<HTMLTextAreaElement>('[data-wp-change-reason]');
      const s = loadState();
      const decision = s.approval.itemDecisions[itemId];
      if (decision === 'approved') {
        card.classList.add('is-approved');
        if (approveBtn) approveBtn.textContent = '承認済み — 取り消す';
      } else if (decision === 'change-requested') {
        card.classList.add('is-change-requested');
        if (changeBtn) changeBtn.textContent = '修正依頼済み — 取り消す';
      }
      approveBtn?.addEventListener('click', () => {
        const state = loadState();
        if (state.approval.itemDecisions[itemId] === 'approved') {
          delete state.approval.itemDecisions[itemId];
        } else {
          state.approval.itemDecisions[itemId] = 'approved';
        }
        saveState(state);
        updateApprovalProgress();
        window.setTimeout(() => window.location.reload(), 150);
      });
      changeBtn?.addEventListener('click', () => {
        const state = loadState();
        if (state.approval.itemDecisions[itemId] === 'change-requested') {
          delete state.approval.itemDecisions[itemId];
          delete state.approval.changeReasons[itemId];
          saveState(state);
          window.setTimeout(() => window.location.reload(), 150);
        } else {
          card.classList.add('is-changing');
          changeTextarea?.focus();
        }
      });
      changeCancel?.addEventListener('click', () => {
        card.classList.remove('is-changing');
      });
      changeSubmit?.addEventListener('click', () => {
        const reason = (changeTextarea?.value || '').trim();
        if (!reason) {
          window.alert('修正内容の理由をご入力ください。');
          changeTextarea?.focus();
          return;
        }
        const state = loadState();
        state.approval.itemDecisions[itemId] = 'change-requested';
        state.approval.changeReasons[itemId] = reason;
        saveState(state);
        window.setTimeout(() => window.location.reload(), 150);
      });
    });
  updateApprovalProgress();
}

function updateApprovalProgress() {
  const s = loadState();
  const totalEls = document.querySelectorAll<HTMLElement>('[data-wp-approval-item]');
  const total = totalEls.length;
  if (!total) return;
  const decided = Array.from(totalEls).filter((el) => {
    const id = el.getAttribute('data-wp-approval-item') || '';
    return !!s.approval.itemDecisions[id];
  }).length;
  document
    .querySelectorAll<HTMLElement>('[data-wp-approval-progress]')
    .forEach((el) => {
      el.textContent = `${decided} / ${total}件を確認済み`;
    });
  const finalBtn = document.querySelector<HTMLButtonElement>('[data-wp-final-action]');
  if (finalBtn) {
    if (decided === total) {
      finalBtn.removeAttribute('disabled');
      finalBtn.removeAttribute('aria-disabled');
    } else {
      finalBtn.setAttribute('disabled', 'true');
      finalBtn.setAttribute('aria-disabled', 'true');
    }
  }
}

function bindMeaningActions() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-wp-meaning-confirm]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-wp-meaning-confirm') || '';
        const s = loadState();
        s.meaning[id] = { status: '確認済み' };
        saveState(s);
        window.setTimeout(() => window.location.reload(), 150);
      });
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-wp-meaning-client]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-wp-meaning-client') || '';
        const s = loadState();
        s.meaning[id] = { status: 'クライアント確認が必要' };
        saveState(s);
        window.setTimeout(() => window.location.reload(), 150);
      });
    });
}

function bindPublicationMismatch() {
  const toggle = document.querySelector<HTMLInputElement>('[data-wp-publication-mismatch]');
  if (!toggle) return;
  const s = loadState();
  toggle.checked = s.publication.mismatch;
  toggle.addEventListener('change', () => {
    const state = loadState();
    state.publication.mismatch = toggle.checked;
    if (!toggle.checked) state.publication.resolvedAs = null;
    saveState(state);
    window.setTimeout(() => window.location.reload(), 150);
  });
  document
    .querySelectorAll<HTMLButtonElement>('[data-wp-publication-resolve]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.getAttribute('data-wp-publication-resolve') as
          | 'new-version'
          | 'external-approval';
        const state = loadState();
        state.publication.resolvedAs = kind;
        saveState(state);
        window.setTimeout(() => window.location.reload(), 150);
      });
    });
}

function bindObservationProtocol() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-wp-observation]')
    .forEach((btn) => {
      const kind = btn.getAttribute('data-wp-observation') as 'baseline' | 'no-comparison';
      btn.addEventListener('click', () => {
        const state = loadState();
        state.observation.protocol = kind;
        state.observation.protocolConfirmedAt = new Date().toISOString();
        saveState(state);
        window.setTimeout(() => window.location.reload(), 150);
      });
    });
}

function bindReportToggle() {
  const btn = document.querySelector<HTMLButtonElement>('[data-wp-report-internal-toggle]');
  const report = document.querySelector<HTMLElement>('[data-wp-report-canvas]');
  if (!btn || !report) return;
  const s = loadState();
  const showInternal = s.reportInternalVisible;
  report.classList.toggle('is-hiding-internal', !showInternal);
  btn.textContent = showInternal ? '社内向けの表示を隠す' : '社内向けの表示を出す';
  btn.addEventListener('click', () => {
    const state = loadState();
    state.reportInternalVisible = !state.reportInternalVisible;
    saveState(state);
    window.setTimeout(() => window.location.reload(), 100);
  });

  const printBtn = document.querySelector<HTMLButtonElement>('[data-wp-print]');
  printBtn?.addEventListener('click', () => window.print());

  const copyBtn = document.querySelector<HTMLButtonElement>('[data-wp-copy-link]');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyBtn.textContent = 'コピーしました';
      window.setTimeout(() => (copyBtn.textContent = 'デモ共有リンクをコピー'), 2000);
    } catch {
      window.alert('お使いのブラウザではコピーできません。URLを手動でコピーしてください。');
    }
  });
}

function bindSaveIndicators() {
  const s = loadState();
  if (s.updatedAt) {
    const t = new Date(s.updatedAt);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    document.querySelectorAll<HTMLElement>('[data-wp-save]').forEach((el) => {
      const label = el.querySelector<HTMLElement>('.wp-save__label');
      if (label) label.textContent = `このブラウザに保存 ${hh}:${mm}`;
    });
  } else {
    document.querySelectorAll<HTMLElement>('[data-wp-save]').forEach((el) => {
      const label = el.querySelector<HTMLElement>('.wp-save__label');
      if (label) label.textContent = 'このブラウザに保存';
    });
  }
}

function bindDecisionNav() {
  const cards = document.querySelectorAll<HTMLElement>('[data-wp-decision-panel]');
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-wp-decision-select]');
  if (!cards.length || !buttons.length) return;
  const showPanel = (id: string) => {
    cards.forEach((c) => {
      c.hidden = c.getAttribute('data-wp-decision-panel') !== id;
    });
    buttons.forEach((b) => {
      b.setAttribute(
        'aria-pressed',
        b.getAttribute('data-wp-decision-select') === id ? 'true' : 'false'
      );
    });
  };
  buttons.forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-wp-decision-select') || '';
      showPanel(id);
    });
  });
  const first = buttons[0].getAttribute('data-wp-decision-select');
  if (first) showPanel(first);
}

function reflectStateOnPage() {
  const s = loadState();
  document.querySelectorAll<HTMLElement>('[data-wp-when-price]').forEach((el) => {
    el.hidden = s.campaign.priceConfirmed !== el.getAttribute('data-wp-when-price');
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-resolved]').forEach((el) => {
    const id = el.getAttribute('data-wp-when-resolved') || '';
    el.hidden = !s.campaign.mustFixResolved.includes(id);
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-unresolved]').forEach((el) => {
    const id = el.getAttribute('data-wp-when-unresolved') || '';
    el.hidden = s.campaign.mustFixResolved.includes(id);
  });
  document.querySelectorAll<HTMLElement>('[data-wp-meaning-status]').forEach((el) => {
    const id = el.getAttribute('data-wp-meaning-status') || '';
    const entry = s.meaning[id];
    if (entry) el.textContent = entry.status;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-observation]').forEach((el) => {
    const kind = el.getAttribute('data-wp-when-observation') || '';
    el.hidden = s.observation.protocol !== kind;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-observation-any]').forEach((el) => {
    el.hidden = !s.observation.protocol;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-no-observation]').forEach((el) => {
    el.hidden = !!s.observation.protocol;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-mismatch]').forEach((el) => {
    el.hidden = !s.publication.mismatch;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-mismatch-resolved]').forEach((el) => {
    const kind = el.getAttribute('data-wp-when-mismatch-resolved') || '';
    el.hidden = !s.publication.mismatch || s.publication.resolvedAs !== kind;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-no-mismatch]').forEach((el) => {
    el.hidden = s.publication.mismatch;
  });
}

function initAll() {
  bindResetButtons();
  bindStateSwitcher();
  bindSaveIndicators();
  bindResolveButtons();
  bindPriceButtons();
  bindApprovalButtons();
  bindMeaningActions();
  bindPublicationMismatch();
  bindObservationProtocol();
  bindReportToggle();
  bindDecisionNav();
  reflectStateOnPage();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}

export {};
