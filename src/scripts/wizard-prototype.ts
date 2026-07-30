// Meandle Wizard Prototype v1 — client-only state manager
// Persists demo state in localStorage under a single key.
// Emits DOM events so components can update.

import { DEMO_FINDINGS, DEMO_TARGET_FINDINGS, DEMO_EVIDENCE, DEMO_STAGE_LABELS } from '../data/wizard-prototype';

const STORAGE_KEY_V1 = 'meandle-wizard-prototype-v1';
const STORAGE_KEY = 'meandle-wizard-prototype-v2';

// 表示する計数はすべて実データから導出する（ハードコード禁止）。
const ALL_FINDINGS_FOR_COUNT = [...DEMO_FINDINGS, ...DEMO_TARGET_FINDINGS];
const BLOCKER_FINDING_IDS = ALL_FINDINGS_FOR_COUNT.filter((f) => f.severity === '公開前に直す').map((f) => f.id);
const STATICALLY_CONFIRMED_EVIDENCE_COUNT = DEMO_EVIDENCE.filter((e) => e.state === '確認済み').length;
const TOTAL_EVIDENCE_COUNT = DEMO_EVIDENCE.length;

type TargetStrategyMode =
  | 'main_only'
  | 'new_only'
  | 'both_same_campaign'
  | 'both_separate'
  | 'test_first';

type TargetPortfolioState = {
  decision: {
    mode: TargetStrategyMode | null;
    primaryTargetId?: string;
    secondaryTargetIds: string[];
    rationale: string;
    rejectedAlternatives: { mode: string; reason: string }[];
    supportingEvidence: string;
    opposingEvidence: string;
    unverifiedAssumptions: string;
    artifactAssignments: { targetId: string; assetIds: string[] }[];
    reviewDate: string;
    version: number;
    decidedBy: string;
    decidedAt: string;
    approvalStatus: 'draft' | 'agency_reviewed' | 'client_approved';
  } | null;
  sameCampaignGate: Record<string, boolean>;
  targetStatus: Record<string, string>;
  activeTab: string;
  /** 対象方針の変更で再確認が必要になった項目 */
  staleAfterTargetChange: string[];
};

type WizardState = {
  version: 2;
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
  targetPortfolio: TargetPortfolioState;
  reportInternalVisible: boolean;
};

const DEFAULT_STATE: WizardState = {
  version: 2,
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
  targetPortfolio: {
    decision: null,
    sameCampaignGate: {},
    targetStatus: {},
    activeTab: 'new_segment',
    staleAfterTargetChange: [],
  },
  reportInternalVisible: true,
};

/**
 * v1 / v2 いずれの保存データも v2 形状へ正規化する純粋関数。
 * v1 に存在したキーは失わず、v2 で追加された既定値を深くマージする。
 */
export function migrateToV2(rawV2: string | null, rawV1: string | null): WizardState {
  const base: WizardState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  const source = safeParse(rawV2) ?? safeParse(rawV1);
  if (!source) return base;

  return {
    version: 2,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : base.updatedAt,
    campaign: { ...base.campaign, ...(source.campaign ?? {}) },
    meaning: { ...base.meaning, ...(source.meaning ?? {}) },
    approval: {
      itemDecisions: { ...base.approval.itemDecisions, ...(source.approval?.itemDecisions ?? {}) },
      changeReasons: { ...base.approval.changeReasons, ...(source.approval?.changeReasons ?? {}) },
    },
    publication: { ...base.publication, ...(source.publication ?? {}) },
    observation: { ...base.observation, ...(source.observation ?? {}) },
    targetPortfolio: {
      ...base.targetPortfolio,
      ...(source.targetPortfolio ?? {}),
      sameCampaignGate: {
        ...base.targetPortfolio.sameCampaignGate,
        ...(source.targetPortfolio?.sameCampaignGate ?? {}),
      },
      targetStatus: {
        ...base.targetPortfolio.targetStatus,
        ...(source.targetPortfolio?.targetStatus ?? {}),
      },
      staleAfterTargetChange: Array.isArray(source.targetPortfolio?.staleAfterTargetChange)
        ? source.targetPortfolio.staleAfterTargetChange
        : base.targetPortfolio.staleAfterTargetChange,
    },
    reportInternalVisible:
      typeof source.reportInternalVisible === 'boolean'
        ? source.reportInternalVisible
        : base.reportInternalVisible,
  };
}

