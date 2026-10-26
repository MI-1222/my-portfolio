/**
 * プロジェクトおよび技術成果物のデータ定義モジュール。
 * トップページおよび詳細ページで共通利用する。
 */

/**
 * 技術領域カテゴリの型定義。
 */
export type ProjectCategory = 'systems' | 'cloud' | 'productivity';

/**
 * プロジェクトの公開ステータス型定義。
 */
export type ProjectStatus = 'OSS' | 'RESEARCH' | 'INTERNAL' | 'PLANNING';

/**
 * アクセントカラーの識別子型定義。
 */
export type ProjectAccent = 'cyan' | 'green' | 'coral' | 'purple';

/**
 * 単一プロジェクト情報のインターフェース。
 */
export interface ProjectItem {
  /** 一意識別子(URLスラッグ等に使用)。 */
  id: string;
  /** プロジェクト名称。 */
  title: string;
  /** 副題または簡潔なキャッチコピー。 */
  subtitle: string;
  /** 所属する技術領域カテゴリ。 */
  category: ProjectCategory;
  /** 画面表示用のカテゴリラベル。 */
  categoryLabel: string;
  /** 使用技術スタック一覧。 */
  tags: string[];
  /** 課題と解決アプローチの要約文。 */
  summary: string;
  /** プロジェクトの稼働状態ステータス。 */
  status: ProjectStatus;
  /** カード表示時のアクセントカラー。 */
  accent: ProjectAccent;
  /** 看板作品(Featured)として強調表示するかどうか。 */
  featured: boolean;
  /** 詳細記事または外部リンクのパス。 */
  link?: string;
  /** GitHubリポジトリのURL(公開されている場合)。 */
  githubUrl?: string;
  /** パブリックリポジトリかどうか。 */
  isPublic: boolean;
}

/**
 * 看板作品および全制作物のリスト。
 */
