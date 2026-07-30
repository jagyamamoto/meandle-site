// Meandle Wizard Prototype v1 — fixed demo data
// This module holds ALL fixed demo data used across the 12 prototype screens.
// No real client data is ever entered here. See CLAUDE.md and the wizard prompt.

export const DEMO_CLIENT = '北辰産業デモ株式会社';
export const DEMO_BRAND = 'RelayOne';
export const DEMO_CAMPAIGN = 'RelayOne 新サービス発表';
export const DEMO_PUBLISH_DATE = '2026年9月15日';
export const DEMO_AGENCY_OWNER = '山田 花子';

export const DEMO_APPROVERS = [
  { id: 'sato', name: '佐藤 真紀', role: '事業責任者' },
  { id: 'tanaka', name: '田中 健', role: '法務担当' },
];

/**
 * 正準デモ台帳 — 全画面の日付・数値はここから引く。ハードコード禁止。
 * 数値の食い違いを検出する製品のデモ自体に食い違いがあると、商談デモで信頼を失う。
 */
export const DEMO_LEDGER = {
  campaignStart: '2026年7月22日',
  evidenceDone: '2026年7月25日',
  meaningDone: '2026年7月26日',
  preflightDone: '2026年7月28日',
  approvalSent: '2026年7月30日',
  approvalDeadline: '2026年8月2日 17:00',
  approvalDone: '2026年8月2日',
  baselineDate: '2026年9月10日',
  publishDate: '2026年9月15日 10:00',
  followupDate: '2026年9月22日',
  reportDate: '2026年9月22日 15:00',
  /** 主張の総数（原稿・LP・営業資料からの抽出数）。架空のデモ推計。 */
  claimsTotal: 12,
  /** 開始時（案件作成直後）の状態。すべて固定のデモ開始値。 */
  startSourcedClaims: 0,
  startConflicts: 2,
} as const;

export type SourceAuthority = '参考資料' | '正式資料候補' | '正式資料として確認';
export type SourceState = '待機' | '読み取り中' | '抽出中' | '要確認' | '準備完了' | '一部成功' | '失敗' | '隔離中';

export interface DemoSource {
  id: string;
  title: string;
  type: 'URL' | 'PDF' | '手動記録';
  authority: SourceAuthority;
  confidentiality: '公開情報' | '社内限定' | '公開前' | '取扱制限';
  aiProcessing: '許可' | '不可';
  updatedAt: string;
  state: SourceState;
  owner: string;
  extractedPrice?: string;
  note?: string;
  partial?: boolean;
}

export const DEMO_SOURCES: DemoSource[] = [
  {
    id: 'src-site',
    title: 'RelayOne 公式サービスページ',
    type: 'URL',
    authority: '正式資料として確認',
    confidentiality: '公開情報',
    aiProcessing: '許可',
    updatedAt: '2026-07-20',
    state: '準備完了',
    owner: '山田 花子',
    extractedPrice: '月額25万円',
    note: '中堅B2B企業の問い合わせ一次対応',
  },
  {
    id: 'src-price',
    title: '料金表_2026.pdf',
    type: 'PDF',
    authority: '正式資料として確認',
    confidentiality: '社内限定',
    aiProcessing: '許可',
    updatedAt: '2026-06-01',
    state: '準備完了',
    owner: '山田 花子',
    extractedPrice: '月額25万円',
  },
  {
    id: 'src-sales',
    title: '営業資料_最新版.pdf',
    type: 'PDF',
    authority: '正式資料候補',
    confidentiality: '社内限定',
    aiProcessing: '許可',
    updatedAt: '2026-07-15',
    state: '一部成功',
    owner: '山田 花子',
    extractedPrice: '月額30万円',
    note: '「業界No.1」という根拠未確認表現あり。3ページ中1ページのみ画像化されており読み取れませんでした。',
    partial: true,
  },
];

export type EvidenceType = '事実' | '主張' | '仮説';
export type EvidenceState = 'AI候補' | '確認待ち' | '確認済み' | '食い違いあり' | '使用しない' | '期限切れ';

export interface DemoEvidence {
  id: string;
  statement: string;
  type: EvidenceType;
  origin: 'AIによる候補' | '人が追加';
  state: EvidenceState;
  sourceId: string;
  sourceExcerpt: string;
  conflictWithId?: string;
  assignedTo?: string;
}

export const DEMO_EVIDENCE: DemoEvidence[] = [
  {
    id: 'ev-price-25',
    statement: 'RelayOne の月額料金は 25万円',
    type: '事実',
    origin: 'AIによる候補',
    state: '食い違いあり',
    sourceId: 'src-site',
    sourceExcerpt: '「月額 250,000 円（税別）」— RelayOne 公式サービスページ 第2セクション',
    conflictWithId: 'ev-price-30',
  },
  {
    id: 'ev-price-30',
    statement: 'RelayOne の月額料金は 30万円',
    type: '事実',
    origin: 'AIによる候補',
    state: '食い違いあり',
    sourceId: 'src-sales',
    sourceExcerpt: '「月額 300,000 円（標準構成）」— 営業資料_最新版.pdf p.4',
    conflictWithId: 'ev-price-25',
  },
  {
    id: 'ev-industry-no1',
    statement: '業界No.1（受電一次対応SaaSカテゴリ）',
    type: '主張',
    origin: 'AIによる候補',
    state: '確認待ち',
    sourceId: 'src-sales',
    sourceExcerpt: '「業界No.1の受電一次対応SaaS」— 営業資料_最新版.pdf p.1',
    assignedTo: '田中 健',
  },
  {
    id: 'ev-b2b-target',
    statement: '中堅B2B企業の問い合わせ一次対応が主な用途',
    type: '事実',
    origin: 'AIによる候補',
    state: '確認済み',
    sourceId: 'src-site',
    sourceExcerpt: '「中堅B2B企業様の受電・チャット一次応答を自動化」— RelayOne 公式サービスページ 冒頭',
  },
  {
    id: 'ev-not-medical',
    statement: '医療診断用途には対応しない',
    type: '事実',
    origin: '人が追加',
    state: '確認済み',
    sourceId: 'src-site',
    sourceExcerpt: '「医療診断・医療行為・救急対応を伴う用途にはご利用いただけません」— 利用規約より',
  },
  {
    id: 'ev-not-full-auto',
    statement: '完全自動で商談化を保証しない',
    type: '事実',
    origin: '人が追加',
    state: '確認済み',
    sourceId: 'src-site',
    sourceExcerpt: '「一次対応の自動化を提供するもので、商談化を保証するものではありません」— よくある質問',
  },
];