function safeParse(raw: string | null): any {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function loadState(): WizardState {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(DEFAULT_STATE));
  try {
    return migrateToV2(
      window.localStorage.getItem(STORAGE_KEY),
      window.localStorage.getItem(STORAGE_KEY_V1)
    );
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState(state: WizardState, savedLabel?: string) {
  if (typeof window === 'undefined') return;
  try {
    state.version = 2;
    state.updatedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // v2 の保存が成功した後にだけ v1 を片付ける。
    if (window.localStorage.getItem(STORAGE_KEY_V1)) {
      window.localStorage.removeItem(STORAGE_KEY_V1);
    }
    setSaveIndicator('saved', savedLabel);
    document.dispatchEvent(new CustomEvent('wizard:state', { detail: state }));
  } catch {
    setSaveIndicator('offline');
  }
}

let saveLabelTimer: number | undefined;

function timestampLabel(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `このブラウザに保存 ${hh}:${mm}`;
}

/**
 * 保存チップの表示。savedLabel を渡すと「何を保存したか」を約2.5秒名指しし、
 * その後タイムスタンプ表示へ戻る（aria-live で読み上げも通知）。
 */
function setSaveIndicator(state: 'saved' | 'saving' | 'offline', savedLabel?: string) {
  if (typeof window !== 'undefined' && saveLabelTimer) {
    window.clearTimeout(saveLabelTimer);
    saveLabelTimer = undefined;
  }
  document.querySelectorAll<HTMLElement>('[data-wp-save]').forEach((el) => {
    el.setAttribute('data-state', state);
    const label = el.querySelector<HTMLElement>('.wp-save__label');
    if (!label) return;
    if (state === 'saved') {
      if (savedLabel) {
        label.textContent = savedLabel;
        saveLabelTimer = window.setTimeout(() => {
          label.textContent = timestampLabel();
          document.querySelectorAll<HTMLElement>('[data-wp-save]').forEach((e) => e.setAttribute('data-state', 'saved'));
        }, 2500);
      } else {
        label.textContent = timestampLabel();
      }
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
    window.localStorage.removeItem(STORAGE_KEY_V1);
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

/** 案件作成直後の遷移先だけに帰結メッセージを表示し、URLからは即座に消す。 */
function bindCreatedNotice() {
  const el = document.querySelector<HTMLElement>('[data-wp-when-created]');
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('created') === '1') {
    el.hidden = false;
    params.delete('created');
    const next = window.location.pathname + (params.toString() ? `?${params}` : '');
    window.history.replaceState(null, '', next);
  }
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
        const nowResolved = !list.includes(id);
        if (list.includes(id)) {
          s.campaign.mustFixResolved = list.filter((x) => x !== id);
        } else {
          s.campaign.mustFixResolved = [...list, id];
        }
        saveState(s, nowResolved ? '点検1件を保存しました（このブラウザ内・デモ）' : undefined);
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
        saveState(s, '根拠1件を保存しました（このブラウザ内・デモ）');
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
        const nowApproved = state.approval.itemDecisions[itemId] !== 'approved';
        if (state.approval.itemDecisions[itemId] === 'approved') {
          delete state.approval.itemDecisions[itemId];
        } else {
          state.approval.itemDecisions[itemId] = 'approved';
        }
        saveState(state, nowApproved ? '承認1件を保存しました（このブラウザ内・デモ）' : undefined);
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
        saveState(state, '修正依頼を保存しました（このブラウザ内・デモ）');
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
        saveState(s, '判断カード1枚を保存しました（このブラウザ内・デモ）');
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
        saveState(s, '判断カード1枚を保存しました（このブラウザ内・デモ）');
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
        saveState(state, '公開版の記録を保存しました（このブラウザ内・デモ）');
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
        saveState(state, '観測条件を保存しました（このブラウザ内・デモ）');
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
    saveState(state, '表示設定を保存しました（このブラウザ内・デモ）');
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

/* ==== 対象ポートフォリオ判断 ==== */

const MODES_NEEDING_EVIDENCE: TargetStrategyMode[] = [
  'new_only',
  'both_same_campaign',
  'both_separate',
];

/** 新候補の判断材料が不足しているか（デモでは固定条件） */
function newTargetLacksEvidence(): boolean {
  const root = document.querySelector<HTMLElement>('[data-wp-target-portfolio]');
  return root?.getAttribute('data-evidence-sufficient') !== 'true';
}

function sameCampaignGateSatisfied(state: WizardState): boolean {
  const boxes = document.querySelectorAll<HTMLInputElement>('[data-wp-same-campaign-gate]');
  if (!boxes.length) return false;
  return Array.from(boxes).every((b) => {
    const id = b.getAttribute('data-wp-same-campaign-gate') || '';
    return b.checked || state.targetPortfolio.sameCampaignGate[id] === true;
  });
}

function selectedMode(): TargetStrategyMode | null {
  const checked = document.querySelector<HTMLInputElement>('input[name="target-strategy-mode"]:checked');
  return (checked?.value as TargetStrategyMode) ?? null;
}

function updateTargetModeFeedback() {
  const state = loadState();
  const mode = selectedMode();
  const gateOk = sameCampaignGateSatisfied(state);
  const lacksEvidence = newTargetLacksEvidence();

  const gateWarning = document.querySelector<HTMLElement>('[data-wp-same-campaign-warning]');
  if (gateWarning) {
    gateWarning.hidden = !(mode === 'both_same_campaign' && !gateOk);
  }

  const evidenceWarning = document.querySelector<HTMLElement>('[data-wp-target-evidence-warning]');
  if (evidenceWarning) {
    evidenceWarning.hidden = !(
      lacksEvidence &&
      mode !== null &&
      mode !== 'main_only' &&
      mode !== 'test_first'
    );
  }

  const approvalNotice = document.querySelector<HTMLElement>('[data-wp-new-only-notice]');
  if (approvalNotice) approvalNotice.hidden = mode !== 'new_only';

  const gateFieldset = document.querySelector<HTMLElement>('[data-wp-same-campaign-fieldset]');
  if (gateFieldset) gateFieldset.hidden = mode !== 'both_same_campaign';

  const submit = document.querySelector<HTMLButtonElement>('[data-wp-target-decide]');
  if (!submit) return;
  let blocked = mode === null;
  if (mode === 'both_same_campaign' && !gateOk) blocked = true;
  if (lacksEvidence && mode !== null && mode !== 'main_only' && mode !== 'test_first') blocked = true;
  submit.disabled = blocked;
  submit.setAttribute('aria-disabled', blocked ? 'true' : 'false');
}

function bindTargetPortfolio() {
  const root = document.querySelector<HTMLElement>('[data-wp-target-portfolio]');
  if (!root) return;
  const state = loadState();
  const saved = state.targetPortfolio.decision;

  document.querySelectorAll<HTMLInputElement>('input[name="target-strategy-mode"]').forEach((radio) => {
    if (saved?.mode && radio.value === saved.mode) radio.checked = true;
    radio.addEventListener('change', updateTargetModeFeedback);
  });

  document.querySelectorAll<HTMLInputElement>('[data-wp-same-campaign-gate]').forEach((box) => {
    const id = box.getAttribute('data-wp-same-campaign-gate') || '';
    if (state.targetPortfolio.sameCampaignGate[id]) box.checked = true;
    box.addEventListener('change', updateTargetModeFeedback);
  });

  const rationale = document.querySelector<HTMLTextAreaElement>('[data-wp-target-rationale]');
  const rejected = document.querySelector<HTMLTextAreaElement>('[data-wp-target-rejected]');
  const supporting = document.querySelector<HTMLTextAreaElement>('[data-wp-target-supporting]');
  const opposing = document.querySelector<HTMLTextAreaElement>('[data-wp-target-opposing]');
  const assumptions = document.querySelector<HTMLTextAreaElement>('[data-wp-target-assumptions]');
  const reviewDate = document.querySelector<HTMLInputElement>('[data-wp-target-review-date]');

  if (saved) {
    if (rationale) rationale.value = saved.rationale || '';
    if (rejected) rejected.value = (saved.rejectedAlternatives || []).map((r) => r.reason).join('\n');
    if (supporting) supporting.value = saved.supportingEvidence || '';
    if (opposing) opposing.value = saved.opposingEvidence || '';
    if (assumptions) assumptions.value = saved.unverifiedAssumptions || '';
    if (reviewDate) reviewDate.value = saved.reviewDate || '';
  }

  const errorBox = document.querySelector<HTMLElement>('[data-wp-target-errors]');
  const submit = document.querySelector<HTMLButtonElement>('[data-wp-target-decide]');

  submit?.addEventListener('click', () => {
    const mode = selectedMode();
    const errors: string[] = [];
    if (!mode) errors.push('今回の対象方針を選択してください。');
    if (!(rationale?.value || '').trim()) errors.push('この方針にした決め手を入力してください。');
    if (!(rejected?.value || '').trim()) errors.push('採用しなかった選択肢とその理由を入力してください。');
    if (!(supporting?.value || '').trim()) errors.push('支持する根拠を入力してください。');
    if (!(opposing?.value || '').trim()) errors.push('反対する根拠・不足情報を入力してください。');
    if (!(assumptions?.value || '').trim()) errors.push('未確認の仮定を入力してください。');
    if (!(reviewDate?.value || '').trim()) errors.push('見直す日を入力してください。');
    if (mode === 'both_same_campaign' && !sameCampaignGateSatisfied(loadState())) {
      errors.push('「両方を同じ施策で扱う」は、4つの条件すべてを人が確認した場合だけ保存できます。');
    }
    if (newTargetLacksEvidence() && mode && mode !== 'main_only' && mode !== 'test_first') {
      errors.push(
        '新しい候補は判断材料が不足しています。「現在の主対象に集中する」または「小さく検証してから決める」を選んでください。'
      );
    }

    if (errorBox) {
      errorBox.hidden = errors.length === 0;
      errorBox.innerHTML = errors.length
        ? `<strong>保存できません</strong><ul>${errors.map((e) => `<li>${e}</li>`).join('')}</ul>`
        : '';
    }
    if (errors.length) {
      errorBox?.focus();
      return;
    }

    setSaveIndicator('saving');
    const next = loadState();
    const previousMode = next.targetPortfolio.decision?.mode ?? null;
    const gate: Record<string, boolean> = {};
    document.querySelectorAll<HTMLInputElement>('[data-wp-same-campaign-gate]').forEach((b) => {
      gate[b.getAttribute('data-wp-same-campaign-gate') || ''] = b.checked;
    });

    next.targetPortfolio.sameCampaignGate = gate;
    next.targetPortfolio.decision = {
      mode: mode as TargetStrategyMode,
      primaryTargetId: mode === 'new_only' ? 'tg-multisite' : 'tg-main',
      secondaryTargetIds:
        mode === 'both_same_campaign' || mode === 'both_separate' || mode === 'test_first'
          ? ['tg-multisite']
          : [],
      rationale: (rationale?.value || '').trim(),
      rejectedAlternatives: [{ mode: 'その他の選択肢', reason: (rejected?.value || '').trim() }],
      supportingEvidence: (supporting?.value || '').trim(),
      opposingEvidence: (opposing?.value || '').trim(),
      unverifiedAssumptions: (assumptions?.value || '').trim(),
      artifactAssignments:
        mode === 'both_separate'
          ? [
              { targetId: 'tg-main', assetIds: ['release-v2', 'lp-v1'] },
              { targetId: 'tg-multisite', assetIds: ['lp-multisite-v1'] },
            ]
          : [{ targetId: 'tg-main', assetIds: ['release-v2', 'lp-v1'] }],
      reviewDate: (reviewDate?.value || '').trim(),
      version: (next.targetPortfolio.decision?.version ?? 0) + 1,
      decidedBy: '山田 花子（案件編集者）',
      decidedAt: new Date().toISOString(),
      approvalStatus: mode === 'new_only' ? 'draft' : 'agency_reviewed',
    };

    // 方針が変わった場合だけ、影響する項目を再確認へ戻す。
    if (previousMode && previousMode !== mode) {
      next.targetPortfolio.staleAfterTargetChange = ['ap-target-strategy', 'asset-main', 'observation'];
      delete next.approval.itemDecisions['ap-target-strategy'];
      delete next.approval.changeReasons['ap-target-strategy'];
    } else if (!previousMode) {
      next.targetPortfolio.staleAfterTargetChange = [];
    }

    saveState(next, '対象方針を保存しました（このブラウザ内・デモ）');
    window.setTimeout(() => window.location.reload(), 200);
  });

  updateTargetModeFeedback();
}

function bindTargetTabs() {
  const tablist = document.querySelector<HTMLElement>('[data-wp-target-tablist]');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  if (!tabs.length) return;

  const activate = (tab: HTMLButtonElement, persist = true) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      const panelId = t.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (panel) panel.hidden = !selected;
    });
    if (!persist) return;
    tab.focus();
    const state = loadState();
    state.targetPortfolio.activeTab = tab.getAttribute('data-wp-target-tab') || 'new_segment';
    saveState(state);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      let target: HTMLButtonElement | null = null;
      if (e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') target = tabs[0];
      else if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        e.preventDefault();
        activate(target);
      }
    });
  });

  const savedTab = loadState().targetPortfolio.activeTab;
  const initial = tabs.find((t) => t.getAttribute('data-wp-target-tab') === savedTab) ?? tabs[0];
  activate(initial, false);
}

