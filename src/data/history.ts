/**
 * 開発・経歴タイムラインページ(/history)で使用するデータ定義モジュール。
 * Gitコミットログ、ブランチ、PRマージ、関連Issueのデータモデルを一元管理する。
 */

/**
 * プロフィール基本情報のインターフェース。
 */
export interface HistoryProfile {
  /** ハンドルネームまたは識別子。 */
  handle: string;
  /** 所属情報(公開可能な範囲に限定)。 */
  affiliation: string;
  /** 保有資格。 */
  credentials: string[];
  /** システム稼働ステータス。 */
  systemStatus: string;
}

/**
 * 解決されたクローズドIssue情報。
 */
export interface ClosedIssueInfo {
  /** Issue番号(例: 1)。 */
  number: number;
  /** 課題のタイトル。 */
  title: string;
}

/**
 * Gitグラフ上のノード・接続タイプ。
 */
export type GitGraphType =
  | 'root' // 初期コミット(main開始)
  | 'fork' // mainからfeatureへの初回分岐
  | 'branch-commit' // featureブランチ上の通常コミット
  | 'intermediate-pr-merge' // 途中のPRマージ(featureブランチは継続)
  | 'final-pr-merge'; // ブランチ完了のPRマージ(featureブランチ合流・終了)

/**
 * ブランチレーンの定義インターフェース。
 */
export interface BranchLaneDef {
  id: string;
  name: string;
  lane: number;
  colorHex: string;
  accent: 'green' | 'cyan' | 'coral' | 'amber' | 'blue' | 'purple';
}

/**
 * 全ブランチレーンの定義マッピング。
 */
export const branchLanes: BranchLaneDef[] = [
  { id: 'main', name: 'main', lane: 0, colorHex: '#39d353', accent: 'green' },
  {
    id: 'math',
    name: 'feat/math',
    lane: 1,
    colorHex: '#56d4dd',
    accent: 'cyan',
  },
  {
    id: 'cert',
    name: 'feat/certifications',
    lane: 2,
    colorHex: '#e3b341',
    accent: 'amber',
  },
  {
    id: 'web-dx',
    name: 'feat/web-dx',
    lane: 3,
    colorHex: '#f78166',
    accent: 'coral',
  },
  {
    id: 'systems',
    name: 'feat/systems',
    lane: 4,
    colorHex: '#58a6ff',
    accent: 'blue',
  },
  {
    id: 'theory',
    name: 'feat/theory',
    lane: 5,
    colorHex: '#bc8cff',
    accent: 'purple',
  },
];

/**
 * コミットに対するGitHub風コメントデータ。
 */
export interface TimelineComment {
  /** コメント本文(Markdown形式)。 */
  body: string;
  /** コメント投稿者のハンドル名。省略時は 'MI-1222'。 */
  author?: string;
  /** コメント投稿日時(例: '2023-02-27', '48m ago' 等)。省略時はコミットのtimestampを使用。 */
  timestamp?: string;
  /** ユーザーバッジ(例: 'Author', 'Collaborator', 'Contributor')。省略時は 'Author'。 */
  badge?: string;
}

/**
 * Gitコミットログ風タイムラインアイテムのインターフェース。
 * デスクトップ版で複数の未マージブランチが並行して並走するマルチレーントポロジーに対応。
 */
export interface TimelineCommitItem {
  /** コミットハッシュ風ラベル(例: 'a12b04f')。 */
  hash: string;
  /** 年月日などのタイムスタンプ(例: '2023-03-09')。 */
  timestamp: string;
  /** コミットメッセージ風タイトル(例: 'feat: explore-cs')。 */
  commitMessage: string;
  /** 日本語標題。 */
  title: string;
  /** 直面した課題または動機。 */
  context: string;
  /** コミットに対してのGitHub風コメント一覧(任意)。 */
  comments?: TimelineComment[];
  /** 所属ブランチ名。 */
  branch: string;
  /** ブランチの表示アクセント色。 */
  branchAccent: 'green' | 'cyan' | 'coral' | 'amber' | 'blue' | 'purple';
  /** このコミットノードが存在するレーン番号 (0〜5)。 */
  commitLane: number;
  /** このコミットの行でアクティブ(並走通過)している全レーン番号の配列。 */
  activeLanes: number[];
  /** 分岐コミットの場合、分岐元レーン番号。 */
  forkFromLane?: number;
  /** マージコミットの場合、合流元レーン番号。 */
  mergeFromLane?: number;
  /** GitGraph上の接続トポロジータイプ。 */
  graphType: GitGraphType;
  /** PRマージコミットかどうか。 */
  isPrMerge?: boolean;
  /** PR番号(マージコミット時)。 */
  prNumber?: number;
  /** PRタイトル(マージコミット時)。 */
  prTitle?: string;
  /** マージ元ブランチ名。 */
  sourceBranch?: string;
  /** マージ先ブランチ名(通常は 'main')。 */
  targetBranch?: string;
  /** 初期状態でアコーディオンを開いておくかどうか。 */
  isDefaultOpen?: boolean;
}