export const DEMO_MEANING_CARDS = [
  {
    id: 'audience_context',
    heading: '対象候補と、必要になる場面',
    aiDraft: '中堅B2B企業の情報システム・お客様対応部門の責任者が、受電・チャット問い合わせ量の急増と、一次対応の担当者確保が難しくなっている場面。',
    sourceRef: 'RelayOne 公式サービスページ 冒頭ヒーロー',
    status: '未確認',
  },
  {
    id: 'discovery_language',
    heading: 'どんな相談や課題から探されるか',
    aiDraft: '「受電の一次対応を自動化したい」「担当者を採用せずに問い合わせ量に耐えたい」「営業時間外の質問に一次回答したい」。',
    sourceRef: '営業資料_最新版.pdf p.2 想定される問い合わせ',
    status: '未確認',
  },
  {
    id: 'promise',
    heading: '何を解決すると約束できるか',
    aiDraft: '中堅B2B企業の受電・チャット一次対応の自動化。人手による一次応対の負荷を下げる。商談化そのものは保証しない。',
    sourceRef: 'RelayOne 公式サービスページ / よくある質問',
    status: '確認済み',
  },
  {
    id: 'proof',
    heading: '何を根拠に言えるか',
    aiDraft: 'RelayOne 公式サービスページの機能記載、料金表_2026.pdf の月額25万円、導入企業へのヒアリング（未検証の口頭情報）。',
    sourceRef: '公式サービスページ・料金表_2026.pdf',
    status: 'クライアント確認が必要',
  },
  {
    id: 'boundaries',
    heading: '向かないケース・言い切れないこと',
    aiDraft: '医療診断用途には対応しない。完全自動での商談化は保証しない。',
    sourceRef: '利用規約・よくある質問',
    status: '確認済み',
  },
  {
    id: 'differentiation',
    heading: '何と混同されやすく、違いは何か',
    aiDraft: '「問い合わせフォーム作成ツール」ではない。「汎用チャットボット」ではない。中堅B2Bの受電を含む一次対応に焦点を置いた業務システム。',
    sourceRef: '営業資料_最新版.pdf p.3 競合比較',
    status: '未確認',
  },
] as const;

export type FindingSeverity = '公開前に直す' | '確認が必要' | '改善候補';
export interface DemoFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  affected: string;
  currentText: string;
  reason: string;
  evidenceRef: string;
  suggestedFix: string;
  owner: string;
}

export const DEMO_FINDINGS: DemoFinding[] = [
  {
    id: 'f-industry-no1',
    severity: '公開前に直す',
    title: '「業界No.1」の根拠がありません',
    affected: 'プレスリリース原稿 第2段落 / 営業資料_最新版.pdf p.1',
    currentText: 'RelayOne は業界No.1の受電一次対応SaaSとして、多くの企業に選ばれています。',
    reason: '「業界No.1」を裏付ける第三者調査・出典が根拠リストにありません。優越表現は誇大広告に該当する可能性があります。',
    evidenceRef: '該当なし（根拠未確認）',
    suggestedFix: '導入企業へのヒアリングで高評価をいただいた受電一次対応SaaSです。',
    owner: '田中 健',
  },
  {
    id: 'f-price-conflict',
    severity: '確認が必要',
    title: '月額料金が資料間で食い違います',
    affected: 'プレスリリース原稿 第4段落 / LP / 営業資料_最新版.pdf p.4',
    currentText: 'プレスリリース: 「月額25万円から」／営業資料: 「月額30万円（標準構成）」',
    reason: 'LP・料金表は 25万円、営業資料は 30万円 と記載されています。正しい価格を確認するまで、伝え方の基準を確定できません。',
    evidenceRef: '根拠ID: ev-price-25 / ev-price-30（食い違いあり）',
    suggestedFix: '正しい月額を確認したうえで、リリース・LP・営業資料を統一。',
    owner: '山田 花子',
  },
  {
    id: 'f-target-condition',
    severity: '改善候補',
    title: '対象企業の条件が明記されていません',
    affected: 'プレスリリース原稿 全体',
    currentText: '「多くの企業に導入されています」',
    reason: '中堅B2B以外の企業（例：医療診断業務、超小規模事業者）が対象外となる条件がリリースに書かれていません。',
    evidenceRef: '根拠ID: ev-b2b-target / ev-not-medical',
    suggestedFix: '「中堅B2B企業の受電・チャット一次対応を対象としています。医療診断用途には対応しません」を追記。',
    owner: '山田 花子',
  },
];