function bindTargetSteps() {
  const steps = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-wp-target-step]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-wp-target-step-panel]'));
  if (!steps.length || !panels.length) return;
  const show = (key: string) => {
    panels.forEach((p) => {
      p.hidden = p.getAttribute('data-wp-target-step-panel') !== key;
    });
    steps.forEach((s) => {
      s.setAttribute('aria-pressed', s.getAttribute('data-wp-target-step') === key ? 'true' : 'false');
    });
  };
  steps.forEach((s) => {
    s.addEventListener('click', () => show(s.getAttribute('data-wp-target-step') || ''));
  });
  show(steps[0].getAttribute('data-wp-target-step') || '');
}

function reflectTargetStateOnPage() {
  const s = loadState();
  const decision = s.targetPortfolio.decision;

  document.querySelectorAll<HTMLElement>('[data-wp-when-target-decided]').forEach((el) => {
    el.hidden = !decision;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-no-target-decision]').forEach((el) => {
    el.hidden = !!decision;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-target-mode]').forEach((el) => {
    const wanted = (el.getAttribute('data-wp-when-target-mode') || '').split(',').map((x) => x.trim());
    el.hidden = !decision || !wanted.includes(decision.mode as string);
  });
  document.querySelectorAll<HTMLElement>('[data-wp-target-mode-label]').forEach((el) => {
    if (decision) el.textContent = modeLabel(decision.mode as TargetStrategyMode);
  });
  document.querySelectorAll<HTMLElement>('[data-wp-target-rationale-out]').forEach((el) => {
    if (decision) el.textContent = decision.rationale;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-target-assumptions-out]').forEach((el) => {
    if (decision) el.textContent = decision.unverifiedAssumptions;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-target-review-out]').forEach((el) => {
    if (decision) el.textContent = decision.reviewDate;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-target-version-out]').forEach((el) => {
    if (decision) el.textContent = `第${decision.version}版`;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-target-stale]').forEach((el) => {
    el.hidden = s.targetPortfolio.staleAfterTargetChange.length === 0;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-target-approval-status]').forEach((el) => {
    if (!decision) return;
    el.textContent =
      decision.approvalStatus === 'draft'
        ? '代理店レビューとクライアント承認が必要'
        : decision.approvalStatus === 'agency_reviewed'
          ? '代理店レビュー済み'
          : 'クライアント承認済み';
  });
}