/**
 * プロフィール基本スペックデータ。
 */
export const historyProfile: HistoryProfile = {
  handle: 'MI-1222',
  affiliation: '東京科学大学(旧 東京工業大学) 在学',
  credentials: ['応用情報技術者試験(AP) 合格', '基本情報技術者試験(FE) 合格'],
  systemStatus: 'NOMINAL // REPOSITORY_ONLINE',
};

/**
 * Gitコミットログタイムラインデータ。
 * 複数の未マージブランチが長期間にわたり並行して並走する本格的なGit Network Graph。
 */
export const timelineCommits: TimelineCommitItem[] = [
  // --------------------------------------------------------------------------
  // Origin
  // --------------------------------------------------------------------------
  {
    hash: '1d0c255d',
    timestamp: '2004-12-22',
    commitMessage: 'feat: init',
    title: 'Initial System Boot (出生)',
    context:
      '`new Human({name: "MI-1222", sex: "male", birthday: "2004-12-22"})`としてインスタンス化。',
    branch: 'main',
    branchAccent: 'green',
    commitLane: 0,
    activeLanes: [0],
    graphType: 'root',
    isDefaultOpen: false,
  },

  // --------------------------------------------------------------------------
  // Branch: feat/high-school (高校時代)
  // --------------------------------------------------------------------------
  {
    hash: '6bda070b',
    timestamp: '2021-11-25',
    commitMessage: 'feat(mindset): prefer a situation with more freedom',
    title: '自由な環境を志向するマインドセットの獲得',
    context:
      '高校の自由な校風の影響を受け、自律的・能動的な活動環境を好むように。',
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    commitLane: 1,
    activeLanes: [0, 1],
    forkFromLane: 0,
    graphType: 'fork',
    isDefaultOpen: false,
  },
  {
    hash: '674792d7',
    timestamp: '2023-02-04',
    commitMessage:
      'fix(mindset): add mindset of taking responsibility within a situation of freedom',
    title: '自由の中での自己責任原則の実装',
    context: '自由な環境内で、責任を持った行動をするようにした。',
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    commitLane: 1,
    activeLanes: [0, 1],
    graphType: 'branch-commit',
    isDefaultOpen: false,
  },
  {
    hash: 'dafec8de',
    timestamp: '2023-02-26',
    commitMessage: 'feat(math): intensive math & physics problem solving',
    title: '受験勉強を通じた数学・物理の武器化',
    context:
      '強みである数学・物理の能力を強化。\n大学数学の基礎概念にも一部先行して触れる。',
    comments: [
      {
        body: '文系科目, 英語 が苦手なこともカバーすべき。',
      },
    ],
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    commitLane: 1,
    activeLanes: [0, 1],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: 'de3ac102',
    timestamp: '2023-03-09',
    commitMessage: 'test: second-stage entrance examination of Tokyo Tech',
    title: '東京工業大学(現 東京科学大学) 二次試験合格',
    context:
      '東工大二次試験を突破・合格を達成。\n\n\`\`\`mermaid\nradar-beta\n  title 2次試験スコア\n  axis english["英語(150点)"], math["数学(300点)"], physics["物理(150点)"], chemistry["化学(150点)"]\n\n  curve pass-median["合格者中央値"]{56, 46, 62, 71}\n  curve fail-median["不合格者中央値"]{43, 27, 47, 61}\n  curve my-score["自分の点数"]{40, 50, 66, 60}\n  graticule polygon\n  max 100\n\`\`\`\n(参考: https://note.com/hijoushiki1024/n/nf380a53cc220 )',
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    commitLane: 1,
    activeLanes: [0, 1],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: 'b0b0050b',
    timestamp: '2023-03-09',
    commitMessage: 'Merge pull request #1 from feat/high-school into main',
    title: '高校時代の終了と大学進学 (PR #1 Merged)',
    context:
      '高校時代で、自律性や高い学習能力を確立。\n東京工業大学(現 東京科学大学)へ進学。',
    comments: [
      {
        body: 'まだプログラミングスキルは全くなかった。',
        timestamp: '2025-08-08',
      },
    ],
    branch: 'main',
    branchAccent: 'green',
    commitLane: 0,
    activeLanes: [0, 1],
    mergeFromLane: 1,
    graphType: 'final-pr-merge',
    isPrMerge: true,
    prNumber: 1,
    prTitle: 'Foundation: Autonomous Mindset & Strong Math Foundations',
    sourceBranch: 'feat/high-school',
    targetBranch: 'main',
    isDefaultOpen: true,
  },

  // --------------------------------------------------------------------------
  // 大学時代: 各種専門分野・プロジェクトの並走
  // --------------------------------------------------------------------------
  {
    hash: 'd229e664',
    timestamp: '2024-03-30',
    commitMessage: 'feat(math): add knowledge of university-level mathematics',
    title: '大学数学の体系的探求と知見の吸収',
    context:
      '線形代数、代数学、圏論など、高校数学を超えた知識を追加。\n抽象度の高い概念を形式化・定式化する数学的リテラシーを体得。',
    branch: 'feat/math',
    branchAccent: 'cyan',
    commitLane: 1,
    activeLanes: [0, 1],
    forkFromLane: 0,
    graphType: 'fork',
    isDefaultOpen: false,
  },
  {
    hash: '211ef17e',
    timestamp: '2024-04-14',
    commitMessage:
      'test(engineer): pass Fundamental Information Technology Engineer Examination (FE)',
    title: '基本情報技術者試験 (FE) 合格',
    context:
      'ITやAIのテクノロジーが今後の社会や自分の将来に関わってくることを想定し、\n独学で開始したIT・計算機科学の基礎知識を客観的に証明。',
    branch: 'feat/certifications',
    branchAccent: 'amber',
    commitLane: 2,
    activeLanes: [0, 1, 2],
    forkFromLane: 0,
    graphType: 'fork',
    isDefaultOpen: true,
  },
  {
    hash: 'bf0ecbeb',
    timestamp: '2024-09-30',
    commitMessage:
      'feat(engineer): gained interest and skills about web development via first production experience',
    title: '実運用Webサイトの初開発',
    context:
      'サークル活動の一環として、外部へ公開される実運用Webサイトの制作を担当。\n\nWordPress(Conoha Wing)環境をベースにHTMLとJSで作り込んだデザインを構築。\nWeb開発の実践的楽しさと奥深さを実感。',
    comments: [
      {
        body: '当時の知識や技術的にWordPressを使っていたことやまだまだ完成度が低かったことはしょうがないが、まあ、0から学んで作ったにしてはよくやった。',
        timestamp: '2026-08-01',
      },
    ],
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    forkFromLane: 0,
    graphType: 'fork',
    isDefaultOpen: false,
  },
  {
    hash: '0b15e7da',
    timestamp: '2024-10-24',
    commitMessage:
      'feat(math): add LaTeX skills and experience with Lua & TikZ',
    title: 'LuaLaTeX & TikZ による定期ドキュメントの自動組版化',
    context:
      'サークルで月1,2回発行する文書をWordで作成していた非効率を解消したい。\nLuaスクリプトを使用し、変数をセットするだけでレイアウトが自動構築される組版パイプラインを構築。\n\n(Overleafによってコンパイル環境も共有。)',
    comments: [
      {
        body: 'なんて素晴らしいものを作ったんだろうか。',
        timestamp: '2025-04-01',
      },
      {
        body: '東工大でも、LaTeXに慣れている人は少ない。研究室に行っても少ない。',
        timestamp: '2025-07-01',
        author: '先代部長',
      },
      {
        body: 'LuaLaTeX使ってたの過剰だった。\nまあ、LaTeXのいい勉強になった。',
        timestamp: '2026-08-01',
      },
    ],
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: '2bfe6d60',
    timestamp: '2024-10-25',
    commitMessage: 'Merge pull request #2 from feat/web-dx into main',
    title: '人に見せることや長い間残る制作物を作る経験値 (PR #2 Merged)',
    context:
      'Web開発経験や組版自動化の経験を獲得。\n\nプログラミングへの興味と少しの経験を蓄えつつ、実社会で価値のあるものを作るための実践経験を積み始めたマイルストーン。',
    branch: 'main',
    branchAccent: 'green',
    commitLane: 0,
    activeLanes: [0, 1, 2, 3],
    mergeFromLane: 3,
    graphType: 'intermediate-pr-merge',
    isPrMerge: true,
    prNumber: 2,
    prTitle:
      'Core: Math Foundations, FE Certification & TeX Automation Pipeline',
    sourceBranch: 'feat/web-dx',
    targetBranch: 'main',
    isDefaultOpen: false,
  },
  {
    hash: '1183d1a2',
    timestamp: '2024-12-26',
    commitMessage:
      'test(engineer): pass Applied Information Technology Engineer Examination (AP)',
    title: '応用情報技術者試験 (AP) 合格',
    context:
      '基本情報(FE)の合格に続き、高度なIT知識を証明。\n\nデータベースや開発手法といった技術的な側面から、\nプロジェクトマネジメントやセキュリティといったIT以外の活動でも必要となる知識まで、\n体系的に習得したと言える。',
    branch: 'feat/certifications',
    branchAccent: 'amber',
    commitLane: 2,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: 'cadf4e0a',
    timestamp: '2024-12-27',
    commitMessage: 'Merge pull request #3 from feat/certifications into main',
    title: 'ITの知識が体系的に身についていることの証明(FE, AP) (PR #3 Merged)',
    context:
      'FEとAPに合格したことで、今後のIT社会で(ITに限らず)エンジニアとして活動していく上での、\n知識の土台が整っていること、自律的に学習できること を証明することができた。',
    branch: 'main',
    branchAccent: 'green',
    commitLane: 0,
    activeLanes: [0, 1, 2, 3],
    mergeFromLane: 2,
    graphType: 'intermediate-pr-merge',
    isPrMerge: true,
    prNumber: 3,
    prTitle: 'Credential: Pass Applied Information Technology Engineer (AP)',
    sourceBranch: 'feat/certifications',
    targetBranch: 'main',
    isDefaultOpen: false,
  },
  {
    hash: '30bf71b4',
    timestamp: '2025-01-04',
    commitMessage: 'chore(engineer): get MacBook Pro M4',
    title: '主開発マシンを MacBook Pro M4 へ刷新',
    context:
      '高校から使っていたMacBook Pro(intel) に限界を感じてきており、パソコンを使う機会も増えてきたので、\n成人祝いのタイミングで購入。',
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: false,
  },
  {
    hash: '7e8dd9a4',
    timestamp: '2025-03-31',
    commitMessage:
      'feat(engineer): add Notion skills and eliminate knowledge siloing',
    title: 'Notionによるナレッジベース構築と運用の脱・属人化',
    context:
      '部長を務めるサークルにて、Notionの柔軟性のあるデータベースを活用し、誰もが知識を参照・更新できる共有基盤を確立。\n属人化を解消。\n\n今まではチーム内の情報がチャットや紙媒体などに分散しており、毎年の引き継ぎの際に負担が大きかった。',
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: '0d7c8d5e',
    timestamp: '2025-09-30',
    commitMessage:
      'feat(engineer): build web services using Cloudflare & Next.js with authentication',
    title: 'Cloudflare ＋ Next.js 認証付きWebアプリの構築と大幅経費削減',
    context:
      '従来のWordPressホスティング(ConoHa等)の月額費用負担と、認証要件への柔軟な対応。\nCloudflare WorkersとNext.jsを活用し、認証機能を備えたWebサイトを構築。サーバー維持費を削減。\nReact hooksによる複雑な状態管理とそれをアニメーションとして表示することに難儀した。',
    comments: [
      {
        body: '2026年には、後輩への引き継ぎの前に、Astroを採用し、再実装。\nパフォーマンスの改善と冗長なバックエンドの削減を実現。',
        timestamp: '2026-08-15',
      },
    ],
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: '38346c6e',
    timestamp: '2025-10-01',
    commitMessage: 'Merge pull request #4 from feat/web-dx into main',
    title: 'チームDX・モダンクラウド移行の経験 (PR #4 Merged)',
    context:
      'Notionによるチームで使われつくされるものの構築、Cloudflare/Next.jsによる人に見せる,使われるための物の開発経験を積む。',
    branch: 'main',
    branchAccent: 'green',
    commitLane: 0,
    activeLanes: [0, 1, 2, 3],
    mergeFromLane: 3,
    graphType: 'intermediate-pr-merge',
    isPrMerge: true,
    prNumber: 4,
    prTitle:
      'Modernize: Workstation M4, Notion KB & Cloudflare/Next.js Migration',
    sourceBranch: 'feat/web-dx',
    targetBranch: 'main',
    isDefaultOpen: false,
  },

  // --------------------------------------------------------------------------
  // 実践Web開発・業務自動化パイプライン
  // --------------------------------------------------------------------------
  {
    hash: '20ed4a81',
    timestamp: '2026-03-26',
    commitMessage:
      'feat(engineer): modernize GAS email forwarder with TypeScript, Rollup & OOP',
    title: 'レガシーGASのTypeScript/Rollup刷新とDiscord連携メール自動化',
    context:
      'メンテナンスが面倒なGoogle Apps Script(GAS)によるメール転送スクリプトをモダンな開発基盤へ刷新。\n(今まで動いていたものは、あまりプログラミングをしたことがない人がweb記事を切り貼りしてGASで作ってくれていたが、保守性が低かった。)\nTypeScriptとRollupを導入してコードをビルド・モジュール化し、Gmail・Spreadsheet・Discordの各操作を責務ごとにクラス化(OOP設計)して型安全性を確保。\nさらに後任への引き継ぎを見据え、GAS特有の制約事項や環境設定、クエリ仕様を網羅したドキュメントを整備。',
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: '12b14a81',
    timestamp: '2026-03-30',
    commitMessage:
      'feat(engineer): build web services using SakuraServer, API(Go/Cloud Run), wasm(Rust)',
    title:
      'モダン技術スタックを駆使したWebサービスの構築と低レイヤ技術への挑戦',
    context:
      'さくらのサーバー, Astro, GCP CloudRun上で動かすGolangのバックエンドAPI, Rustにより構築したwasmによる高速検索機能 によるwebサイトを構築。\n\n3言語を使ってしまってはいるが、wasmの部分はyamlを設定すればいいので、引き継ぎに際してはTypeScriptとGolangだけがいじれればいいようにした。\n(Next.jsによってバックエンドまですべてTypeScriptで書き、Vercelにデプロイすることも候補であった。引き継ぎは楽になるが、Vercelの料金がだいぶかかる。)',
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
  {
    hash: '358f978e',
    timestamp: '2026-10-05',
    commitMessage:
      'feat(engineer): automated script PDF generation & CI/CD workflow with Puppeteer and Discord',
    title: 'Markdown駆動のイベント台本PDF生成システムとCI/CD差分自動配信',
    context:
      'イベントの進行台本作成において、表組みや改ページ、スライド連携のレイアウト調整をWordで手作業で行う負担を解消するため、Markdownから台本PDFを自動生成するツールを開発。\n\nmarkdown-itやCheerioで構造化パースを行い、Puppeteerを活用してヘッダー再表示付きの改ページ・注記ブロック・スライド画像の自動結合を含むA4 PDF出力を実現。\nさらにGitHub Actionsと連携し、mainへのマージをトリガーに、メインPDF・色分け差分PDF(diff.pdf)を自動生成してDiscordチャンネルへ即座に通知・配信するCI/CDパイプラインを構築。',
    branch: 'feat/web-dx',
    branchAccent: 'coral',
    commitLane: 3,
    activeLanes: [0, 1, 2, 3],
    graphType: 'branch-commit',
    isDefaultOpen: true,
  },
];