/** 対象方針に関する公開前チェック（対象混在・根拠の流用・整合など） */
export const DEMO_TARGET_FINDINGS: DemoFinding[] = [
  {
    id: 'f-target-mixed',
    severity: '公開前に直す',
    title: '異なる対象の課題が同じ段落に混在しています',
    affected: 'プレスリリース原稿 第3段落',
    currentText:
      '人手が足りない企業にも、拠点ごとに応答がばらつく企業にも、RelayOne が一括で対応します。',
    reason:
      '「人手不足」と「拠点間のばらつき」は購買が始まる場面が異なります。同じ見出し・段落に混ぜると、どちらにも伝わりにくくなる可能性があります。',
    evidenceRef: '対象方針: 主対象と新候補は場面・きっかけが異なると記録されています',
    suggestedFix:
      '主対象（人手不足）の記述だけを本文に残し、拠点課題は検証用の別原稿へ分離します。',
    owner: '山田 花子',
  },
  {
    id: 'f-target-evidence-reuse',
    severity: '公開前に直す',
    title: '主対象だけの根拠を、新候補の約束へ流用しています',
    affected: 'LP 導入効果セクション',
    currentText: '複数拠点のお客様でも、導入企業へのヒアリングで高い評価をいただいています。',
    reason:
      'ヒアリングの根拠は主対象（単一拠点の中堅B2B）のものです。新候補（複数拠点）を裏付ける根拠は根拠リストにありません。',
    evidenceRef: '根拠未確認（新候補向けの根拠は L0〜L2 のみ）',
    suggestedFix:
      '新候補に言及している記述を削除し、検証後に根拠が揃ってから追加します。',
    owner: '田中 健',
  },
  {
    id: 'f-target-artifact-mismatch',
    severity: '公開前に直す',
    title: '異なる対象を採用しているのに、成果物が1種類しかありません',
    affected: '成果物一覧',
    currentText: 'プレスリリース、LP、営業資料（いずれも主対象向け）',
    reason:
      '対象方針で「両方を別の原稿・LP・チャネルで扱う」を選んだ場合、対象ごとに成果物を分ける必要があります。',
    evidenceRef: '対象方針: 保存済みの判断を参照',
    suggestedFix: '新候補向けの原稿を追加するか、対象方針を「小さく検証してから決める」へ変更します。',
    owner: '山田 花子',
  },
  {
    id: 'f-target-estimate-meta',
    severity: '確認が必要',
    title: '市場規模に出典・単位・地域・基準日・算定法が揃っていません',
    affected: '対象比較（12カ月の実現可能売上）',
    currentText: '12カ月の実現可能売上：判断材料が不足',
    reason:
      '数値を提示する場合、出典・単位・地域・基準日・算定法をすべて記載する必要があります。新候補は単価が未確認のため算出していません。',
    evidenceRef: '架空のデモ推計（実在市場の数値ではありません）',
    suggestedFix: '算出できない項目は 0 とせず「判断材料が不足」と表示したまま維持します。',
    owner: '山田 花子',
  },
  {
    id: 'f-target-excluded-appeal',
    severity: '確認が必要',
    title: '除外した対象へ再び訴求している可能性があります',
    affected: 'LP 冒頭コピー',
    currentText: 'あらゆる業種の問い合わせ対応を自動化します。',
    reason:
      '医療診断用途は対象外として確認済みですが、「あらゆる業種」という表現は除外条件と矛盾します。',
    evidenceRef: '根拠ID: ev-not-medical（確認済み）',
    suggestedFix: '「中堅B2B企業の受電・チャット一次対応」に限定した表現へ差し替えます。',
    owner: '田中 健',
  },
  {
    id: 'f-target-cta-route',
    severity: '改善候補',
    title: '新候補向けの記述が主対象用LPへ誘導しています',
    affected: '検証用LP のCTA',
    currentText: '詳しくはこちら（主対象用LPへのリンク）',
    reason:
      '新候補向けの検証で、主対象用LPへ誘導すると、反応の由来が判別できなくなります。',
    evidenceRef: '観測条件: 対象別に反応を分けて記録する設計',
    suggestedFix: '検証用LP内で完結する導線に変更します。',
    owner: '山田 花子',
  },
  {
    id: 'f-target-sensitive',
    severity: '改善候補',
    title: '機微属性による対象推定が含まれていないか確認してください',
    affected: '対象条件の記述全体',
    currentText: '（現時点で該当する記述は見つかっていません）',
    reason:
      '対象は企業条件、役割、業務場面、行動を中心に定義します。健康、政治信条、民族、宗教等の属性を推測してはいけません。',
    evidenceRef: '対象定義の方針',
    suggestedFix: '現状維持。対象条件を追加する際も企業条件・役割・場面に限定します。',
    owner: '山田 花子',
  },
];

/** 点検の総項目数（DEMO_FINDINGS + DEMO_TARGET_FINDINGS）。裏づけ帯・受領行で使用。 */
export const TOTAL_PREFLIGHT_FINDINGS = DEMO_FINDINGS.length + DEMO_TARGET_FINDINGS.length;

/** レポートの章構成。入口の見本カードと実際のレポート画面で共有し、数のずれを防ぐ。 */
export const DEMO_REPORT_CHAPTERS = [
  '要約',
  '経緯',
  '確認した範囲',
  '決定と根拠',
  '公開前に直した記録',
  '公開記録',
  '観測',
  '対象戦略比較レポート',
  '限界と不足データ',
  '次の3アクション',
  '方法と出典',
] as const;

export interface DemoApprovalItem {
  id: string;
  scope: string;
  question: string;
  proposed: string;
  assignedTo: string[];
  changedFromPrior?: string;
  evidenceExcerpt?: string;
}

export const DEMO_APPROVAL_ITEMS: DemoApprovalItem[] = [
  {
    id: 'ap-price',
    scope: '事実',
    question: 'RelayOne の月額料金は「月額25万円」で確定してよろしいでしょうか。',
    proposed: '月額25万円（税別）',
    assignedTo: ['tanaka'],
    changedFromPrior: '営業資料に記載の「月額30万円（標準構成）」との差分を、リリース・LPに合わせて 25万円へ統一しました。',
    evidenceExcerpt: 'RelayOne 公式サービスページ 第2セクション「月額 250,000 円（税別）」',
  },
  {
    id: 'ap-promise',
    scope: '約束',
    question: '「中堅B2B企業の受電・チャット一次対応の自動化」を、RelayOne が解決すると約束できる範囲としてよろしいでしょうか。',
    proposed: '中堅B2B企業の受電・チャット一次対応の自動化。人手による一次応対の負荷を下げます。商談化そのものは保証しません。',
    assignedTo: ['sato', 'tanaka'],
    evidenceExcerpt: 'RelayOne 公式サービスページ / よくある質問',
  },
  {
    id: 'ap-boundary',
    scope: '対象外',
    question: '「医療診断用途には対応しない」「完全自動で商談化を保証しない」を、リリース・LPに明記してよろしいでしょうか。',
    proposed: '医療診断用途には対応しません。また、完全自動で商談化を保証するものではありません。',
    assignedTo: ['tanaka'],
    evidenceExcerpt: '利用規約 / よくある質問',
  },
  {
    id: 'ap-fix-no1',
    scope: '修正案',
    question: '「業界No.1」表現を「導入企業へのヒアリングで高評価」へ差し替えてよろしいでしょうか。',
    proposed: '「業界No.1」→「導入企業へのヒアリングで高評価をいただいた」',
    assignedTo: ['sato'],
    changedFromPrior: '根拠未確認の優越表現「業界No.1」を、事実ベースの表現へ差し替えました。',
    evidenceExcerpt: '根拠ID: ev-industry-no1（確認待ち）',
  },
];

export const DEMO_STAGE_LABELS = [
  { key: 'materials', label: '1. 根拠を揃える', href: '/wizard/campaign/demo/materials/', makes: '確認済みの根拠リスト' },
  { key: 'meaning', label: '2. 伝え方を決める', href: '/wizard/campaign/demo/meaning/', makes: '確定した判断カード6枚' },
  { key: 'preflight', label: '3. 公開前に点検する', href: '/wizard/campaign/demo/preflight/', makes: '点検済みの原稿' },
  { key: 'approval', label: '4. 承認を得て公開', href: '/wizard/campaign/demo/approval/preview/', makes: '承認記録つきの公開版' },
  { key: 'results', label: '5. レポートと次の一手', href: '/wizard/campaign/demo/results/', makes: 'クライアントに渡せるレポート＋次回への一手1件' },
] as const;

