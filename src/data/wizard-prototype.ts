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
    heading: 'どんな人の、どんな場面か',
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
  { key: 'materials', label: '1. 材料', href: '/wizard/campaign/demo/materials/' },
  { key: 'meaning', label: '2. 伝え方', href: '/wizard/campaign/demo/meaning/' },
  { key: 'preflight', label: '3. 公開前チェック', href: '/wizard/campaign/demo/preflight/' },
  { key: 'approval', label: '4. 確認・公開', href: '/wizard/campaign/demo/approval/preview/' },
  { key: 'results', label: '5. 結果と次の一手', href: '/wizard/campaign/demo/results/' },
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