export const projects: ProjectItem[] = [
  // --------------------------------------------------------------------------
  // Featured 看板作品
  // --------------------------------------------------------------------------
  {
    id: 'tex-tikz-server',
    title: 'TikZ / LaTeX SVG Rendering API',
    subtitle: 'GCP Cloud Run と Go で実現するミリ秒SVGレンダリング基盤',
    category: 'cloud',
    categoryLabel: 'Cloud & Web Platforms',
    tags: ['Go', 'GCP Cloud Run', 'Docker', 'Zero-copy Stream'],
    summary:
      'モバイル端末やWeb環境で重厚なTeXエンジンを直接動かせない制約に対し、GoとCloud Runで最小構成コンテナとエッジキャッシュを統合したミリ秒レイテンシのSVG変換基盤。',
    status: 'OSS',
    accent: 'cyan',
    featured: true,
    link: '/projects/tex-tikz-server',
    githubUrl: 'https://github.com/MI-1222/tex-tikz-server',
    isPublic: true,
  },
  {
    id: 'obsidian-md2pdf',
    title: 'Obsidian High-Fidelity PDF Exporter',
    subtitle: 'TikZ・Mermaid・数式を忠実にベクターPDF化するObsidianプラグイン',
    category: 'productivity',
    categoryLabel: 'Productivity & DX',
    tags: ['TypeScript', 'Obsidian Plugin', 'Markdown', 'PDF Engine'],
    summary:
      '標準PDF出力におけるベクター図や数式のレイアウト崩れを解決。Markdown AST解析と外部SVGレンダラー連携により、モバイル(iOS/Android)でも完全再現する組版プラグイン。',
    status: 'OSS',
    accent: 'green',
    featured: false,
    link: '/projects/obsidian-md2pdf',
    githubUrl: 'https://github.com/MI-1222/obsidian-md2pdf',
    isPublic: true,
  },
  {
    id: 'auto-matrix-code',
    title: 'Student Matrix Code Auto-Fill Extension',
    subtitle: 'OSキーチェーン連携により平文保存を完全排除した認証自動化拡張',
    category: 'productivity',
    categoryLabel: 'Productivity & Security',
    tags: ['TypeScript', 'Chrome MV3', 'Native Messaging', 'macOS Keychain'],
    summary:
      '学生証マトリクスコードの自動入力において、ブラウザへの認証情報平文保存リスクを排除。Chrome拡張のNative Messagingを介してmacOSキーチェーンとセキュアに連携。',
    status: 'OSS',
    accent: 'coral',
    featured: true,
    link: '/projects/auto-matrix-code',
    githubUrl: 'https://github.com/MI-1222/auto-matrix-code',
    isPublic: true,
  },
  {
    id: 'lean4-skills',
    title: 'Lean 4 Agent Skills (lean4-skills)',
    subtitle:
      'Mathlib探索・定理証明・エラー診断を自律化するAIエージェント向け形式証明スキル群',
    category: 'productivity',
    categoryLabel: 'Productivity & DX',
    tags: [
      'Lean 4',
      'Python',
      'AI Agent',
      'Formal Verification',
      'Mathlib',
      'CLI',
    ],
    summary:
      'AIエージェントがLean 4を用いた数学の形式的証明を自律的に進めるためのスキルセット。lean --server との対話ゴール取得、7編のエラー処方箋、Loogle/LeanSearch探索を統合。',
    status: 'OSS',
    accent: 'green',
    featured: true,
    link: '/projects/lean4-skills',
    githubUrl: 'https://github.com/MI-1222/lean4-skills',
    isPublic: true,
  },

  // --------------------------------------------------------------------------
  // Category 1: Systems & Foundations / AI
  // --------------------------------------------------------------------------
  {
    id: 'sokuto',
    title: 'sokuto',
    subtitle: '非自己回帰型・ミリ秒決定基盤の日本語特化ローカル推論エンジン',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Rust', 'ModernBERT-ja', 'Python', 'Low-Latency'],
    summary:
      '文章生成のオーバーヘッドをゼロにし、型付き確率決定をミリ秒で返すTypeSafe Jevの日本語特化・純Rustローカル推論基盤。',
    status: 'OSS',
    accent: 'purple',
    featured: true,
    githubUrl: 'https://github.com/MI-1222/sokuto',
    isPublic: true,
  },
  {
    id: 'beamer-canvas',
    title: 'LaTeX Beamer Visual Canvas Editor',
    subtitle: 'CSTロスレス同期とGitネイティブなプレゼンエディタ',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Rust', 'Tauri v2', 'LaTeX', 'CST Sync'],
    summary:
      'LaTeX Beamerスライドの視覚的編集とコード直接編集を両立。具象構文木(CST)の双方向同期により、コメントや手動フォーマットを壊さず編集可能。',
    status: 'OSS',
    accent: 'purple',
    featured: false,
    githubUrl: 'https://github.com/MI-1222/beamer-canvas',
    isPublic: true,
  },
  {
    id: 'my-lean',
    title: 'Theorem Proving & Formalization',
    subtitle: 'Lean 4による数学各種定理・補題の形式化および証明基盤',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Lean 4', 'Mathlib', 'Proof Search', 'Python'],
    summary:
      '数学の厳密な論理体系の探求を目的に各種定理をLean 4で形式化。形式的証明の体系的な蓄積を進める個人研究リポジトリ。',
    status: 'RESEARCH',
    accent: 'purple',
    featured: false,
    githubUrl: 'https://github.com/MI-1222/my-lean',
    isPublic: true,
  },
  {
    id: 'lean-visualize',
    title: 'Lean 4 Proof Visualizer',
    subtitle:
      '定理証明のゴール状態とタクティック適用ツリーを俯瞰する証明可視化システム',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Lean 4', 'AST Visualization', 'Formal Verification', 'Graph UI'],
    summary:
      '形式手法・定理証明系における長大な証明ステップやゴール状態の分岐をグラフィカルに可視化し、証明全体の依存関係と進捗の直感的把握を支援する基盤。',
    status: 'PLANNING',
    accent: 'purple',
    featured: false,
    isPublic: false,
  },
  {
    id: 'bihada',
    title: 'bihada',
    subtitle: '低レイヤ高速画像処理と顔特徴量抽出パイプライン',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Rust', 'Computer Vision', 'Image Pipeline'],
    summary:
      '顔画像の特徴抽出および写真加工を高速かつメモリ安全に行う画像処理パイプライン。Rustによるネイティブ演算エンジンを構築。',
    status: 'PLANNING',
    accent: 'purple',
    featured: false,
    githubUrl: 'https://github.com/MI-1222/bihada',
    isPublic: true,
  },
  {
    id: 'hello-mojo',
    title: 'Mojo Language Benchmark & Demo',
    subtitle: 'Mojo言語による並列計算とSIMD最適化の検証リポジトリ',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Mojo', 'SIMD', 'Benchmark', 'High Performance'],
    summary:
      'PythonライクなシンタックスとC++並みの性能を持つMojo言語の言語仕様・並列化性能を計測・検証。',
    status: 'RESEARCH',
    accent: 'purple',
    featured: false,
    githubUrl: 'https://github.com/MI-1222/hello-mojo',
    isPublic: true,
  },

  // --------------------------------------------------------------------------
  // Category 2: Cloud & Web Platforms
  // --------------------------------------------------------------------------
  {
    id: 'latex-template',
    title: 'Portable TeX Environment (latex_template)',
    subtitle: '再現性と可搬性を担保したDockerコンテナLaTeXコンパイル環境',
    category: 'cloud',
    categoryLabel: 'Cloud & Web Platforms',
    tags: ['Docker', 'TeX', 'LaTeX', 'Makefile'],
    summary:
      'OS環境差分による組版崩れを排除するため、最小構成のTeX環境を封入した再現性の高いコンテナ開発環境テンプレート。',
    status: 'OSS',
    accent: 'cyan',
    featured: false,
    githubUrl: 'https://github.com/MI-1222/latex_template',
    isPublic: true,
  },
  {
    id: 'my-portfolio',
    title: 'Interactive Engineering Portfolio (my-portfolio)',
    subtitle:
      '自身のことや開発した制作物を視覚的・インタラクティブに紹介する個人サイト',
    category: 'cloud',
    categoryLabel: 'Cloud & Web Platforms',
    tags: [
      'Astro',
      'Tailwind CSS v4',
      'Cloudflare Pages',
      'TypeScript',
      'Interactive UI',
    ],
    summary:
      '自らの技術的バックボーンや多岐にわたる制作物を、視覚的かつインタラクティブに体験できるポートフォリオサイト。サイバーミニマルな世界観のもと、動的テーマ切り替えや軽快なインタラクションを備える。',
    status: 'PLANNING',
    accent: 'cyan',
    featured: false,
    githubUrl: 'https://github.com/MI-1222/my-portfolio',
    isPublic: true,
  },

  // --------------------------------------------------------------------------
  // Category 3: Productivity & Developer Experience
  // --------------------------------------------------------------------------
  {
    id: 'md-script-studio',
    title: 'Markdown Script Studio',
    subtitle:
      '非自己回帰推論基盤(System 1)とSingle Sourceデュアル組版を統合した舞台演出台本基盤',
    category: 'productivity',
    categoryLabel: 'Productivity & DX',
    tags: ['Rust', 'ModernBERT-ja', 'TypeScript', 'Typst', 'Wasm', 'DSL'],
    summary:
      '自作の非自己回帰推論エンジンにより息継ぎ位置や発話尺をミリ秒でリアルタイム推論。1つのMarkdown/独自DSLから練習用Webアプリと本番用省スペースPDFを完全同期出力。',
    status: 'PLANNING',
    accent: 'coral',
    featured: false,
    isPublic: false,
  },
];

/**
 * 看板作品のみを抽出して返す。
 */
export const featuredProjects = projects.filter((p) => p.featured);

/**
 * カテゴリ一覧の定義。
 */
export const categories = [
  { id: 'all', label: 'All Works' },
  { id: 'systems', label: 'Systems & AI' },
  { id: 'cloud', label: 'Cloud & Web' },
  { id: 'productivity', label: 'Productivity & DX' },
] as const;