/** 出典5種（材料の3資料 + 利用規約 + よくある質問）。承認プレビュー・レポートの裏づけ帯で使用。 */
export const DEMO_SOURCE_TYPE_LABELS = [
  ...DEMO_SOURCES.map((s) => s.title),
  '利用規約',
  'よくある質問',
] as const;

export const DEMO_STATES = [
  { key: 'normal', label: '通常' },
  { key: 'loading', label: '読み込み中' },
  { key: 'empty', label: '空' },
  { key: 'partial', label: '一部成功' },
  { key: 'error', label: 'エラー' },
  { key: 'offline', label: 'オフライン' },
  { key: 'conflict', label: '同時更新' },
] as const;

export const CLIENT_APPROVAL_STATES = [
  { key: 'normal', label: '通常' },
  { key: 'expired', label: '期限切れ' },
  { key: 'revoked', label: '取消済み' },
  { key: 'wrong-recipient', label: '別の宛先' },
  { key: 'stale', label: '内容が更新済み' },
] as const;

export const STORAGE_KEY = 'meandle-wizard-prototype-v1';
export const STORAGE_KEY_V2 = 'meandle-wizard-prototype-v2';

/* ============================================================
 * 対象ポートフォリオ判断（Target portfolio decisions）
 * 「見えていない対象候補」を抽出・比較し、人が対象方針を決める。
 * AI は候補を提示するだけで、対象・規模・採否を確定しない。
 * ============================================================ */

export type TargetOpportunityType = 'new_segment' | 'buying_role' | 'buying_situation';

export type TargetHypothesisStatus = 'ai_hypothesis' | 'human_reviewed' | 'validated' | 'rejected';

export interface TargetHypothesis {
  id: string;
  kind: 'current' | 'discovered' | 'human_added';
  opportunityType: TargetOpportunityType;
  neutralName: string;
  observation: string;
  scene: string;
  trigger: string;
  must: string[];
  mustNot: string[];
  examples: string[];
  counterexamples: string[];
  buyerLanguage: string[];
  alternatives: string[];
  evidenceIds: string[];
  counterEvidenceIds: string[];
  sharedWithMain?: string[];
  differsFromMain?: string[];
  status: TargetHypothesisStatus;
}

export const TARGET_STATUS_LABEL: Record<TargetHypothesisStatus, string> = {
  ai_hypothesis: '未検証の仮説',
  human_reviewed: '人が確認済み',
  validated: '検証済み',
  rejected: '棄却',
};

export const TARGET_TYPE_LABEL: Record<TargetOpportunityType, string> = {
  new_segment: '買う可能性がある企業',
  buying_role: '意思決定に関わる人',
  buying_situation: '必要になる場面',
};

export type EvidenceLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export const EVIDENCE_LEVEL_LABEL: Record<EvidenceLevel, string> = {
  L0: 'L0 AIによる推論（候補表示のみ）',
  L1: 'L1 営業・顧客対応の定性情報',
  L2: 'L2 問い合わせ・検索語・利用行動',
  L3: 'L3 公的統計・業界データ',
  L4: 'L4 インタビュー・商談・有償検証',
};

export interface TargetMarketEstimate {
  targetId: string;
  metric: 'population' | 'reachable_accounts' | 'revenue_opportunity' | 'hours';
  low?: number;
  base?: number;
  high?: number;
  unit: string;
  geography?: string;
  period?: string;
  formula: string;
  sourceIds: string[];
  assumptions: string[];
  overlapNotes?: string;
  evidenceLevel: EvidenceLevel;
  asOf: string;
}

export type TargetStrategyMode =
  | 'main_only'
  | 'new_only'
  | 'both_same_campaign'
  | 'both_separate'
  | 'test_first';

export interface TargetStrategyDecision {
  mode: TargetStrategyMode;
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
}

export const TARGET_STRATEGY_MODES: {
  mode: TargetStrategyMode;
  label: string;
  description: string;
  requiresApproval?: boolean;
}[] = [
  {
    mode: 'main_only',
    label: '現在の主対象に集中する',
    description: '新しい候補は今回採用せず、記録だけ残します。無理に候補を採る必要はありません。',
  },
  {
    mode: 'new_only',
    label: '新しい候補へ切り替える',
    description: '主対象を外す判断です。代理店レビューとクライアント承認が必要な状態で保存されます。',
    requiresApproval: true,
  },
  {
    mode: 'both_same_campaign',
    label: '両方を同じ施策で扱う',
    description: '場面・約束・根拠・CTAの4つがすべて同じと人が確認した場合だけ選べます。',
  },
  {
    mode: 'both_separate',
    label: '両方を別の原稿・LP・チャネルで扱う',
    description: '対象ごとに成果物を分けます。混ざって伝わらなくなることを避けられます。',
  },
  {
    mode: 'test_first',
    label: '小さく検証してから決める',
    description: '判断材料が不足している場合の既定選択です。検証してから改めて方針を決めます。',
  },
];

export const SAME_CAMPAIGN_GATE_ITEMS = [
  { id: 'scene', label: '購買が始まる場面が同じ' },
  { id: 'promise', label: '解決の約束が同じ' },
  { id: 'proof', label: '約束を支える根拠が同じ' },
  { id: 'cta', label: 'CTAと導入条件が同じ' },
] as const;