/**
 * 価格が確認された対象のバッジを「確認済み」へ、対立するもう一方を「使用しない」へ
 * 差し替える（120ms のクロスフェードはCSS側で処理）。
 */
function reflectEvidenceBadges() {
  const s = loadState();
  const confirmed = s.campaign.priceConfirmed;
  if (!confirmed) return;
  const winnerIds = confirmed === '25' ? ['ev-price-25', 'ev-price-25-detail'] : ['ev-price-30', 'ev-price-30-detail'];
  const loserIds = confirmed === '25' ? ['ev-price-30', 'ev-price-30-detail'] : ['ev-price-25', 'ev-price-25-detail'];
  winnerIds.forEach((id) => {
    document.querySelectorAll<HTMLElement>(`[data-wp-evidence-badge="${id}"]`).forEach((el) => {
      el.className = 'wp-badge wp-badge--success';
      el.textContent = '確認済み';
    });
  });
  loserIds.forEach((id) => {
    document.querySelectorAll<HTMLElement>(`[data-wp-evidence-badge="${id}"]`).forEach((el) => {
      el.className = 'wp-badge wp-badge--neutral';
      el.textContent = '使用しない';
    });
  });
}

/* ==== 集計の反映（裏づけ帯・受領行・段階の敷居・伝え方の進捗） ==== */

