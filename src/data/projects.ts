/**
 * プロジェクトおよび技術成果物のデータ定義モジュール。
 * トップページおよび各機能コンポーネントで共通利用する。
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
 * 定量的なインパクトを提示する工学的指標の型定義。
 */
export interface EngineeringMetric {
  /** 指標の項目名(例: 'Latency (p50)', 'Running Cost')。 */
  label: string;
  /** 指標の値(例: '12.61 ms', '$0 / mo')。 */
  value: string;
}

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
  /** 定量的インパクトを即座に伝えるメトリクス一覧。 */
  metrics?: EngineeringMetric[];
  /** 技術的コアやアーキテクチャの核心要約。 */
  architectureHighlight?: string;
  /** コマンドパレットやターミナルでの検索用キーワード群。 */
  searchKeywords?: string[];
}

/**
 * 全制作物および看板作品のリスト。
 * 配列先頭に3大看板作品を配置し、続いて各カテゴリの通常作品を展開する。
 */
export const projects: ProjectItem[] = [
  // --------------------------------------------------------------------------
  // Featured 3大看板作品 (Systems / Cloud / Productivity)
  // --------------------------------------------------------------------------
  {
    id: 'sokuto',
    title: 'sokuto',
    subtitle: '文章生成ゼロで型付き確率決定をミリ秒で返す純Rust推論基盤',
    category: 'systems',
    categoryLabel: 'Systems & Foundations / AI',
    tags: ['Rust', 'ModernBERT-ja', 'ONNX Runtime', 'Low-Latency'],
    summary:
      'LLM特有の遅延肥大化・JSON型破綻・確率過信を根本排除。ModernBERT-jaの単一フォワードパスと置換同変アテンション(SAB)により、CPUのみで12msの確定レイテンシと厳密較正された確率値を両立。',
    status: 'OSS',
    accent: 'purple',
    featured: true,
    githubUrl: 'https://github.com/MI-1222/sokuto',
    isPublic: true,
    metrics: [
      { label: 'Latency (p50)', value: '12.7 ms' },
      { label: 'Completion Tokens', value: '0 tokens' },
      { label: 'Calibration', value: 'ECE 2.08%' },
      { label: 'OOD Safety', value: '92.3% (Free Energy)' },
    ],
    architectureHighlight:
      '置換同変アテンション(SAB)・自由エネルギーOOD安全弁・インプロセスDAGによる非自己回帰決定基盤。',
    searchKeywords: [
      'sokuto',
      'ModernBERT',
      'Rust',
      'ONNX',
      'DAG',
      'Low-Latency',
      'Non-Autoregressive',
    ],
  },
  {
    id: 'patto-md',
    title: 'patto-md',
    subtitle:
      'ローカルのMarkdownと添付画像をD&Dで即座にWeb公開するサーバーレス共有基盤',
    category: 'cloud',
    categoryLabel: 'Cloud & Web Platforms',
    tags: ['Cloudflare Workers', 'Astro', 'Cloudflare R2', 'TypeScript'],
    summary:
      '複雑なCMSやログインの壁を排し、手元のMarkdown文書と画像をブラウザへD&Dするだけでパーマリンク発行と即時Web共有を実現。Workers・D1・R2 Presigned PUTの連携により、完全ゼロコスト運用と高速エッジ配信を両立。',
    status: 'OSS',
    accent: 'cyan',
    featured: true,
    githubUrl: 'https://github.com/MI-1222/patto-md',
    isPublic: true,
    metrics: [
      { label: 'Running Cost', value: '$0 / mo' },
      { label: 'Upload Path', value: 'Direct R2 PUT' },
      { label: 'Architecture', value: 'Edge Native' },
    ],
    architectureHighlight:
      'Workers + D1 + R2 Presigned URLによる完全サーバーレス・ゼロコピー共有。',
    searchKeywords: [
      'patto-md',
      'Cloudflare Workers',
      'D1',
      'R2',
      'Astro',
      'Markdown',
      'Serverless',
    ],
  },
  {
    id: 'lean4-skills',
    title: 'lean4-skills',
    subtitle:
      'Mathlib探索・定理証明・エラー診断を自律化するAIエージェント向け形式証明スキル群',
    category: 'productivity',
    categoryLabel: 'Productivity & DX',
    tags: ['Lean 4', 'Mathlib', 'AI Agent', 'LSP'],
    summary:
      'AIコーディングエージェントに数学の形式的証明を自律実行させる専用ツールキット。lean --server との対話ゴール取得、7編のエラー処方箋、Loogle型探索を統合し、Python標準ライブラリのみで動作する依存ゼロ設計。',
    status: 'OSS',
    accent: 'green',
    featured: true,
    githubUrl: 'https://github.com/MI-1222/lean4-skills',
    isPublic: true,
    metrics: [
      { label: 'Verified Lean', value: 'v4.35.0' },
      { label: 'Bundled Skills', value: '7 skills' },
      { label: 'External Deps', value: '0 (Python stdlib)' },
    ],
    architectureHighlight:
      'LSP Tactic State対話ループと7編のエラー処方箋による形式検証自律化。',
    searchKeywords: [
      'lean4-skills',
      'Lean 4',
      'Mathlib',
      'AI Agent',
      'Formal Verification',
      'LSP',
    ],
  },

  // --------------------------------------------------------------------------
  // Category 1: Systems & Foundations / AI
  // --------------------------------------------------------------------------
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
    searchKeywords: ['beamer-canvas', 'Rust', 'Tauri', 'LaTeX', 'Beamer'],
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
    searchKeywords: [
      'my-lean',
      'Lean 4',
      'Mathlib',
      'Formalization',
      'Theorem Proving',
    ],
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
    searchKeywords: ['lean-visualize', 'Lean 4'],
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
    searchKeywords: ['bihada', 'Rust'],
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
    searchKeywords: ['hello-mojo', 'Mojo', 'SIMD', 'Benchmark'],
  },

  // --------------------------------------------------------------------------
  // Category 2: Cloud & Web Platforms
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
    featured: false,
    githubUrl: 'https://github.com/MI-1222/tex-tikz-server',
    isPublic: true,
    searchKeywords: [
      'tex-tikz-server',
      'Go',
      'Cloud Run',
      'Docker',
      'TikZ',
      'LaTeX',
      'SVG',
    ],
  },
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
    searchKeywords: ['latex-template', 'Docker', 'LaTeX', 'TeX', 'Container'],
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
      'Cloudflare Workers',
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
    searchKeywords: [
      'my-portfolio',
      'Astro',
      'Cloudflare Workers',
      'TypeScript',
    ],
  },

  // --------------------------------------------------------------------------
  // Category 3: Productivity & Developer Experience
  // --------------------------------------------------------------------------
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
    featured: false,
    githubUrl: 'https://github.com/MI-1222/auto-matrix-code',
    isPublic: true,
    searchKeywords: [
      'auto-matrix-code',
      'TypeScript',
      'Chrome MV3',
      'Keychain',
      'Native Messaging',
    ],
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
    githubUrl: 'https://github.com/MI-1222/obsidian-md2pdf',
    isPublic: true,
    searchKeywords: [
      'obsidian-md2pdf',
      'Obsidian Plugin',
      'TypeScript',
      'AST',
      'PDF',
      'TikZ',
    ],
  },
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
    searchKeywords: ['md-script-studio', 'Rust'],
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