export const DEMO_TARGETS: TargetHypothesis[] = [
  {
    id: 'tg-main',
    kind: 'current',
    opportunityType: 'new_segment',
    neutralName: '中堅B2B企業の情報システム・顧客対応責任者',
    observation: '問い合わせ量が採用計画を上回って増えており、一次対応の担当者を確保できていません。',
    scene: '広告・展示会の直後や新製品発表の直後に、受電とチャットが同時に増える時期。',
    trigger: '一次対応の遅延が営業機会の損失として社内で問題になったとき。',
    must: ['自社で受電・チャットの一次対応を持っている', '中堅規模（従業員100〜1,000名程度）', '一次対応の担当者採用に制約がある'],
    mustNot: ['医療診断・救急対応を伴う用途', '一次対応そのものを外部委託済みで内製予定がない企業'],
    examples: ['問い合わせが増えて一次対応が追いつかない', '営業時間外の電話に出られていない'],
    counterexamples: ['CRMを入れ替えたい', 'マーケティングオートメーションを導入したい'],
    buyerLanguage: ['受電 一次対応 自動化', '問い合わせ 増加 対応しきれない', '一次回答 自動'],
    alternatives: ['アルバイト・派遣の増員', 'コールセンター外部委託', '汎用チャットボット'],
    evidenceIds: ['ev-b2b-target', 'ev-price-25', 'ev-not-medical'],
    counterEvidenceIds: [],
    status: 'validated',
  },
  {
    id: 'tg-multisite',
    kind: 'discovered',
    opportunityType: 'new_segment',
    neutralName: '複数拠点を持つサービス事業者の業務企画責任者',
    observation: '拠点ごとに応答内容と品質がばらついており、本部として統一する手段を持っていません。',
    scene: '拠点を増やした直後や、拠点間でクレーム対応の差が本部に報告されたとき。',
    trigger: '拠点ごとの応答品質のばらつきが、本部のリスクとして議題に上がったとき。',
    must: ['複数拠点で同種の問い合わせを受けている', '本部に業務標準化の権限がある', '拠点ごとの応答内容を把握したい意向がある'],
    mustNot: ['拠点ごとに事業内容が大きく異なる企業', '応答品質の統一を目的としていない企業'],
    examples: ['拠点によって案内内容が違う', '本部で応答品質を揃えたい', '拠点ごとの対応ログを見たい'],
    counterexamples: ['単一拠点で一次対応の人手だけが足りない', '受電量そのものを減らしたい'],
    buyerLanguage: ['拠点 応答 ばらつき 統一', '複数拠点 問い合わせ 標準化', '本部 対応品質 揃える'],
    alternatives: ['対応マニュアルの配布', '拠点ごとの研修', '本部への電話集約'],
    evidenceIds: ['ev-tg-multisite-support-1', 'ev-tg-multisite-support-2'],
    counterEvidenceIds: ['ev-tg-multisite-against-1', 'ev-tg-multisite-against-2'],
    sharedWithMain: ['一次対応の負荷を下げたい', '営業時間外の応答が課題になる'],
    differsFromMain: [
      '主対象は「人手不足」、この候補は「拠点間のばらつき」が出発点',
      '購買の決め手が「対応件数」ではなく「本部での可視化・統一」',
      '意思決定が本部の業務企画側にあり、情報システム部門ではない可能性がある',
    ],
    status: 'ai_hypothesis',
  },
  {
    id: 'tg-role-legal',
    kind: 'discovered',
    opportunityType: 'buying_role',
    neutralName: '法務担当',
    observation: '導入部門ではないが、契約条件と個人情報の扱いについて拒否権を持ちます。',
    scene: '稟議が法務レビューに回ったとき。',
    trigger: '個人情報を含む応答ログの保管条件が明確でないとき。',
    must: ['契約・約款のレビュー権限を持つ', '個人情報の取り扱いを確認する立場'],
    mustNot: ['機能比較を判断材料にする立場ではない'],
    examples: ['応答ログはどこに保管されますか', '委託先はどこですか', '契約解除時のデータはどうなりますか'],
    counterexamples: ['どの機能が他社より優れていますか'],
    buyerLanguage: ['個人情報 保管 委託先', '契約解除 データ 返却', '再委託 範囲'],
    alternatives: ['導入を保留する', '法務要件を満たす別サービスを探す'],
    evidenceIds: ['ev-tg-role-legal-1'],
    counterEvidenceIds: [],
    differsFromMain: [
      '機能ではなく、契約・個人情報・運用リスクを確認する役割',
      '市場規模を主対象と競わせる相手ではない',
    ],
    status: 'ai_hypothesis',
  },
  {
    id: 'tg-role-security',
    kind: 'discovered',
    opportunityType: 'buying_role',
    neutralName: '情報セキュリティ担当',
    observation: '外部サービスへの接続可否と、通信・保管の条件を確認する立場です。',
    scene: '社内のセキュリティチェックシートに回答を求められたとき。',
    trigger: '外部サービスとの接続がセキュリティ審査に入ったとき。',
    must: ['外部接続の可否を判断する権限を持つ', 'セキュリティ要件を定義している'],
    mustNot: ['費用対効果だけで判断する立場ではない'],
    examples: ['通信は暗号化されますか', 'アクセス権限はどう管理しますか', '監査ログは取れますか'],
    counterexamples: ['月額はいくらですか'],
    buyerLanguage: ['暗号化 通信 保管', 'アクセス権限 管理', '監査ログ 取得'],
    alternatives: ['社内構築を検討する', '接続を許可しない'],
    evidenceIds: [],
    counterEvidenceIds: [],
    differsFromMain: ['機能ではなく、接続条件と運用の信頼性を確認する役割'],
    status: 'ai_hypothesis',
  },
  {
    id: 'tg-role-procurement',
    kind: 'discovered',
    opportunityType: 'buying_role',
    neutralName: '調達担当',
    observation: '価格の妥当性と、継続契約の条件を確認する立場です。',
    scene: '複数社の見積比較が始まったとき。',
    trigger: '年度予算の枠と契約期間の整合を確認する必要が出たとき。',
    must: ['取引条件を確定する権限を持つ', '複数社比較の実務を担う'],
    mustNot: ['導入後の運用を担当する立場ではない'],
    examples: ['他社と比べて何が違いますか', '最低契約期間はありますか', '値引き余地はありますか'],
    counterexamples: ['管理画面は使いやすいですか'],
    buyerLanguage: ['最低契約期間', '他社 比較 条件', '年間契約 割引'],
    alternatives: ['相見積で他社を選ぶ', '契約を単年に留める'],
    evidenceIds: [],
    counterEvidenceIds: [],
    differsFromMain: ['機能ではなく、価格の妥当性と契約条件を確認する役割'],
    status: 'ai_hypothesis',
  },
  {
    id: 'tg-situation-spike',
    kind: 'discovered',
    opportunityType: 'buying_situation',
    neutralName: '広告・PR後に問い合わせ量が急増したとき',
    observation: '施策の直後に一時的に問い合わせが集中し、通常体制では受けきれません。',
    scene: 'キャンペーン開始直後の1〜2週間。',
    trigger: '施策の効果で問い合わせが想定を超えたとき。',
    must: ['施策の実施計画がある', '一時的な増加を見込んでいる'],
    mustNot: ['恒常的に人員が不足しているだけの状態'],
    examples: ['キャンペーン後の問い合わせに対応しきれない', '一時的に電話が集中する'],
    counterexamples: ['年間を通して人手が足りない'],
    buyerLanguage: ['キャンペーン後 問い合わせ 集中', '一時的 電話 増加 対応'],
    alternatives: ['短期の派遣を手配する', '施策の規模を抑える'],
    evidenceIds: ['ev-tg-situation-spike-1'],
    counterEvidenceIds: [],
    differsFromMain: ['恒常課題ではなく、施策に紐づく一時的な発生。別の原稿として扱う必要があります。'],
    status: 'ai_hypothesis',
  },
  {
    id: 'tg-situation-afterhours',
    kind: 'discovered',
    opportunityType: 'buying_situation',
    neutralName: '営業時間外の一次回答が必要になったとき',
    observation: '営業時間外の問い合わせが翌営業日まで滞留しています。',
    scene: '夜間・休日の問い合わせが機会損失として認識されたとき。',
    trigger: '時間外の未応答が失注理由として報告されたとき。',
    must: ['営業時間外にも問い合わせが発生している', '時間外対応の体制を持たない'],
    mustNot: ['24時間体制の有人対応をすでに持つ企業'],
    examples: ['夜間の問い合わせに翌日しか返せない', '休日の連絡に対応できていない'],
    counterexamples: ['営業時間内の対応品質を上げたい'],
    buyerLanguage: ['営業時間外 問い合わせ 対応', '夜間 一次回答', '休日 連絡 返答'],
    alternatives: ['夜間シフトを組む', '自動返信メールで案内する'],
    evidenceIds: [],
    counterEvidenceIds: [],
    differsFromMain: ['同じ相手でも、時間帯という別の契機で必要になります。'],
    status: 'ai_hypothesis',
  },
  {
    id: 'tg-situation-multisite',
    kind: 'discovered',
    opportunityType: 'buying_situation',
    neutralName: '複数拠点の応答品質を統一するとき',
    observation: '拠点ごとに案内内容が異なり、本部として統一したい状態です。',
    scene: '拠点を追加したときや、本部監査で差異が指摘されたとき。',
    trigger: '拠点間の応答差がリスクとして報告されたとき。',
    must: ['複数拠点で同種の問い合わせを受けている', '本部に標準化の権限がある'],
    mustNot: ['拠点ごとに独立採算で本部が介入しない企業'],
    examples: ['拠点によって案内が違う', '本部として応答内容を揃えたい'],
    counterexamples: ['単一拠点で対応件数を減らしたい'],
    buyerLanguage: ['拠点 案内 統一', '応答品質 標準化 本部'],
    alternatives: ['マニュアル整備', '拠点研修の実施'],
    evidenceIds: ['ev-tg-multisite-support-1'],
    counterEvidenceIds: [],
    differsFromMain: ['主対象の「人手不足」とは出発点が異なるため、同じ原稿へ混ぜられません。'],
    status: 'ai_hypothesis',
  },
];