function reflectCounters() {
  const s = loadState();

  // 伝え方: 6枚中n枚確認済み
  const meaningTotal = document.querySelectorAll<HTMLElement>('[data-wp-decision-select]').length;
  const meaningConfirmed = Object.values(s.meaning).filter((m) => m.status === '確認済み').length;
  document.querySelectorAll<HTMLElement>('[data-wp-meaning-tally]').forEach((el) => {
    el.textContent = `${meaningConfirmed}`;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-meaning-tally-total]').forEach((el) => {
    el.textContent = `${meaningTotal}`;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-meaning-remaining]').forEach((el) => {
    el.textContent = `${Math.max(meaningTotal - meaningConfirmed, 0)}`;
  });
  const meaningAllDone = meaningTotal > 0 && meaningConfirmed === meaningTotal;
  document.querySelectorAll<HTMLElement>('[data-wp-when-meaning-complete]').forEach((el) => {
    el.hidden = !meaningAllDone;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-when-meaning-incomplete]').forEach((el) => {
    el.hidden = meaningAllDone;
  });

  // 根拠リスト: 確認済み n/6件（静的確認済み3件 + 価格確定で+1）
  const confirmedEvidence = STATICALLY_CONFIRMED_EVIDENCE_COUNT + (s.campaign.priceConfirmed ? 1 : 0);
  document.querySelectorAll<HTMLElement>('[data-wp-evidence-tally]').forEach((el) => {
    el.textContent = `確認済み ${confirmedEvidence}/${TOTAL_EVIDENCE_COUNT}件`;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-confirmed-evidence-count]').forEach((el) => {
    el.textContent = `${confirmedEvidence}`;
  });

  // 公開前チェック: 公開前に直す項目のうち対応済みの件数
  const resolvedBlockers = BLOCKER_FINDING_IDS.filter((id) => s.campaign.mustFixResolved.includes(id)).length;
  document.querySelectorAll<HTMLElement>('[data-wp-resolved-blockers]').forEach((el) => {
    el.textContent = `${resolvedBlockers}`;
  });
  document.querySelectorAll<HTMLElement>('[data-wp-remaining-blockers]').forEach((el) => {
    el.textContent = `${Math.max(BLOCKER_FINDING_IDS.length - resolvedBlockers, 0)}`;
  });

  // 伝え方: 右レール「レポートに載る言い方（下書き）」の確定状態
  const draftLines = document.querySelectorAll<HTMLElement>('[data-wp-draft-line]');
  draftLines.forEach((el) => {
    const id = el.getAttribute('data-wp-draft-line') || '';
    const isConfirmed = s.meaning[id]?.status === '確認済み';
    el.classList.toggle('wp-draft-line--confirmed', isConfirmed);
  });
  if (draftLines.length) {
    const heading = document.querySelector<HTMLElement>('[data-wp-draft-heading]');
    if (heading) {
      heading.textContent = meaningAllDone ? 'この案件の言い方（確定）' : 'レポートに載る言い方（下書き）';
    }
  }
}