export interface TargetEvidenceItem {
  id: string;
  targetId: string;
  stance: '支持' | '反対';
  aspect: '適合' | '市場規模' | '到達経路' | '予算' | '除外条件';
  statement: string;
  sourceLabel: string;
  evidenceLevel: EvidenceLevel;
  asOf: string;
  humanState: 'AI仮説' | '人が確認' | '棄却';
}

export const DEMO_TARGET_EVIDENCE: TargetEvidenceItem[] = [
  {
    id: 'ev-tg-multisite-support-1',
    targetId: 'tg-multisite',
    stance: '支持',
    aspect: '適合',
    statement: '営業資料に「複数拠点での応答内容の統一」に関する問い合わせ事例が2件記載されています。',
    sourceLabel: '営業資料_最新版.pdf p.2',
    evidenceLevel: 'L1',
    asOf: '2026-07-15',
    humanState: 'AI仮説',
  },
  {
    id: 'ev-tg-multisite-support-2',
    targetId: 'tg-multisite',
    stance: '支持',
    aspect: '到達経路',
    statement: '公式サービスページへの流入検索語に「拠点 応答 統一」に相当する語が含まれています。',
    sourceLabel: 'RelayOne 公式サービスページ（検索語ログ・架空のデモ推計）',
    evidenceLevel: 'L2',
    asOf: '2026-07-20',
    humanState: 'AI仮説',
  },
  {
    id: 'ev-tg-multisite-against-1',
    targetId: 'tg-multisite',
    stance: '反対',
    aspect: '適合',
    statement: '現行の機能は単一拠点の受電を前提としており、拠点別の権限分離は未実装です。',
    sourceLabel: 'RelayOne 公式サービスページ 機能一覧',
    evidenceLevel: 'L1',
    asOf: '2026-07-20',
    humanState: 'AI仮説',
  },
  {
    id: 'ev-tg-multisite-against-2',
    targetId: 'tg-multisite',
    stance: '反対',
    aspect: '予算',
    statement: 'この候補向けの想定単価と決裁者を裏付ける資料が、今回の材料の中にありません。',
    sourceLabel: '（該当資料なし）',
    evidenceLevel: 'L0',
    asOf: '2026-07-29',
    humanState: 'AI仮説',
  },
  {
    id: 'ev-tg-role-legal-1',
    targetId: 'tg-role-legal',
    stance: '支持',
    aspect: '除外条件',
    statement: '利用規約に個人情報と医療診断用途に関する条項があり、法務レビューの対象になります。',
    sourceLabel: '利用規約',
    evidenceLevel: 'L1',
    asOf: '2026-07-20',
    humanState: '人が確認',
  },
  {
    id: 'ev-tg-situation-spike-1',
    targetId: 'tg-situation-spike',
    stance: '支持',
    aspect: '適合',
    statement: '公式サービスページに「発表直後の問い合わせ集中」を想定した記載があります。',
    sourceLabel: 'RelayOne 公式サービスページ 想定利用シーン',
    evidenceLevel: 'L1',
    asOf: '2026-07-20',
    humanState: 'AI仮説',
  },
];

/** 主対象と新候補の横並び比較。数値はすべて架空のデモ推計。 */
export interface TargetComparisonRow {
  id: string;
  label: string;
  mainValue: string;
  newValue: string;
  newInsufficient?: boolean;
  unit?: string;
  geography?: string;
  period?: string;
  formula?: string;
  source?: string;
  assumptions?: string;
  asOf?: string;
  overlap?: string;
  evidenceLevel: EvidenceLevel;
}

export const DEMO_TARGET_COMPARISON: TargetComparisonRow[] = [
  {
    id: 'cmp-urgency',
    label: '課題の強さ・緊急性',
    mainValue: '高（採用が追いつかず、失注理由として報告済み）',
    newValue: '中（本部の課題認識はあるが、期限のある問題として扱われていない）',
    evidenceLevel: 'L1',
    source: '営業資料_最新版.pdf / 公式サービスページ',
    asOf: '2026-07-20',
  },
  {
    id: 'cmp-fit',
    label: '商品適合',
    mainValue: '高（現行機能でそのまま対応可能）',
    newValue: '中（拠点別の権限分離が未実装のため追加設計が必要）',
    evidenceLevel: 'L1',
    source: '公式サービスページ 機能一覧',
    asOf: '2026-07-20',
  },
  {
    id: 'cmp-population',
    label: '対象となり得る企業数',
    mainValue: '1,200〜1,800社（標準 1,500社）',
    newValue: '判断材料が不足',
    newInsufficient: true,
    unit: '社',
    geography: '日本国内',
    period: '2026年度',
    formula: '中堅B2B企業数 × 自社で一次対応を持つ割合',
    source: '架空のデモ推計（公的統計に基づく実在の数値ではありません）',
    assumptions: '従業員100〜1,000名を中堅と定義。外部委託済み企業を除外。',
    asOf: '2026-07-29',
    overlap: '新候補と最大 15% 程度重複する可能性があります（未検証）',
    evidenceLevel: 'L3',
  },
  {
    id: 'cmp-reachable',
    label: '12カ月以内に接点を持てる企業数',
    mainValue: '80〜120社（標準 100社）',
    newValue: '30〜70社（標準 50社）',
    unit: '社',
    geography: '日本国内',
    period: '12カ月',
    formula: '対象企業数 × 既存チャネルの到達率',
    source: '架空のデモ推計',
    assumptions: '既存の展示会・紹介・自社サイト経由のみを算入。新規チャネル開拓は含みません。',
    asOf: '2026-07-29',
    overlap: '重複の有無は未確認のため、主対象と合算していません',
    evidenceLevel: 'L2',
  },
  {
    id: 'cmp-decision',
    label: '意思決定者と予算',
    mainValue: '情報システム部門長。年度予算の枠内で決裁可能。',
    newValue: '判断材料が不足（本部の業務企画側と推測されるが、決裁枠は未確認）',
    newInsufficient: true,
    evidenceLevel: 'L0',
    source: '（該当資料なし）',
    asOf: '2026-07-29',
  },
  {
    id: 'cmp-channel',
    label: '到達可能なチャネル',
    mainValue: '自社サイト、業界展示会、既存顧客紹介',
    newValue: '自社サイト（検索語の一部が一致）。展示会は未確認。',
    evidenceLevel: 'L2',
    source: '検索語ログ（架空のデモ推計）',
    asOf: '2026-07-20',
  },
  {
    id: 'cmp-price',
    label: '想定単価',
    mainValue: '月額25〜30万円（標準 25万円）',
    newValue: '判断材料が不足',
    newInsufficient: true,
    unit: '円／月',
    geography: '日本国内',
    period: '月額',
    formula: '確認済みの公表価格',
    source: '料金表_2026.pdf / 公式サービスページ',
    assumptions: '標準構成での月額。拠点別構成の価格は未定義。',
    asOf: '2026-06-01',
    evidenceLevel: 'L4',
  },
  {
    id: 'cmp-cycle',
    label: '営業期間',
    mainValue: '2〜4カ月（標準 3カ月）',
    newValue: '4〜8カ月（標準 6カ月・未検証）',
    unit: 'カ月',
    period: '初回接点から受注まで',
    formula: '既存案件の実績レンジ',
    source: '架空のデモ推計',
    assumptions: '新候補は本部合議を想定して長めに置いています。',
    asOf: '2026-07-29',
    evidenceLevel: 'L1',
  },
  {
    id: 'cmp-hours',
    label: '1受注あたりの提供工数',
    mainValue: '40〜60時間（標準 50時間）',
    newValue: '80〜140時間（標準 110時間・追加設計を含む）',
    unit: '時間',
    period: '1受注あたり',
    formula: '初期設定 + 導入支援 + 初月運用',
    source: '架空のデモ推計',
    assumptions: '新候補は拠点別設計の追加工数を含みます。',
    asOf: '2026-07-29',
    evidenceLevel: 'L1',
  },
  {
    id: 'cmp-revenue',
    label: '12カ月の実現可能売上',
    mainValue: '1,800〜3,600万円（標準 2,400万円）',
    newValue: '判断材料が不足（単価と決裁枠が未確認のため算出しません）',
    newInsufficient: true,
    unit: '円',
    geography: '日本国内',
    period: '12カ月',
    formula: '接点企業数 × 課題発生率 × 有望反応率 × 受注率 × 平均受注額',
    source: '架空のデモ推計',
    assumptions: '課題発生率 60%、有望反応率 25%、受注率 20% と仮置き。すべて未検証。',
    asOf: '2026-07-29',
    overlap: '主対象と重複する可能性があるため、両者を足し合わせていません',
    evidenceLevel: 'L1',
  },
  {
    id: 'cmp-efficiency',
    label: '売上価値／提供工数',
    mainValue: '標準 約 48万円／時間相当（架空のデモ推計）',
    newValue: '判断材料が不足',
    newInsufficient: true,
    unit: '円／時間',
    period: '12カ月',
    formula: '12カ月の実現可能売上 ÷ 販売・提供・運用に必要な総工数',
    source: '架空のデモ推計',
    assumptions: '新候補は分子（売上）が算出できないため計算していません。',
    asOf: '2026-07-29',
    evidenceLevel: 'L1',
  },
  {
    id: 'cmp-risk',
    label: 'ブランド・法務リスク',
    mainValue: '低（医療診断用途の除外条件を明記済み）',
    newValue: '中（拠点間のデータ分離条件が未定義。法務確認が必要）',
    evidenceLevel: 'L1',
    source: '利用規約 / 機能一覧',
    asOf: '2026-07-20',
  },
  {
    id: 'cmp-evidence',
    label: '根拠の確かさ',
    mainValue: 'L4（確認済みの一次資料と実績あり）',
    newValue: 'L1〜L2（定性情報と検索語のみ。判断材料が不足）',
    evidenceLevel: 'L1',
    source: '根拠リスト参照',
    asOf: '2026-07-29',
  },
];