/**
 * レポートの現在形パネル。5段階それぞれについて、代表的な到達条件を目安として判定する。
 * 章単位の内容有無ではなく、段階の到達状況を近似する簡易な指標。
 */
function stageIsFilled(key: string, s: WizardState): boolean {
  switch (key) {
    case 'materials':
      return !!s.campaign.priceConfirmed;
    case 'meaning': {
      // 判断カードは全6枚固定。localStorage の確認済み件数が6枚に達したかで判定する。
      const confirmed = Object.values(s.meaning).filter((m) => m.status === '確認済み').length;
      return confirmed >= 6;
    }
    case 'preflight': {
      const resolved = BLOCKER_FINDING_IDS.filter((id) => s.campaign.mustFixResolved.includes(id)).length;
      return BLOCKER_FINDING_IDS.length > 0 && resolved === BLOCKER_FINDING_IDS.length;
    }
    case 'approval':
      return !!s.targetPortfolio.decision;
    case 'results':
      return !!s.observation.protocol;
    default:
      return false;
  }
}

function reflectReportPanel() {
  const s = loadState();
  let filledCount = 0;
  const panel = document.querySelector<HTMLElement>('[data-wp-report-panel]');
  DEMO_STAGE_LABELS.forEach((stage) => {
    const filled = stageIsFilled(stage.key, s);
    if (filled) filledCount += 1;
    if (!panel) return;
    const item = panel.querySelector<HTMLElement>(`[data-wp-report-panel-item="${stage.key}"]`);
    if (!item) return;
    item.classList.toggle('wp-report-panel__item--filled', filled);
    const mark = item.querySelector<HTMLElement>('.wp-report-panel__mark');
    if (mark) mark.textContent = filled ? '●' : '○';
  });
  if (panel) {
    const summary = panel.querySelector<HTMLElement>('[data-wp-report-panel-summary]');
    if (summary) summary.textContent = `レポート ${filledCount}/${DEMO_STAGE_LABELS.length}段階が埋まっています`;
  }

  const remaining = Math.max(DEMO_STAGE_LABELS.length - filledCount, 0);
  document.querySelectorAll<HTMLElement>('[data-wp-stage-distance]').forEach((el) => {
    el.textContent = remaining === 0 ? 'レポート完成' : `あと${remaining}段階`;
  });
}

function modeLabel(mode: TargetStrategyMode): string {
  switch (mode) {
    case 'main_only':
      return '現在の主対象に集中する';
    case 'new_only':
      return '新しい候補へ切り替える';
    case 'both_same_campaign':
      return '両方を同じ施策で扱う';
    case 'both_separate':
      return '両方を別の原稿・LP・チャネルで扱う';
    case 'test_first':
      return '小さく検証してから決める';
    default:
      return '未決定';
  }
}

function initAll() {
  bindResetButtons();
  bindCreatedNotice();
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
  bindTargetSteps();
  bindTargetTabs();
  bindTargetPortfolio();
  reflectStateOnPage();
  reflectTargetStateOnPage();
  reflectCounters();
  reflectReportPanel();
  reflectEvidenceBadges();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}

export {};