export const DEMO_TARGET_ESTIMATES: TargetMarketEstimate[] = [
  {
    targetId: 'tg-main',
    metric: 'reachable_accounts',
    low: 80,
    base: 100,
    high: 120,
    unit: '社',
    geography: '日本国内',
    period: '12カ月',
    formula: '対象企業数 × 既存チャネルの到達率',
    sourceIds: ['src-site', 'src-sales'],
    assumptions: ['既存チャネルのみ算入', '新規チャネル開拓は含まない'],
    overlapNotes: '新候補との重複は未確認のため合算しません',
    evidenceLevel: 'L2',
    asOf: '2026-07-29',
  },
  {
    targetId: 'tg-multisite',
    metric: 'reachable_accounts',
    low: 30,
    base: 50,
    high: 70,
    unit: '社',
    geography: '日本国内',
    period: '12カ月',
    formula: '検索語の一致件数 × 想定転換率',
    sourceIds: ['src-site'],
    assumptions: ['検索語ログのみを根拠にした仮置き', '展示会経由は未確認'],
    overlapNotes: '主対象との重複は未確認のため合算しません',
    evidenceLevel: 'L2',
    asOf: '2026-07-29',
  },
  {
    targetId: 'tg-multisite',
    metric: 'revenue_opportunity',
    unit: '円',
    geography: '日本国内',
    period: '12カ月',
    formula: '接点企業数 × 課題発生率 × 有望反応率 × 受注率 × 平均受注額',
    sourceIds: [],
    assumptions: ['平均受注額が未確認のため算出できません'],
    evidenceLevel: 'L0',
    asOf: '2026-07-29',
  },
];

/** 新しく追加する資料種別（材料画面のデモ表示用） */
export const DEMO_SOURCE_KINDS = [
  { id: 'sk-customers', label: '現行顧客・受注／失注', note: '既存顧客の属性と、受注・失注の理由' },
  { id: 'sk-inquiry', label: '問い合わせ・検索語', note: '実際に使われている課題側の言葉' },
  { id: 'sk-channel', label: '営業チャネル', note: '展示会・紹介・自社サイトなど到達経路' },
  { id: 'sk-stats', label: '公的統計・業界調査', note: '母集団と按分の根拠' },
  { id: 'sk-price', label: '価格・契約単価', note: '想定単価と契約条件' },
  { id: 'sk-competitor', label: '競合・代替手段', note: '現在の代替手段と混同されやすい相手' },
] as const;

/** 対象方針の承認項目（承認プレビューとクライアント承認で共有） */
export const DEMO_TARGET_APPROVAL_ITEM: DemoApprovalItem = {
  id: 'ap-target-strategy',
  scope: '対象方針',
  question:
    '今回の案件で「誰に伝えるか」の方針を、代理店の提案どおりで進めてよろしいでしょうか。',
  proposed:
    '現在の主対象（中堅B2B企業の情報システム・顧客対応責任者）に集中し、新しい対象候補（複数拠点を持つサービス事業者の業務企画責任者）は判断材料が不足しているため、今回は小さく検証してから決めます。',
  assignedTo: ['sato'],
  changedFromPrior:
    '新しい対象候補が資料から抽出されましたが、単価・決裁枠が未確認のため、今回の原稿には混ぜず別途検証する方針としています。',
  evidenceExcerpt:
    '支持: 営業資料の問い合わせ事例2件、検索語の一致 / 反対: 拠点別権限が未実装、想定単価が未確認',
};

export const DEMO_TARGET_ARTIFACTS = [
  { targetId: 'tg-main', label: 'プレスリリース、LP、営業資料（現行）' },
  { targetId: 'tg-multisite', label: '検証用の短いLPのみ（本番原稿は作成しません）' },
];

export const DEMO_TARGET_OBSERVATION = [
  {
    targetId: 'tg-main',
    name: '中堅B2B企業の情報システム・顧客対応責任者',
    problemLanguage: ['受電 一次対応 自動化', '問い合わせ 増加 対応しきれない'],
    questions: ['受電の一次対応を自動化するには', '問い合わせが増えたときの対応方法'],
    adoptionSignals: ['料金ページの閲覧', '導入事例の閲覧', '問い合わせフォーム到達'],
    comparedWith: ['汎用チャットボット', 'コールセンター外部委託'],
    successCondition: '商品名の言及率が公開前の測定値を上回り、対象外用途の混同が減ること',
  },
  {
    targetId: 'tg-multisite',
    name: '複数拠点を持つサービス事業者の業務企画責任者',
    problemLanguage: ['拠点 応答 ばらつき 統一', '本部 対応品質 揃える'],
    questions: ['拠点ごとの応答品質を揃えるには', '複数拠点の問い合わせ対応を標準化する方法'],
    adoptionSignals: ['検証用LPの閲覧', '拠点数の問い合わせ'],
    comparedWith: ['対応マニュアルの配布', '本部への電話集約'],
    successCondition: '検証用LPで、拠点課題からの反応が5件以上得られること（判定条件）',
  },
];

export const DEMO_TARGET_RESULTS = [
  {
    targetId: 'tg-main',
    name: '中堅B2B企業の情報システム・顧客対応責任者',
    reach: '1,240 件（自社サイト到達 / 2026-09-15〜09-22 / source: 自社解析）',
    promisingResponse: '38 件（料金・事例の閲覧を伴う到達 / 同期間）',
    meetings: '6 件（source: 自社CRM）',
    revenueOutlook: '判断材料が不足（受注前のため確定していません）',
    cost: '制作・観測の実工数 62 時間',
    salesCycle: '2〜4カ月（過去実績レンジ）',
    deliveryHours: '40〜60 時間／受注（見込み）',
    hypothesis: '支持',
    nextAction: '料金条件の根拠をFAQへ追加し、次回観測で再確認します。',
  },
  {
    targetId: 'tg-multisite',
    name: '複数拠点を持つサービス事業者の業務企画責任者',
    reach: '96 件（検証用LP到達 / 同期間 / source: 自社解析）',
    promisingResponse: '3 件（判定条件は5件のため未達）',
    meetings: '0 件',
    revenueOutlook: '判断材料が不足',
    cost: '検証用LPの実工数 9 時間',
    salesCycle: '未確認',
    deliveryHours: '未確認（拠点別設計の見積前）',
    hypothesis: '判断不能',
    nextAction: '検証期間を延長するか、対象条件を絞って再検証するかを次回判断します。',
  },
];
